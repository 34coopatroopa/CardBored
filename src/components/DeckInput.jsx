import React, { useState } from 'react'

function DeckInput({ onSubmit, priceThreshold, onThresholdChange, loading, error }) {
  const [deckText, setDeckText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (deckText.trim()) {
      onSubmit(deckText)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setDeckText(event.target.result)
      }
      reader.readAsText(file)
    }
  }

  const exampleDecklist = `4 Lightning Bolt
4 Brainstorm
4 Counterspell
2 Force of Will
4 Ponder
4 Preordain
2 Snapcaster Mage
4 Delver of Secrets
4 Young Pyromancer
2 Monastery Swiftspear
4 Island
4 Mountain
4 Steam Vents
4 Scalding Tarn
2 Misty Rainforest
2 Flooded Strand
1 Volcanic Island`

  return (
    <div className="bg-dungeon-stone/80 rounded-xl shadow-lg p-6 card-hover border border-cardboard-dark">
      <h2 className="text-2xl font-bold mb-4 text-ancient-gold">
        Input Decklist
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Price Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price Threshold: ${priceThreshold}
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="0.5"
            value={priceThreshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$50</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Cards at or below this price will go in your "Keep" pile
          </p>
        </div>

        {/* Decklist Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Decklist (Standard Format)
          </label>
          <textarea
            value={deckText}
            onChange={(e) => setDeckText(e.target.value)}
            placeholder="Paste your decklist here in standard format (e.g., '4 Lightning Bolt')"
            className="input-field h-48 resize-none"
            disabled={loading}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Or Upload File
          </label>
          <input
            type="file"
            accept=".txt,.deck"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-gray-600 bg-dungeon-stone text-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-torch-glow file:text-white hover:file:bg-orange-600"
            disabled={loading}
          />
        </div>

        {/* Example Button */}
        <div>
          <button
            type="button"
            onClick={() => setDeckText(exampleDecklist)}
            className="btn-secondary w-full"
            disabled={loading}
          >
            Load Example Deck
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !deckText.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Split Deck'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-600/50 text-red-300 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-400 space-y-1">
          <p><strong className="text-ancient-gold">Format:</strong> One card per line with quantity first</p>
          <p><strong className="text-ancient-gold">Example:</strong> "4 Lightning Bolt"</p>
          <p><strong className="text-ancient-gold">Comments:</strong> Lines starting with // or # are ignored</p>
          <p className="text-torch-glow mt-2"><strong>Note:</strong> Cards showing "No price data" may be very new, banned, or have spelling variations</p>
        </div>
      </form>
    </div>
  )
}

export default DeckInput
