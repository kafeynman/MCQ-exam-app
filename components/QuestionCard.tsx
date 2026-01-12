
import React from 'react';
import { useSession } from '../context/SessionContext';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber }) => {
  const { session, dispatch } = useSession();
  
  if (!session) return null;

  const { answers, flagged, choiceMappings } = session;
  const userAnswer = answers[question.id];
  const isFlagged = flagged.includes(question.id);
  const isAnswered = userAnswer !== undefined;

  const handleAnswerChange = (answer: string) => {
    dispatch({ type: 'UPDATE_ANSWER', payload: { questionId: question.id, answer } });
  };

  const handleToggleFlag = () => {
    dispatch({ type: 'TOGGLE_FLAG', payload: { questionId: question.id } });
  };

  const choiceMapping = choiceMappings[question.id];
  const displayOptions = Object.keys(question.options).sort();

  const cardClasses = `
    bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all duration-300
    ${isAnswered ? 'ring-2 ring-blue-300 dark:ring-blue-700' : 'ring-1 ring-slate-200 dark:ring-slate-700'}
    ${isFlagged ? 'border-l-4 border-yellow-400' : ''}
  `;

  return (
    <div className={cardClasses}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            <span className="text-indigo-600 dark:text-indigo-400 mr-2">Q{questionNumber}.</span>
            {question.question_text}
          </h3>
          <button onClick={handleToggleFlag} className={`text-xl ${isFlagged ? 'text-yellow-400' : 'text-slate-400 dark:text-slate-500 hover:text-yellow-400'}`} title="Flag question">
            <i className={`${isFlagged ? 'fas' : 'far'} fa-star`}></i>
          </button>
        </div>
        
        <div className="space-y-3">
          {displayOptions.map((displayKey) => {
             const originalKey = choiceMapping[displayKey];
             const optionText = question.options[originalKey];
             const isSelected = userAnswer === displayKey;
            
            return (
              <label 
                key={displayKey} 
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-700' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={displayKey}
                  checked={isSelected}
                  onChange={() => handleAnswerChange(displayKey)}
                  className="hidden"
                />
                <span className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mr-4 flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400'}`}>
                    {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                </span>
                <span className="text-slate-700 dark:text-slate-300">{displayKey}. {optionText}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
