import React from 'react';
import { X } from 'lucide-react';
import { Criterion } from '@/shared/types';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { motion, AnimatePresence } from 'framer-motion';

interface GuidedRankingFormProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: Criterion[];
  onUpdateRankings: (rankings: { [key: string]: number }) => void;
  onRealTimeUpdate?: (rankings: { [key: string]: number }) => void;
}

interface Question {
  id: string;
  text: string;
  criteriaImpact: { [key: string]: number };
  options: {
    text: string;
    value: number;
  }[];
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
  },
  {
    id: 'q7',
    text: 'What are your security and compliance requirements?',
    criteriaImpact: { security: 1 },
    options: [
      { text: 'Standard security features', value: 1 },
      { text: 'Enhanced security needs', value: 3 },
      { text: 'Strict compliance requirements', value: 5 }
    ]
  },
  {
    id: 'q8',
    text: 'How complex are your resource management needs?',
    criteriaImpact: { ppmFeatures: 0.5, scalability: 0.5 },
    options: [
      { text: 'Simple time tracking', value: 1 },
      { text: 'Basic resource allocation', value: 2 },
      { text: 'Advanced capacity planning', value: 4 },
      { text: 'Complex multi-project optimization', value: 5 }
    ]
  },
  {
    id: 'q9',
    text: 'What level of workflow automation do you need?',
    criteriaImpact: { flexibility: 0.5, integrations: 0.5 },
    options: [
      { text: 'Manual processes', value: 1 },
      { text: 'Basic automation', value: 2 },
      { text: 'Advanced workflow automation', value: 4 },
      { text: 'Complex, custom automation', value: 5 }
    ]
  },
  {
    id: 'q10',
    text: 'How important is real-time collaboration?',
    criteriaImpact: { scalability: 0.5, easeOfUse: 0.5 },
    options: [
      { text: 'Basic collaboration', value: 1 },
      { text: 'Standard team features', value: 3 },
      { text: 'Advanced real-time collaboration', value: 5 }
    ]
  }
];

export const GuidedRankingForm: React.FC<GuidedRankingFormProps> = ({
  isOpen,
  onClose,
  criteria,
  onUpdateRankings,
  onRealTimeUpdate
}) => {
  const [answers, setAnswers] = React.useState<{ [key: string]: number }>({});
  const [currentStep, setCurrentStep] = React.useState(0);

  const formRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(formRef, onClose);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateRankings = () => {
    const rankings: { [key: string]: number } = {};
    const weights: { [key: string]: number } = {};
    
    // Initialize rankings
    criteria.forEach(criterion => {
      rankings[criterion.id] = 0;
      weights[criterion.id] = 0;
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
        // Calculate weighted average and round to nearest integer
        rankings[criterionId] = Math.round(rankings[criterionId] / weights[criterionId]);
        // Ensure the result is within 1-5 range
        rankings[criterionId] = Math.max(1, Math.min(5, rankings[criterionId]));
      } else {
        // Default to 3 if no questions affected this criterion
        rankings[criterionId] = 3;
      }
    });

    return rankings;
  };

  // Real-time update effect - call whenever answers change
  React.useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const rankings = calculateRankings();
      // Call the real-time update callback to update background sliders
      onRealTimeUpdate?.(rankings);
    }
  }, [answers, onRealTimeUpdate]);

  const handleSubmit = () => {
    const rankings = calculateRankings();
    onUpdateRankings(rankings);
    onClose();
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const progress = (currentStep + 1) / questions.length * 100;

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.42, 0, 1, 1] as const
      }
    }
  };

  const questionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="fixed inset-0 bg-black/20" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div 
            ref={formRef} 
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden z-10"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-alpine-blue-50 to-indigo-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Guided Rankings</h3>
                  <p className="text-sm text-gray-500">Answer questions to determine optimal criteria rankings</p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Animated Progress bar */}
              <div className="h-1 bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-alpine-blue-500 to-indigo-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                />
              </div>

              {/* Question */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={questionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }}
                    className="mb-8"
                  >
                    <div className="mb-4">
                      <motion.div 
                        className="text-sm text-gray-500 mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        Question {currentStep + 1} of {questions.length}
                      </motion.div>
                      <motion.h4 
                        className="text-lg font-medium text-gray-900 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {currentQuestion.text}
                      </motion.h4>
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <motion.button
                            key={option.value}
                            onClick={() => handleAnswer(currentQuestion.id, option.value)}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                              answers[currentQuestion.id] === option.value
                                ? 'border-alpine-blue-500 bg-alpine-blue-50 text-alpine-blue-700 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              duration: 0.2,
                              delay: index * 0.05
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option.text}</span>
                              <AnimatePresence>
                                {answers[currentQuestion.id] === option.value && (
                                  <motion.div
                                    className="w-5 h-5 bg-alpine-blue-500 rounded-full flex items-center justify-center"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ 
                                      duration: 0.3,
                                      type: "spring",
                                      stiffness: 200
                                    }}
                                  >
                                    <motion.div
                                      className="w-2 h-2 bg-white rounded-full"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.1 }}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <motion.div 
                className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
                  whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
                >
                  Previous
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (currentStep < questions.length - 1) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={!answers[currentQuestion.id]}
                  className="px-6 py-2 text-sm font-medium text-white bg-alpine-blue-500 rounded-lg hover:bg-alpine-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={answers[currentQuestion.id] ? { scale: 1.05 } : {}}
                  whileTap={answers[currentQuestion.id] ? { scale: 0.95 } : {}}
                  animate={{
                    backgroundColor: answers[currentQuestion.id] ? '#3b82f6' : '#9ca3af'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {currentStep < questions.length - 1 ? 'Next' : 'Generate Your Rankings'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
    </AnimatePresence>
  );
};