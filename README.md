# 🎉 Party Planner

A modern, browser-based party planning application built with React, TypeScript, and Tailwind CSS.

## 🚀 Demo

**[Live Demo](https://drakeaharper.github.io/pary-planner/)**

## ✨ Features

### 🍕 Pizza Estimator
- Calculate the number of pizzas needed based on guest count
- Smart estimation using 2-3 slices per person formula
- Real-time calculations as you type
- Helpful tips for pizza ordering

## 🛠️ Tech Stack

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **Bun** - Fast JavaScript runtime and package manager
- **SQLite WASM** - Client-side database storage
- **GitHub Pages** - Automatic deployment

## 🏗️ Getting Started

### Prerequisites
- Bun 1.0 or higher (or Node.js 18+ with npm/yarn as fallback)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/drakeaharper/pary-planner.git
cd pary-planner
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

4. Open your browser and visit `http://localhost:5173`

## 📜 Available Scripts

```bash
# Start development server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run type checking
bun run typecheck

# Run linting
bun run lint
```

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages:

1. Push changes to the `main` branch
2. GitHub Actions automatically builds and deploys the app
3. Visit your live app at `https://[username].github.io/pary-planner/`

## 🏗️ Project Structure

```
src/
├── App.tsx              # Main application component
├── PizzaEstimator.tsx   # Pizza calculation component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind
```

## 🎯 Development Guidelines

- **One component per file** - Keep components focused and maintainable
- **TypeScript interfaces** - Define clear prop types
- **Under 250 lines** - Keep files concise and readable
- **Tailwind CSS** - Use utility classes for styling

## 🔮 Future Features

- Beverage calculator
- Guest list management
- Party timeline planner
- Budget tracker
- Shopping list generator

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

*Making parties better, one slice at a time!* 🍕✨