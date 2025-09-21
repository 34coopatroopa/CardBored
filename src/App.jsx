import React, { useState, useCallback } from 'react'
import Header from './components/Header'
import DeckInput from './components/DeckInput'
import DeckSplitter from './components/DeckSplitter'
import { parseDecklist, fetchCardPrices } from './utils/decklistUtils'

function App() {
  const [decklist, setDecklist] = useState('')
  const [priceThreshold, setPriceThreshold] = useState(3)
  const [parsedCards, setParsedCards] = useState([])
  const [keepCards, setKeepCards] = useState([])
  const [proxyCards, setProxyCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const processDecklist = useCallback(async (deckText) => {
    setLoading(true)
    setError('')
    
    try {
      // Fetch prices for all cards using backend API
      const cardsWithPrices = await fetchCardPrices(deckText)
      
      // Split into keep/proxy based on threshold
      const keep = cardsWithPrices.filter(card => card.price <= priceThreshold)
      const proxy = cardsWithPrices.filter(card => card.price > priceThreshold)
      
      setParsedCards(cardsWithPrices)
      setKeepCards(keep)
      setProxyCards(proxy)
      
    } catch (err) {
      setError(err.message || 'Failed to process decklist')
      console.error('Error processing decklist:', err)
    } finally {
      setLoading(false)
    }
  }, [priceThreshold])

  const handleDecklistSubmit = (deckText) => {
    setDecklist(deckText)
    processDecklist(deckText)
  }

  const handleThresholdChange = (newThreshold) => {
    setPriceThreshold(newThreshold)
    // Reprocess with new threshold
    if (parsedCards.length > 0) {
      const keep = parsedCards.filter(card => card.price <= newThreshold)
      const proxy = parsedCards.filter(card => card.price > newThreshold)
      setKeepCards(keep)
      setProxyCards(proxy)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Input */}
          <div className="lg:col-span-1">
            <DeckInput 
              onSubmit={handleDecklistSubmit}
              priceThreshold={priceThreshold}
              onThresholdChange={handleThresholdChange}
              loading={loading}
              error={error}
            />
          </div>
          
          {/* Right side - Results */}
          <div className="lg:col-span-2">
            <DeckSplitter 
              keepCards={keepCards}
              proxyCards={proxyCards}
              priceThreshold={priceThreshold}
              loading={loading}
            />
          </div>
        </div>
      </main>
      
      {/* Footer with Author Credit */}
      <footer className="mt-12 py-6 border-t border-ancient-gold/30">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-dungeon-stone/30 rounded-lg p-4 border border-ancient-gold/20">
            <p className="text-gray-400 text-sm">
              Created with passion for the MTG community by{' '}
              <span className="text-ancient-gold font-semibold">Cooper Hoy</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Because Magic is about the gathering, not the wallet
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
