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
  Building2,
  TrendingUp,
  Clock,
  Search,
  BookOpen,
  Lightbulb
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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Why This Assessment Matters",
      description: "PPM tool selection affects your organization's productivity for years. Make the right choice from the start.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Personalized to Your Needs",
      description: "Answer a few questions about your organization and get recommendations tailored to your specific requirements.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Visual Analysis & Comparison",
      description: "See how tools compare across your priorities with interactive charts and detailed breakdowns.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Lightbulb,
      title: "Expert-Backed Results",
      description: "Get actionable insights based on independent research and real-world implementation data.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Tell Us About Your Organization",
      description: "Share your company size, industry, and role to get contextual recommendations"
    },
    {
      step: "2", 
      title: "Rank Your Criteria",
      description: "Answer guided questions or manually set priorities for what matters most to you"
    },
    {
      step: "3",
      title: "Analyze & Compare",
      description: "Review visual comparisons and detailed recommendations tailored to your needs"
    },
    {
      step: "4",
      title: "Get Your Results",
      description: "Download insights, next steps, and implementation guidance for your top choices"
    }
  ];

  const expectedOutcomes = [
    "Clear understanding of which tools best fit your needs",
    "Confidence in your PPM tool selection decision",
    "Time saved avoiding unsuitable options",
    "Roadmap for successful tool implementation",
    "Benchmarks against similar organizations"
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
            Choosing the right Project Portfolio Management tool is crucial for your organization's success. 
            Our intelligent assessment guides you to the best fit for your specific needs.
          </p>

          {/* Key Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 text-gray-700">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-medium">5-minute assessment</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Search className="w-5 h-5 text-green-500" />
              <span className="font-medium">50+ tools analyzed</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Shield className="w-5 h-5 text-purple-500" />
              <span className="font-medium">100% free & private</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Left Column - Why & What to Expect */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Can Expect</h2>
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

            {/* Expected Outcomes */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By the end, you'll have:</h3>
              {expectedOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - How It Works */}
          <div className="relative">
            <div className="glass-card p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How It Works</h3>
                <p className="text-gray-600">Simple 4-step process to find your ideal PPM tool</p>
              </div>

              {/* Process Steps */}
              <div className="space-y-6">
                {howItWorks.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time & Quality Indicators */}
            <div className="absolute -top-4 -right-4 glass-card p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">5 min</div>
                  <div className="text-xs text-gray-600">Total Time</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 glass-card p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-lg font-bold text-gray-900">Instant</div>
                  <div className="text-xs text-gray-600">Results</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Considerations */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-16 border border-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Tool Selection Matters</h2>
            <p className="text-gray-700 max-w-4xl mx-auto mb-6 leading-relaxed">
              The wrong PPM tool can cost organizations thousands in lost productivity, failed implementations, and team frustration. 
              Our assessment helps you avoid common pitfalls by matching tools to your specific organizational context, technical requirements, and business goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-1">$50K+</div>
                <div className="text-sm text-gray-600">Average cost of failed tool implementation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">6 months</div>
                <div className="text-sm text-gray-600">Typical time to realize implementation issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">80%</div>
                <div className="text-sm text-gray-600">Success rate with proper tool selection</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Make the Right Choice?
            </h2>
            <p className="text-gray-600 mb-8">
              Start your personalized PPM tool assessment now. No commitment required—just better decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="btn-premium btn-hover-premium text-lg px-8 py-4"
              >
                Begin Your Assessment
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
              ✨ No signup required • ⚡ Instant results • 🔒 Your data stays private
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 