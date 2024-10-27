class ProductAnalyticsService {
  constructor() {
    // Define the API URL explicitly
    this.API_BASE_URL = 'http://localhost:3000/api';  // Make sure this matches your backend URL
    this.MAX_RETRIES = 1;
    this.RETRY_DELAY = 1000;
    this.initializeMessageListener();
  }

  initializeMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (['PRODUCT_VIEW', 'PRODUCT_EXIT'].includes(message.type)) {
        // Get username from storage before sending
        chrome.storage.local.get(['username', 'authToken'], async (result) => {
          if (!result.username) {
            sendResponse({ error: 'User not logged in' });
            return;
          }
          
          // Add username to the data
          const enrichedData = {
            ...message.data,
            username: result.username
          };

          try {
            const response = await this.sendToServer(enrichedData, sender.tab.id);
            sendResponse(response);
          } catch (error) {
            console.error('Error in message listener:', error);
            sendResponse({ error: error.message });
          }
        });
        return true;  // Keep message channel open for async response
      }

      if (message.action === 'LOGIN_SUCCESS') {
        this.handleLogin(message.userData, sendResponse);
        return true;
      }
    });
  }

  async sendToServer(data, tabId, attempt = 1) {
    try {
      console.log('Sending data to server:', data);  // Debug log
      
      const response = await fetch(`${this.API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id,
          'X-Tab-ID': tabId.toString(),
          'Access-Control-Allow-Origin': '*'
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

      const responseData = await response.json();
      console.log('Server response:', responseData);  // Debug log
      return responseData;

    } catch (error) {
      console.error(`Error sending data (attempt ${attempt}):`, error);

      if (attempt < this.MAX_RETRIES) {
        console.log(`Retrying... Attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.sendToServer(data, tabId, attempt + 1);
      }

      throw error;
    }
  }

  async handleLogin(userData, sendResponse) {
    try {
      console.log('Handling login:', userData);  // Debug log
      
      // Store token and username
      await chrome.storage.local.set({
        authToken: userData.token,
        username: userData.username
      });
      
      console.log('User data saved to storage');
      sendResponse({ status: 'success', message: 'Login successful' });
    } catch (error) {
      console.error('Error saving user data:', error);
      sendResponse({ status: 'error', message: error.message });
    }
  }
}

// Initialize extension storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    authToken: null,
    username: null 
  }, () => {
      console.log('Initial storage set');
  });
});

// Check login state periodically
setInterval(() => {
  chrome.storage.local.get(['username', 'authToken'], (result) => {
      console.log('Current auth state:', result.username ? `logged in as ${result.username}` : 'not logged in');
  });
}, 5000);

// Initialize analytics service
new ProductAnalyticsService();