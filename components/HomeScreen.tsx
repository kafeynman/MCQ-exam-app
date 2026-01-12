
import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import PracticeModal from './PracticeModal';

const HomeScreen: React.FC = () => {
  const { startExamSession, session } = useSession();
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  
  const hasSavedSession = !!localStorage.getItem('current_session');

  const handleResume = () => {
    // The session is already restored by the context, we just need to re-render.
    // This function is effectively a no-op that relies on the parent component's logic.
    // We can force a re-render if needed, but context handles it.
    window.location.reload(); 
  };
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Exam System</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Choose your mode to begin.</p>
        
        <div className="space-y-4">
          <button 
            onClick={startExamSession}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
          >
            <i className="fas fa-play-circle mr-2"></i> Start Normal Exam
          </button>
          
          <button 
            onClick={() => setIsPracticeModalOpen(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800"
          >
            <i className="fas fa-pencil-alt mr-2"></i> Start Practice Session
          </button>

          {hasSavedSession && !session && (
            <button
                onClick={handleResume}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 mt-6"
            >
                <i className="fas fa-redo-alt mr-2"></i> Resume Last Session
            </button>
          )}
        </div>
      </div>

      <PracticeModal 
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
      />
    </div>
  );
};

export default HomeScreen;
