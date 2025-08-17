import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { PartyProvider } from './contexts/PartyContext';
import Navigation from './Navigation';
import Home from './pages/Home';
import PizzaCalculator from './pages/PizzaCalculator';
import BeverageCalculator from './pages/BeverageCalculator';
import GuestListManager from './pages/GuestListManager';
import TimelinePlanner from './pages/TimelinePlanner';
import TodoManager from './pages/TodoManager';
import ItineraryPlanner from './pages/ItineraryPlanner';
import DataManagement from './pages/DataManagement';

function App() {
  return (
    <DatabaseProvider>
      <PartyProvider>
        <Router basename="/pary-planner">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            
            <main className="pb-12">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pizza" element={<PizzaCalculator />} />
                <Route path="/beverages" element={<BeverageCalculator />} />
                <Route path="/guests" element={<GuestListManager />} />
                <Route path="/timeline" element={<TimelinePlanner />} />
                <Route path="/todos" element={<TodoManager />} />
                <Route path="/itinerary" element={<ItineraryPlanner />} />
                <Route path="/data" element={<DataManagement />} />
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