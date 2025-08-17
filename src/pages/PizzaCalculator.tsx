import PizzaEstimator from '../PizzaEstimator';

const PizzaCalculator = () => {
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

      <div className="flex justify-center">
        <PizzaEstimator />
      </div>

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