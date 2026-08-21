const API_URL = 'https://localhost:8080/api/game'

/* DOM'S ELEMENTS */

// To altenate between the screens
const modalWelcome = document.getElementById('modal-welcome');
const gameBoard = document.getElementById('game-board');

// Screen 1 interactions
const formLogin = document.getElementById('form-login');
const nicknameInput = document.getElementById('input-nickname');

// Screen 2 HUD
const hudNickname = document.getElementById('hud-nickname');
const hudBalance = document.getElementById('hud-balance');


/* --- SECTION 1 - WELCOME'S SCREEN --- */

// Button's listener (PLAY NOW)
formLogin.addEventListener('submit', async function(event) {

    // Refresh preventing
    event.preventDefault();

    const nickname = nicknameInput.value;

    // Simulating balance (while no BD's available)
    const balance = 500; 

    // Injecting the nickname in the HUD com a fonte Spectral
    hudNickname.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Logged in as:</span> <span style="color: #FFFFFF;">${nickname}</span>`;
    hudBalance.innerHTML = `<span style="color: #D4AF37; font-weight: 600;">Balance:</span> <span style="color: #FFFFFF;">$${balance}</span>`;

    modalWelcome.classList.add('hidden'); // hidding the section 1
    gameBoard.classList.remove('hidden'); // removing the hidding class
});



/* --- SECTION 2 - GAME BOARD's SCREEN --- */

