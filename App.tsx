
import React, { useEffect } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import HomeScreen from './components/HomeScreen';
import ExamScreen from './components/ExamScreen';
import ResultsScreen from './components/ResultsScreen';
import { Question } from './types';
import questionBankData from './question_bank.json';

const AppContent: React.FC = () => {
    const { session, completedSession, setQuestionBank } = useSession();

    useEffect(() => {
        // By importing the JSON, we can set it directly without fetching.
        // This is more reliable and works seamlessly on platforms like Vercel.
        setQuestionBank(questionBankData.questions);
    }, [setQuestionBank]);
    
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