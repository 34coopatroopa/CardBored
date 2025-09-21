import React, { useState } from 'react'
import CardList from './CardList'
import DeckStats from './DeckStats'
import SavedDecks from './SavedDecks'
import Mascot from './Mascot'
import { calculateTotal, formatPrice, exportDecklist, copyToClipboard, downloadTextFile } from '../utils/decklistUtils'
import { saveDeck } from '../utils/deckStorage'

function DeckSplitter({ keepCards, proxyCards, priceThreshold, loading, onLoadDeck }) {
  const [sortBy, setSortBy] = useState('price') // 'price', 'name', 'quantity'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [showSavedDecks, setShowSavedDecks] = useState(false)
  const [saving, setSaving] = useState(false)

  const keepTotal = calculateTotal(keepCards)
  const proxyTotal = calculateTotal(proxyCards)
  const overallTotal = keepTotal + proxyTotal
  const savings = proxyTotal

  const sortedKeepCards = [...keepCards].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'quantity':
        comparison = a.quantity - b.quantity
        break
      default:
        comparison = 0
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const sortedProxyCards = [...proxyCards].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'quantity':
        comparison = a.quantity - b.quantity
        break
      default:
        comparison = 0
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleExportKeep = async () => {
    const text = exportDecklist(keepCards, 'Keep Pile')
    const success = await copyToClipboard(text)
    if (success) {
      alert('Keep pile copied to clipboard!')
    } else {
      downloadTextFile(text, 'keep-pile.txt')
    }
  }

  const handleExportProxy = async () => {
    const text = exportDecklist(proxyCards, 'Proxy Pile')
    const success = await copyToClipboard(text)
    if (success) {
      alert('Proxy pile copied to clipboard!')
    } else {
      downloadTextFile(text, 'proxy-pile.txt')
    }
  }

  const handleExportBoth = async () => {
    const text = `// Keep Pile (≤$${priceThreshold})\n\n${exportDecklist(keepCards, '')}\n\n// Proxy Pile (>$${priceThreshold})\n\n${exportDecklist(proxyCards, '')}`
    const success = await copyToClipboard(text)
    if (success) {
      alert('Both piles copied to clipboard!')
    } else {
      downloadTextFile(text, 'deck-split.txt')
    }
  }

  const handleSaveDeck = async () => {
    if (allCards.length === 0) {
      alert('No deck to save!')
      return
    }

    setSaving(true)
    try {
      const deckName = prompt('Enter a name for this deck:', `Deck ${new Date().toLocaleDateString()}`)
      if (!deckName) {
        setSaving(false)
        return
      }

      const deckData = {
        name: deckName,
        deckText: allCards.map(card => `${card.quantity} ${card.name}`).join('\n'),
        priceThreshold,
        cards: allCards,
        keepCards,
        proxyCards,
        totalValue: overallTotal,
        stats: {
          totalCards: allCards.length,
          avgManaCost: allCards.reduce((sum, card) => sum + (parseInt(card.manaCost?.replace(/[^0-9]/g, '') || '0')), 0) / allCards.length
        }
      }

      await saveDeck(deckData)
      alert('Deck saved successfully!')
    } catch (error) {
      alert('Failed to save deck: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dungeon-stone/80 rounded-xl shadow-lg p-8 text-center border border-cardboard-dark relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-torch-glow mx-auto mb-4"></div>
        <p className="text-gray-300">Fetching card prices from Scryfall...</p>
        
        {/* Sleepy Mascot */}
        <Mascot type="sleepy" position="bottom-right" size="medium" />
      </div>
    )
  }

  if (keepCards.length === 0 && proxyCards.length === 0) {
    return (
      <div className="bg-dungeon-stone/80 rounded-xl shadow-lg p-8 text-center border border-cardboard-dark relative">
        <div className="text-ancient-gold mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ancient-gold mb-2">No decklist processed yet</h3>
        <p className="text-gray-400">Enter a decklist in the input panel to see your Keep and Proxy piles</p>
        
        {/* Default Bored Mascot */}
        <Mascot type="default" position="bottom-right" size="medium" />
      </div>
    )
  }

  // Combine all cards for statistics
  const allCards = [...keepCards, ...proxyCards]

  return (
    <div className="space-y-6">
      {/* Deck Statistics */}
      <DeckStats cards={allCards} />
      
      {/* Summary Stats */}
      <div className="bg-dungeon-stone/80 rounded-xl shadow-lg p-6 border border-cardboard-dark">
        <h2 className="text-2xl font-bold mb-4 text-ancient-gold">Price Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{formatPrice(keepTotal)}</div>
            <div className="text-sm text-green-300">Keep Pile ({keepCards.length} cards)</div>
          </div>
          
          <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{formatPrice(proxyTotal)}</div>
            <div className="text-sm text-red-300">Proxy Pile ({proxyCards.length} cards)</div>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{formatPrice(overallTotal)}</div>
            <div className="text-sm text-blue-300">Total Value</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-torch-glow to-ancient-gold rounded-lg p-4 text-center border border-ancient-gold/30">
          <div className="text-3xl font-bold text-gray-900">You save {formatPrice(savings)}</div>
          <div className="text-sm text-gray-800">by proxying expensive cards!</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-dungeon-stone/80 rounded-xl shadow-lg p-4 border border-cardboard-dark">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-600 bg-dungeon-stone text-gray-200 rounded text-sm"
            >
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="quantity">Quantity</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1 border border-gray-600 bg-dungeon-stone text-gray-200 rounded text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleSaveDeck} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : '💾 Save Deck'}
            </button>
            <button onClick={() => setShowSavedDecks(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors">
              📁 Load Deck
            </button>
            <button onClick={handleExportKeep} className="btn-secondary text-sm">
              Export Keep
            </button>
            <button onClick={handleExportProxy} className="btn-secondary text-sm">
              Export Proxy
            </button>
            <button onClick={handleExportBoth} className="btn-primary text-sm">
              Export Both
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keep Pile */}
        <CardList
          title="Keep Pile"
          subtitle={`Cards ≤ $${priceThreshold}`}
          cards={sortedKeepCards}
          totalValue={keepTotal}
          color="green"
          icon="✓"
        />
        
        {/* Proxy Pile */}
        <CardList
          title="Proxy Pile"
          subtitle={`Cards > $${priceThreshold}`}
          cards={sortedProxyCards}
          totalValue={proxyTotal}
          color="red"
          icon="🖨️"
        />
      </div>

      {/* Saved Decks Modal */}
      <SavedDecks 
        isOpen={showSavedDecks}
        onClose={() => setShowSavedDecks(false)}
        onLoadDeck={onLoadDeck}
      />
    </div>
  )
}

export default DeckSplitter
