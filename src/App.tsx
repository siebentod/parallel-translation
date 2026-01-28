import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';

import Modals from 'src/components/modals';
import HomePage from 'src/pages/HomePage';
import TranslationPage from 'src/pages/TranslationPage';

function App() {
  return (
    <div className="relative w-fit mx-auto">
      <div className="mx-auto font-inter max-h-screen relative">
        <div className="xl:pt-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/translation/:basename/:language" element={<TranslationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <Modals />

      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: '8px' }}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            maxWidth: '500px',
            padding: '4px 8px',
            backgroundColor: 'rgb(255 201 201)',
            color: 'rgb(30, 30, 30)',
          },
        }}
      />
    </div>
  );
}

export default App;


