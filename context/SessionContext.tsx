
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { Question, Session, PracticeSettings, CompletedSession, SessionMode } from '../types';
import { shuffleArray } from '../utils/helpers';
import useDebounce from '../hooks/useDebounce';

interface SessionState {
  questionBank: Question[];
  session: Session | null;
  completedSession: CompletedSession | null;
}

type SessionAction =
  | { type: 'SET_QUESTION_BANK'; payload: Question[] }
  | { type: 'START_SESSION'; payload: Session }
  | { type: 'UPDATE_ANSWER'; payload: { questionId: string; answer: string } }
  | { type: 'TOGGLE_FLAG'; payload: { questionId: string } }
  | { type: 'SUBMIT_SESSION' }
  | { type: 'CLEAR_COMPLETED_SESSION' }
  | { type: 'RESTORE_SESSION'; payload: Session | null };

const initialState: SessionState = {
  questionBank: [],
  session: null,
  completedSession: null,
};

const SessionContext = createContext<{
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  startExamSession: () => void;
  startPracticeSession: (settings: PracticeSettings) => void;
  setQuestionBank: (questions: Question[]) => void;
  session: Session | null;
  completedSession: CompletedSession | null;
  questionBank: Question[];
  clearCompletedSession: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  startExamSession: () => {},
  startPracticeSession: () => {},
  setQuestionBank: () => {},
  session: null,
  completedSession: null,
  questionBank: [],
  clearCompletedSession: () => {},
});

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case 'SET_QUESTION_BANK':
      return { ...state, questionBank: action.payload };
    case 'START_SESSION':
      return { ...state, session: action.payload, completedSession: null };
    case 'RESTORE_SESSION':
       return { ...state, session: action.payload };
    case 'UPDATE_ANSWER':
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          answers: {
            ...state.session.answers,
            [action.payload.questionId]: action.payload.answer,
          },
        },
      };
    case 'TOGGLE_FLAG':
      if (!state.session) return state;
      const { questionId } = action.payload;
      const flagged = state.session.flagged.includes(questionId)
        ? state.session.flagged.filter((id) => id !== questionId)
        : [...state.session.flagged, questionId];
      return { ...state, session: { ...state.session, flagged } };
    case 'SUBMIT_SESSION':
        if (!state.session) return state;

        let correctCounts = { Easy: 0, Medium: 0, Hard: 0 };
        let totalCounts = { Easy: 0, Medium: 0, Hard: 0 };

        state.session.questionSet.forEach(q => {
            totalCounts[q.difficulty]++;
            const userAnswer = state.session!.answers[q.id];
            const originalCorrectAnswerKey = q.correct_answer;
            const choiceMapping = state.session!.choiceMappings[q.id];
            const randomizedCorrectAnswerKey = Object.keys(choiceMapping).find(key => choiceMapping[key] === originalCorrectAnswerKey);
            
            if (userAnswer === randomizedCorrectAnswerKey) {
                correctCounts[q.difficulty]++;
            }
        });

        const totalCorrect = correctCounts.Easy + correctCounts.Medium + correctCounts.Hard;
        const totalQuestions = state.session.questionSet.length;

        const completed: CompletedSession = {
            ...state.session,
            endTime: Date.now(),
            score: totalCorrect,
            totalQuestions: totalQuestions,
            breakdown: {
                Easy: { correct: correctCounts.Easy, total: totalCounts.Easy },
                Medium: { correct: correctCounts.Medium, total: totalCounts.Medium },
                Hard: { correct: correctCounts.Hard, total: totalCounts.Hard },
            }
        };

        return { ...state, session: null, completedSession: completed };
    case 'CLEAR_COMPLETED_SESSION':
        return { ...state, completedSession: null };
    default:
      return state;
  }
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const debouncedSession = useDebounce(state.session, 1000);

  useEffect(() => {
    try {
        const storedSession = localStorage.getItem('current_session');
        if (storedSession) {
            dispatch({ type: 'RESTORE_SESSION', payload: JSON.parse(storedSession) });
        }
    } catch (error) {
        console.error("Failed to parse session from localStorage", error);
        localStorage.removeItem('current_session');
    }
  }, []);

  useEffect(() => {
    if (debouncedSession) {
        localStorage.setItem('current_session', JSON.stringify(debouncedSession));
    } else {
        localStorage.removeItem('current_session');
    }
  }, [debouncedSession]);

  useEffect(() => {
    if (state.completedSession) {
        const completed = JSON.parse(localStorage.getItem('completed_sessions') || '[]');
        completed.push(state.completedSession);
        localStorage.setItem('completed_sessions', JSON.stringify(completed));
    }
  }, [state.completedSession]);


  const setQuestionBank = useCallback((questions: Question[]) => {
    dispatch({ type: 'SET_QUESTION_BANK', payload: questions });
  }, []);
  
  const startExamSession = useCallback(() => {
    const { questionBank } = state;
    const easyQs = shuffleArray(questionBank.filter(q => q.difficulty === 'Easy')).slice(0, 33);
    const mediumQs = shuffleArray(questionBank.filter(q => q.difficulty === 'Medium')).slice(0, 50);
    const hardQs = shuffleArray(questionBank.filter(q => q.difficulty === 'Hard')).slice(0, 82);
    
    let questionSet = shuffleArray([...easyQs, ...mediumQs, ...hardQs]);

    const choiceMappings: Record<string, Record<string, string>> = {};
    questionSet.forEach(q => {
        const originalKeys = Object.keys(q.options);
        const shuffledKeys = shuffleArray([...originalKeys]);
        choiceMappings[q.id] = originalKeys.reduce((acc, key, index) => {
            acc[key] = shuffledKeys[index];
            return acc;
        }, {} as Record<string, string>);
    });
    
    const session: Session = {
        mode: 'exam',
        settings: null,
        startTime: Date.now(),
        answers: {},
        questionSet,
        choiceMappings,
        flagged: []
    };
    dispatch({ type: 'START_SESSION', payload: session });
  }, [state.questionBank]);
  
  const startPracticeSession = useCallback((settings: PracticeSettings) => {
    const { questionBank } = state;
    let pool = questionBank;
    if (settings.difficulty !== 'All') {
        pool = questionBank.filter(q => q.difficulty === settings.difficulty);
    }
    let questionSet = shuffleArray(pool).slice(0, settings.questionCount);
    
    const choiceMappings: Record<string, Record<string, string>> = {};
    questionSet.forEach(q => {
        const originalKeys = Object.keys(q.options);
        const shuffledKeys = shuffleArray([...originalKeys]);
        choiceMappings[q.id] = originalKeys.reduce((acc, key, index) => {
            acc[key] = shuffledKeys[index];
            return acc;
        }, {} as Record<string, string>);
    });

    const session: Session = {
        mode: 'practice',
        settings: settings,
        startTime: Date.now(),
        answers: {},
        questionSet,
        choiceMappings,
        flagged: []
    };
    dispatch({ type: 'START_SESSION', payload: session });
  }, [state.questionBank]);
  
  const clearCompletedSession = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED_SESSION' });
  }, []);

  return (
    <SessionContext.Provider value={{ state, dispatch, startExamSession, startPracticeSession, setQuestionBank, session: state.session, completedSession: state.completedSession, questionBank: state.questionBank, clearCompletedSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
