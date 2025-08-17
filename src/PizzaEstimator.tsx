import { useState } from 'react';

interface PizzaEstimatorProps {
  className?: string;
}

const PizzaEstimator = ({ className = '' }: PizzaEstimatorProps) => {
  const [peopleCount, setPeopleCount] = useState<number>(0);
  
  const calculatePizzas = (people: number): number => {
    if (people <= 0) return 0;
    // Estimate: 2-3 slices per person, 8 slices per pizza
    const slicesNeeded = people * 2.5;
    const slicesPerPizza = 8;
    return Math.ceil(slicesNeeded / slicesPerPizza);
  };

  const pizzasNeeded = calculatePizzas(peopleCount);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🍕 Pizza Estimator
      </h2>
      
      <div className="space-y-4">
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
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Pizzas Needed</p>
            <p className="text-3xl font-bold text-blue-600">
              {pizzasNeeded}
            </p>
            {peopleCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Based on 2-3 slices per person
              </p>
            )}
          </div>
        </div>
        
        {pizzasNeeded > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 text-center">
              💡 Consider ordering different sizes and toppings for variety!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PizzaEstimator;