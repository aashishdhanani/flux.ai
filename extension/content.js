class ProductTracker {
  constructor() {
    this.selectors = {
      amazon: {
        title: '#productTitle',
        price: '.a-price-whole',
        rating: '#acrPopover .a-text-bold',
        reviews: '#acrCustomerReviewText',
        availability: '#availability span',
        category: '#wayfinding-breadcrumbs_container',
      },
      ebay: {
        title: '.x-item-title__mainTitle',
        price: '.x-price-primary',
        rating: '.rating-stars',
        reviews: '.review-item-count',
        availability: '.d-quantity__availability',
        category: '.breadcrumbs',
      },
      walmart: {
        title: '[itemprop="name"]',
        price: '[itemprop="price"]',
        rating: '.rating-number',
        reviews: '.review-count',
        availability: '.prod-ProductOffer-oosMsg',
        category: '.breadcrumb',
      },
      bestbuy: {
        title: '.heading-5',
        price: '.priceView-current-price',
        rating: '.ratingsReviews',
        reviews: '.review-count',
        availability: '.fulfillment-add-to-cart-button',
        category: '.breadcrumb',
      },
      target: {
        title: '[data-test="product-title"]',
        price: '[data-test="product-price"]',
        rating: '.RatingStars',
        reviews: '.h-text-sm',
        availability: '.h-text-availability',
        category: '.Breadcrumb',
      }
    };

    this.sessionStartTime = new Date();
    this.pageLoadTime = new Date();
    this.currentPlatform = this.detectPlatform();
    this.checkLoginAndInitialize();
  }

  async checkLoginAndInitialize() {
    chrome.storage.local.get(['username', 'authToken'], (result) => {
      if (!result.username) {
        console.log('User not logged in - tracking disabled');
        this.showLoginPrompt();
        return;
      }
      this.username = result.username;
      this.initialize();
    });
  }

  showLoginPrompt() {
    chrome.runtime.sendMessage({
      type: 'SHOW_LOGIN_PROMPT',
      data: {
        message: 'Please log in to track your shopping activity'
      }
    });
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('ebay')) return 'ebay';
    if (hostname.includes('walmart')) return 'walmart';
    if (hostname.includes('bestbuy')) return 'bestbuy';
    if (hostname.includes('target')) return 'target';
    return null;
  }

  isProductPage() {
    const url = window.location.href;
    const patterns = {
      amazon: /\/dp\/|\/gp\/product\//,
      ebay: /\/itm\//,
      walmart: /\/ip\//,
      bestbuy: /\/products\//,
      target: /\/p\//
    };

    return this.currentPlatform && patterns[this.currentPlatform].test(url);
  }

  getProductInfo() {
    if (!this.currentPlatform || !this.username) return null;
    
    const platformSelectors = this.selectors[this.currentPlatform];
    const getTextContent = (selector) => {
      const element = document.querySelector(selector);
      return element ? element.textContent.trim() : null;
    };

    const priceText = getTextContent(platformSelectors.price);
    const price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');

    return {
      sessionId: this.generateSessionId(),
      platform: this.currentPlatform,
      productUrl: window.location.href,
      productTitle: getTextContent(platformSelectors.title),
      price: price,
      productCategory: getTextContent(platformSelectors.category),
      timestamp: new Date().toISOString(),
      username: this.username // Include username in product info
    };
  }

  generateSessionId() {
    return `${this.currentPlatform}-${this.username}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  trackUserInteraction() {
    let scrollDepth = 0;
    let lastScrollTime = null;

    document.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollDepth = Math.max(scrollDepth, (currentScroll / maxScroll) * 100);
      lastScrollTime = new Date();
    });

    return {
      scrollDepth: Math.round(scrollDepth),
      timeSpent: lastScrollTime ? 
        Math.round((lastScrollTime - this.pageLoadTime) / 1000) : 0
    };
  }

  initialize() {
    if (!this.isProductPage()) return;

    const productInfo = this.getProductInfo();
    if (!productInfo) return;

    // Send initial page view data
    chrome.runtime.sendMessage({
      type: 'PRODUCT_VIEW',
      data: {
        ...productInfo,
        eventType: 'VIEW'
      }
    }, response => {
      if (response?.error) {
        console.error('Error recording product view:', response.error);
      }
    });

    // Track user interaction
    const interactionMetrics = this.trackUserInteraction();

    // Send data when user leaves page
    window.addEventListener('beforeunload', () => {
      chrome.runtime.sendMessage({
        type: 'PRODUCT_EXIT',
        data: {
          ...productInfo,
          ...interactionMetrics,
          event: 'page_exit',
          totalTimeSpent: Math.round((new Date() - this.sessionStartTime) / 1000)
        }
      });
    });
  }
}

// Handle login messages from the webpage
window.addEventListener("message", function(event) {
    if (event.origin !== "http://localhost:3006") return;
    
    if (event.data.type === "FROM_PAGE" && event.data.userData) {
        chrome.runtime.sendMessage({ 
            action: "LOGIN_SUCCESS", 
            userData: {
                username: event.data.userData.username,
                token: event.data.userData.token
            }
        }).then(response => {
            console.log("Login processed:", response);
            // Reload tracker after successful login
            new ProductTracker();
        }).catch(error => {
            console.error("Login error:", error);
        });
    }
});

// Initialize tracker when page loads
new ProductTracker();