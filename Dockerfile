# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm config set registry https://registry.npmmirror.com && \
    npm install && \
    npm cache clean --force



# Copy source code
COPY . .

# Optional private API endpoint used only while generating SEO artifacts.
ARG SEO_API_BASE=http://host.docker.internal:30002/api
ENV SEO_API_BASE=${SEO_API_BASE}
# Docker hosts without IPv6 connectivity can otherwise fail when Cloudflare's
# IPv6 address is selected first during SEO prerendering.
ENV NODE_OPTIONS=--dns-result-order=ipv4first

# Build the application
RUN echo "SEO prerender API base: ${SEO_API_BASE}" && npm run build:seo

# Stage 2: Production image with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage. Vite already copies public assets into
# dist, and postbuild writes SEO files there.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 30001
EXPOSE 30001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:30001/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
