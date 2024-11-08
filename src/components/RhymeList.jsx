import React from 'react';
import {
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const RhymeList = ({ rhymesData }) => {
  if (!rhymesData || rhymesData.length === 0) {
    return null;
  }

  // Сортуємо рими за балом рими (score) у спадному порядку
  const sortedRhymes = [...rhymesData].sort((a, b) => b.score - a.score);

  // Розбиваємо рими на категорії за їхнім балом
  const categorizedRhymes = sortedRhymes.reduce((acc, rhyme) => {
    const { score, word } = rhyme;

    let category = 'Інші';

    if (score >= 15) {
      category = 'Найкращі';
    } else if (score >= 10) {
      category = 'Дуже хороші';
    } else if (score >= 7) {
      category = 'Хороші';
    }

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push({ word, score });
    return acc;
  }, {});

  return (
    <Box>
      {Object.keys(categorizedRhymes).map(category => {
        const rhymes = categorizedRhymes[category];

        // Якщо більше 20 слів у категорії, використовуємо акордеон
        const useAccordion = rhymes.length > 20;

        const content = (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {rhymes.map((rhyme, index) => (
              <Chip
                key={index}
                label={rhyme.word}
                variant="outlined"
                // Можливо, додати відображення балу рими
                // label={`${rhyme.word} (${rhyme.score})`}
              />
            ))}
          </Box>
        );

        return (
          <Box key={category} sx={{ mb: 3 }}>
            {useAccordion ? (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>{content}</AccordionDetails>
              </Accordion>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {category}
                </Typography>
                {content}
              </>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default RhymeList;
