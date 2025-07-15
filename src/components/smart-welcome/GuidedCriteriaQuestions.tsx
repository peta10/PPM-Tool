import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Question {
  id: string;
  text: string;
  criteriaImpact: { [key: string]: number };
  options: {
    text: string;
    value: number;
  }[];
}

interface GuidedCriteriaQuestionsProps {
  onNext: (rankings: { [key: string]: number }) => void;
  onBack: () => void;
  userRole?: string;
}

const questions: Question[] = [
  {
    id: 'q1',
    text: 'How many users will be actively using the PPM tool?',
    criteriaImpact: { scalability: 1, security: 0.5 },
    options: [
      { text: '1-10 users', value: 1 },
      { text: '11-50 users', value: 2 },
      { text: '51-200 users', value: 3 },
      { text: '201-1000 users', value: 4 },
      { text: '1000+ users', value: 5 }
    ]
  },
  {
    id: 'q2',
    text: 'How many external tools need to integrate with your PPM solution?',
    criteriaImpact: { integrations: 1 },
    options: [
      { text: 'No integrations needed', value: 1 },
      { text: '1-3 key tools', value: 2 },
      { text: '4-7 tools', value: 3 },
      { text: '8-12 tools', value: 4 },
      { text: '12+ tools or complex ecosystem', value: 5 }
    ]
  },
  {
    id: 'q3',
    text: 'What is the technical expertise level of your primary users?',
    criteriaImpact: { easeOfUse: 1, flexibility: 0.5 },
    options: [
      { text: 'Advanced technical users', value: 1 },
      { text: 'Mix of technical and non-technical', value: 3 },
      { text: 'Primarily non-technical users', value: 5 }
    ]
  },
  {
    id: 'q4',
    text: 'How frequently do your project management processes change?',
    criteriaImpact: { flexibility: 1 },
    options: [
      { text: 'Rarely - stable processes', value: 1 },
      { text: 'Occasionally - minor adjustments', value: 2 },
      { text: 'Regularly - evolving needs', value: 4 },
      { text: 'Frequently - highly dynamic', value: 5 }
    ]
  },
  {
    id: 'q5',
    text: 'What level of portfolio management capabilities do you need?',
    criteriaImpact: { ppmFeatures: 1 },
    options: [
      { text: 'Basic project tracking', value: 1 },
      { text: 'Standard portfolio features', value: 3 },
      { text: 'Advanced portfolio optimization', value: 5 }
    ]
  },
  {
    id: 'q6',
    text: 'How important is data visualization and reporting?',
    criteriaImpact: { reporting: 1 },
    options: [
      { text: 'Basic status reports', value: 1 },
      { text: 'Standard dashboards', value: 3 },
      { text: 'Advanced analytics & insights', value: 5 }
    ]
  }
];

export const GuidedCriteriaQuestions: React.FC<GuidedCriteriaQuestionsProps> = ({ 
  onNext, 
  onBack, 
  userRole 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 500);
  };

  const calculateRankings = () => {
    const rankings: { [key: string]: number } = {};
    const weights: { [key: string]: number } = {};
    
    // Initialize all criteria
    const criteria = ['scalability', 'integrations', 'easeOfUse', 'flexibility', 'ppmFeatures', 'reporting', 'security'];
    criteria.forEach(criterion => {
      rankings[criterion] = 0;
      weights[criterion] = 0;
    });

    // Calculate weighted scores
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        Object.entries(question.criteriaImpact).forEach(([criterionId, weight]) => {
          rankings[criterionId] += answer * weight;
          weights[criterionId] += weight;
        });
      }
    });

    // Calculate final scores based on weighted averages
    Object.keys(rankings).forEach(criterionId => {
      if (weights[criterionId] > 0) {
        rankings[criterionId] = Math.round(rankings[criterionId] / weights[criterionId]);
        rankings[criterionId] = Math.max(1, Math.min(5, rankings[criterionId]));
      } else {
        rankings[criterionId] = 3; // Default to medium priority
      }
    });

    // Apply role-based adjustments
    if (userRole === 'executive') {
      rankings.reporting = Math.min(5, rankings.reporting + 1);
      rankings.security = Math.min(5, rankings.security + 1);
    } else if (userRole === 'it-leader') {
      rankings.security = Math.min(5, rankings.security + 1);
      rankings.integrations = Math.min(5, rankings.integrations + 1);
    } else if (userRole === 'project-manager') {
      rankings.easeOfUse = Math.min(5, rankings.easeOfUse + 1);
      rankings.ppmFeatures = Math.min(5, rankings.ppmFeatures + 1);
    }

    return rankings;
  };

  const handleComplete = () => {
    const rankings = calculateRankings();
    onNext(rankings);
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900">
            Rank Your Criteria: Question {currentQuestion + 1}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Help us understand your priorities to get personalized recommendations
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {Math.round(progress)}% Complete
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Question */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQ.text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    answers[currentQ.id] === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {answers[currentQ.id] === option.value && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={currentQuestion > 0 ? () => setCurrentQuestion(prev => prev - 1) : onBack}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentQuestion > 0 ? 'Previous' : 'Back'}
            </button>

            {isLastQuestion && allAnswered ? (
              <button
                onClick={handleComplete}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Complete Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={!answers[currentQ.id] || currentQuestion >= questions.length - 1}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleComplete}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip remaining questions and use current answers
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 