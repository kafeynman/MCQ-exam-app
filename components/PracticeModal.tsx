
import React, { useState, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { PracticeSettings } from '../types';

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PracticeModal: React.FC<PracticeModalProps> = ({ isOpen, onClose }) => {
  const { questionBank, startPracticeSession } = useSession();
  const [difficulty, setDifficulty] = useState<PracticeSettings['difficulty']>('All');
  const [questionCount, setQuestionCount] = useState(20);

  const maxQuestions = useMemo(() => {
    if (difficulty === 'All') {
      return questionBank.length;
    }
    return questionBank.filter(q => q.difficulty === difficulty).length;
  }, [difficulty, questionBank]);
  
  const handleStart = () => {
    startPracticeSession({ difficulty, questionCount: Math.min(questionCount, maxQuestions) });
    onClose();
  };

  if (!isOpen) return null;
  
  const currentCount = Math.min(questionCount, maxQuestions);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Practice Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Difficulty Level</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as PracticeSettings['difficulty'])}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>All</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Number of Questions</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                id="questionCount"
                min="20"
                max={maxQuestions}
                value={currentCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                disabled={maxQuestions < 20}
              />
              <span className="font-semibold text-lg bg-slate-100 dark:bg-slate-700 rounded-md px-3 py-1 w-28 text-center">{currentCount} / {maxQuestions}</span>
            </div>
             {maxQuestions < 20 && <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">Not enough questions for this difficulty (min 20 required).</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold transition">Cancel</button>
          <button 
            onClick={handleStart} 
            className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-semibold transition disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
            disabled={maxQuestions < 20}
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeModal;
