import { useRoutes } from 'react-router-dom';
import routes from './routerConfig';
import { UserProvider } from './context/UserContext';

function App() {
  const routing = useRoutes(routes);

  return <UserProvider>{routing}</UserProvider>;
}

export default App;
