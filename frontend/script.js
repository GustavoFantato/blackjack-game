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

async function updateUI(game) {
    if (!game) return;

    if (hudNickname) {
        const pName = game.player?.name || nicknameInput.value;
        hudNickname.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Logged in as:</span> <span style="color: #FFFFFF;">${pName}</span>`;
    }
    
    // 1. Cria a trava: Verifica se é o final da rodada (Stand, Bust, ou GameOver)
    const isRoundFinishedForHud = game.playerStand === true || game.isPlayerStand === true || game.state === 'FINISHED' || game.isGameOver || (game.player?.hand?.score > 21);

    // 2. Só atualiza o saldo do HUD no meio da partida. Se o jogo acabou, congela o valor!
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
    
    // Jogador (Anima somente a última, e bloqueia se for Stand)
    renderCards('player-cards', playerCards, false, false, !isStandAction, false);

    const dealerContainer = document.getElementById('dealer-cards');

if (isDealerRevealed) {
        if (hitButton) hitButton.disabled = true;
        if (standButton) standButton.disabled = true;

        // 1. Garante que as 2 cartas iniciais estão renderizadas
        if (dealerContainer.children.length === 0) {
            renderCards('dealer-cards', dealerCards.slice(0, 2), true, false, false, false);
        }

        await sleep(600); // Suspense inicial

        // 2. FLIP: Transforma a carta virada
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

                // ATUALIZA O PLACAR: Soma apenas as duas primeiras cartas
                if (dealerScoreElem) {
                    dealerScoreElem.innerText = calculateScoreFallback(dealerCards.slice(0, 2));
                }

                await sleep(1800); // 800ms da animação + 1 segundo extra
            }
        }

        // 3. DROP: O dealer compra cartas
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

            // ATUALIZA O PLACAR: Soma as cartas na mesa até o momento atual (i + 1)
            if (dealerScoreElem) {
                dealerScoreElem.innerText = calculateScoreFallback(dealerCards.slice(0, i + 1));
            }

            await sleep(1800); // Delay extra entre cada carta nova caindo
        }

        // Atualiza a interface final como garantia
        if (dealerScoreElem) dealerScoreElem.innerText = dealerScore;
        checkGameStatus(game, playerScore);

    } else {
        // Fase Normal do jogo (Dealer oculto)
        renderCards('dealer-cards', dealerCards, true, false, false, false);
        if (dealerScoreElem) dealerScoreElem.innerText = '?';
        checkGameStatus(game, playerScore);
    }

    // Atualiza a interface final como garantia
    if (dealerScoreElem) dealerScoreElem.innerText = isDealerRevealed ? dealerScore : '?';

    // VERIFICA SE O JOGO ACABOU PARA DISPARAR A ANIMAÇÃO FINAL
    const isPlayerBust = playerScore > 21;
    const isRoundFinished = isPlayerBust || game.playerStand === true || game.isPlayerStand === true || game.state === 'FINISHED';

    if (isRoundFinished) {
        if (hitButton) hitButton.disabled = true;
        if (standButton) standButton.disabled = true;
        
        // Dispara a animação e depois abre o painel
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

        // 1. Aplica o drop apenas na última carta comprada
        if (animateLast && index === cards.length - 1) {
            cardElement.classList.add('animate-drop');
        }
        
        // 2. Aplica o flip na carta oculta do dealer quando é a hora de revelar
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
    
    // Lógica para saber quem ganhou
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

    // Injeta os dados no HTML da tela final
    if (resultTitle) {
        resultTitle.innerText = message;
        resultTitle.className = textClass; // Isso garante a cor e o brilho certo!
    }
    
    if (resultNickname) {
        resultNickname.innerText = game.player?.name || nicknameInput.value;
    }
    
    if (resultBalance) {
        resultBalance.innerText = game.player?.wallet?.cash ?? game.player?.balance ?? 0;
    }

    // Dá só meio segundo de respiro depois da última carta antes de escurecer a tela
    await sleep(500);

    // Revela a tela idêntica ao protótipo
    if (modalResult) {
        modalResult.classList.remove('hidden');
    }
}

// Capturando os botões da Section 3
const btnPlayAgain = document.getElementById('btn-play-again');
const btnLeaveTable = document.getElementById('btn-leave-table');

/* --- LÓGICA DO PLAY AGAIN --- */
btnPlayAgain?.addEventListener('click', async () => {
    // 1. Esconde a tela de resultado
    const modalResult = document.getElementById('modal-result');
    if (modalResult) modalResult.classList.add('hidden');

    // 2. Resgata os mesmos dados que o jogador usou na última partida
    const nickname = nicknameInput.value;
    const bet = parseFloat(betInput.value);
    const strategy = strategySelect.value;

    try {
        // 3. Inicia um novo jogo no Backend (O Java vai manter o usuário e descontar a nova aposta)
        const response = await fetch(`${API_URL}/start?name=${encodeURIComponent(nickname)}&strategy=${strategy}&bet=${bet}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const game = await response.json();

        // 4. Limpa a mesa antes de atualizar para não bugar animações antigas
        document.getElementById('dealer-cards').innerHTML = '';
        document.getElementById('player-cards').innerHTML = '';

        // 5. Atualiza a UI com a nova rodada
        updateUI(game);

        // 6. Reativa os botões de ação
        if (hitButton) hitButton.disabled = false;
        if (standButton) standButton.disabled = false;

    } catch (error) {
        alert("Insufficient funds to play again or backend error!");
    }
});

/* --- LÓGICA DO LEAVE TABLE --- */
btnLeaveTable?.addEventListener('click', () => {
    // 1. Esconde a tela de resultado e a mesa de jogo
    const modalResult = document.getElementById('modal-result');
    if (modalResult) modalResult.classList.add('hidden');
    
    gameBoard.classList.add('hidden');
    
    // 2. Mostra a tela inicial de Login
    modalWelcome.classList.remove('hidden');

    // 3. Reseta o formulário inteiro (limpa os inputs e volta o select pro padrão)
    formLogin.reset(); 

    // 4. Limpa a mesa de jogo e placares visualmente para o próximo jogador não ver as cartas antigas
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('player-score').innerText = '0';
    document.getElementById('dealer-score').innerText = '?';
    
    // Opcional: injeta "MODE" vazio de volta na tela para quando o próximo entrar
    const botStrategyElem = document.getElementById('bot-strategy');
    if (botStrategyElem) botStrategyElem.innerText = '';
});