import React, { useState, useEffect } from 'react'
import { getSavedDecks, deleteDeck, exportDeck, getStorageInfo } from '../utils/deckStorage'

function SavedDecks({ onLoadDeck, isOpen, onClose }) {
  const [savedDecks, setSavedDecks] = useState([])
  const [storageInfo, setStorageInfo] = useState({ deckCount: 0, sizeFormatted: '0 B' })

  useEffect(() => {
    if (isOpen) {
      loadSavedDecks()
    }
  }, [isOpen])

  const loadSavedDecks = () => {
    const decks = getSavedDecks()
    setSavedDecks(decks)
    setStorageInfo(getStorageInfo())
  }

  const handleLoadDeck = (deck) => {
    onLoadDeck(deck)
    onClose()
  }

  const handleDeleteDeck = (id) => {
    if (window.confirm('Are you sure you want to delete this saved deck?')) {
      deleteDeck(id)
      loadSavedDecks()
    }
  }

  const handleExportDeck = (deck, format) => {
    exportDeck(deck, format)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dungeon-stone/95 rounded-xl shadow-2xl border border-cardboard-dark max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-dungeon-dark to-cardboard-dark p-6 border-b border-ancient-gold/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ancient-gold">Saved Decks</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {storageInfo.deckCount} decks saved ({storageInfo.sizeFormatted})
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {savedDecks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Saved Decks</h3>
              <p className="text-gray-400">Save your decklists to access them later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedDecks.map((deck) => (
                <div key={deck.id} className="bg-dungeon-dark/50 rounded-lg p-4 border border-gray-600/30 hover:border-ancient-gold/50 transition-colors">
                  {/* Deck Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-ancient-gold mb-1">{deck.name}</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Saved: {new Date(deck.saveDate).toLocaleDateString()}</p>
                      <p>Cards: {deck.cards?.length || 0} total</p>
                      <p>Threshold: ${deck.priceThreshold}</p>
                      {deck.totalValue && (
                        <p>Value: ${deck.totalValue.toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats Preview */}
                  {deck.stats && (
                    <div className="mb-4 p-3 bg-dungeon-stone/30 rounded border border-gray-600/20">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Keep: {deck.keepCards?.length || 0}</span>
                        <span>Proxy: {deck.proxyCards?.length || 0}</span>
                        <span>CMC: {deck.stats.avgManaCost}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleLoadDeck(deck)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Load
                    </button>
                    
                    <div className="relative group">
                      <button className="btn-secondary text-sm px-3 py-1">
                        Export ▼
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-dungeon-dark border border-gray-600 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <button
                          onClick={() => handleExportDeck(deck, 'txt')}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-t"
                        >
                          Export as TXT
                        </button>
                        <button
                          onClick={() => handleExportDeck(deck, 'json')}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-b"
                        >
                          Export as JSON
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-dungeon-dark/50 p-4 border-t border-gray-600/30">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <p>Click "Load" to restore a deck • "Export" to download • "Delete" to remove</p>
            <p className="text-torch-glow">💡 Tip: Decks are saved automatically when you click "Save Deck"</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SavedDecks
