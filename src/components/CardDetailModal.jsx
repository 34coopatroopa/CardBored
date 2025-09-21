import React, { useState, useEffect } from 'react'
import { fetchCardDetails } from '../utils/api.js'

function CardDetailModal({ card, isOpen, onClose }) {
  const [cardData, setCardData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && card) {
      setLoading(true)
      fetchCardDetails(card.name)
        .then(data => {
          setCardData(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [isOpen, card])

  if (!isOpen || !card) return null

  const cardImage = cardData?.image_uris?.large || cardData?.card_faces?.[0]?.image_uris?.large || card.imageUrl
  const cardText = cardData?.oracle_text || cardData?.card_faces?.[0]?.oracle_text || card.type || 'Card text not available'
  const manaCost = cardData?.mana_cost || card.manaCost || ''
  const cardType = cardData?.type_line || card.type || 'Unknown'
  const setName = cardData?.set_name || card.setName || 'Unknown Set'
  const rarity = cardData?.rarity || 'Unknown'
  const power = cardData?.power || ''
  const toughness = cardData?.toughness || ''

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dungeon-dark/95 border-2 border-ancient-gold rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ancient-gold/30">
          <h2 className="text-2xl font-bold text-ancient-gold">{card.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-torch-glow"></div>
              <span className="ml-4 text-gray-300 text-lg">Loading card details...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Card Image */}
              <div className="space-y-4">
                {cardImage && (
                  <div className="relative">
                    <img
                      src={cardImage}
                      alt={card.name}
                      className="w-full max-w-sm mx-auto rounded-lg shadow-2xl card-3d"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                  </div>
                )}
                
                {/* Card Stats */}
                <div className="bg-dungeon-stone/50 rounded-lg p-4 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-torch-glow mb-3">Card Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mana Cost:</span>
                      <span className="text-torch-glow font-mono">{manaCost || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-gray-200">{cardType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Set:</span>
                      <span className="text-gray-200">{setName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rarity:</span>
                      <span className="text-gray-200 capitalize">{rarity}</span>
                    </div>
                    {(power || toughness) && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Power/Toughness:</span>
                        <span className="text-gray-200">{power}/{toughness}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className={`font-bold ${card.price > 0 ? 'text-torch-glow' : 'text-gray-500'}`}>
                        {card.price > 0 ? `$${card.price.toFixed(2)}` : 'No price data'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity in deck:</span>
                      <span className="font-bold text-ancient-gold">{card.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Card Text and Details */}
              <div className="space-y-4">
                {/* Oracle Text */}
                <div className="bg-dungeon-stone/50 rounded-lg p-4 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-torch-glow mb-3">Oracle Text</h3>
                  <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {cardText}
                  </div>
                </div>

                {/* Flavor Text */}
                {cardData?.flavor_text && (
                  <div className="bg-dungeon-stone/30 rounded-lg p-4 border border-gray-600/20">
                    <h3 className="text-lg font-semibold text-ancient-gold mb-3">Flavor Text</h3>
                    <div className="text-gray-300 italic leading-relaxed">
                      "{cardData.flavor_text}"
                    </div>
                  </div>
                )}

                {/* Legal Formats */}
                {cardData?.legalities && (
                  <div className="bg-dungeon-stone/30 rounded-lg p-4 border border-gray-600/20">
                    <h3 className="text-lg font-semibold text-ancient-gold mb-3">Legality</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(cardData.legalities).map(([format, status]) => (
                        <div key={format} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{format.replace('_', ' ')}:</span>
                          <span className={`font-semibold ${
                            status === 'legal' ? 'text-green-400' : 
                            status === 'banned' ? 'text-red-400' : 
                            status === 'restricted' ? 'text-yellow-400' : 
                            'text-gray-500'
                          }`}>
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardDetailModal
