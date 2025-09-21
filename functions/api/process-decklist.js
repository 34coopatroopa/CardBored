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
        console.log(`Searching for card: ${card.name}`)
        const searchUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`
        console.log(`Exact search URL: ${searchUrl}`)
        
        const response = await fetch(searchUrl)
        console.log(`Exact search response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Found card ${card.name}, price: ${data.prices?.usd}`)
          results.push({
            ...card,
            price: parseFloat(data.prices?.usd) || 0,
            imageUrl: data.image_uris?.small || null,
            setName: data.set_name || 'Unknown',
            manaCost: data.mana_cost || '',
            type: data.type_line || 'Unknown'
          })
        } else {
          console.log(`Exact search failed for ${card.name}, trying fuzzy search`)
          // Try fuzzy search
          const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.name)}`
          console.log(`Fuzzy search URL: ${fuzzyUrl}`)
          
          const fuzzyResponse = await fetch(fuzzyUrl)
          console.log(`Fuzzy search response status: ${fuzzyResponse.status}`)
          
          if (fuzzyResponse.ok) {
            const fuzzyData = await fuzzyResponse.json()
            const scryfallCard = fuzzyData.data?.[0]
            console.log(`Fuzzy search found ${scryfallCard ? scryfallCard.name : 'nothing'} for ${card.name}`)
            
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
            console.log(`Fuzzy search failed for ${card.name}, status: ${fuzzyResponse.status}`)
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
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.log(`Error fetching ${card.name}: ${error.message}`)
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