/* chrome.storage.local.get("nlpResult", ({ nlpResult }) => {
    const outputDiv = document.getElementById("output");
    
    if (nlpResult) {
      outputDiv.innerHTML = `
        <h4>Keywords:</h4>
        <p>${nlpResult.keywords.join(", ")}</p>
        <h4>People:</h4>
        <p>${nlpResult.people.join(", ")}</p>
        <h4>Places:</h4>
        <p>${nlpResult.places.join(", ")}</p>
      `;
    } else {
      outputDiv.textContent = "No content analyzed yet.";
    }
  });
   */