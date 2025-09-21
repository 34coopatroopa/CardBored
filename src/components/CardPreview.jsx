import React, { useState, useEffect } from 'react'
import { fetchCardDetails } from '../utils/api.js'

function CardPreview({ card, isVisible, position, onClose }) {
  const [cardData, setCardData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isVisible && card) {
      setLoading(true)
      // Fetch detailed card data from Scryfall
      fetchCardDetails(card.name)
        .then(data => {
          setCardData(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [isVisible, card])

  if (!isVisible || !card) return null

  const cardImage = cardData?.image_uris?.large || cardData?.card_faces?.[0]?.image_uris?.large || card.imageUrl
  const cardText = cardData?.oracle_text || cardData?.card_faces?.[0]?.oracle_text || card.type || 'Card text not available'

  return (
    <div 
      className="fixed z-50 bg-dungeon-dark/95 backdrop-blur-sm border-2 border-ancient-gold rounded-xl shadow-2xl p-4 max-w-md"
      style={{
        left: `${Math.min(position.x, window.innerWidth - 450)}px`,
        top: `${Math.min(position.y, window.innerHeight - 300)}px`,
        transform: 'translate(-50%, 0)'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl leading-none"
      >
        ×
      </button>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-torch-glow"></div>
          <span className="ml-2 text-gray-300">Loading card...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Card Image */}
          {cardImage && (
            <div className="relative">
              <img
                src={cardImage}
                alt={card.name}
                className="w-full max-w-xs mx-auto rounded-lg shadow-lg card-3d"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          )}

          {/* Card Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-ancient-gold">{card.name}</h3>
            
            {/* Mana Cost */}
            {card.manaCost && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">Mana Cost:</span>
                <span className="text-sm text-torch-glow font-mono">{card.manaCost}</span>
              </div>
            )}

            {/* Type */}
            {card.type && (
              <div className="text-sm text-gray-300">{card.type}</div>
            )}

            {/* Set */}
            {card.setName && (
              <div className="text-xs text-gray-400">From: {card.setName}</div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Price:</span>
              <span className={`font-bold ${card.price > 0 ? 'text-torch-glow' : 'text-gray-500'}`}>
                {card.price > 0 ? `$${card.price.toFixed(2)}` : 'No price data'}
              </span>
            </div>

            {/* Card Text */}
            {cardText && (
              <div className="bg-dungeon-stone/50 rounded p-3 border border-gray-600/30">
                <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {cardText}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="text-center text-sm text-gray-400">
              Quantity in deck: <span className="font-bold text-ancient-gold">{card.quantity}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardPreview
