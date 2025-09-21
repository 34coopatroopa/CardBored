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

// Fetch card prices directly from Scryfall API
export async function fetchCardPrices(deckText) {
  try {
    console.log('Fetching card prices for deckText:', deckText.substring(0, 100) + '...')
    
    // Parse decklist into cards
    const cards = parseDecklist(deckText)
    console.log('Parsed cards:', cards.length)
    
    const results = []
    
    for (const card of cards) {
      try {
        console.log('Searching for card:', card.name)
        
        // Try exact search first
        let searchUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`
        let response = await fetch(searchUrl)
        
        // If exact search fails, try fuzzy search
        if (!response.ok) {
          searchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(card.name)}`
          response = await fetch(searchUrl)
        }
        
        if (response.ok) {
          const data = await response.json()
          const scryfallCard = data.data?.[0] || data
          
          console.log('Found card:', card.name, 'Price:', scryfallCard.prices?.usd)
          
          results.push({
            ...card,
            price: parseFloat(scryfallCard.prices?.usd) || 0,
            imageUrl: scryfallCard.image_uris?.small || null,
            setName: scryfallCard.set_name || 'Unknown',
            manaCost: scryfallCard.mana_cost || '',
            type: scryfallCard.type_line || 'Unknown'
          })
        } else {
          console.log('Card not found:', card.name)
          results.push({
            ...card,
            price: 0,
            imageUrl: null,
            setName: 'Not Found',
            manaCost: '',
            type: 'Unknown'
          })
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.log('Error fetching card:', card.name, error.message)
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
    
    console.log('Final results:', results)
    return results
    
  } catch (error) {
    console.error('Error fetching card prices:', error)
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
