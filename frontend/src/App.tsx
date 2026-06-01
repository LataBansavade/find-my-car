// Top-level view switch: quiz -> results -> compare. Answers, results, and the
// compare selection all live here as plain state (two-to-three screens, no router).

import { useState } from 'react';
import { recommend } from './api';
import type { Preferences, ScoredCar } from './types';
import { QuizForm } from './components/QuizForm';
import { ResultsView } from './components/ResultsView';
import { CompareView } from './components/CompareView';

type View = 'quiz' | 'results' | 'compare';

export default function App() {
  const [view, setView] = useState<View>('quiz');
  const [results, setResults] = useState<ScoredCar[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(prefs: Preferences) {
    setLoading(true);
    setError(null);
    try {
      const matches = await recommend(prefs);
      setResults(matches);
      setSelectedIds([]);
      setView('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev
    );
  }

  if (view === 'results') {
    return (
      <ResultsView
        results={results}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onCompare={() => setView('compare')}
        onStartOver={() => setView('quiz')}
      />
    );
  }

  if (view === 'compare') {
    const selected = results.filter((s) => selectedIds.includes(s.car.id));
    return <CompareView items={selected} onBack={() => setView('results')} />;
  }

  return (
    <>
      {error && (
        <div className="bg-rose-50 px-4 py-2 text-center text-sm text-rose-600">
          {error}
        </div>
      )}
      <QuizForm onSubmit={handleSubmit} loading={loading} />
    </>
  );
}
