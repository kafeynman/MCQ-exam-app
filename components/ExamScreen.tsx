import React, { useRef } from 'react';
import { useSession } from '../context/SessionContext';
import StickyHeader from './StickyHeader';
import QuestionCard from './QuestionCard';

const ExamScreen: React.FC = () => {
  const { session, dispatch } = useSession();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!session) {
    return <div>Loading session...</div>;
  }

  const { questionSet } = session;

  const scrollToQuestion = (index: number) => {
    questionRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
  };

  const handleSubmit = () => {
    const message = session.mode === 'exam'
      ? 'Are you sure you want to submit the exam? This action cannot be undone.'
      : 'Are you sure you want to end your practice session and see the results?';
      
    if (window.confirm(message)) {
      dispatch({ type: 'SUBMIT_SESSION' });
    }
  };

  const handleSaveAndExit = () => {
    if (window.confirm('Are you sure you want to save and exit? Your progress is automatically saved.')) {
      // State is already saved via debouncing. Just need to leave the session view.
      // In a real SPA with routing, this would navigate away. Here we can simulate it.
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <StickyHeader 
        onSubmit={handleSubmit}
        onSaveAndExit={handleSaveAndExit}
        scrollToQuestion={scrollToQuestion}
      />
      <main className="flex-grow overflow-y-auto pt-48 md:pt-36 bg-slate-100 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {questionSet.map((question, index) => {
            // FIX: The ref callback was incorrectly returning the DOM element. A ref callback should have a void return type.
            // By changing the arrow function to use a block body, it implicitly returns undefined, which satisfies the requirement.
            return (
              <div key={question.id} ref={el => { questionRefs.current[index] = el; }}>
                <QuestionCard 
                  question={question} 
                  questionNumber={index + 1} 
                />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ExamScreen;