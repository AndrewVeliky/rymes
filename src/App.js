import 'core-js/stable';
import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import RhymeSearchPage from './pages/RhymeSearchPage';
import AddRhymePage from './pages/AddRhymePage';

// Імпорт компонентів з Material-UI
import { AppBar, Toolbar, Button, Container } from '@mui/material';

// Ініціалізація бази даних у IndexedDB
const initializeDatabase = async () => {
  try {
    const stored = await localforage.getItem('initialized');
    if (!stored) {
      const numParts = 4; // Кількість частин
      for (let i = 1; i <= numParts; i++) {
        const response = await fetch(`${process.env.PUBLIC_URL}/part${i}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();

        // Зберігаємо записи з цієї частини в IndexedDB
        const entries = Object.entries(jsonData);
        for (const [key, value] of entries) {
          await localforage.setItem(key.toLowerCase(), value);
        }

        console.log(`Частина ${i} завантажена та збережена в IndexedDB`);
      }

      await localforage.setItem('initialized', true);
      console.log('Усі частини завантажені та дані збережені в IndexedDB');
    }
  } catch (error) {
    console.error('Помилка ініціалізації бази даних:', error);
  }
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('search');

  useEffect(() => {
    initializeDatabase();
  }, []);

  const renderPage = () => {
    if (currentPage === 'search') {
      return <RhymeSearchPage />;
    }
    if (currentPage === 'add') {
      return <AddRhymePage />;
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => setCurrentPage('search')}>
            Пошук рим
          </Button>
          <Button color="inherit" onClick={() => setCurrentPage('add')}>
            Додавання рими
          </Button>
        </Toolbar>
      </AppBar>
      <Container>{renderPage()}</Container>
    </div>
  );
};

export default App;
