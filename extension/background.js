class ProductAnalyticsService {
    constructor() {
      this.API_BASE_URL = `${URL}/api`;
      this.MAX_RETRIES = 1;
      this.RETRY_DELAY = 1000;
      this.initializeMessageListener();
    }
  
    // Initialize Chrome message listener
    initializeMessageListener() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (['PRODUCT_VIEW', 'PRODUCT_EXIT'].includes(message.type)) {
          this.sendToServer(message.data, sender.tab.id)
            .then(response => sendResponse(response))
            .catch(error => sendResponse({ error: error.message }));
          return true; // Keep message channel open for async response
        }
      });
    }
  
    // Send data to backend server with retry logic
    async sendToServer(data, tabId, attempt = 1) {
      try {
        const response = await fetch(`${this.API_BASE_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Extension-ID': chrome.runtime.id,
            'X-Tab-ID': tabId.toString()
          },
          body: JSON.stringify({
            ...data,
            extensionVersion: chrome.runtime.getManifest().version,
            recordedAt: new Date().toISOString()
          })
        });
  
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
  
        return await response.json();
  
      } catch (error) {
        console.error(`Error sending data (attempt ${attempt}):`, error);
  
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
          return this.sendToServer(data, tabId, attempt + 1);
        }
  
        throw error;
      }
    }
  }
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ authToken: null }, () => {
        console.log('Initial storage set');
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background script received message:", request); // Debug incoming messages
    
    if (request.action === 'LOGIN_SUCCESS') {
        const token = request.token;
        console.log('Processing login token:', token);
        
        // Store the token
        chrome.storage.local.set({ authToken: token }, () => {
            console.log('Token saved to storage');
            // Send response back to content script
            sendResponse({ status: 'success', message: authToken });
        });
        
        // Important: return true to indicate we'll respond asynchronously
        return true;
    }
});

// Function to check login state
function checkLoginState() {
    chrome.storage.local.get(['authToken'], (result) => {
        console.log('Current auth state:', result.authToken ? 'logged in' : 'not logged in');
    });
}

// Check login state periodically
setInterval(checkLoginState, 5000);
  // Initialize analytics service
  new ProductAnalyticsService();
