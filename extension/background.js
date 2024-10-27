class ProductAnalyticsService {
    constructor() {
      this.API_BASE_URL = 'http://localhost:3000/api';
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
  
  // Initialize analytics service
  new ProductAnalyticsService();