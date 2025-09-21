export async function onRequest(context) {
  const { request } = context

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  try {
    const url = new URL(request.url)
    const cardName = url.searchParams.get('card')
    
    if (!cardName) {
      return new Response('Missing card parameter', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Try exact search first
    const exactUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`
    let response = await fetch(exactUrl)
    
    if (!response.ok) {
      // Try fuzzy search
      const fuzzyUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}&order=released&dir=desc&unique=cards`
      response = await fetch(fuzzyUrl)
      
      if (response.ok) {
        const data = await response.json()
        const card = data.data?.[0]
        if (card) {
          return new Response(JSON.stringify(card), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          })
        }
      }
      
      return new Response('Card not found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
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
