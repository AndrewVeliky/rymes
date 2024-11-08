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
      // Завантажуємо дані з merged.json динамічно
      const response = await fetch('public/merged.json');
      const jsonData = await response.json();

      for (const item of jsonData) {
        await localforage.setItem(item.word.toLowerCase(), item);
      }
      await localforage.setItem('initialized', true);
      console.log('Дані з JSON успішно збережено у IndexedDB');
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
