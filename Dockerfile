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

# Build the application
RUN npm run build

# Stage 2: Production image with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy static assets
COPY --from=builder /app/public /usr/share/nginx/html

# Expose port 30001
EXPOSE 30001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:30001/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
