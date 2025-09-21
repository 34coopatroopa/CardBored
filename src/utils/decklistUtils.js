import axios from 'axios'

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
    console.log('=== fetchCardPrices START (Direct Scryfall) ===')
    console.log('DeckText length:', deckText.length)
    
    // Parse decklist into cards
    const cards = parseDecklist(deckText)
    console.log('Parsed cards:', cards.length)
    
    const results = []
    const maxRequests = 15 // Limit to avoid rate limiting
    
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
        await new Promise(resolve => setTimeout(resolve, 150))
        
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
