import { useState, useEffect } from 'react';
import { useCurrentParty } from '../contexts/PartyContext';
import { useBeverageCalculations } from '../hooks/useBeverageCalculations';
import PartySelector from '../components/PartySelector';

interface BeverageEstimate {
  water: number;
  soda: number;
  beer: number;
  wine: number;
  cocktails: number;
}

const BeverageCalculator = () => {
  const { currentParty, currentPartyId, setCurrentPartyId } = useCurrentParty();
  const { calculations, saveCalculation, deleteCalculation, loading } = useBeverageCalculations(currentPartyId);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [partyDuration, setPartyDuration] = useState<number>(3);
  const [partyType, setPartyType] = useState<'casual' | 'formal' | 'mixed'>('mixed');
  const [includeAlcohol, setIncludeAlcohol] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState(false);

  // Load party data when party changes
  useEffect(() => {
    if (currentParty) {
      if (currentParty.guest_count > 0) {
        setGuestCount(currentParty.guest_count);
      }
      setPartyDuration(currentParty.duration);
      setPartyType(currentParty.party_type);
    }
  }, [currentParty]);

  const calculateBeverages = (): BeverageEstimate => {
    if (guestCount <= 0) return { water: 0, soda: 0, beer: 0, wine: 0, cocktails: 0 };

    const drinksPerPersonPerHour = partyType === 'formal' ? 1 : 1.5;
    const totalDrinks = guestCount * partyDuration * drinksPerPersonPerHour;

    if (!includeAlcohol) {
      return {
        water: Math.ceil(guestCount * 2), // 2 bottles per person
        soda: Math.ceil(totalDrinks * 0.8), // 80% soft drinks
        beer: 0,
        wine: 0,
        cocktails: 0,
      };
    }

    // With alcohol
    const alcoholPercentage = partyType === 'formal' ? 0.6 : 0.7;
    const alcoholicDrinks = totalDrinks * alcoholPercentage;
    const nonAlcoholicDrinks = totalDrinks * (1 - alcoholPercentage);

    return {
      water: Math.ceil(guestCount * 1.5),
      soda: Math.ceil(nonAlcoholicDrinks * 0.7),
      beer: Math.ceil(alcoholicDrinks * 0.5),
      wine: Math.ceil(alcoholicDrinks * 0.3 / 5), // 5 glasses per bottle
      cocktails: Math.ceil(alcoholicDrinks * 0.2),
    };
  };

  const estimate = calculateBeverages();

  const handleSaveCalculation = async () => {
    if (!currentPartyId || guestCount === 0) return;
    
    try {
      await saveCalculation(
        guestCount,
        partyDuration,
        partyType,
        includeAlcohol,
        estimate.water,
        estimate.soda,
        estimate.beer,
        estimate.wine,
        estimate.cocktails
      );
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🥤 Beverage Calculator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate how many drinks you need for your party based on guest count, 
          duration, and party type.
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
            Please select or create a party to calculate beverage needs.
          </p>
        </div>
      ) : (

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Inputs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Party Details
            </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <input
                type="number"
                min="0"
                value={guestCount || ''}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter guest count"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Duration (hours)
              </label>
              <select
                value={partyDuration}
                onChange={(e) => setPartyDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
                <option value={5}>5 hours</option>
                <option value={6}>6+ hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Type
              </label>
              <select
                value={partyType}
                onChange={(e) => setPartyType(e.target.value as 'casual' | 'formal' | 'mixed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="casual">Casual (BBQ, Birthday)</option>
                <option value="formal">Formal (Wedding, Corporate)</option>
                <option value="mixed">Mixed Crowd</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="include-alcohol"
                checked={includeAlcohol}
                onChange={(e) => setIncludeAlcohol(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="include-alcohol" className="ml-2 text-sm text-gray-700">
                Include alcoholic beverages
              </label>
            </div>

            {guestCount > 0 && currentPartyId && (
              <button
                onClick={handleSaveCalculation}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                💾 Save Calculation
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Beverage Estimate
          </h2>
          
          {guestCount > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">💧 Water (bottles)</span>
                <span className="text-lg font-bold text-blue-600">{estimate.water}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">🥤 Soft Drinks</span>
                <span className="text-lg font-bold text-green-600">{estimate.soda}</span>
              </div>
              
              {includeAlcohol && (
                <>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">🍺 Beer (bottles/cans)</span>
                    <span className="text-lg font-bold text-yellow-600">{estimate.beer}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">🍷 Wine (bottles)</span>
                    <span className="text-lg font-bold text-red-600">{estimate.wine}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">🍸 Cocktail Servings</span>
                    <span className="text-lg font-bold text-purple-600">{estimate.cocktails}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Enter guest count to see beverage estimates
            </p>
          )}
        </div>

        {/* Calculation History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              📊 History
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showHistory ? 'Hide' : 'Show'}
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
                <div key={calc.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">
                      {calc.guest_count} guests, {calc.duration}h
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setGuestCount(calc.guest_count);
                          setPartyDuration(calc.duration);
                          setPartyType(calc.party_type as any);
                          setIncludeAlcohol(calc.include_alcohol);
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
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span>💧 {calc.water_bottles} water</span>
                    <span>🥤 {calc.soft_drinks} sodas</span>
                    {calc.include_alcohol && (
                      <>
                        <span>🍺 {calc.beer_bottles} beers</span>
                        <span>🍷 {calc.wine_bottles} wines</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(calc.calculated_at).toLocaleDateString()}
                  </p>
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

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💡 Beverage Planning Tips
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Non-Alcoholic</h4>
            <ul className="space-y-1">
              <li>• Always have water available</li>
              <li>• Offer variety: cola, lemon-lime, diet options</li>
              <li>• Consider seasonal drinks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Alcoholic</h4>
            <ul className="space-y-1">
              <li>• Provide both beer and wine options</li>
              <li>• Have designated driver alternatives</li>
              <li>• Consider signature cocktails</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Service</h4>
            <ul className="space-y-1">
              <li>• Keep drinks cold with ice</li>
              <li>• Have backup non-alcoholic options</li>
              <li>• Consider cups/glasses needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeverageCalculator;