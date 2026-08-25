const API_URL = 'http://localhost:8080/api/game';

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

formLogin.addEventListener('submit', async function(event) {
    event.preventDefault();

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

    try {
        const response = await fetch(`${API_URL}/start?name=${encodeURIComponent(nickname)}&strategy=${strategy}&bet=${bet}`, {
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
    }
});

hitButton?.addEventListener('click', async() => {
    try {
        const response = await fetch(`${API_URL}/hit`, { method: 'POST'});

        if(!response.ok) {
            const errorText = await response.text();
            alert(`Invalid move!\n${errorText}`);
            return;
        }

        const game = await response.json();
        updateUI(game);

    } catch (error) {
        alert("An error occurred while hitting a card.");
    }
});

standButton?.addEventListener('click', async() => {
    try {
        const response = await fetch(`${API_URL}/stand`, { method: 'POST' });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const game = await response.json();
        updateUI(game);

        if (hitButton) hitButton.disabled = true;
        if (standButton) standButton.disabled = true;

    } catch (error) {
        alert("Failed to process stand action. Please try again.");
    }
});

function updateUI(game) {
    if (!game) return;

    if (hudNickname) {
        const pName = game.player?.name || nicknameInput.value;
        hudNickname.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Logged in as:</span> <span style="color: #FFFFFF;">${pName}</span>`;
    }
    
    if (hudBalance) {
        const pCash = game.player?.wallet?.cash ?? game.player?.balance ?? 0;
        hudBalance.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Balance:</span> <span style="color: #FFFFFF;">$${pCash}</span>`;
    }

    const playerCards = game.player?.hand?.cards || game.player?.cards || [];
    
    let dealerObj = game.dealer || game.bot || game.croupier || game.dealerHand;
    if (!dealerObj) {
        dealerObj = Object.values(game).find(val => val && typeof val === 'object' && (val.hand || val.cards) && val !== game.player);
    }

    const dealerCards = dealerObj?.hand?.cards || dealerObj?.cards || [];
    
    const isPlayerStand = game.playerStand === true || game.isPlayerStand === true || game.state === 'FINISHED';
    const isDealerRevealed = Boolean(isPlayerStand || game.isGameOver || (game.player?.hand?.score > 21));

    renderCards('player-cards', playerCards, false, false);
    renderCards('dealer-cards', dealerCards, true, isDealerRevealed);

    let playerScore = game.player?.hand?.score ?? game.player?.score;
    let dealerScore = dealerObj?.hand?.score ?? dealerObj?.score;

    if (!playerScore) playerScore = calculateScoreFallback(playerCards);
    if (!dealerScore) dealerScore = calculateScoreFallback(dealerCards);

    const playerScoreElem = document.getElementById('player-score');
    const dealerScoreElem = document.getElementById('dealer-score');
    const currentBetElem = document.getElementById('current-bet');

    if (playerScoreElem) playerScoreElem.innerText = playerScore;
    if (dealerScoreElem) dealerScoreElem.innerText = isDealerRevealed ? dealerScore : '?';
    if (currentBetElem && betInput) currentBetElem.innerText = betInput.value;

    checkGameStatus(game, playerScore);
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

function renderCards(containerId, cards, isDealer = false, isRevealed = false) {
    const container = document.getElementById(containerId);
    if (!container || !cards) return;

    container.innerHTML = '';

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';

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