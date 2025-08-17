import { useState, useEffect } from 'react';
import { useCurrentParty } from '../contexts/PartyContext';
import { usePizzaCalculations } from '../hooks/usePizzaCalculations';
import PartySelector from '../components/PartySelector';

const PizzaCalculator = () => {
  const { currentParty, currentPartyId, setCurrentPartyId } = useCurrentParty();
  const { calculations, saveCalculation, deleteCalculation, loading } = usePizzaCalculations(currentPartyId);
  const [peopleCount, setPeopleCount] = useState<number>(0);
  const [slicesPerPerson, setSlicesPerPerson] = useState<number>(2.5);
  const [slicesPerPizza, setSlicesPerPizza] = useState<number>(8);
  const [showHistory, setShowHistory] = useState(false);

  // Load guest count from current party
  useEffect(() => {
    if (currentParty && currentParty.guest_count > 0) {
      setPeopleCount(currentParty.guest_count);
    }
  }, [currentParty]);

  const calculatePizzas = (people: number): number => {
    if (people <= 0) return 0;
    const slicesNeeded = people * slicesPerPerson;
    return Math.ceil(slicesNeeded / slicesPerPizza);
  };

  const pizzasNeeded = calculatePizzas(peopleCount);
  const totalSlices = peopleCount * slicesPerPerson;

  const handleSaveCalculation = async () => {
    if (!currentPartyId || pizzasNeeded === 0) return;
    
    try {
      await saveCalculation(peopleCount, pizzasNeeded);
    } catch (error) {
      console.error('Failed to save calculation:', error);
    }
  };

  const handleDeleteCalculation = async (id: number) => {
    try {
      await deleteCalculation(id);
    } catch (error) {
      console.error('Failed to delete calculation:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🍕 Pizza Calculator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate exactly how many pizzas you need for your party. Our calculator 
          uses the standard estimate of 2-3 slices per person to ensure everyone gets fed!
        </p>
      </div>

      <PartySelector
        selectedPartyId={currentPartyId}
        onPartySelect={setCurrentPartyId}
        className="mb-8"
      />

      {!currentPartyId ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Please select or create a party to calculate pizza needs.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pizza Calculator */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Calculate Pizza Needs
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="people-count" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People
                </label>
                <input
                  id="people-count"
                  type="number"
                  min="0"
                  value={peopleCount || ''}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter number of guests"
                />
                {currentParty && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current party has {currentParty.guest_count} expected guests
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="slices-per-person" className="block text-sm font-medium text-gray-700 mb-2">
                  Slices per Person
                </label>
                <select
                  id="slices-per-person"
                  value={slicesPerPerson}
                  onChange={(e) => setSlicesPerPerson(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 slices (light appetite)</option>
                  <option value={2.5}>2.5 slices (standard)</option>
                  <option value={3}>3 slices (good appetite)</option>
                  <option value={3.5}>3.5 slices (hearty appetite)</option>
                  <option value={4}>4 slices (very hungry)</option>
                </select>
              </div>

              <div>
                <label htmlFor="slices-per-pizza" className="block text-sm font-medium text-gray-700 mb-2">
                  Slices per Pizza
                </label>
                <select
                  id="slices-per-pizza"
                  value={slicesPerPizza}
                  onChange={(e) => setSlicesPerPizza(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={6}>6 slices (small)</option>
                  <option value={8}>8 slices (large)</option>
                  <option value={10}>10 slices (extra large)</option>
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Pizzas Needed</p>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {pizzasNeeded}
                  </p>
                  {peopleCount > 0 && (
                    <div className="text-xs text-gray-500">
                      <p>{totalSlices} total slices needed</p>
                      <p>{slicesPerPerson} slices × {peopleCount} people</p>
                    </div>
                  )}
                </div>
              </div>

              {pizzasNeeded > 0 && currentPartyId && (
                <button
                  onClick={handleSaveCalculation}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  💾 Save Calculation
                </button>
              )}
            </div>
          </div>

          {/* Calculation History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                📊 Calculation History
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading calculations...</p>
              </div>
            ) : calculations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No saved calculations yet</p>
                <p className="text-sm">Save a calculation to see it here!</p>
              </div>
            ) : showHistory ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {calculations.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {calc.pizzas_needed} pizzas for {calc.guest_count} people
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(calc.calculated_at).toLocaleDateString()} at{' '}
                        {new Date(calc.calculated_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setPeopleCount(calc.guest_count);
                          setSlicesPerPerson(2.5); // Reset to default
                          setSlicesPerPizza(8); // Reset to default
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Load this calculation"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteCalculation(calc.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Delete calculation"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">
                  {calculations.length} saved calculation{calculations.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          💡 Pizza Ordering Tips
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Variety Matters</h3>
            <ul className="space-y-1">
              <li>• Order multiple toppings for variety</li>
              <li>• Consider dietary restrictions (vegetarian, gluten-free)</li>
              <li>• Popular choices: Margherita, Pepperoni, Supreme</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Size Considerations</h3>
            <ul className="space-y-1">
              <li>• Large pizzas typically have 8 slices</li>
              <li>• Medium pizzas have 6 slices</li>
              <li>• Large pizzas are usually more cost-effective</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Timing</h3>
            <ul className="space-y-1">
              <li>• Order 30-60 minutes before serving</li>
              <li>• Call ahead for large orders</li>
              <li>• Consider peak hours for delivery</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Special Occasions</h3>
            <ul className="space-y-1">
              <li>• Kids parties: Order more plain cheese pizzas</li>
              <li>• Adult gatherings: More adventurous toppings</li>
              <li>• Mixed groups: Stick to crowd-pleasers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaCalculator;