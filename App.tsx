import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Store } from './services/store';
import { Loader2 } from 'lucide-react';
import { AppRoutes } from './routes/AppRoutes/index';

const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    Store.init().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;
