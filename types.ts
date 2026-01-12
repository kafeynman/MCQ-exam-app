
export interface Question {
  id: string;
  bok_reference: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  solution: {
    correct_rationale: string;
    distractor_analysis: string;
  };
}

export interface PracticeSettings {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'All';
  questionCount: number;
}

export type SessionMode = 'exam' | 'practice';

export interface Session {
  mode: SessionMode;
  settings: PracticeSettings | null;
  startTime: number;
  endTime?: number;
  answers: Record<string, string>;
  questionSet: Question[];
  choiceMappings: Record<string, Record<string, string>>;
  flagged: string[];
}

export interface CompletedSession extends Session {
    endTime: number;
    score: number;
    totalQuestions: number;
    breakdown: {
        [key in 'Easy' | 'Medium' | 'Hard']: {
            correct: number;
            total: number;
        }
    };
}
