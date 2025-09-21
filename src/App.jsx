import React, { useState, useCallback } from 'react'
import Header from './components/Header'
import DeckInput from './components/DeckInput'
import DeckSplitter from './components/DeckSplitter'
import CardPreview from './components/CardPreview'
import RatingModal from './components/RatingModal'
import RatingDisplay from './components/RatingDisplay'
import { parseDecklist, fetchCardPrices } from './utils/decklistUtils'

function App() {
  const [decklist, setDecklist] = useState('')
  const [priceThreshold, setPriceThreshold] = useState(3)
  const [parsedCards, setParsedCards] = useState([])
  const [keepCards, setKeepCards] = useState([])
  const [proxyCards, setProxyCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)

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

  const handleLoadDeck = (deck) => {
    setDecklist(deck.deckText)
    setPriceThreshold(deck.priceThreshold)
    setParsedCards(deck.cards || [])
    setKeepCards(deck.keepCards || [])
    setProxyCards(deck.proxyCards || [])
    setError('')
  }

  const handleCardHover = (card) => {
    setPreviewCard(card)
    setShowPreview(true)
  }

  const handleCardLeave = () => {
    setShowPreview(false)
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
              onLoadDeck={handleLoadDeck}
            />
          </div>
          
          {/* Right side - Results */}
          <div className="lg:col-span-2">
            <DeckSplitter 
              keepCards={keepCards}
              proxyCards={proxyCards}
              priceThreshold={priceThreshold}
              loading={loading}
              onLoadDeck={handleLoadDeck}
            />
          </div>
        </div>
      </main>
      
      {/* Footer with Author Credit and Rating */}
      <footer className="mt-12 py-6 border-t border-ancient-gold/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Author Credit */}
            <div className="bg-dungeon-stone/30 rounded-lg p-6 border border-ancient-gold/20">
              <p className="text-gray-400 text-sm">
                Created with passion for the MTG community by{' '}
                <span className="text-ancient-gold font-semibold">Cooper Hoy</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Because Magic is about the gathering, not the wallet
              </p>
              
              <div className="mt-4 pt-4 border-t border-ancient-gold/20">
                <p className="text-ancient-gold text-sm font-medium mb-2">
                  Dedicated to Bradley, Jayson, Jacob, Jeffery, Jaime, and Derek
                </p>
                <p className="text-gray-500 text-xs">
                  <em>Note: Card prices and statistics may be slightly inaccurate due to market fluctuations and API limitations. 
                  Use as a general guide for budget planning.</em>
                </p>
              </div>
            </div>

            {/* Rating Section */}
            <div className="space-y-4">
              <div className="bg-dungeon-stone/30 rounded-lg p-6 border border-ancient-gold/20">
                <h3 className="text-lg font-semibold text-ancient-gold mb-3">Enjoying Cardbored?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Help us improve by sharing your experience!
                </p>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="btn-primary w-full"
                >
                  ⭐ Leave a Rating
                </button>
              </div>

              {/* Rating Display */}
              <RatingDisplay />
            </div>
          </div>
        </div>

        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
        />
      </footer>
    </div>
  )
}

export default App
