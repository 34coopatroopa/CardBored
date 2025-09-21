// API helper functions for Cardbored

/**
 * Process a decklist by sending it to the backend API
 * @param {string} decklist - The decklist text to process
 * @returns {Promise<{cards: Array}>} - The processed cards with prices
 */
export async function processDecklist(decklist) {
  console.log('API: Processing decklist via POST /api/process-decklist')
  
  const response = await fetch("/api/process-decklist", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ deckText: decklist }),
  });
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error:', response.status, errorText)
    throw new Error(`Failed to process decklist: ${response.status} ${errorText}`);
  }
  
  const data = await response.json()
  console.log('API: Received', data.cards?.length || 0, 'cards')
  console.log('API: Total cost:', data.totalCost)
  console.log('API: Cache age:', data.cacheAge, 'hours')
  return data;
}

/**
 * Fetch individual card details (for previews)
 * @param {string} cardName - The card name to fetch
 * @returns {Promise<Object>} - Card details from Scryfall
 */
export async function fetchCardDetails(cardName) {
  console.log('API: Fetching card details for:', cardName)
  
  const response = await fetch(`/api/card-proxy?card=${encodeURIComponent(cardName)}`)
  
  if (!response.ok) {
    throw new Error('Card not found')
  }
  
  return await response.json()
}
