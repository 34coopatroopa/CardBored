// Scryfall bulk data processing with bundled cards.json
// This eliminates the need for KV and makes the app work offline

// Import the bundled cards data
import cardsData from "../../dist/cards.json";

// Extract just the card data (excluding metadata)
const cards = Object.fromEntries(
  Object.entries(cardsData).filter(([key]) => key !== '_metadata')
);

export async function onRequestGet() {
  return new Response(
    JSON.stringify({ 
      message: "Use POST with { decklist, threshold } to process decklists",
      example: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { decklist: "4 Lightning Bolt\n2 Sol Ring", threshold: 3.0 }
      }
    }),
    { 
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*'
      } 
    }
  );
}

export async function onRequestPost(context) {
  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  try {
    const body = await context.request.json()
    const deckText = body.deckText || body.decklist || ""
    const threshold = parseFloat(body.threshold) || 3.0
    
    if (!deckText) {
      return new Response(JSON.stringify({ error: 'No deck text provided' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log(`Processing decklist with ${deckText.split('\n').length} lines, threshold: $${threshold}`)

    // Process decklist using bundled cards data
    const lines = deckText.trim().split('\n').map(l => l.trim()).filter(Boolean)
    const doNotProxy = []
    const proxy = []
    let totalCost = 0

    for (const line of lines) {
      // Skip comments
      if (line.startsWith('//') || line.startsWith('#')) {
        continue
      }
      
      // Parse quantity + card name
      const match = line.match(/^(\d+)\s+(.*)$/)
      if (!match) {
        console.log(`Skipping invalid line: "${line}"`)
        continue
      }
      
      const qty = parseInt(match[1], 10)
      const cardName = match[2].trim()
      const normalizedName = cardName.toLowerCase()
      
      // Lookup in bundled cards data
      const card = cards[normalizedName]
      
      let price = "N/A"
      let imageUrl = null
      let setName = "Not Found"
      let manaCost = ""
      let type = "Unknown"
      
      if (card) {
        price = card.price || "N/A"
        if (price !== "N/A") {
          totalCost += parseFloat(price) * qty
        }
        imageUrl = card.imageUrl || null
        setName = card.setName || "Unknown"
        manaCost = card.manaCost || ""
        type = card.type || "Unknown"
      }
      
      const cardData = {
        name: cardName,
        quantity: qty,
        price: price,
        imageUrl: imageUrl,
        setName: setName,
        manaCost: manaCost,
        type: type,
        id: Math.random().toString(36).substr(2, 9)
      }
      
      // Split into doNotProxy (≤ threshold or N/A) vs proxy (> threshold)
      if (price === "N/A" || parseFloat(price) <= threshold) {
        doNotProxy.push(cardData)
      } else {
        proxy.push(cardData)
      }
    }

    console.log(`Successfully processed ${doNotProxy.length + proxy.length} cards, total cost: $${totalCost.toFixed(2)}`)
    console.log(`Do not proxy: ${doNotProxy.length} cards, Proxy: ${proxy.length} cards`)
    
    return new Response(JSON.stringify({ 
      doNotProxy: doNotProxy,
      proxy: proxy,
      totalCost: totalCost.toFixed(2),
      timestamp: Math.floor(Date.now() / 1000)
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Function error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}