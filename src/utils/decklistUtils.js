import axios from 'axios'

const API_BASE = '/api'

// Parse a decklist text into card objects
export function parseDecklist(deckText) {
  const lines = deckText.trim().split('\n')
  const cards = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
      continue
    }
    
    // Parse format: "4 Lightning Bolt"
    const match = trimmedLine.match(/^(\d+)\s+(.+)$/)
    if (match) {
      const quantity = parseInt(match[1])
      const name = match[2].trim()
      
      cards.push({
        name,
        quantity,
        price: 0, // Will be fetched later
        id: Math.random().toString(36).substr(2, 9) // Temporary ID
      })
    }
  }
  
  return cards
}

// Fetch card prices using our backend API
export async function fetchCardPrices(deckText) {
  try {
    console.log('=== fetchCardPrices START ===')
    console.log('DeckText length:', deckText.length)
    console.log('API_BASE:', API_BASE)
    console.log('Full URL:', `${API_BASE}/process-decklist`)
    
    const requestData = { deckText }
    console.log('Request data:', requestData)
    
    const response = await axios.post(`${API_BASE}/process-decklist`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    })
    
    console.log('Response status:', response.status)
    console.log('Response data:', response.data)
    console.log('Response cards length:', response.data?.cards?.length || 0)
    
    const result = response.data.cards || []
    console.log('=== fetchCardPrices SUCCESS ===')
    return result
    
  } catch (error) {
    console.error('=== fetchCardPrices ERROR ===')
    console.error('Error object:', error)
    console.error('Error message:', error.message)
    console.error('Error response:', error.response)
    console.error('Error response data:', error.response?.data)
    console.error('Error response status:', error.response?.status)
    console.error('Error response headers:', error.response?.headers)
    
    // Try to provide more specific error messages
    if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error - check your internet connection')
    } else if (error.response?.status === 404) {
      throw new Error('API endpoint not found - function may not be deployed')
    } else if (error.response?.status === 500) {
      throw new Error('Server error - check Cloudflare Pages function logs')
    } else if (error.response?.status === 405) {
      throw new Error('Method not allowed - API function configuration issue')
    } else {
      throw new Error(`Failed to fetch card prices: ${error.message}`)
    }
  }
}

// Format price for display
export function formatPrice(price) {
  if (price === 0) return 'No price data'
  if (price < 0.01) return '<$0.01'
  return `$${price.toFixed(2)}`
}

// Calculate total value
export function calculateTotal(cards) {
  return cards.reduce((total, card) => total + (card.price * card.quantity), 0)
}

// Export decklist as text
export function exportDecklist(cards, title = 'Decklist') {
  const header = `// ${title}\n\n`
  const cardLines = cards.map(card => `${card.quantity} ${card.name}`).join('\n')
  return header + cardLines
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

// Download as file
export function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
