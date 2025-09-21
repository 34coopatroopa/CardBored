// Deck storage utilities for saving and loading decklists

const STORAGE_KEY = 'cardbored_saved_decks'

// Save a deck to localStorage
export function saveDeck(deckData) {
  try {
    const savedDecks = getSavedDecks()
    const newDeck = {
      id: Date.now().toString(),
      name: deckData.name || `Deck ${new Date().toLocaleDateString()}`,
      deckText: deckData.deckText,
      priceThreshold: deckData.priceThreshold,
      cards: deckData.cards,
      keepCards: deckData.keepCards,
      proxyCards: deckData.proxyCards,
      totalValue: deckData.totalValue,
      saveDate: new Date().toISOString(),
      stats: deckData.stats
    }
    
    savedDecks.unshift(newDeck) // Add to beginning of array
    
    // Keep only the last 20 decks to prevent storage bloat
    const limitedDecks = savedDecks.slice(0, 20)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedDecks))
    return newDeck
  } catch (error) {
    console.error('Error saving deck:', error)
    throw new Error('Failed to save deck')
  }
}

// Get all saved decks
export function getSavedDecks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error loading saved decks:', error)
    return []
  }
}

// Get a specific deck by ID
export function getDeckById(id) {
  try {
    const savedDecks = getSavedDecks()
    return savedDecks.find(deck => deck.id === id)
  } catch (error) {
    console.error('Error loading deck:', error)
    return null
  }
}

// Delete a saved deck
export function deleteDeck(id) {
  try {
    const savedDecks = getSavedDecks()
    const filteredDecks = savedDecks.filter(deck => deck.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDecks))
    return true
  } catch (error) {
    console.error('Error deleting deck:', error)
    return false
  }
}

// Clear all saved decks
export function clearAllDecks() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing decks:', error)
    return false
  }
}

// Export deck as downloadable file
export function exportDeck(deck, format = 'txt') {
  try {
    let content = ''
    let filename = ''
    let mimeType = ''
    
    switch (format) {
      case 'txt':
        content = `// ${deck.name}\n// Saved: ${new Date(deck.saveDate).toLocaleDateString()}\n// Total Value: $${deck.totalValue?.toFixed(2) || '0.00'}\n\n`
        
        if (deck.keepCards && deck.keepCards.length > 0) {
          content += `// Keep Pile (≤$${deck.priceThreshold})\n`
          deck.keepCards.forEach(card => {
            content += `${card.quantity} ${card.name}\n`
          })
          content += '\n'
        }
        
        if (deck.proxyCards && deck.proxyCards.length > 0) {
          content += `// Proxy Pile (>$${deck.priceThreshold})\n`
          deck.proxyCards.forEach(card => {
            content += `${card.quantity} ${card.name}\n`
          })
        }
        
        filename = `${deck.name.replace(/[^a-z0-9]/gi, '_')}.txt`
        mimeType = 'text/plain'
        break
        
      case 'json':
        content = JSON.stringify(deck, null, 2)
        filename = `${deck.name.replace(/[^a-z0-9]/gi, '_')}.json`
        mimeType = 'application/json'
        break
        
      default:
        throw new Error('Unsupported format')
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error exporting deck:', error)
    return false
  }
}

// Get storage usage info
export function getStorageInfo() {
  try {
    const savedDecks = getSavedDecks()
    const totalSize = new Blob([JSON.stringify(savedDecks)]).size
    return {
      deckCount: savedDecks.length,
      totalSize: totalSize,
      sizeFormatted: formatBytes(totalSize)
    }
  } catch (error) {
    return { deckCount: 0, totalSize: 0, sizeFormatted: '0 B' }
  }
}

// Format bytes to human readable string
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
