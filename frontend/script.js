const API_URL = 'https://blackjack-game-aa4k.onrender.com';

const modalWelcome = document.getElementById('modal-welcome');
const gameBoard = document.getElementById('game-board');

const formLogin = document.getElementById('form-login');
const nicknameInput = document.getElementById('input-nickname');
const betInput = document.getElementById('input-bet');
const strategySelect = document.getElementById('select-strategy');

const hudNickname = document.getElementById('hud-nickname');
const hudBalance = document.getElementById('hud-balance');
const hitButton = document.getElementById('btn-hit');
const standButton = document.getElementById('btn-stand');
const botStrategyElem = document.getElementById('bot-strategy');

// NOVO: Cadeado global para evitar spam de cliques
let isProcessing = false; 

formLogin.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Se já estiver a carregar um pedido, ignora os cliques extra
    if (isProcessing) return; 

    const nickname = nicknameInput.value;
    const bet = parseFloat(betInput.value);
    const strategy = strategySelect.value;
    const strategyText = strategySelect.options[strategySelect.selectedIndex].text;

    if (!nickname || nickname.length < 3) {
        alert("Please enter a valid nickname (minimum 3 characters).");
        return;
    }

    if (isNaN(bet) || bet <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    isProcessing = true; // Tranca o cadeado
    const submitBtn = formLogin.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true; // Desativa o botão de play visualmente

    try {
        const response = await fetch(`${API_URL}/api/game/start?name=${encodeURIComponent(nickname)}&strategy=${strategy}&bet=${bet}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`API's error: ${response.status}`);
        }

        const game = await response.json();

        if (botStrategyElem) {
            botStrategyElem.innerText = strategyText.toUpperCase();
        }

        updateUI(game);

        if (hitButton) hitButton.disabled = false;
        if (standButton) standButton.disabled = false;

        modalWelcome.classList.add('hidden');
        gameBoard.classList.remove('hidden');

    } catch (error) {
        alert("Insufficient funds or backend error! Check your database balance.");
    } finally {
        isProcessing = false; // Destranca o cadeado quer dê erro ou sucesso
        if (submitBtn) submitBtn.disabled = false;
    }
});

hitButton?.addEventListener('click', async() => {
    if (isProcessing || hitButton.disabled) return;
    
    isProcessing = true;
    hitButton.disabled = true;
    standButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/game/hit`, { method: 'POST'});

        if(!response.ok) {
            const errorText = await response.text();
            alert(`Invalid move!\n${errorText}`);
            return;
        }

        const game = await response.json();
        updateUI(game);

    } catch (error) {
        alert("An error occurred while hitting a card.");
    } finally {
        isProcessing = false;
        // O updateUI já se encarrega de reativar os botões se o jogo não tiver acabado
        if (document.getElementById('modal-result')?.classList.contains('hidden')) {
             hitButton.disabled = false;
             standButton.disabled = false;
        }
    }
});

standButton?.addEventListener('click', async() => {
    if (isProcessing || standButton.disabled) return;
    
    isProcessing = true;
    hitButton.disabled = true;
    standButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/game/stand`, { method: 'POST' });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const game = await response.json();
        updateUI(game);

    } catch (error) {
        alert("Failed to process stand action. Please try again.");
    } finally {
        isProcessing = false;
    }
});

async function updateUI(game) {
    if (!game) return;

    if (hudNickname) {
        const pName = game.player?.name || nicknameInput.value;
        hudNickname.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Logged in as:</span> <span style="color: #FFFFFF;">${pName}</span>`;
    }
    
    const isRoundFinishedForHud = game.playerStand === true || game.isPlayerStand === true || game.state === 'FINISHED' || game.isGameOver || (game.player?.hand?.score > 21);

    if (hudBalance && !isRoundFinishedForHud) {
        const pCash = game.player?.wallet?.cash ?? game.player?.balance ?? 0;
        hudBalance.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Balance:</span> <span style="color: #FFFFFF;">$${pCash}</span>`;
    }

    const playerCards = game.player?.hand?.cards || game.player?.cards || [];
    
    let dealerObj = game.dealer || game.bot || game.croupier || game.dealerHand;
    if (!dealerObj) {
        dealerObj = Object.values(game).find(val => val && typeof val === 'object' && (val.hand || val.cards) && val !== game.player);
    }

    const dealerCards = dealerObj?.hand?.cards || dealerObj?.cards || [];
    
    const isStandAction = game.playerStand === true || game.isPlayerStand === true || game.state === 'FINISHED';
    const isDealerRevealed = Boolean(isStandAction || game.isGameOver || (game.player?.hand?.score > 21));

    let playerScore = game.player?.hand?.score ?? game.player?.score;
    let dealerScore = dealerObj?.hand?.score ?? dealerObj?.score;

    if (!playerScore) playerScore = calculateScoreFallback(playerCards);
    if (!dealerScore) dealerScore = calculateScoreFallback(dealerCards);

    const playerScoreElem = document.getElementById('player-score');
    const dealerScoreElem = document.getElementById('dealer-score');
    const currentBetElem = document.getElementById('current-bet');

    if (playerScoreElem) playerScoreElem.innerText = playerScore;
    if (currentBetElem && betInput) currentBetElem.innerText = `${betInput.value} $`;


    // --- RENDERIZAÇÃO E ANIMAÇÕES ---
    renderCards('player-cards', playerCards, false, false, !isStandAction, false);

    const dealerContainer = document.getElementById('dealer-cards');

    if (isDealerRevealed) {
        if (hitButton) hitButton.disabled = true;
        if (standButton) standButton.disabled = true;

        if (dealerContainer.children.length === 0) {
            renderCards('dealer-cards', dealerCards.slice(0, 2), true, false, false, false);
        }

        await sleep(600);

        if (dealerContainer.children.length >= 2 && dealerCards.length >= 2) {
            const hiddenCard = dealerContainer.children[1];
            
            if (hiddenCard.classList.contains('hidden-card')) {
                hiddenCard.className = 'card animate-flip'; 
                
                const card = dealerCards[1];
                const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS' || card.suit === '♥' || card.suit === '♦';
                if (isRed) hiddenCard.classList.add('red');

                const displayValue = formatCardValue(card.value || card.rank);
                const suitSymbol = getSuitSymbol(card.suit);

                hiddenCard.innerHTML = `
                    <div class="card-corner top-left">
                        <div>${displayValue}</div>
                        <div class="suit">${suitSymbol}</div>
                    </div>
                    <div class="card-center">${suitSymbol}</div>
                    <div class="card-corner bottom-right">
                        <div>${displayValue}</div>
                        <div class="suit">${suitSymbol}</div>
                    </div>
                `;

                if (dealerScoreElem) {
                    dealerScoreElem.innerText = calculateScoreFallback(dealerCards.slice(0, 2));
                }

                await sleep(1800);
            }
        }

        for (let i = 2; i < dealerCards.length; i++) {
            if (dealerContainer.children.length > i) continue;

            const card = dealerCards[i];
            const newCardElem = document.createElement('div');
            newCardElem.className = 'card animate-drop'; 
            
            const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS' || card.suit === '♥' || card.suit === '♦';
            if (isRed) newCardElem.classList.add('red');

            const displayValue = formatCardValue(card.value || card.rank);
            const suitSymbol = getSuitSymbol(card.suit);

            newCardElem.innerHTML = `
                <div class="card-corner top-left">
                    <div>${displayValue}</div>
                    <div class="suit">${suitSymbol}</div>
                </div>
                <div class="card-center">${suitSymbol}</div>
                <div class="card-corner bottom-right">
                    <div>${displayValue}</div>
                    <div class="suit">${suitSymbol}</div>
                </div>
            `;
            
            dealerContainer.appendChild(newCardElem);

            if (dealerScoreElem) {
                dealerScoreElem.innerText = calculateScoreFallback(dealerCards.slice(0, i + 1));
            }

            await sleep(1800);
        }

        if (dealerScoreElem) dealerScoreElem.innerText = dealerScore;
        checkGameStatus(game, playerScore);

    } else {
        renderCards('dealer-cards', dealerCards, true, false, false, false);
        if (dealerScoreElem) dealerScoreElem.innerText = '?';
        checkGameStatus(game, playerScore);
    }

    if (dealerScoreElem) dealerScoreElem.innerText = isDealerRevealed ? dealerScore : '?';

    const isPlayerBust = playerScore > 21;
    const isRoundFinished = isPlayerBust || game.playerStand === true || game.isPlayerStand === true || game.state === 'FINISHED';

    if (isRoundFinished) {
        if (hitButton) hitButton.disabled = true;
        if (standButton) standButton.disabled = true;
        
        await showEndGameSequence(game, playerScore, dealerScore);
    }
}

function calculateScoreFallback(cards) {
    if (!cards || cards.length === 0) return 0;
    let score = 0;
    let aces = 0;

    cards.forEach(card => {
        const val = (card.value || card.rank || '').toString().toUpperCase();
        if (['KING', 'QUEEN', 'JACK', 'K', 'Q', 'J', '10'].includes(val)) {
            score += 10;
        } else if (val === 'ACE' || val === 'A') {
            aces += 1;
            score += 11;
        } else {
            const num = parseInt(formatCardValue(val), 10);
            score += isNaN(num) ? 0 : num;
        }
    });

    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }

    return score;
}

function renderCards(containerId, cards, isDealer = false, isRevealed = false, animateLast = false, animateFlip = false) {
    const container = document.getElementById(containerId);
    if (!container || !cards) return;

    container.innerHTML = '';

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';

        if (animateLast && index === cards.length - 1) {
            cardElement.classList.add('animate-drop');
        }
        
        if (animateFlip && index === 1) {
            cardElement.classList.add('animate-flip');
        }

        const isHidden = isDealer && index === 1 && !isRevealed;

        if (isHidden) {
            cardElement.classList.add('hidden-card');
            cardElement.innerHTML = `
                <div class="card-corner top-left"></div>
                <div class="card-center">🂠</div>
                <div class="card-corner bottom-right"></div>
            `;
        } else {
            const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS' || card.suit === '♥' || card.suit === '♦';
            if (isRed) cardElement.classList.add('red');

            const displayValue = formatCardValue(card.value || card.rank);
            const suitSymbol = getSuitSymbol(card.suit);

            cardElement.innerHTML = `
                <div class="card-corner top-left">
                    <div>${displayValue}</div>
                    <div class="suit">${suitSymbol}</div>
                </div>
                <div class="card-center">${suitSymbol}</div>
                <div class="card-corner bottom-right">
                    <div>${displayValue}</div>
                    <div class="suit">${suitSymbol}</div>
                </div>
            `;
        }

        container.appendChild(cardElement);
    });
}

function getSuitSymbol(suit) {
    switch (suit) {
        case 'HEARTS': return '♥';
        case 'DIAMONDS': return '♦';
        case 'CLUBS': return '♣';
        case 'SPADES': return '♠';
        default: return suit;
    }
}

function checkGameStatus(game, currentScore) {
    const isPlayerBust = currentScore > 21;
    const isRoundOver = isPlayerBust || game.playerStand || game.isGameOver; 

    if (isRoundOver) {
        if (hitButton) hitButton.disabled = true;
        if (standButton) standButton.disabled = true;
    }
}

function formatCardValue(value) {
    if (!value) return '';
    const map = {
        'ONE': '1', 'TWO': '2', 'THREE': '3', 'FOUR': '4', 'FIVE': '5',
        'SIX': '6', 'SEVEN': '7', 'EIGHT': '8', 'NINE': '9', 'TEN': '10',
        'JACK': 'J', 'QUEEN': 'Q', 'KING': 'K', 'ACE': 'A'
    };
    return map[value.toUpperCase()] || value;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


async function showEndGameSequence(game, pScore, dScore) {
    const modalResult = document.getElementById('modal-result');
    const resultTitle = document.getElementById('result-title');
    const resultNickname = document.getElementById('result-nickname');
    const resultBalance = document.getElementById('result-balance');
    
    const pBust = pScore > 21;
    const dBust = dScore > 21;
    
    let message = "DRAW!";
    let textClass = "text-draw";

    if (!pBust && (dBust || pScore > dScore)) {
        message = "YOU WIN!";
        textClass = "text-win";
    } else if (pBust || (!pBust && dScore > pScore)) {
        message = "YOU LOSE!";
        textClass = "text-lose";
    }

    if (resultTitle) {
        resultTitle.innerText = message;
        resultTitle.className = textClass;
    }
    
    if (resultNickname) {
        resultNickname.innerText = game.player?.name || nicknameInput.value;
    }
    
    if (resultBalance) {
        resultBalance.innerText = game.player?.wallet?.cash ?? game.player?.balance ?? 0;
    }

    await sleep(500);

    if (modalResult) {
        modalResult.classList.remove('hidden');
    }
}

const btnPlayAgain = document.getElementById('btn-play-again');
const btnLeaveTable = document.getElementById('btn-leave-table');

/* --- LÓGICA DO PLAY AGAIN --- */
btnPlayAgain?.addEventListener('click', async () => {
    // Evita o double click
    if (isProcessing) return;
    isProcessing = true;
    btnPlayAgain.disabled = true; // Desativa visualmente o botão

    const modalResult = document.getElementById('modal-result');
    if (modalResult) modalResult.classList.add('hidden');

    const nickname = nicknameInput.value;
    const bet = parseFloat(betInput.value);
    const strategy = strategySelect.value;

    try {
        const response = await fetch(`${API_URL}/api/game/start?name=${encodeURIComponent(nickname)}&strategy=${strategy}&bet=${bet}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const game = await response.json();

        document.getElementById('dealer-cards').innerHTML = '';
        document.getElementById('player-cards').innerHTML = '';

        updateUI(game);

        if (hitButton) hitButton.disabled = false;
        if (standButton) standButton.disabled = false;

    } catch (error) {
        alert("Insufficient funds to play again or backend error!");
    } finally {
        isProcessing = false; // Liberta o cadeado
        btnPlayAgain.disabled = false; // Reativa o botão
    }
});

/* --- LÓGICA DO LEAVE TABLE --- */
btnLeaveTable?.addEventListener('click', () => {
    const modalResult = document.getElementById('modal-result');
    if (modalResult) modalResult.classList.add('hidden');
    
    gameBoard.classList.add('hidden');
    modalWelcome.classList.remove('hidden');
    formLogin.reset(); 

    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('player-score').innerText = '0';
    document.getElementById('dealer-score').innerText = '?';
    
    if (hudNickname) hudNickname.innerHTML = '';
    if (hudBalance) hudBalance.innerHTML = '';
    
    const botStrategyElem = document.getElementById('bot-strategy');
    if (botStrategyElem) botStrategyElem.innerText = '';
});