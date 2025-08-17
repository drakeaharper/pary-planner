import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: 'Pizza Calculator',
      description: 'Calculate how many pizzas you need based on guest count',
      icon: '🍕',
      path: '/pizza',
      color: 'bg-red-50 hover:bg-red-100',
    },
    {
      title: 'Beverage Calculator',
      description: 'Estimate drinks needed for your party',
      icon: '🥤',
      path: '/beverages',
      color: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'Guest List Manager',
      description: 'Track RSVPs and manage your guest information',
      icon: '👥',
      path: '/guests',
      color: 'bg-green-50 hover:bg-green-100',
    },
    {
      title: 'Timeline Planner',
      description: 'Create a schedule for your party preparation',
      icon: '📅',
      path: '/timeline',
      color: 'bg-purple-50 hover:bg-purple-100',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Party Planner
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your all-in-one solution for planning the perfect party. From food calculations 
          to guest management, we've got you covered!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            className={`block p-6 rounded-xl border-2 border-transparent transition-all duration-200 ${feature.color}`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{feature.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
                <div className="mt-3 text-blue-600 font-medium">
                  Get started →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Plan Like a Pro
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Whether you're hosting a birthday party, wedding, corporate event, or casual gathering, 
          our tools help you plan every detail so you can focus on having fun with your guests.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span>✨ Easy to use</span>
          <span>📱 Mobile friendly</span>
          <span>🎯 Accurate calculations</span>
          <span>⚡ Fast planning</span>
        </div>
      </div>
    </div>
  );
};

export default Home;