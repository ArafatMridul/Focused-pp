let reply = "";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "VIDEO_TITLES") {
    console.log("Received single title:", message.title);
    console.log("Received all titles:", message.data);
  }
});

// `You are analyzing YouTube video title similarity.

// Main video title: "${mainTitle}"

// Suggested video titles:
// ${suggestedTitles}

// Task:
// Return ONLY a JSON array of indices (numbers) for suggested titles that are semantically similar to the main title.

// Criteria for similarity:
// - Same topic or subject matter
// - Same technology/tools discussed
// - Same problem being solved
// - Similar use case or application

// Ignore titles that are:
// - Different topics
// - Tangentially related
// - Generic recommendations

// Response format (valid JSON array only):
// [0, 5, 12]

// Your response:`,
