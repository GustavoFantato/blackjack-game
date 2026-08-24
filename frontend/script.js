const API_URL = 'http://localhost:8080/api/game'

/* DOM'S ELEMENTS */

// To altenate between the screens
const modalWelcome = document.getElementById('modal-welcome');
const gameBoard = document.getElementById('game-board');

// Screen 1 interactions
const formLogin = document.getElementById('form-login');
const nicknameInput = document.getElementById('input-nickname');
const betInput = document.getElementById('input-bet');
const strategySelect = document.getElementById('select-strategy') 

// Screen 2 HUD
const hudNickname = document.getElementById('hud-nickname');
const hudBalance = document.getElementById('hud-balance');


/* --- SECTION 1 - WELCOME'S SCREEN --- */

// Button's listener (PLAY NOW)
formLogin.addEventListener('submit', async function(event) {

    // Refresh preventing
    event.preventDefault();

    const nickname = nicknameInput.value;
    const bet = parseFloat(betInput.value);
    const strategy = strategySelect.value;

    if (!nickname || nickname.length < 3) {
        alert("Please enter a valid nickname (minimum 3 characters).");
        return;
    }

    if (isNaN(bet) || bet <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    try{
        const response = await fetch(`${API_URL}/start?name=${encodeURIComponent(nickname)}&strategy=${strategy}&bet=${bet}`, {
            method: 'POST'
        });

        if(!response.ok){
            throw new Error(`API's error: ${response.status}`);
        }

        const game = await response.json();

        // Injecting the nickname in the HUD com a fonte Spectral
        hudNickname.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Logged in as:</span> <span style="color: #FFFFFF;">${nickname}</span>`;
        hudBalance.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Balance:</span> <span style="color: #FFFFFF;">$${game.player.wallet.cash}</span>`;

        modalWelcome.classList.add('hidden'); // hidding the section 1
        gameBoard.classList.remove('hidden'); // removing the hidding class

    } catch (error){
        console.error("Error while starting the game", error);
        alert("Insufficient funds or backend error! Check your database balance.");
    }

});



/* --- SECTION 2 - GAME BOARD's SCREEN --- */

