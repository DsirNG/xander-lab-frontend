# Xander Lab Frontend

Personal component and hooks showcase platform.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to frontend directory
cd xander-lab-frontend

# Install dependencies
npm install 
# or 
pnpm install
```

### Development
Start the development server:

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build
Build the application for production:

```bash
npm run build
```

## Project Structure

```
xander-lab-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layouts (e.g. MainLayout)
│   ├── pages/          # Application routes/pages
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles & Tailwind directives
├── public/             # Static assets
├── tailwind.config.js  # Tailwind CSS configuration
└── CODE_STANDARDS.md   # Project coding standards
```

## Code Standards
Please refer to [CODE_STANDARDS.md](./CODE_STANDARDS.md) for detailed coding guidelines, including:
- Naming Conventions
- JavaScript/TypeScript Best Practices
- Project Structure
- Component & Style Guidelines
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
