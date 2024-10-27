function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function getVisibleElementsText() {
    return new Promise((resolve) => {
        const texts = [];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Check if the entry is actually visible in the viewport
                    if (isElementInViewport(entry.target)) {
                        if (entry.target.childNodes.length && entry.target.childNodes[0].nodeType === Node.TEXT_NODE) {
                            const text = entry.target.innerText.trim();
                            if (text) {
                                texts.push(text);
                            }
                        }
                    }
                }
            });
        }, {
            root: null, // Use the viewport as the root
            threshold: 0.1 // Trigger when at least 10% of the element is visible
        });

        // Observe all elements on the page
        const allElements = Array.from(document.body.getElementsByTagName("*"));
        allElements.forEach(el => observer.observe(el));

        // Using a MutationObserver to keep observing as new elements may appear
        const mutationObserver = new MutationObserver(() => {
            // Re-observe all elements after mutations
            const updatedElements = Array.from(document.body.getElementsByTagName("*"));
            updatedElements.forEach(el => {
                if (!texts.includes(el.innerText.trim()) && isElementInViewport(el)) {
                    observer.observe(el);
                }
            });
        });

        // Start observing for mutations in the body
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        // After a short timeout, stop observing and resolve the promise
        setTimeout(() => {
            observer.disconnect(); // Stop observing
            mutationObserver.disconnect(); // Stop observing mutations
            const combinedTexts = texts.join(" ");
            resolve(combinedTexts);
        }, 1000); // Adjust the timeout as needed
    });
}
async function getPageText() {
    const texts = await getVisibleElementsText();
    
    // Perform pattern matching on the combined text of visible elements
    const keywords = texts.match(/(Price|Discount|Sale|Add to Cart|Free Shipping)/gi);
    const productNames = texts.match(/(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,})+/g);
    
    return {
        keywords,
        productNames
    };
}

// Usage
getPageText().then(data => {
    console.log(data);
});