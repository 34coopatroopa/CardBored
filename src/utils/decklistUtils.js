import { processDecklist as apiProcessDecklist } from './api.js'

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

// Fetch card prices using the backend API
export async function fetchCardPrices(deckText) {
  try {
    console.log('=== fetchCardPrices START (Using Backend API) ===')
    console.log('DeckText length:', deckText.length)
    
    // Use the backend API to process the entire decklist
    const response = await apiProcessDecklist(deckText)
    console.log('Backend returned:', response.cards?.length || 0, 'cards')
    
    // Ensure all cards have the required fields
    const results = response.cards?.map(card => ({
      name: card.name || 'Unknown',
      quantity: card.quantity || 1,
      price: card.price === "N/A" ? 0 : parseFloat(card.price) || 0,
      imageUrl: card.imageUrl || null,
      setName: card.setName || 'Unknown',
      manaCost: card.manaCost || '',
      type: card.type || 'Unknown',
      id: card.id || Math.random().toString(36).substr(2, 9)
    })) || []
    
    console.log('=== fetchCardPrices SUCCESS ===')
    return results
    
  } catch (error) {
    console.error('=== fetchCardPrices ERROR ===')
    console.error('Error:', error)
    throw new Error(`Failed to fetch card prices: ${error.message}`)
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
