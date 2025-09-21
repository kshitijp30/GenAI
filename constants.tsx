import React from 'react';
import type { EducationalTip, QuizQuestion } from './types';

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ExclamationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export const EDUCATIONAL_TIPS: EducationalTip[] = [
  {
    title: "Check the Source",
    description: "Investigate the site's mission and contact info. Lack of credibility or transparency is a red flag.",
    icon: <CheckCircleIcon />,
  },
  {
    title: "Look for Emotional Language",
    description: "Misinformation often uses sensational, emotionally charged words to provoke a reaction.",
    icon: <ExclamationIcon />,
  },
  {
    title: "Read Beyond the Headline",
    description: "Headlines can be misleading. Read the full article to understand the complete story.",
    icon: <EyeIcon />,
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "A headline says 'SHOCKING: This one food CURES all diseases!'. What's a potential red flag?",
    options: ["It offers a simple solution to a complex problem.", "It's published on a well-known news site.", "It includes a doctor's quote."],
    correctAnswerIndex: 0,
    explanation: "Sensational claims and miraculous cures are common misinformation tactics. Real science is nuanced."
  },
  {
    question: "You see a post on social media from an account you don't know. What should be your first step before sharing?",
    options: ["Share it if it seems believable.", "Check the account's profile and previous posts for credibility.", "Assume it's true if it has many likes."],
    correctAnswerIndex: 1,
    explanation: "Always vet the source. Anonymous or new accounts with no history are often unreliable."
  },
];