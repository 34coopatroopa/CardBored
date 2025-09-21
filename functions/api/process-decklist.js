export async function onRequest(context) {
  const { request } = context

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { deckText } = await request.json()
    
    if (!deckText) {
      return new Response('No deck text provided', { status: 400 })
    }

    // Parse decklist
    const lines = deckText.trim().split('\n')
    const cards = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        continue
      }
      
      const match = trimmedLine.match(/^(\d+)\s+(.+)$/)
      if (match) {
        const quantity = parseInt(match[1])
        const name = match[2].trim()
        cards.push({
          name,
          quantity,
          price: 0,
          id: Math.random().toString(36).substr(2, 9)
        })
      }
    }

    // Fetch prices for each card
    const results = []
    
    for (const card of cards) {
      try {
        // Try exact name search first
        let searchUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`
        let response = await fetch(searchUrl)
        
        // If exact search fails, try fuzzy search
        if (!response.ok) {
          searchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.name)}`
          response = await fetch(searchUrl)
        }
        
        if (response.ok) {
          const data = await response.json()
          const scryfallCard = data.data?.[0] || data
          
          results.push({
            ...card,
            price: parseFloat(scryfallCard.prices?.usd) || 0,
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
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
        
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
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    return new Response('Internal server error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}