import PizzaEstimator from './PizzaEstimator';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎉 Party Planner
          </h1>
          <p className="text-gray-600 text-lg">
            Plan the perfect party with our helpful tools
          </p>
        </header>
        
        <main>
          <PizzaEstimator />
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 Party Planner - Making parties better, one slice at a time!</p>
        </footer>
      </div>
    </div>
  );
}

export default App;