
import { CompletedSession } from '../types';

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
// Fix: Removed trailing comma from generic type parameter <T,> to <T> to ensure correct type inference.
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Formats a duration in seconds into a MM:SS string.
 * @param seconds The total number of seconds.
 * @returns A formatted time string.
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

/**
 * Generates a detailed text report from a completed session.
 * @param session The completed session object.
 * @returns A string containing the formatted report.
 */
export const generateReport = (session: CompletedSession): string => {
  const {
    startTime,
    mode,
    endTime,
    totalQuestions,
    score,
    breakdown,
    questionSet,
    answers,
    choiceMappings,
  } = session;

  const sessionId = `ES-${new Date(startTime).toISOString().slice(0, 10)}-${new Date(startTime).getHours()}${new Date(startTime).getMinutes()}`;
  const date = new Date(startTime).toLocaleString();
  const durationSeconds = Math.floor((endTime - startTime) / 1000);
  const durationFormatted = `${Math.floor(durationSeconds / 60)} minutes ${durationSeconds % 60} seconds`;
  const percentage = totalQuestions > 0 ? (score / totalQuestions * 100).toFixed(1) : '0.0';
  const answeredCount = Object.keys(answers).length;

  let report = `
EXAMINATION REPORT
══════════════════
Session ID: ${sessionId}
Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}
Date: ${date}
Duration: ${durationFormatted}
Total Questions: ${totalQuestions}
Questions Attempted: ${answeredCount}
Score: ${score}/${totalQuestions} (${percentage}%)

DIFFICULTY BREAKDOWN:
`;

  Object.entries(breakdown).forEach(([difficulty, data]) => {
    if (data.total > 0) {
      const diffPercentage = (data.correct / data.total * 100).toFixed(1);
      report += `${difficulty}: ${data.correct}/${data.total} (${diffPercentage}%)\n`;
    }
  });

  report += `\nQUESTION DETAILS:\n`;
  report += '─────────────────────────────────────────────────────────\n';

  questionSet.forEach((q, index) => {
    const userAnswerKey = answers[q.id];
    const choiceMapping = choiceMappings[q.id];
    const originalCorrectAnswerKey = q.correct_answer;
    const randomizedCorrectAnswerKey = Object.keys(choiceMapping).find(key => choiceMapping[key] === originalCorrectAnswerKey);
    const isCorrect = userAnswerKey === randomizedCorrectAnswerKey;
    
    const userAnswerText = userAnswerKey ? choiceMapping[userAnswerKey] : 'N/A';
    const correctAnswerText = originalCorrectAnswerKey;

    report += `${index + 1}. QID: ${q.id} | Difficulty: ${q.difficulty} | Status: ${isCorrect ? 'Correct' : 'Incorrect'}\n`;
    report += `Question: ${q.question_text}\n`;
    report += `Your Answer: ${userAnswerKey || 'Not Answered'}) ${q.options[userAnswerText] || ''}\n`;
    report += `Correct Answer: ${randomizedCorrectAnswerKey}) ${q.options[correctAnswerText]}\n`;
    report += `Rationale: ${q.solution.correct_rationale}\n`;
    report += '─────────────────────────────────────────────────────────\n';
  });

  return report.trim();
};
