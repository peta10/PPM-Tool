import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Target, 
  BarChart3, 
  Users, 
  Shield, 
  Sparkles,
  Play,
  Building2,
  TrendingUp,
  Star
} from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSkip: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSkip }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Target,
      title: "Smart Criteria Matching",
      description: "AI-powered recommendations based on your specific requirements",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Visual Comparisons",
      description: "Interactive radar charts and detailed analytics",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Enterprise Ready",
      description: "Team collaboration and approval workflows",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Trusted Data",
      description: "Independent research and verified tool information",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const benefits = [
    "Save 80% of research time",
    "Compare 50+ PPM tools",
    "Get personalized recommendations",
    "Access expert insights",
    "Free forever plan"
  ];

  const stats = [
    { number: "10K+", label: "Organizations Trust Us" },
    { number: "50+", label: "Tools Analyzed" },
    { number: "99%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[size:24px_24px]" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className={`relative z-10 container mx-auto px-4 py-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-16">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-gradient-premium">PPM Solution</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop wasting months evaluating project management tools. Get AI-powered 
            recommendations tailored to your organization in just 5 minutes.
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Trusted by 10,000+ organizations</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`glass-card p-6 border-l-4 border-l-transparent transition-all duration-500 cursor-pointer ${
                    currentFeature === index 
                      ? `bg-gradient-to-r ${feature.gradient} bg-opacity-10 border-l-blue-500 shadow-lg scale-105` 
                      : 'hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentFeature === index ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll get:</h3>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Interactive Demo */}
          <div className="relative">
            <div className="glass-card p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">See It In Action</h3>
                <p className="text-gray-600">Watch how easy it is to find your perfect PPM tool</p>
              </div>

              {/* Mock Interface Preview */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Scalability</span>
                    <span className="text-sm text-blue-600">High Priority</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Integrations</span>
                    <span className="text-sm text-green-600">Medium Priority</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full w-3/5"></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Ease of Use</span>
                    <span className="text-sm text-purple-600">High Priority</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>

              <button className="w-full btn-premium btn-hover-premium">
                <Play className="w-4 h-4 mr-2" />
                Watch 2-Minute Demo
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 glass-card p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">98%</div>
                  <div className="text-xs text-gray-600">Accuracy Rate</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 glass-card p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">5 min</div>
                  <div className="text-xs text-gray-600">Setup Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient-premium mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to find your perfect PPM solution?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of organizations who've streamlined their tool selection process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="btn-premium btn-hover-premium text-lg px-8 py-4"
              >
                Start Free Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button 
                onClick={onSkip}
                className="btn-glass text-gray-700 font-medium px-8 py-4 rounded-lg"
              >
                Skip Introduction
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              ✨ No signup required • ⚡ Get results instantly • 🔒 Your data stays private
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 