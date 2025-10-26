// Access codes
const CODES = {
  LAUNCHER: '918',  // CrazyGames
  GROWDEN:  '819',  // Growden.io
  POKETUBE: '818',  // PokeTube
  CLOUDMOON:'919',  // CloudMoon Gaming
  UPTOPLAY:'676',   // UptoPlay
};

let currentPage = 'login';
const $ = (id) => document.getElementById(id);

function showPage(page) {
  currentPage = page;

  // Hide all pages first
  ['loginPage', 'launcherPage', 'growdenPage', 'poketubePage', 'cloudmoonPage', 'uptoplayPage'].forEach(id => {
    const el = $(id);
    if (el) el.style.display = 'none';
  });

  switch (page) {
    case 'login':
      $('loginPage').style.display = 'block';
      $('accessCode').value = '';
      $('accessCode').focus();
      break;

    case 'launcher':
      $('launcherPage').style.display = 'block';
      $('gameFrame').src = 'https://games.crazygames.com/en_US/ragdoll-archers/index.html';
      $('currentGame').textContent = 'Ragdoll Archers';
      $('gameName').focus();
      break;

    case 'growden':
      $('growdenPage').style.display = 'block';
      $('growdenFrame').src = 'https://growden.io/';
      break;

    case 'poketube':
      $('poketubePage').style.display = 'block';
      $('poketubeFrame').src = 'https://poketube.fun';
      break;

    case 'cloudmoon':
      $('cloudmoonPage').style.display = 'block';
      // Initialize CloudMoon handler
      CloudMoonHandler.init();
      // Load CloudMoon main page
      $('cloudmoonFrame').src = 'https://web.cloudmoonapp.com/';
      console.log('🌙 CloudMoon loaded with enhanced popup handling');
      break;
      
    case 'uptoplay':
      $('uptoplayPage').style.display = 'block';
      $('uptoplayFrame').src = 'https://www.uptoplay.net/';
      console.log('🚀 UptoPlay loaded');
      break;
  }
}

function showLogin() {
  showPage('login');
}

function checkCode() {
  const code = $('accessCode').value.trim();
  const error = $('errorMessage');

  if (code === CODES.LAUNCHER) {
    showPage('launcher');
    error.textContent = '';
  } else if (code === CODES.GROWDEN) {
    showPage('growden');
    error.textContent = '';
  } else if (code === CODES.POKETUBE) {
    showPage('poketube');
    error.textContent = '';
  } else if (code === CODES.CLOUDMOON) {
    showPage('cloudmoon');
    error.textContent = '';
  } else if (code === CODES.UPTOPLAY) {
    showPage('uptoplay');
    error.textContent = '';
  } else {
    error.textContent = '❌ Invalid code. Please try again.';
    $('accessCode').style.animation = 'shake 0.5s';
    setTimeout(() => {
      $('accessCode').style.animation = '';
      error.textContent = '';
    }, 1600);
  }
}

function launchGame() {
  const inputEl = $('gameName');
  const input = (inputEl.value || '').trim();
  if (!input) {
    alert('⚠️ Please enter a game name or URL.');
    inputEl.focus();
    return;
  }

  let url = '';
  let title = '';

  // Case 1: crazygames.com/game/...
  if (input.includes('crazygames.com/game/')) {
    try {
      const u = new URL(input);
      const slug = u.pathname.split('/').pop();
      const base = slug.split('---')[0].replace(/-/g, ' ');
      title = base.replace(/\b\w/g, c => c.toUpperCase());
      const dashed = base.trim().replace(/\s+/g, '-');
      url = `https://games.crazygames.com/en_US/${dashed}/index.html`;
    } catch {
      alert('❌ Invalid CrazyGames URL.');
      return;
    }
  }
  // Case 2: direct games.crazygames.com link
  else if (input.includes('games.crazygames.com')) {
    url = input;
    try {
      const parts = new URL(input).pathname.split('/');
      title = (parts[parts.length - 2] || 'Custom Game')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
      title = 'Custom Game';
    }
  }
  // Case 3: plain game name
  else {
    const slug = input.toLowerCase().replace(/\s+/g, '-');
    url = `https://games.crazygames.com/en_US/${slug}/index.html`;
    title = input.replace(/\b\w/g, c => c.toUpperCase());
  }

  $('gameFrame').src = url;
  $('currentGame').textContent = title;
  console.log(`🎮 Loading ${title}: ${url}`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  $('accessCode').focus();

  $('enterBtn').addEventListener('click', checkCode);
  $('accessCode').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkCode();
  });

  $('launchButton').addEventListener('click', launchGame);
  $('gameName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') launchGame();
  });

  document.querySelectorAll('[data-back]').forEach(btn => 
    btn.addEventListener('click', showLogin)
  );

  showLogin();

  console.log('%c✅ Launcher Ready', 'color:#4fc3f7;font-size:18px;font-weight:bold;');
});

// Confirm before exit
window.addEventListener('beforeunload', (e) => {
  if (currentPage !== 'login') {
    e.preventDefault();
    e.returnValue = '';
  }
});
