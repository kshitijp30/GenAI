import type { ReactNode } from 'react';

export enum Verdict {
  VERIFIED_TRUE = "VERIFIED_TRUE",
  MISLEADING = "MISLEADING",
  PARTIALLY_TRUE = "PARTIALLY_TRUE",
  POTENTIALLY_FALSE = "POTENTIALLY_FALSE",
  UNVERIFIABLE = "UNVERIFIABLE",
}

export interface AnalysisResult {
  verdict: Verdict;
  confidenceScore: number;
  explanation: string;
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

export interface EducationalTip {
  title: string;
  description: string;
  // FIX: Use React.ReactNode instead of JSX.Element to avoid namespace errors.
  icon: ReactNode;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}