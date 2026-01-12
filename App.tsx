
import React, { useState, useEffect, useCallback } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import HomeScreen from './components/HomeScreen';
import ExamScreen from './components/ExamScreen';
import ResultsScreen from './components/ResultsScreen';
import { Question } from './types';

const AppContent: React.FC = () => {
    const { session, completedSession, setQuestionBank } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/question_bank.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: { questions: Question[] } = await response.json();
                setQuestionBank(data.questions);
            } catch (e) {
                if (e instanceof Error) {
                    setError(`Failed to load question bank: ${e.message}`);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold animate-pulse">Loading Questions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold text-red-500">{error}</div>
            </div>
        );
    }
    
    if (completedSession) {
        return <ResultsScreen />;
    }

    if (session) {
        return <ExamScreen />;
    }

    return <HomeScreen />;
};


const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
};

export default App;
