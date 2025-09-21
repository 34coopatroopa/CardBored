export async function onRequest(context) {
  const { request } = context

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { deckText } = await request.json()
    
    if (!deckText) {
      return new Response('No deck text', { status: 400 })
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
        cards.push({
          name: match[2].trim(),
          quantity: parseInt(match[1]),
          price: 0,
          id: Math.random().toString(36).substr(2, 9)
        })
      }
    }

    // Fetch prices
    const results = []
    for (const card of cards) {
      try {
        const searchUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`
        const response = await fetch(searchUrl)
        
        if (response.ok) {
          const data = await response.json()
          results.push({
            ...card,
            price: parseFloat(data.prices?.usd) || 0,
            imageUrl: data.image_uris?.small || null,
            setName: data.set_name || 'Unknown',
            manaCost: data.mana_cost || '',
            type: data.type_line || 'Unknown'
          })
        } else {
          // Try fuzzy search
          const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.name)}`
          const fuzzyResponse = await fetch(fuzzyUrl)
          
          if (fuzzyResponse.ok) {
            const fuzzyData = await fuzzyResponse.json()
            const scryfallCard = fuzzyData.data?.[0]
            
            if (scryfallCard) {
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
        }
        
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
    return new Response('Server error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}