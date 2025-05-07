// src/components/CoinActionButton.jsx
import React from 'react';
import { Button } from 'react-bootstrap';

export default function CoinActionButton({ symbol, onClick }) {
  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={e => {
        e.stopPropagation();       // bloqueia o click na linha
        onClick(symbol);
      }}
    >
      Ver
    </Button>
  );
}
