export async function onRequestGet() {
  return new Response(
    JSON.stringify({ 
      message: "Use POST with { deckText } to process decklists",
      example: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { deckText: "4 Lightning Bolt\n2 Sol Ring" }
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
    const deckText = body.deckText || ""
    
    if (!deckText) {
      return new Response(JSON.stringify({ error: 'No deck text provided' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Parse decklist into cards
    const lines = deckText.trim().split('\n').map(l => l.trim()).filter(Boolean)
    const results = []
    
    console.log(`Processing ${lines.length} decklist lines`)
    
    for (const line of lines) {
      // Skip comments
      if (line.startsWith('//') || line.startsWith('#')) {
        continue
      }
      
      // Extract quantity + card name
      const match = line.match(/^(\d+)\s+(.*)$/)
      if (!match) {
        console.log(`Skipping invalid line: "${line}"`)
        continue
      }
      
      const qty = parseInt(match[1], 10)
      const cardName = match[2].trim()
      
      console.log(`Looking up card: "${cardName}" (${qty}x)`)
      
      try {
        // Use fuzzy search (more reliable than exact)
        const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
        const res = await fetch(url)
        
        if (!res.ok) {
          console.warn(`Scryfall fetch failed for "${cardName}": ${res.status}`)
          results.push({
            name: cardName,
            quantity: qty,
            price: 0,
            imageUrl: null,
            setName: 'Not Found',
            manaCost: '',
            type: 'Unknown',
            id: Math.random().toString(36).substr(2, 9)
          })
          continue
        }
        
        const data = await res.json()
        
        // Use best available price
        const price = parseFloat(data.prices?.usd || data.prices?.usd_foil || data.prices?.eur || 0)
        
        console.log(`Found "${cardName}" as "${data.name}": $${price}`)
        
        results.push({
          name: data.name, // Use Scryfall's official name
          quantity: qty,
          price: price,
          imageUrl: data.image_uris?.small || null,
          setName: data.set_name || 'Unknown',
          manaCost: data.mana_cost || '',
          type: data.type_line || 'Unknown',
          id: Math.random().toString(36).substr(2, 9)
        })
        
        // Rate limiting - be gentle with Scryfall
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error fetching "${cardName}": ${error.message}`)
        results.push({
          name: cardName,
          quantity: qty,
          price: 0,
          imageUrl: null,
          setName: 'Error',
          manaCost: '',
          type: 'Unknown',
          id: Math.random().toString(36).substr(2, 9)
        })
      }
    }

    console.log(`Successfully processed ${results.length} cards`)
    
    return new Response(JSON.stringify({ cards: results }), {
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
