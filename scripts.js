
// -----------------------------
// ACCESS CODES
// -----------------------------
const CODES = {
  LAUNCHER: '918',  // CrazyGames
  GROWDEN:  '819',  // Growden.io
  POKETUBE: '818',  // PokeTube (replaces Roblox)
  CLOUDMOON:'919',  // CloudMoon Gaming
  UPTOPLAY:'676',   // UptoPlay
};

let currentPage = 'login';
const $ = (id) => document.getElementById(id);

// -----------------------------
// ADVANCED POPUP INTERCEPTOR FOR CLOUDMOON
// -----------------------------
(function setupAdvancedPopupHandler() {
  // Store original window.open
  const originalOpen = window.open;
  
  // Override window.open to intercept popups
  window.open = function(url, target, features) {
    console.warn('\ud83d\udeab Popup intercepted:', url || 'unknown');
    
    // If on CloudMoon page, load URL in the iframe instead
    if (currentPage === 'cloudmoon' && url && url !== 'about:blank') {
      const cloudFrame = $('cloudmoonFrame');
      if (cloudFrame) {
        console.log('\ud83c\udfae Loading game in iframe:', url);
        cloudFrame.src = url;
        // Return a mock window object to prevent errors
        return {
          closed: false,
          close() { console.log('Fake window close called'); },
          focus() {},
          blur() {},
          postMessage() {}
        };
      }
    }
    
    // For other cases, block the popup entirely
    console.log('\ud83d\udeab Popup blocked for security');
    return null;
  };

  // Enhanced message listener for CloudMoon
  window.addEventListener('message', (event) => {
    // Only handle messages when on CloudMoon page
    if (currentPage !== 'cloudmoon') return;
    
    const cloudFrame = $('cloudmoonFrame');
    if (!cloudFrame) return;
    
    try {
      // Handle different types of navigation events
      if (event.data && typeof event.data === 'string') {
        // Check if it's a URL or contains URL-like content
        if (event.data.includes('web.cloudmoonapp.com') || 
            event.data.includes('run-site') ||
            event.data.includes('game=') ||
            event.data.includes('userid=')) {
          console.log('\ud83c\udfae CloudMoon URL detected:', event.data);
          cloudFrame.src = event.data;
          return;
        }
      }
      
      // Handle structured message data
      if (event.data && event.data.url) {
        console.log('\ud83c\udfae Message-based navigation:', event.data.url);
        cloudFrame.src = event.data.url;
        return;
      }
      
      // Handle CloudMoon specific events
      if (event.data && event.data.type === 'cloudmoon-game') {
        if (event.data.gameUrl) {
          console.log('\ud83c\udfae CloudMoon game URL:', event.data.gameUrl);
          cloudFrame.src = event.data.gameUrl;
          return;
        }
      }
      
      // Handle navigation events
      if (event.data && event.data.type === 'navigate') {
        if (event.data.url) {
          console.log('\ud83c\udfae Navigation event:', event.data.url);
          cloudFrame.src = event.data.url;
          return;
        }
      }
      
    } catch (e) {
      console.warn('Error processing CloudMoon message:', e);
    }
  });
  
  // Additional navigation interceptor
  const originalPushState = history.pushState;
  history.pushState = function(state) {
    if (currentPage === 'cloudmoon') {
      console.log('\ud83c\udfae History pushState intercepted:', arguments);
    }
    return originalPushState.apply(history, arguments);
  };
})();

// -----------------------------
// PAGE SWITCHING LOGIC
// -----------------------------
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
      // Load CloudMoon main page
      $('cloudmoonFrame').src = 'https://web.cloudmoonapp.com/';
      console.log('\ud83c\udf19 CloudMoon loaded - popups will redirect to iframe');
      break;
      
    case 'uptoplay':
      $('uptoplayPage').style.display = 'block';
      // Load UptoPlay main page
      $('uptoplayFrame').src = 'https://www.uptoplay.net/';
      console.log('\ud83d\ude80 UptoPlay loaded');
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
  } else if (code === CODES.UPTOPLAY) {
    showPage('uptoplay');
    error.textContent = '';
  } else {
    error.textContent = '\u274c Invalid code. Please try again.';
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
    alert('\u26a0\ufe0f Please enter a game name or URL.');
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
      alert('\u274c Invalid CrazyGames URL.');
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
  console.log(`\ud83c\udfae Loading ${title}: ${url}`);
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

  console.log('%c\u2705 Launcher Ready', 'color:#4fc3f7;font-size:18px;font-weight:bold;');
  console.log('%cCloudMoon popups \u2192 iframe redirect active', 'color:#ff6b6b;');
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
