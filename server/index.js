import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

const SCRYFALL_API_BASE = 'https://api.scryfall.com'

// Rate limiting and caching
let requestCount = 0
let lastReset = Date.now()
const cardCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function checkRateLimit() {
  const now = Date.now()
  if (now - lastReset > 1000) {
    requestCount = 0
    lastReset = now
  }
  
  if (requestCount >= 50) {
    throw new Error('Rate limit exceeded. Please try again in a moment.')
  }
  
  requestCount++
}

function getCachedCard(cardName) {
  const cached = cardCache.get(cardName.toLowerCase())
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedCard(cardName, data) {
  cardCache.set(cardName.toLowerCase(), {
    data,
    timestamp: Date.now()
  })
}

// Parse decklist endpoint
app.post('/api/parse-decklist', async (req, res) => {
  try {
    const { deckText } = req.body
    
    if (!deckText || typeof deckText !== 'string') {
      return res.status(400).json({ error: 'Invalid decklist text' })
    }
    
    const cards = parseDecklist(deckText)
    res.json({ cards })
  } catch (error) {
    console.error('Error parsing decklist:', error)
    res.status(500).json({ error: 'Failed to parse decklist' })
  }
})

// Fetch card prices endpoint
app.post('/api/card-prices', async (req, res) => {
  try {
    const { cards } = req.body
    
    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'Invalid cards array' })
    }
    
    checkRateLimit()
    const cardsWithPrices = await fetchCardPrices(cards)
    res.json({ cards: cardsWithPrices })
  } catch (error) {
    console.error('Error fetching card prices:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch card prices' })
  }
})

// Bulk process decklist endpoint
app.post('/api/process-decklist', async (req, res) => {
  try {
    const { deckText } = req.body
    
    if (!deckText || typeof deckText !== 'string') {
      return res.status(400).json({ error: 'Invalid decklist text' })
    }
    
    // Parse the decklist
    const cards = parseDecklist(deckText)
    
    if (cards.length === 0) {
      return res.json({ cards: [] })
    }
    
    // Fetch prices
    checkRateLimit()
    const cardsWithPrices = await fetchCardPrices(cards)
    
    res.json({ cards: cardsWithPrices })
  } catch (error) {
    console.error('Error processing decklist:', error)
    res.status(500).json({ error: error.message || 'Failed to process decklist' })
  }
})

// Parse a decklist text into card objects
function parseDecklist(deckText) {
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

// Fetch card prices from Scryfall API with caching
async function fetchCardPrices(cards) {
  const results = []
  const uncachedCards = []
  
  // Check cache first
  for (const card of cards) {
    const cached = getCachedCard(card.name)
    if (cached) {
      results.push({
        ...card,
        ...cached
      })
    } else {
      uncachedCards.push(card)
    }
  }
  
  // Process uncached cards in batches
  for (let i = 0; i < uncachedCards.length; i += 10) {
    const batch = uncachedCards.slice(i, i + 10)
    
    try {
      checkRateLimit()
      
      // Process each card individually for better matching
      for (const ourCard of batch) {
        try {
          // Try exact name match first
          const exactMatch = await searchCardExact(ourCard.name)
          if (exactMatch) {
            const cardData = extractCardData(exactMatch)
            setCachedCard(ourCard.name, cardData)
            results.push({
              ...ourCard,
              ...cardData
            })
            continue
          }
          
          // Try fuzzy search if exact match fails
          const fuzzyMatch = await searchCardFuzzy(ourCard.name)
          if (fuzzyMatch) {
            const cardData = extractCardData(fuzzyMatch)
            setCachedCard(ourCard.name, cardData)
            results.push({
              ...ourCard,
              ...cardData
            })
            continue
          }
          
          // If no match found, add with 0 price
          const cardData = {
            price: 0,
            imageUrl: null,
            setName: 'Not Found',
            manaCost: '',
            type: 'Unknown'
          }
          
          setCachedCard(ourCard.name, cardData)
          results.push({
            ...ourCard,
            ...cardData
          })
          
        } catch (error) {
          console.error(`Error searching for card "${ourCard.name}":`, error.message)
          
          // Add with 0 price if search fails
          const cardData = {
            price: 0,
            imageUrl: null,
            setName: 'Search Failed',
            manaCost: '',
            type: 'Unknown'
          }
          
          setCachedCard(ourCard.name, cardData)
          results.push({
            ...ourCard,
            ...cardData
          })
        }
        
        // Small delay between individual searches
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
    } catch (error) {
      console.error('Error processing batch:', error.message)
      
      // Add cards with 0 price if batch processing fails
      for (const card of batch) {
        const cardData = {
          price: 0,
          imageUrl: null,
          setName: 'API Error',
          manaCost: '',
          type: 'Unknown'
        }
        
        setCachedCard(card.name, cardData)
        results.push({
          ...card,
          ...cardData
        })
      }
    }
  }
  
  return results
}

// Helper function to search for a card with exact name match
async function searchCardExact(cardName) {
  try {
    const response = await axios.get(`${SCRYFALL_API_BASE}/cards/named`, {
      params: {
        exact: cardName,
        format: 'json'
      },
      timeout: 5000
    })
    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      return null // Card not found
    }
    throw error
  }
}

// Helper function to search for a card with fuzzy matching
async function searchCardFuzzy(cardName) {
  try {
    const response = await axios.get(`${SCRYFALL_API_BASE}/cards/search`, {
      params: {
        q: `!"${cardName}"`,
        format: 'json'
      },
      timeout: 5000
    })
    return response.data.data?.[0] || null
  } catch (error) {
    if (error.response?.status === 404) {
      return null // No matches found
    }
    throw error
  }
}

// Helper function to extract card data from Scryfall response
function extractCardData(scryfallCard) {
  // Get USD price, preferring non-foil
  const price = scryfallCard.prices?.usd || scryfallCard.prices?.usd_foil || 0
  
  return {
    price: parseFloat(price) || 0,
    imageUrl: scryfallCard.image_uris?.small || scryfallCard.card_faces?.[0]?.image_uris?.small,
    setName: scryfallCard.set_name || 'Unknown Set',
    manaCost: scryfallCard.mana_cost || scryfallCard.card_faces?.[0]?.mana_cost || '',
    type: scryfallCard.type_line || scryfallCard.card_faces?.[0]?.type_line || 'Unknown'
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`Cardbored server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
