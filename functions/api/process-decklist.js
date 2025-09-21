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

    // Fetch prices with individual searches (simpler and more reliable)
    const results = []
    const maxRequests = 20 // Limit to avoid subrequest limits
    
    for (let i = 0; i < Math.min(cards.length, maxRequests); i++) {
      const card = cards[i]
      
      try {
        console.log(`Searching for card ${i + 1}/${Math.min(cards.length, maxRequests)}: ${card.name}`)
        
        // Try exact search first
        const exactUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`
        const response = await fetch(exactUrl)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Found ${card.name}, price: ${data.prices?.usd}`)
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
          const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.name)}&order=released&dir=desc&unique=cards`
          const fuzzyResponse = await fetch(fuzzyUrl)
          
          if (fuzzyResponse.ok) {
            const fuzzyData = await fuzzyResponse.json()
            const foundCard = fuzzyData.data?.[0]
            
            if (foundCard) {
              console.log(`Fuzzy found ${card.name} as ${foundCard.name}, price: ${foundCard.prices?.usd}`)
              results.push({
                ...card,
                price: parseFloat(foundCard.prices?.usd) || 0,
                imageUrl: foundCard.image_uris?.small || null,
                setName: foundCard.set_name || 'Unknown',
                manaCost: foundCard.mana_cost || '',
                type: foundCard.type_line || 'Unknown'
              })
            } else {
              console.log(`No fuzzy match for ${card.name}`)
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
            console.log(`Both searches failed for ${card.name}`)
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
        
        // Rate limiting
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
    
    // Add remaining cards without prices if we hit the limit
    for (let i = maxRequests; i < cards.length; i++) {
      results.push({
        ...cards[i],
        price: 0,
        imageUrl: null,
        setName: 'Not Processed',
        manaCost: '',
        type: 'Unknown'
      })
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