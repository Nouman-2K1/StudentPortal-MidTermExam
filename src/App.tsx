import { useRoutes } from 'react-router-dom';
import routes from './routerConfig';
import { UserProvider } from './context/UserContext';
import LoadingSpinner from './components/LoadingSpinner';
import { Suspense } from 'react';

function App() {
  const routing = useRoutes(routes);

  return (
    <UserProvider>
      <Suspense fallback={<LoadingSpinner />}>{routing}</Suspense>
    </UserProvider>
  );
}

export default App;
