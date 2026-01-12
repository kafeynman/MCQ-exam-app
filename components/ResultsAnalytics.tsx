
import React, { useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ResultsAnalytics: React.FC = () => {
  const { completedSession } = useSession();

  const performanceByDifficulty = useMemo(() => {
    if (!completedSession) return [];
    const { breakdown } = completedSession;
    // Fix: Cast `data` to the correct type to resolve properties not existing on `unknown`.
    return Object.entries(breakdown).map(([difficulty, data]) => {
      const stats = data as { correct: number; total: number };
      return {
        name: difficulty,
        Correct: stats.correct,
        Incorrect: stats.total - stats.correct,
        Total: stats.total,
        'Accuracy (%)': stats.total > 0 ? parseFloat(((stats.correct / stats.total) * 100).toFixed(1)) : 0,
      };
    }).filter(d => d.Total > 0);
  }, [completedSession]);

  const performanceByBok = useMemo(() => {
    if (!completedSession) return [];
    const { questionSet, answers, choiceMappings } = completedSession;

    const bokStats: Record<string, { correct: number; total: number }> = {};

    questionSet.forEach(q => {
      if (!bokStats[q.bok_reference]) {
        bokStats[q.bok_reference] = { correct: 0, total: 0 };
      }
      bokStats[q.bok_reference].total++;

      const userAnswerKey = answers[q.id];
      const choiceMapping = choiceMappings[q.id];
      const originalCorrectAnswerKey = q.correct_answer;
      const randomizedCorrectAnswerKey = Object.keys(choiceMapping).find(key => choiceMapping[key] === originalCorrectAnswerKey);

      if (userAnswerKey === randomizedCorrectAnswerKey) {
        bokStats[q.bok_reference].correct++;
      }
    });

    return Object.entries(bokStats).map(([bok, data]) => ({
      name: bok.replace('Section ', 'S'),
      Correct: data.correct,
      Incorrect: data.total - data.correct,
      Total: data.total,
      'Accuracy (%)': data.total > 0 ? parseFloat(((data.correct / data.total) * 100).toFixed(1)) : 0,
    })).sort((a,b) => a['Accuracy (%)'] - b['Accuracy (%)']);
  }, [completedSession]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-b-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Performance Analytics</h2>
      
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Performance by Difficulty</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceByDifficulty}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="%" domain={[0, 100]} label={{ value: 'Accuracy', angle: 90, position: 'insideRight' }} />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    borderColor: 'rgba(100, 116, 139, 0.5)' 
                }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="Correct" fill="#8884d8" stackId="a" />
            <Bar yAxisId="left" dataKey="Incorrect" fill="#f87171" stackId="a" />
            <Bar yAxisId="right" dataKey="Accuracy (%)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Performance by Topic (BOK Reference)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceByBok} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    borderColor: 'rgba(100, 116, 139, 0.5)' 
                }}
             />
            <Legend />
            <Bar dataKey="Correct" fill="#8884d8" stackId="a" />
            <Bar dataKey="Incorrect" fill="#f87171" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResultsAnalytics;
