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

    // Test if we can make any external requests at all
    console.log('Testing external connectivity...')
    try {
      const testResponse = await fetch('https://httpbin.org/get')
      console.log(`Test request status: ${testResponse.status}`)
      console.log(`Test request ok: ${testResponse.ok}`)
    } catch (testError) {
      console.log(`Test request failed: ${testError.message}`)
    }

    // For now, return mock data to test the frontend
    console.log('Returning mock data for testing...')
    const results = cards.map((card, index) => ({
      ...card,
      price: Math.random() * 50, // Random prices for testing
      imageUrl: null,
      setName: `Mock Set ${index + 1}`,
      manaCost: '{' + (index % 6) + '}',
      type: index % 2 === 0 ? 'Creature' : 'Instant'
    }))
    
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