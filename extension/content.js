// content.js
class ProductTracker {
    constructor() {
      // Store selectors for different e-commerce platforms
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
      this.initialize();
    }
  
    // Detect which e-commerce platform we're on
    detectPlatform() {
      const hostname = window.location.hostname;
      if (hostname.includes('amazon')) return 'amazon';
      if (hostname.includes('ebay')) return 'ebay';
      if (hostname.includes('walmart')) return 'walmart';
      if (hostname.includes('bestbuy')) return 'bestbuy';
      if (hostname.includes('target')) return 'target';
      return null;
    }
  
    // Check if current page is a product page
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
  
    // Extract product information using platform-specific selectors
    getProductInfo() {
      if (!this.currentPlatform) return null;
      const platformSelectors = this.selectors[this.currentPlatform];
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : null;
      };
  
      return {
        sessionId: this.generateSessionId(),
        platform: this.currentPlatform,
        productUrl: window.location.href,
        productTitle: getTextContent(platformSelectors.title),
        price: getTextContent(platformSelectors.price),
        productCategory: getTextContent(platformSelectors.category),
        timespent: 1,
        timestamp: new Date().toISOString()
      };
    }
  
    // Generate unique session ID
    generateSessionId() {
      return `${this.currentPlatform}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  
    // Track user interaction metrics
    trackUserInteraction() {
      let scrollDepth = 0;
      let lastScrollTime = null;
  
      // Track scroll depth
      document.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollDepth = Math.max(scrollDepth, (currentScroll / maxScroll) * 100);
        lastScrollTime = new Date();
      });
  
      // Return tracking data when needed
      return {
        scrollDepth: Math.round(scrollDepth),
        timeSpent: lastScrollTime ? 
          Math.round((lastScrollTime - this.pageLoadTime) / 1000) : 0
      };
    }
  
    // Initialize tracking
    initialize() {
      if (!this.isProductPage()){
        return;
      } 
  
      const productInfo = this.getProductInfo();
      if (!productInfo) return;
  
      // Send initial page view data
      chrome.runtime.sendMessage({
        type: 'PRODUCT_VIEW',
        data: {
          ...productInfo,
          eventType: 'VIEW'
        }
      });
      console.log('message sent')
  
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
  

  console.log("Content script loaded"); // Debug loading

  window.addEventListener("message", function(event) {
      console.log("Message received in content script:", event.data); // Debug incoming messages
      
      // Make sure we're only accepting messages from our webpage
      if (event.origin !== "http://localhost:3006") {
          console.log("Wrong origin:", event.origin);
          return;
      }
      
      if (event.data.type === "FROM_PAGE") {
          console.log("Valid message received, sending to background");
          chrome.runtime.sendMessage({ 
              action: "LOGIN_SUCCESS", 
              token: event.data.token 
          }).then(response => {
              console.log("Background script response:", response);
          }).catch(error => {
              console.log("Error sending message to background:", error);
          });
      }
  });

  // Initialize tracker when page loads
  new ProductTracker();