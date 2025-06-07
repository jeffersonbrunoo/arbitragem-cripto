import React, { useEffect, useRef, useState } from 'react';
import socket from '../services/socket';

const METAS = {
  'BUBB': { min: 0, max: 10 },
};

export default function Alert() {
  const audioRef = useRef(null);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
  socket.on('spotData', ({ symbol, data }) => {
    const cleanSymbol = symbol.replace('USDT', '').toUpperCase();
    const rawLucro = data.lucroReverso;
    const lucro = parseFloat(String(rawLucro).replace('%', '').replace(',', '.'));
    const range = METAS[cleanSymbol];

    console.log('[DEBUG] Symbol recebido:', symbol);
    console.log('[DEBUG] Symbol limpo:', cleanSymbol);
    console.log('[DEBUG] lucroReverso bruto:', rawLucro);
    console.log('[DEBUG] lucroReverso parseado:', lucro);
    console.log('[DEBUG] Alvo mínimo:', range?.min);

    if (!range) return;
    if (isNaN(lucro)) {
      console.warn(`[WARN] lucroReverso inválido para ${cleanSymbol}:`, rawLucro);
      return;
    }

    if (lucro >= range.min && lucro <= range.max) {
      setAlertas(prev => {
        if (!prev.includes(cleanSymbol)) {
          console.log(`🔔 Alvo atingido: ${cleanSymbol}, lucroReverso: ${lucro}%`);
          audioRef.current?.play().catch(err => {
            console.error('Erro ao tocar áudio:', err.message);
          });
          setTimeout(() => {
            setAlertas(p => p.filter(s => s !== cleanSymbol));
          }, 10000);
          return [...prev, cleanSymbol];
        }
        return prev;
      });
    }
  });

  return () => socket.off('spotData');
}, []);


  return (
    <>
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />
      <button onClick={() => audioRef.current.play()} style={{ position: 'absolute', top: 10, right: 10 }}>
        🔊 Testar Alerta Sonoro
      </button>
    </>
  );
}
