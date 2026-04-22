import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';

export default function App() {
  // Hook useRoutes automatycznie dopasowuje komponent do adresu URL
  // na podstawie listy wygenerowanej przez wtyczkę.
  const element = useRoutes(routes);

  return (
    // Suspense jest wymagany, ponieważ wtyczka domyślnie ładuje strony
    // w sposób asynchroniczny (lazy loading), co poprawia szybkość aplikacji.
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-sans">
        Ładowanie zawartości...
      </div>
    }>
      {element}
    </Suspense>
  );
}