import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './App';

const Router = () => {
  useEffect(() => {
    // Scroll to top when route changes
    const handleRouteChange = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <HashRouter>
      <App />
    </HashRouter>
  );
};

export default Router;