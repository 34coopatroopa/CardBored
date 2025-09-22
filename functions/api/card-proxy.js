// Import the bundled cards data
import cards from "../../dist/cards.json";

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

    // Search in the bundled cards data
    const normalizedName = cardName.toLowerCase().trim()
    const card = cards[normalizedName]
    
    if (card) {
      return new Response(JSON.stringify(card), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // Card not found in bundled data
    return new Response('Card not found', { 
      status: 404,
      headers: {
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
