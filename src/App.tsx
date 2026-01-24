import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

import Table from 'src/components/table';
import Modals from 'src/components/modals';
import About from 'src/components/about';
import TranslationSection from 'src/components/translation-section';

function App() {
  const [tableOpened, setTableOpened] = useState(true);

  return (
    <div className="relative w-fit mx-auto">
      <div className="mx-auto font-inter max-h-screen relative">
        <div className="pt-4">
          {tableOpened ? (
            <Table setTableOpened={setTableOpened} />
          ) : (
            <TranslationSection setTableOpened={setTableOpened} />
          )}
        </div>
      </div>

      {tableOpened && <About />}

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
