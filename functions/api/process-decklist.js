// Scryfall bulk data processing with KV caching
// This avoids rate limits and subrequest issues

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
    const { CARD_DB } = context.env
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

    console.log(`Processing decklist with ${deckText.split('\n').length} lines`)

    // Check KV cache for Scryfall bulk data
    let cardsJson = await CARD_DB.get("scryfall-cards", "json")
    let cacheTimestamp = await CARD_DB.get("scryfall-cards-timestamp", "text")
    
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    // If cache is missing or older than 1 day, fetch fresh data
    if (!cardsJson || !cacheTimestamp || (now - parseInt(cacheTimestamp)) > oneDay) {
      console.log('Cache miss or stale data, fetching fresh Scryfall bulk data...')
      
      try {
        // Fetch bulk data metadata
        const bulkMetaResponse = await fetch("https://api.scryfall.com/bulk-data/default-cards")
        if (!bulkMetaResponse.ok) {
          throw new Error(`Failed to fetch bulk metadata: ${bulkMetaResponse.status}`)
        }
        const bulkMeta = await bulkMetaResponse.json()
        
        console.log(`Fetching bulk data from: ${bulkMeta.download_uri}`)
        
        // Fetch the actual bulk data
        const bulkDataResponse = await fetch(bulkMeta.download_uri)
        if (!bulkDataResponse.ok) {
          throw new Error(`Failed to fetch bulk data: ${bulkDataResponse.status}`)
        }
        const bulkData = await bulkDataResponse.json()
        
        console.log(`Fetched ${bulkData.length} cards from Scryfall`)
        
        // Create lookup table by normalized card name
        const lookup = {}
        for (const card of bulkData) {
          if (card.name && card.prices) {
            const normalizedName = card.name.toLowerCase().trim()
            lookup[normalizedName] = {
              name: card.name,
              prices: card.prices,
              image_uris: card.image_uris,
              set_name: card.set_name,
              mana_cost: card.mana_cost,
              type_line: card.type_line
            }
          }
        }
        
        // Store in KV with timestamp
        await CARD_DB.put("scryfall-cards", JSON.stringify(lookup))
        await CARD_DB.put("scryfall-cards-timestamp", now.toString())
        
        cardsJson = lookup
        console.log(`Cached ${Object.keys(lookup).length} cards in KV`)
        
      } catch (error) {
        console.error('Failed to fetch bulk data:', error.message)
        
        // If we have stale cache, use it
        if (cardsJson) {
          console.log('Using stale cache due to fetch error')
        } else {
          throw new Error('No cache available and bulk data fetch failed')
        }
      }
    } else {
      console.log('Using cached Scryfall data')
    }

    // Process decklist
    const lines = deckText.trim().split('\n').map(l => l.trim()).filter(Boolean)
    const results = []
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
      
      // Lookup in cached data
      const card = cardsJson[normalizedName]
      
      let price = "N/A"
      let imageUrl = null
      let setName = "Not Found"
      let manaCost = ""
      let type = "Unknown"
      
      if (card) {
        price = card.prices?.usd || card.prices?.usd_foil || "N/A"
        if (price !== "N/A") {
          totalCost += parseFloat(price) * qty
        }
        imageUrl = card.image_uris?.small || null
        setName = card.set_name || "Unknown"
        manaCost = card.mana_cost || ""
        type = card.type_line || "Unknown"
      }
      
      results.push({
        name: cardName,
        quantity: qty,
        price: price,
        imageUrl: imageUrl,
        setName: setName,
        manaCost: manaCost,
        type: type,
        id: Math.random().toString(36).substr(2, 9)
      })
    }

    console.log(`Successfully processed ${results.length} cards, total cost: $${totalCost.toFixed(2)}`)
    
    return new Response(JSON.stringify({ 
      cards: results, 
      totalCost: totalCost.toFixed(2),
      timestamp: new Date().toISOString(),
      cacheAge: cacheTimestamp ? Math.round((now - parseInt(cacheTimestamp)) / (60 * 60 * 1000)) : null
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