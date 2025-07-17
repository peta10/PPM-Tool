import React from 'react';
import { ComparisonSection } from '@/features/comparison/ComparisonSection';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';
import { CTABanner } from '@/components/common/CTABanner';
import { Tool, Criterion } from '@/shared/types';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';

interface ComparisonPageProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { isMobile } = useFullscreen();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isMobile ? 'pb-20' : ''}`}>
      <Header />
      <CTABanner />
      <StepsSection />
      
      <main className="container mx-auto px-4 py-8">
        <ComparisonSection
          selectedTools={selectedTools}
          selectedCriteria={selectedCriteria}
        />
      </main>
    </div>
  );
}; 