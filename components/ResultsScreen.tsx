
import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { Question } from '../types';
import ResultsAnalytics from './ResultsAnalytics';
import { generateReport, formatTime } from '../utils/helpers';

const ResultsScreen: React.FC = () => {
    const { completedSession, clearCompletedSession } = useSession();
    const [activeTab, setActiveTab] = useState('summary');

    if (!completedSession) {
        return <div>No completed session found.</div>;
    }

    const { score, totalQuestions, breakdown, questionSet, answers, choiceMappings, startTime, endTime, mode } = completedSession;
    const percentage = totalQuestions > 0 ? (score / totalQuestions * 100).toFixed(1) : 0;
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    const handleDownloadReport = () => {
        const report = generateReport(completedSession);
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam_report_${new Date(startTime).toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'review':
                return <ReviewList isKey={false} />;
            case 'key':
                return <ReviewList isKey={true} />;
            case 'analytics':
                return <ResultsAnalytics />;
            default:
                return <Summary />;
        }
    };
    
    const Summary = () => (
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Exam Complete!</h2>
            <p className="text-6xl font-bold mb-2">{score}/{totalQuestions} <span className="text-4xl text-slate-500">({percentage}%)</span></p>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">Time Taken: {formatTime(timeTaken)}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center my-6">
                {/* Fix: Cast `data` to the correct type to resolve properties `total` and `correct` not existing on `unknown`. */}
                {Object.entries(breakdown).map(([difficulty, data]) => {
                    const stats = data as { correct: number; total: number };
                    return stats.total > 0 && (
                        <div key={difficulty} className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                            <p className="font-bold text-lg">{difficulty}</p>
                            <p className="text-2xl">{stats.correct}/{stats.total}</p>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
                <button onClick={handleDownloadReport} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                    <i className="fas fa-download mr-2"></i> Download Detailed Report
                </button>
                 <button onClick={clearCompletedSession} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                    <i className="fas fa-home mr-2"></i> Back to Home
                </button>
            </div>
        </div>
    );
    
    const ReviewList: React.FC<{isKey: boolean}> = ({ isKey }) => (
         <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">{isKey ? 'Answer Key & Rationale' : 'Your Answers'}</h2>
            {questionSet.map((q, index) => <ReviewItem key={q.id} question={q} questionNumber={index + 1} isKey={isKey}/>)}
        </div>
    );
    
    const ReviewItem: React.FC<{question: Question; questionNumber: number; isKey: boolean}> = ({ question, questionNumber, isKey }) => {
        const userAnswerKey = answers[question.id];
        const choiceMapping = choiceMappings[question.id];
        const originalCorrectAnswerKey = question.correct_answer;
        const randomizedCorrectAnswerKey = Object.keys(choiceMapping).find(key => choiceMapping[key] === originalCorrectAnswerKey);
        const isCorrect = userAnswerKey === randomizedCorrectAnswerKey;
        const userAnswerText = userAnswerKey ? question.options[choiceMapping[userAnswerKey]] : "Not Answered";
        const correctAnswerText = question.options[originalCorrectAnswerKey];

        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4" style={{borderColor: isCorrect ? '#4ade80' : '#f87171'}}>
                <p className="font-bold mb-2">Q{questionNumber}. {question.question_text}</p>
                {!isKey && <p>Your Answer: <span className="font-semibold">{userAnswerKey ? `${userAnswerKey}) ${userAnswerText}` : 'Not Answered'}</span> {isCorrect ? <span className="text-green-500 font-bold">✓ Correct</span> : <span className="text-red-500 font-bold">✗ Incorrect</span>}</p>}
                {!isCorrect && <p>Correct Answer: <span className="font-semibold">{randomizedCorrectAnswerKey}) {correctAnswerText}</span></p>}
                {isKey && <p className="mb-4">Correct Answer: <span className="font-semibold">{randomizedCorrectAnswerKey}) {correctAnswerText}</span></p>}
                {isKey && (
                     <details className="mt-2 text-sm">
                        <summary className="cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400">Show Rationale</summary>
                        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded">
                            <p className="font-bold">Rationale:</p>
                            <p>{question.solution.correct_rationale}</p>
                            <p className="font-bold mt-2">Distractor Analysis:</p>
                            <p>{question.solution.distractor_analysis}</p>
                        </div>
                    </details>
                )}
            </div>
        )
    };
    
    const TabButton: React.FC<{tabName: string; label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex border-b border-slate-300 dark:border-slate-600">
                    <TabButton tabName="summary" label="Summary" />
                    <TabButton tabName="review" label="Your Answers" />
                    <TabButton tabName="key" label="Answer Key" />
                    <TabButton tabName="analytics" label="Performance Analytics" />
                </div>
                <div className="mt-[-1px]">
                     {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ResultsScreen;
