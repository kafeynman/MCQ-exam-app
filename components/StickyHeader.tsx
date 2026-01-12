import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { formatTime } from '../utils/helpers';

interface StickyHeaderProps {
  onSubmit: () => void;
  onSaveAndExit: () => void;
  scrollToQuestion: (index: number) => void;
}

const Timer: React.FC = () => {
    const { session, dispatch } = useSession();
    const [timeLeft, setTimeLeft] = useState(40 * 60);

    useEffect(() => {
        if (session?.mode !== 'exam') return;

        const endTime = session.startTime + 40 * 60 * 1000;
        
        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                dispatch({ type: 'SUBMIT_SESSION' });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [session, dispatch]);

    if (session?.mode !== 'exam') return null;

    return (
        <div className="flex items-center space-x-2">
            <i className="far fa-clock text-lg text-amber-500"></i>
            <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
        </div>
    );
};

const StickyHeader: React.FC<StickyHeaderProps> = ({ onSubmit, onSaveAndExit, scrollToQuestion }) => {
    const { session } = useSession();

    if (!session) return null;
    
    const answeredCount = Object.keys(session.answers).length;
    const totalCount = session.questionSet.length;
    const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
    const submitText = session.mode === 'exam' ? 'Submit Exam' : 'End Practice';

    return (
        <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-md z-40 border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between py-3 space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-6">
                        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 capitalize">{session.mode} Mode</h1>
                        <div className="flex items-center space-x-2">
                            <i className="far fa-check-circle text-lg text-green-500"></i>
                            <span className="font-semibold">{answeredCount} / {totalCount}</span>
                        </div>
                    </div>
                    
                    <Timer />

                    <div className="flex items-center space-x-2">
                        <button onClick={onSaveAndExit} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Save & Exit</button>
                        <button onClick={onSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">{submitText}</button>
                    </div>
                </div>

                <div className="py-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                
                 <div className="py-2 flex flex-wrap gap-1 justify-center">
                    {session.questionSet.map((q, index) => {
                        const isAnswered = q.id in session.answers;
                        const isFlagged = session.flagged.includes(q.id);
                        let bgColor = 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500';
                        if (isAnswered) bgColor = 'bg-blue-400 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-400';
                        if (isFlagged) bgColor = 'bg-yellow-400 dark:bg-yellow-500 hover:bg-yellow-500 dark:hover:bg-yellow-400';

                        return (
                            <button
                                key={q.id}
                                onClick={() => scrollToQuestion(index)}
                                className={`w-6 h-6 rounded-sm text-xs font-bold text-white flex items-center justify-center transition-colors ${bgColor}`}
                                title={`Question ${index + 1}`}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>

            </div>
        </header>
    );
};


export default StickyHeader;