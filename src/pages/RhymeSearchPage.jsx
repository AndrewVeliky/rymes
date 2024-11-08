import React, { useState } from 'react';
import RhymeList from '../components/RhymeList';
import {
  findDictionaryRhymes,
  findPhoneticRhymes,
  findCustomRhymes,
} from './utils';

// Імпорт компонентів Material-UI
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Container,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const RhymeSearchPage = () => {
  const [word, setWord] = useState('');
  const [dictionaryRhymes, setDictionaryRhymes] = useState([]);
  const [phoneticRhymes, setPhoneticRhymes] = useState([]);
  const [customRhymes, setCustomRhymes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!word.trim()) {
      setError('Будь ласка, введіть слово для пошуку.');
      return;
    }

    setLoading(true);
    setError(null);

    const dictionaryResults = await findDictionaryRhymes(word);
    const phoneticResults = await findPhoneticRhymes(word);
    const customResults = await findCustomRhymes(word);

    setDictionaryRhymes(dictionaryResults);
    setPhoneticRhymes(phoneticResults);
    setCustomRhymes(customResults);
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Пошук рим
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Введіть слово"
          variant="outlined"
          value={word}
          onChange={e => {
            setWord(e.target.value);
            if (error) setError(null);
          }}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </Box>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Знайти рими
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading &&
        !dictionaryRhymes.length &&
        !phoneticRhymes.length &&
        !customRhymes.length &&
        word &&
        !error && (
          <Typography variant="body1" align="center" color="textSecondary">
            Рими не знайдено.
          </Typography>
        )}

      {/* Акордеон для власних рим */}
      {customRhymes.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Власні рими</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RhymeList rhymesData={customRhymes} />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Акордеон для словникових рим */}
      {dictionaryRhymes.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Словникові рими</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RhymeList rhymesData={dictionaryRhymes} />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Акордеон для фонетичних рим */}
      {phoneticRhymes.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Фонетичні рими</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RhymeList rhymesData={phoneticRhymes} />
          </AccordionDetails>
        </Accordion>
      )}
    </Container>
  );
};

export default RhymeSearchPage;
