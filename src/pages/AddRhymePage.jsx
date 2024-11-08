import React, { useState, useEffect } from 'react';

// Ініціалізація IndexedDB для збереження рим
const initializeDatabase = async () => {
  const request = window.indexedDB.open('rhymeDB', 1);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject('Database failed to open');
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('CustomRhymes', { keyPath: 'word' });
    };
  });
};

// Функція для додавання рими в базу даних
const addRhymeToDatabase = async (word, partOfSpeech, gender, manys, rhyme) => {
  const db = await initializeDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['CustomRhymes'], 'readwrite');
    const store = transaction.objectStore('CustomRhymes');

    const request = store.get(word.toLowerCase());

    request.onsuccess = function () {
      const existingEntry = request.result;

      if (existingEntry) {
        if (existingEntry.rhymes.includes(rhyme)) {
          alert('Рима вже існує для цього слова');
          resolve(false);
        } else {
          existingEntry.rhymes.push(rhyme);
          store.put(existingEntry);
          alert('Рима додана успішно');
          resolve(true);
        }
      } else {
        const newEntry = {
          word: word.toLowerCase(),
          partOfSpeech,
          gender,
          manys,
          rhymes: [rhyme],
        };
        store.add(newEntry);
        alert('Слово та рима додані успішно');
        resolve(true);
      }
    };

    request.onerror = () => reject('Error accessing the database');
  });
};

const AddRhymePage = () => {
  const [word, setWord] = useState('');
  const [rhyme, setRhyme] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [gender, setGender] = useState('');
  const [manys, setManys] = useState('');

  useEffect(() => {
    initializeDatabase();
  }, []);

  const handleAddRhyme = async () => {
    if (!word || !rhyme) {
      alert('Будь ласка, заповніть всі поля');
      return;
    }

    await addRhymeToDatabase(word, partOfSpeech, gender, manys, rhyme);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Додати власну риму</h2>
      <input
        style={styles.input}
        placeholder="Слово"
        value={word}
        onChange={e => setWord(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Рима"
        value={rhyme}
        onChange={e => setRhyme(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Частина мови"
        value={partOfSpeech}
        onChange={e => setPartOfSpeech(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Рід (ч/ж/с)"
        value={gender}
        onChange={e => setGender(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Множина"
        value={manys}
        onChange={e => setManys(e.target.value)}
      />
      <button onClick={handleAddRhyme} style={styles.button}>
        Внести в базу рим
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    maxWidth: '500px',
    margin: 'auto',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  button: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default AddRhymePage;
