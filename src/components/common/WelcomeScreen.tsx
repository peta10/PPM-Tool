import React from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Target, 
  BarChart3, 
  Lightbulb,
  Zap,
  Award,
  Rocket
} from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSkip: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSkip }) => {
  const handleGetStarted = () => {
    // Fast transition - no delays
    onGetStarted();
  };

  const valueProps = [
    {
      icon: Zap,
      title: "Instant Intelligence",
      description: "Get smart recommendations in minutes, not months of research."
    },
    {
      icon: Target,
      title: "Tailored Results", 
      description: "Customized analysis based on your specific organizational needs."
    },
    {
      icon: Award,
      title: "Proven Methodology",
      description: "Research-backed framework used by leading organizations."
    },
    {
      icon: Rocket,
      title: "Start on Course",
      description: "Begin with confidence knowing you've made the right choice."
    }
  ];

  const howItWorksSteps = [
    {
      number: "01",
      title: "Rank Your Criteria",
      description: "Common criteria: Scalability, Integration, & extensibility. Ease of use & user experience. Implementation timeline & costs. Security & compliance."
    },
    {
      number: "02", 
      title: "Select & Evaluate Tools",
      description: "Evaluate current tech stack. Consider new options. Define your requirements and desired outcomes."
    },
    {
      number: "03",
      title: "Analyze Comparison Chart", 
      description: "Map your criteria rankings against tool criteria rankings. Compare each tool against the criteria. Review current state."
    },
    {
      number: "04",
      title: "Review Recommendations",
      description: "Score tools based on how well they meet your requirements. Define current business processes. Create your recommendations."
    }
  ];

  const whatToExpect = [
    {
      icon: CheckCircle,
      title: "Why This Assessment Matters",
      description: "PPM tool selection affects your organization's productivity for years. Make the right choice from the start."
    },
    {
      icon: Target,
      title: "Personalized to Your Needs", 
      description: "Answer a few questions about your organization and get recommendations tailored to your specific requirements."
    },
    {
      icon: BarChart3,
      title: "Visual Analysis & Comparison",
      description: "See how tools compare across your priorities with interactive charts and detailed breakdowns."
    },
    {
      icon: Lightbulb,
      title: "Expert-Backed Results",
      description: "Get actionable insights based on independent research and real-world implementation data."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect <span className="text-blue-600">PPM Tool</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Get <span className="font-semibold text-blue-600">100% free personalized recommendations</span> in minutes with our intelligent Project Portfolio Management Tool assessment. Make informed decisions and focus on key features identified through deep research for lasting project portfolio success.
          </p>

          {/* Prominent CTA Button */}
          <div className="mb-12">
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Rank Your Criteria: Question 1
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Value Props Section - Simple Icon + Text Layout */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {valueProps.map((prop, index) => {
              const IconComponent = prop.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <IconComponent className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{prop.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{prop.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Section - Landscape */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Discover tools that best match your business needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What You Can Expect Section - Landscape */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Can Expect</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatToExpect.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Complete assessment in 5 minutes or choose <button onClick={onSkip} className="text-blue-600 hover:text-blue-700 underline">Skip & use manual criteria</button>
          </p>
        </div>
      </div>
    </div>
  );
}; 