// Cloudflare Pages Functions - API proxy for Scryfall
export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
  
  // Only allow POST requests to /api/process-decklist
  if (request.method !== 'POST' || !url.pathname.includes('/api/process-decklist')) {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { deckText } = await request.json()
    
    if (!deckText || typeof deckText !== 'string') {
      return new Response('Invalid request body', { status: 400 })
    }

    // Parse decklist into cards
    const lines = deckText.trim().split('\n')
    const cards = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        continue
      }
      
      // Parse format: "4 Lightning Bolt"
      const match = trimmedLine.match(/^(\d+)\s+(.+)$/)
      if (match) {
        const quantity = parseInt(match[1])
        const name = match[2].trim()
        
        cards.push({
          name,
          quantity,
          price: 0, // Will be fetched
          id: Math.random().toString(36).substr(2, 9)
        })
      }
    }

    const results = []
    
    for (const card of cards) {
      try {
        // Search for card in Scryfall
        const searchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.name)}`
        const response = await fetch(searchUrl)
        
        if (response.ok) {
          const data = await response.json()
          const scryfallCard = data.data?.[0]
          
          if (scryfallCard) {
            results.push({
              ...card,
              price: scryfallCard.prices?.usd || 0,
              imageUrl: scryfallCard.image_uris?.small || null,
              setName: scryfallCard.set_name || 'Unknown',
              manaCost: scryfallCard.mana_cost || '',
              type: scryfallCard.type_line || 'Unknown'
            })
          } else {
            results.push({
              ...card,
              price: 0,
              imageUrl: null,
              setName: 'Not Found',
              manaCost: '',
              type: 'Unknown'
            })
          }
        } else {
          results.push({
            ...card,
            price: 0,
            imageUrl: null,
            setName: 'Search Failed',
            manaCost: '',
            type: 'Unknown'
          })
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        results.push({
          ...card,
          price: 0,
          imageUrl: null,
          setName: 'Error',
          manaCost: '',
          type: 'Unknown'
        })
      }
    }
    
    return new Response(JSON.stringify({ cards: results }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    return new Response('Internal server error', { status: 500 })
  }
}
