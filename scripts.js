// -----------------------------
// ACCESS CODES
// -----------------------------
const CODES = {
  LAUNCHER: '918',  // CrazyGames
  GROWDEN:  '819',  // Growden.io
  POKETUBE: '818',  // PokeTube (replaces Roblox)
  CLOUDMOON:'919',  // CloudMoon Gaming
};

let currentPage = 'login';
const $ = (id) => document.getElementById(id);

// -----------------------------
// ADVANCED POPUP INTERCEPTOR FOR CLOUDMOON
// -----------------------------
(function setupAdvancedPopupHandler() {
  const originalOpen = window.open;
  
  window.open = function(url, target, features) {
    console.warn('🚫 Popup intercepted:', url || 'unknown');
    
    // If on CloudMoon page, load URL in the iframe instead
    if (currentPage === 'cloudmoon' && url && url !== 'about:blank') {
      const cloudFrame = $('cloudmoonFrame');
      if (cloudFrame) {
        console.log('🎮 Loading game in iframe:', url);
        cloudFrame.src = url;
        return {
          closed: false,
          close() { console.log('Fake window close called'); },
          focus() {},
          blur() {},
          postMessage() {}
        };
      }
    }
    
    // For other cases, open in about:blank
    const newWindow = originalOpen('about:blank', target || '_blank', features);
    
    if (newWindow && url && url !== 'about:blank') {
      try {
        newWindow.location.href = url;
      } catch (e) {
        console.warn('Could not navigate popup window:', e);
      }
    }
    
    return newWindow;
  };

  // Also intercept window.location changes in iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'navigate' && currentPage === 'cloudmoon') {
      const cloudFrame = $('cloudmoonFrame');
      if (cloudFrame && event.data.url) {
        console.log('🎮 Message-based navigation:', event.data.url);
        cloudFrame.src = event.data.url;
      }
    }
  });
})();

// -----------------------------
// PAGE SWITCHING LOGIC
// -----------------------------
function showPage(page) {
  currentPage = page;

  // Hide all pages first
  ['loginPage', 'launcherPage', 'growdenPage', 'poketubePage', 'cloudmoonPage'].forEach(id => {
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
      $('cloudmoonFrame').src = 'https://web.cloudmoonapp.com/';
      console.log('🌙 CloudMoon loaded - popups will redirect to iframe');
      break;
  }
}

function showLogin() {
  showPage('login');
}

// -----------------------------
// ACCESS CODE CHECK
// -----------------------------
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
  } else {
    error.textContent = '❌ Invalid code. Please try again.';
    $('accessCode').style.animation = 'shake 0.5s';
    setTimeout(() => {
      $('accessCode').style.animation = '';
      error.textContent = '';
    }, 1600);
  }
}

// -----------------------------
// CRAZYGAMES LAUNCHER LOGIC
// -----------------------------
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

// -----------------------------
// EVENT LISTENERS
// -----------------------------
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

  document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', showLogin));

  showLogin();

  console.log('%c✅ Launcher Ready', 'color:#4fc3f7;font-size:18px;font-weight:bold;');
  console.log('%cCloudMoon popups → iframe redirect active', 'color:#ff6b6b;');
});

// -----------------------------
// CONFIRM BEFORE EXIT
// -----------------------------
window.addEventListener('beforeunload', (e) => {
  if (currentPage !== 'login') {
    e.preventDefault();
    e.returnValue = '';
  }
});
