import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { PartyProvider } from './contexts/PartyContext';
import Navigation from './Navigation';
import Home from './pages/Home';
import PizzaCalculator from './pages/PizzaCalculator';
import BeverageCalculator from './pages/BeverageCalculator';
import GuestListManager from './pages/GuestListManager';
import TimelinePlanner from './pages/TimelinePlanner';

function App() {
  return (
    <DatabaseProvider>
      <PartyProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            
            <main className="pb-12">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pizza" element={<PizzaCalculator />} />
                <Route path="/beverages" element={<BeverageCalculator />} />
                <Route path="/guests" element={<GuestListManager />} />
                <Route path="/timeline" element={<TimelinePlanner />} />
              </Routes>
            </main>
            
            <footer className="text-center py-8 text-gray-500 text-sm bg-white/50">
              <p>© 2025 Party Planner - Making parties better, one slice at a time!</p>
            </footer>
          </div>
        </Router>
      </PartyProvider>
    </DatabaseProvider>
  );
}

export default App;