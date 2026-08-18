import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/api/game';

function App() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/start?name=Gustavo&strategy=1&bet=50`, { method: 'POST' });
      const data = await res.json();
      setGameState(data);
    } catch (err) {
      console.error('Erro ao iniciar jogo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHit = async () => {
    try {
      const res = await fetch(`${API_URL}/hit`, { method: 'POST' });
      const data = await res.json();
      setGameState(data);
    } catch (err) {
      console.error('Erro ao pedir carta:', err);
    }
  };

  const handleStand = async () => {
    try {
      const res = await fetch(`${API_URL}/stand`, { method: 'POST' });
      const data = await res.json();
      setGameState(data);
    } catch (err) {
      console.error('Erro ao dar stand:', err);
    }
  };

  return (
      <div className="game-container">
        <h1>♠️ BlackJack Web 🔴</h1>

        {!gameState ? (
            <button className="btn primary" onClick={startGame} disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar Novo Jogo'}
            </button>
        ) : (
            <div className="board">
              {/* MÃO DO DEALER */}
              <div className="hand-section">
                <h2>Dealer ({gameState.bot.hand.score} pts)</h2>
                <div className="cards">
                  {gameState.bot.hand.cards.map((card, idx) => (
                      <div key={idx} className={`card ${!card.faceUp ? 'hidden' : ''}`}>
                        {card.faceUp ? `${card.rank} de ${card.suit}` : '🎴 Oculta'}
                      </div>
                  ))}
                </div>
              </div>

              {/* PAINEL DE CONTROLES */}
              <div className="controls">
                <button className="btn" onClick={handleHit}>Pedir Carta (Hit)</button>
                <button className="btn" onClick={handleStand}>Parar (Stand)</button>
                <button className="btn danger" onClick={startGame}>Nova Rodada</button>
              </div>

              {/* MÃO DO JOGADOR */}
              <div className="hand-section">
                <h2>{gameState.player.name} ({gameState.player.hand.score} pts)</h2>
                <div className="cards">
                  {gameState.player.hand.cards.map((card, idx) => (
                      <div key={idx} className="card">
                        {card.rank} de {card.suit}
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;