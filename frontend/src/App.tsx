import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';

export default function App() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-sans">
        Ładowanie zawartości...
      </div>
    }>
      {element}
    </Suspense>
  );
}
