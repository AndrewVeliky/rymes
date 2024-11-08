import localforage from 'localforage';

// Кешування для оптимізації
const cache = {
  data: {},
  phonetic: {},
  scores: new Map(),
};

// Нормалізація слова для обробки
const normalizeWord = word =>
  word
    ? word.toLowerCase().replace(/[^а-яіїєґ]/g, '') // Видаляємо небажані символи
    : '';

// Фільтрація архаїзмів і діалектизмів
const isModernWord = word => {
  const archaicWords = [
    'перст',
    'шати',
    'длань',
    'вельми',
    'єлей',
    'недоля',
    'витязь',
    'звитяга',
    'глас',
    'тать',
    'узрів',
    'воздаяння',
    'віщун',
    'осквернити',
    'молвити',
    'сивина',
    'стезя',
    'рамена',
    'кресало',
    'клопіт',
    'леле',
    'жупан',
    'барвінок',
    'древо',
    'орай',
    'зело',
    'співати',
    'плакати',
    'квітка',
    'мандрівник',
    'боярин',
    'лицар',
    'панночка',
    'челядь',
    'вельможа',
    'князь',
    'княгиня',
    'воєвода',
    'дружина',
    'колядка',
    'щедрівка',
    'русалка',
    'мавка',
    'вовкулака',
    'вертеп',
    'гетьман',
    'кобзар',
    'думка',
    'сірома',
    'ненька',
    'отаман',
    'садок',
    'сонцесяйний',
    'зоряний',
    'братина',
    'булава',
    'райдуга',
    'лебідь',
    'слобода',
    'чумацький',
    'потайки',
    'джура',
    'писар',
    'сотник',
    'корогва',
    'воля',
    'бандура',
    'писання',
    'сповідь',
    'тужити',
    'гетьманщина',
    'полонений',
    'лелека',
    'калиновий',
    'плуг',
    'гайдамака',
    'козак',
    'сопілка',
    'сумний',
    'трембіта',
    'хмара',
  ];

  const dialectWords = [
    'файно',
    'ґазда',
    'цімбор',
    'баґаття',
    'лишенько',
    'давненько',
    'плай',
    'моцний',
    'хосен',
    'церата',
    'вар’ят',
    'книш',
    'латка',
    'карпатський',
    'моргати',
    'гутірка',
    'куфер',
    'цебер',
    'бздура',
    'балагур',
    'шушпан',
    'мешти',
    'маґазин',
    'гайстер',
    'ґоґоль-моґоль',
    'ґринджоли',
    'баюн',
    'кальварія',
    'опришок',
    'бартка',
    'ґражда',
    'леґінь',
    'певний',
    'повістка',
    'позичати',
    'чічка',
    'черес',
    'бавитися',
    'колєга',
    'коліжанка',
    'кєд',
    'люстерко',
    'маґа',
    'матолок',
    'мешканець',
    'нянька',
    'пані',
    'пательня',
    'плай',
    'плескати',
    'позирати',
    'поріг',
    'похід',
    'радити',
    'рукавиця',
    'світлиця',
    'сковорода',
    'слухати',
    'спасибі',
    'стежка',
    'сусід',
    'торба',
    'тримати',
    'холоша',
    'цвіт',
    'чарівний',
    'чекати',
    'чорнобривець',
    'шапка',
    'швидко',
    'шептати',
    'щира',
    'яблуко',
  ];

  const surzhykWords = [
    'канєшно',
    'вопшє',
    'шо',
    'счас',
    'тєлєфон',
    'нє',
    'ето',
    'понятно',
    'дєньги',
    'роботать',
    'всмислє',
    'нужен',
    'нада',
    'кстаті',
    'сідєть',
    'смотріть',
    'мір',
    'всє',
    'єслі',
    'можна',
    'жить',
    'тєпєрь',
    'свєт',
    'своєй',
    'чєловєк',
    'мнє',
    'хароший',
    'красівий',
    'сєводня',
    'утром',
    'вчера',
    'да',
    'потому',
    'разговор',
    'думаю',
    'понімаєш',
    'вопрос',
    'рєбята',
    'общаться',
    'завтра',
    'сєйчас',
    'іспользовать',
    'вніманіє',
    'вєрний',
    'должен',
    'ніжний',
    'почему',
    'сєрдце',
    'сєкрет',
    'сітуація',
    'слєдующий',
    'старший',
    'товаріщ',
    'увєрєн',
    'удівітєльний',
    'хватіть',
    'цвєт',
    'чувствувати',
    'якби',
    'ясно',
    'автобус',
    'бабушка',
    'бєгать',
    'болєть',
    'боятися',
    'вєсєлий',
    'вкусний',
    'говорити',
    'давать',
    'дождь',
    'ждать',
  ];

  return (
    !archaicWords.includes(word) &&
    !dialectWords.includes(word) &&
    !surzhykWords.includes(word)
  );
};

// Генерація фонетичного коду з урахуванням асонансу
const computePhoneticCode = word => {
  if (!word) return '';
  const lowerWord = normalizeWord(word);
  if (cache.phonetic[lowerWord]) return cache.phonetic[lowerWord];

  const phoneticCode = Array.from(lowerWord)
    .map(char => {
      if ('бп'.includes(char)) return 'Б';
      if ('вф'.includes(char)) return 'В';
      if ('гґкх'.includes(char)) return 'Г';
      if ('дт'.includes(char)) return 'Д';
      if ('зсц'.includes(char)) return 'З';
      if ('жшчщ'.includes(char)) return 'Ж';
      if ('лр'.includes(char)) return 'Л';
      if ('й'.includes(char)) return 'Й';
      if ('мн'.includes(char)) return 'М';
      if ('ао'.includes(char)) return 'А';
      if ('еєиі'.includes(char)) return 'Е';
      if ('юяї'.includes(char)) return 'У';
      return '';
    })
    .join('');

  cache.phonetic[lowerWord] = phoneticCode;
  return phoneticCode;
};

// Оцінка рими з урахуванням асонансу і ваги
const getSoundWeight = char => {
  const weights = {
    А: 2,
    Е: 2,
    У: 2,
    Б: 1,
    В: 1,
    Г: 1,
    Д: 1,
    З: 1,
    Ж: 1,
    Л: 1,
    Й: 1,
    М: 1,
  };
  return weights[char] || 0;
};

// Функція для підрахунку кількості складів у слові
const countSyllables = word => {
  const vowels = 'аеиіоуяєюї';
  return word.split('').filter(char => vowels.includes(char)).length;
};

// Функція для визначення позиції наголосу
// У цьому спрощеному варіанті припускаємо, що наголос на останньому складі
const getStressPosition = word => {
  return countSyllables(word) - 1;
};

// Функція для оцінки милозвучності
const calculateEuphonyScore = (word1, word2) => {
  const syllables1 = countSyllables(word1);
  const syllables2 = countSyllables(word2);

  const stressPos1 = getStressPosition(word1);
  const stressPos2 = getStressPosition(word2);

  let score = 0;

  // Більший бал, якщо кількість складів співпадає
  if (syllables1 === syllables2) {
    score += 2;
  }

  // Більший бал, якщо наголошені склади співпадають
  if (stressPos1 === stressPos2) {
    score += 3;
  }

  // Додатковий бал за співпадіння останніх складів
  const lastSyllable1 = word1.slice(-2);
  const lastSyllable2 = word2.slice(-2);
  if (lastSyllable1 === lastSyllable2) {
    score += 5;
  }

  return score;
};

// Оновлена функція розрахунку загального балу рими
const calculateRhymeScore = (word1, word2) => {
  if (!word1 || !word2) return 0;
  const key = `${word1}_${word2}`;
  if (cache.scores.has(key)) return cache.scores.get(key);

  const phoneticCode1 = computePhoneticCode(word1);
  const phoneticCode2 = computePhoneticCode(word2);

  // Врахування асонансу (голосні звуки)
  const vowels1 = phoneticCode1.replace(/[^АЕУ]/g, '');
  const vowels2 = phoneticCode2.replace(/[^АЕУ]/g, '');
  let vowelScore = 0;

  for (
    let i = vowels1.length - 1, j = vowels2.length - 1;
    i >= 0 && j >= 0;
    i--, j--
  ) {
    if (vowels1[i] === vowels2[j]) {
      vowelScore += 2; // Вища вага для голосних
    } else {
      break;
    }
  }

  // Врахування приголосних
  let consonantScore = 0;
  for (
    let i = phoneticCode1.length - 1, j = phoneticCode2.length - 1;
    i >= 0 && j >= 0;
    i--, j--
  ) {
    if (phoneticCode1[i] === phoneticCode2[j]) {
      consonantScore += getSoundWeight(phoneticCode1[i]);
    } else {
      break;
    }
  }

  // Оцінка милозвучності
  const euphonyScore = calculateEuphonyScore(word1, word2);

  const totalScore = vowelScore + consonantScore + euphonyScore;
  cache.scores.set(key, totalScore);
  return totalScore;
};

// Отримання даних про слово з кешу або бази даних
const getWordData = async word => {
  if (!word) return null;
  const lowerWord = normalizeWord(word);
  if (cache.data[lowerWord]) return cache.data[lowerWord];

  const data = await localforage.getItem(lowerWord);
  if (data) {
    cache.data[lowerWord] = data;
    cache.phonetic[lowerWord] = computePhoneticCode(data.word);
  }
  return data;
};

// Загальна функція для знаходження рим
const findRhymes = async (word, type) => {
  if (!word) return [];
  const normalizedWord = normalizeWord(word);
  const rhymes = [];

  await localforage.iterate(entry => {
    const entryWord = normalizeWord(entry.word);

    // Фільтрація за сучасністю слова
    if (!isModernWord(entryWord)) return;

    // Уникнення самого слова
    if (entryWord === normalizedWord) return;

    const rhymeScore = calculateRhymeScore(normalizedWord, entryWord);

    // Пороги для різних типів рим
    const threshold = type === 'phonetic' ? 7 : 10;

    if (rhymeScore >= threshold) {
      rhymes.push({
        word: entry.word,
        score: rhymeScore,
        partOfSpeech: entry.partOfSpeech,
      });
    }
  });

  // Сортування за балами рими
  return rhymes.sort((a, b) => b.score - a.score);
};

// Функції для різних типів рим
const findDictionaryRhymes = async word => findRhymes(word, 'dictionary');
const findPhoneticRhymes = async word => findRhymes(word, 'phonetic');

// Пошук кастомних рим (наприклад, з урахуванням суржику)
const findCustomRhymes = async word => {
  if (!word) return [];
  const customRhymes = [];
  const lowerWord = normalizeWord(word);

  // Кастомні рими з урахуванням суржику
  const surzhykMap = {
    хлопець: ['парень', 'пацан', 'малий'],
    дівчина: ['дєвушка', 'дівка'],
    дім: ['дом', 'хата'],
    робота: ['работа', 'діло'],
    говорити: ['говорить', 'балакать'],
    пити: ['пить', 'хлєбати'],
    їсти: ['кушать', 'жувати'],
    купувати: ['покупать', 'брать'],
    ходити: ['ходить', 'топтать'],
    дивитися: ['смотреть', 'глядєть'],
    жити: ['жить', 'існувати'],
    писати: ['писать', 'черкать'],
    читати: ['читать', 'глядать'],
    знати: ['знать', 'відать'],
    думати: ['думать', 'гадать'],
    мати: ['імєть'],
    питати: ['спрашувать', 'спрашивать'],
    бачити: ['відєть', 'бачить'],
    бігти: ['бігать', 'бєжать'],
    давати: ['давать', 'подавать'],
    сидіти: ['сидіть', 'сідіть'],
    спати: ['спать', 'дрімать'],
    працювати: ['работать', 'трудиться'],
    чекати: ['ждать', 'дожидаться'],
    відчувати: ['чувствовать', 'ощущать'],
    любити: ['любить', 'кохать'],
    розуміти: ['понімать', 'тямить'],
    брати: ['брать', 'забірать'],
    давно: ['давно', 'давненько'],
    треба: ['нада', 'нужно'],
    можливо: ['можна', 'возможно'],
    великий: ['большой', 'здоровий'],
    маленький: ['малий', 'маленький'],
    швидко: ['бистро', 'скоро'],
    повільно: ['мєдлєнно', 'поволі'],
    добрий: ['хароший', 'добрий'],
    поганий: ['плахой', 'дурний'],
  };

  const possibleRhymes = surzhykMap[lowerWord] || [];

  possibleRhymes.forEach(rhyme => {
    const rhymeNormalized = normalizeWord(rhyme);
    const score = calculateRhymeScore(lowerWord, rhymeNormalized);
    if (score > 0) {
      customRhymes.push({
        word: rhyme,
        score,
        type: 'custom',
      });
    }
  });

  return customRhymes.sort((a, b) => b.score - a.score);
};

export {
  findDictionaryRhymes,
  findPhoneticRhymes,
  findCustomRhymes,
  getWordData,
};
