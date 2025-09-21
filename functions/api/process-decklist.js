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

    // Fetch prices using batch search to avoid subrequest limits
    const results = []
    const batchSize = 10 // Process cards in smaller batches
    
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize)
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} with ${batch.length} cards`)
      
      // Try to get multiple cards in one search
      const cardNames = batch.map(card => `!"${card.name}"`).join(' or ')
      const batchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardNames)}&unique=cards&order=name`
      
      try {
        console.log(`Batch search URL: ${batchUrl}`)
        const response = await fetch(batchUrl)
        console.log(`Batch search response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          const foundCards = data.data || []
          console.log(`Batch search found ${foundCards.length} cards`)
          
          // Match found cards with our batch
          for (const card of batch) {
            const foundCard = foundCards.find(fc => 
              fc.name.toLowerCase() === card.name.toLowerCase()
            )
            
            if (foundCard) {
              console.log(`Found ${card.name}, price: ${foundCard.prices?.usd}`)
              results.push({
                ...card,
                price: parseFloat(foundCard.prices?.usd) || 0,
                imageUrl: foundCard.image_uris?.small || null,
                setName: foundCard.set_name || 'Unknown',
                manaCost: foundCard.mana_cost || '',
                type: foundCard.type_line || 'Unknown'
              })
            } else {
              // Try individual search for this card
              try {
                const individualUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`
                const individualResponse = await fetch(individualUrl)
                
                if (individualResponse.ok) {
                  const individualData = await individualResponse.json()
                  results.push({
                    ...card,
                    price: parseFloat(individualData.prices?.usd) || 0,
                    imageUrl: individualData.image_uris?.small || null,
                    setName: individualData.set_name || 'Unknown',
                    manaCost: individualData.mana_cost || '',
                    type: individualData.type_line || 'Unknown'
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
              } catch (individualError) {
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
          }
        } else {
          console.log(`Batch search failed, trying individual searches`)
          // Fall back to individual searches
          for (const card of batch) {
            try {
              const individualUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`
              const individualResponse = await fetch(individualUrl)
              
              if (individualResponse.ok) {
                const individualData = await individualResponse.json()
                results.push({
                  ...card,
                  price: parseFloat(individualData.prices?.usd) || 0,
                  imageUrl: individualData.image_uris?.small || null,
                  setName: individualData.set_name || 'Unknown',
                  manaCost: individualData.mana_cost || '',
                  type: individualData.type_line || 'Unknown'
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
            } catch (individualError) {
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
        }
        
        // Rate limiting between batches
        if (i + batchSize < cards.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
      } catch (error) {
        console.log(`Batch error: ${error.message}`)
        // Add all cards in this batch as errors
        for (const card of batch) {
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