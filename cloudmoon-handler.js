// CloudMoon-specific functionality
const CloudMoonHandler = {
  // Store references to original window methods
  originalMethods: {
    open: window.open,
    pushState: history.pushState,
    replaceState: history.replaceState
  },

  // Keep track of the last URL to prevent loops
  lastUrl: '',

  // Initialize the handler
  init() {
    this.setupPopupInterception();
    this.setupNavigationInterception();
    this.setupMessageHandling();
    this.setupMutationObserver();
  },

  // Handle URL changes and loading in iframe
  handleUrl(url) {
    if (!url || url === 'about:blank' || url === this.lastUrl) return;
    
    const cloudFrame = document.getElementById('cloudmoonFrame');
    if (!cloudFrame) return;

    // Check if URL is a CloudMoon game URL
    if (url.includes('web.cloudmoonapp.com') || 
        url.includes('run-site') ||
        url.includes('game=') ||
        url.includes('cloudmoonapp.com')) {
      
      console.log('🎮 Loading CloudMoon game:', url);
      this.lastUrl = url;
      cloudFrame.src = url;
      return true;
    }
    return false;
  },

  // Set up popup interception
  setupPopupInterception() {
    window.open = (url, target, features) => {
      console.log('🚫 Intercepted window.open:', url);
      
      if (this.handleUrl(url)) {
        return {
          closed: false,
          close() {},
          focus() {},
          blur() {},
          postMessage(msg) { window.postMessage(msg, '*'); }
        };
      }
      
      // For non-CloudMoon URLs, maintain original behavior
      return this.originalMethods.open.call(window, url, target, features);
    };
  },

  // Set up navigation interception
  setupNavigationInterception() {
    // Override history methods
    history.pushState = (...args) => {
      if (typeof args[2] === 'string') {
        this.handleUrl(args[2]);
      }
      return this.originalMethods.pushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      if (typeof args[2] === 'string') {
        this.handleUrl(args[2]);
      }
      return this.originalMethods.replaceState.apply(history, args);
    };

    // Listen for URL changes
    window.addEventListener('popstate', () => {
      this.handleUrl(window.location.href);
    });
  },

  // Set up message handling
  setupMessageHandling() {
    window.addEventListener('message', (event) => {
      try {
        const data = event.data;
        
        // Handle string messages (direct URLs)
        if (typeof data === 'string') {
          this.handleUrl(data);
          return;
        }
        
        // Handle object messages
        if (data && typeof data === 'object') {
          // Check for URL in various common formats
          const url = data.url || data.gameUrl || data.href || data.src;
          if (url) {
            this.handleUrl(url);
            return;
          }
          
          // Handle navigation events
          if (data.type === 'navigate' && data.url) {
            this.handleUrl(data.url);
            return;
          }
        }
      } catch (e) {
        console.warn('Error processing message:', e);
      }
    });
  },

  // Set up mutation observer to catch dynamic changes
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target.tagName === 'A' && target.href) {
            this.handleUrl(target.href);
          }
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['href', 'src']
    });
  }
};
