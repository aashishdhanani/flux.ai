class TimeCircuit {
    constructor() {
      this.fluxCapacitor = new Date();
      this.currentProduct = null;
      this.gigawattsConsumed = 0;
      this.initializeFluxCapacitor();
    }
  
    initializeFluxCapacitor() {
      if (this.isTemporalDestination()) {
        this.currentProduct = this.scanTemporalCoordinates();
        this.logTemporalJump();
        this.monitorTemporalFlux();
      }
    }
  
    isTemporalDestination() {
      // Check if we're on a product page
      return window.location.href.includes('/dp/') || // Amazon
             window.location.href.includes('/itm/') || // eBay
             window.location.href.includes('/ip/');    // Walmart
    }
  
    scanTemporalCoordinates() {
      // Extract product information
      const destinationTime = {
        productName: document.querySelector('h1')?.textContent || 'Flux Capacitor',
        plutoniumCost: document.querySelector('.price')?.textContent || '1.21 Gigawatts',
        temporalLocation: window.location.href,
        timestamp: this.getHillValleyTime()
      };
  
      return destinationTime;
    }
  
    getHillValleyTime() {
      const now = new Date();
      return now.toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'short'
      });
    }
  
    logTemporalJump() {
      chrome.runtime.sendMessage({
        type: 'TEMPORAL_ENTRY',
        data: {
          ...this.currentProduct,
          startTime: this.fluxCapacitor.toISOString(),
          message: "Doc, we've arrived at the product page!",
          speedometer: 0
        }
      });
    }
  
    monitorTemporalFlux() {
      // Track scroll speed
      let lastScrollPosition = 0;
      let lastScrollTime = Date.now();
  
      document.addEventListener('scroll', () => {
        const currentPosition = window.scrollY;
        const currentTime = Date.now();
        const timeDiff = currentTime - lastScrollTime;
        
        if (timeDiff > 0) {
          const scrollSpeed = Math.abs(currentPosition - lastScrollPosition) / timeDiff;
          this.gigawattsConsumed += scrollSpeed * 0.00121; // Convert to Gigawatts
  
          if (scrollSpeed > 88) {
            console.log("🚗 ⚡ Time travel in progress!");
          }
        }
  
        lastScrollPosition = currentPosition;
        lastScrollTime = currentTime;
      });
    }
  
    async returnToPresent() {
      if (this.currentProduct) {
        const presentTime = new Date();
        const timeSpentInPast = presentTime - this.fluxCapacitor;
        
        await chrome.runtime.sendMessage({
          type: 'TEMPORAL_EXIT',
          data: {
            ...this.currentProduct,
            timeSpentSeconds: Math.round(timeSpentInPast / 1000),
            gigawattsConsumed: this.gigawattsConsumed.toFixed(3),
            endTime: presentTime.toISOString(),
            message: "Roads? Where we're going, we don't need roads!"
          }
        });
      }
    }
  }
  
  // Initialize time circuits
  const delorean = new TimeCircuit();
  
  // Listen for temporal distortions (page unload)
  window.addEventListener('beforeunload', () => {
    delorean.returnToPresent();
  });
  
  