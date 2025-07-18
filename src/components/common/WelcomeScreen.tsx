import React, { useRef, useState } from 'react';
import { 
  ArrowRight, 
  Target, 
  Zap,
  Award,
  Rocket
} from 'lucide-react';
import { EmbeddedPPMToolFlow } from './EmbeddedPPMToolFlow';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
  onSkip?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSkip }) => {
  const toolRef = useRef<HTMLDivElement>(null);
  const [showToolFlow, setShowToolFlow] = useState(false);
  const [isScrolledToTool, setIsScrolledToTool] = useState(false);

  // Handle scroll to detect when user reaches the tool flow
  React.useEffect(() => {
    const handleScroll = () => {
      if (showToolFlow && toolRef.current) {
        const rect = toolRef.current.getBoundingClientRect();
        setIsScrolledToTool(rect.top <= 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showToolFlow]);

  const handleGetStarted = () => {
    // Show the tool flow
    setShowToolFlow(true);
    // Scroll to the tool flow section
    setTimeout(() => {
      toolRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    // Call the original handler if provided
    onGetStarted?.();
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



  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header - Only show when scrolled to tool flow */}
      {showToolFlow && isScrolledToTool && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {valueProps.map((prop, index) => {
                const IconComponent = prop.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">{prop.title}</h3>
                      <p className="text-xs text-gray-600 hidden lg:block">{prop.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Hero Section - Hide when scrolled to tool flow */}
        {!isScrolledToTool && (
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Find Your Perfect <span className="text-blue-600">PPM Tool</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Get <span className="font-semibold text-blue-600">100% free personalized recommendations</span> in minutes with our intelligent Project Portfolio Management Tool assessment. Make informed decisions and focus on key features identified through deep research for lasting project portfolio success.
            </p>
          </div>
        )}

        {/* Value Props Section - Full Width Layout - Hide when scrolled to tool flow */}
        {!isScrolledToTool && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {valueProps.map((prop, index) => {
                const IconComponent = prop.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <IconComponent className="w-4 h-4 text-blue-600" />
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
        )}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Complete assessment in 5 minutes or choose <button onClick={onSkip} className="text-blue-600 hover:text-blue-700 underline">Skip & use manual criteria</button>
          </p>
        </div>
      </div>

      {/* How It Works Section - First thing users see */}
      <div className="w-full max-w-none bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Discover tools that best match your business needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Rank Your Criteria: Question 1
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Embedded PPM Tool Flow - Only shown when user clicks start */}
      {showToolFlow && (
        <div ref={toolRef} className="w-full max-w-none">
          <EmbeddedPPMToolFlow />
        </div>
      )}

      {/* Persistent CTA Button - Only show if tool flow is not active */}
      {!showToolFlow && (
        <button
          onClick={handleGetStarted}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          Rank Your Criteria: Question 1
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}; 