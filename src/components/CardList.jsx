import React, { useState } from 'react'
import { formatPrice } from '../utils/decklistUtils'
import CardPreview from './CardPreview'
import CardDetailModal from './CardDetailModal'

function CardList({ title, subtitle, cards, totalValue, color, icon }) {
  const [previewCard, setPreviewCard] = useState(null)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const [showPreview, setShowPreview] = useState(false)
  const [detailCard, setDetailCard] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const colorClasses = {
    green: {
      bg: 'bg-green-900/20',
      border: 'border-green-600/50',
      header: 'bg-green-800/30 border-green-600/70',
      text: 'text-green-300',
      accent: 'text-green-400'
    },
    red: {
      bg: 'bg-red-900/20',
      border: 'border-red-600/50',
      header: 'bg-red-800/30 border-red-600/70',
      text: 'text-red-300',
      accent: 'text-red-400'
    }
  }

  const colors = colorClasses[color] || colorClasses.green

  const handleCardHover = (card, event) => {
    const rect = event.target.getBoundingClientRect()
    // Position the preview lower, near the cards
    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 20 // Position below the card row
    })
    setPreviewCard(card)
    setShowPreview(true)
  }

  const handleCardLeave = () => {
    setShowPreview(false)
  }

  const handleCardClick = (card) => {
    setDetailCard(card)
    setShowDetailModal(true)
  }

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl shadow-lg overflow-hidden backdrop-blur-sm`}>
      {/* Header */}
      <div className={`${colors.header} ${colors.border} border-b px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`${colors.text} font-bold text-lg flex items-center gap-2`}>
              <span className="text-xl">{icon}</span>
              {title}
            </h3>
            <p className={`${colors.accent} text-sm`}>{subtitle}</p>
          </div>
          <div className="text-right">
            <div className={`${colors.text} font-bold text-lg`}>
              {formatPrice(totalValue)}
            </div>
            <div className={`${colors.accent} text-xs`}>
              {cards.length} cards
            </div>
          </div>
        </div>
      </div>

      {/* Card List */}
      <div className="max-h-96 overflow-y-auto">
        {cards.length === 0 ? (
          <div className="p-8 text-center">
            <div className={`${colors.accent} text-4xl mb-2`}>🎉</div>
            <p className={`${colors.text} font-medium`}>No cards in this pile!</p>
            <p className={`${colors.accent} text-sm`}>
              {color === 'green' ? 'All your cards are under budget!' : 'All your cards are affordable!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-600/30">
            {cards.map((card, index) => (
              <div 
                key={card.id || index} 
                className="p-3 hover:bg-white/10 transition-colors cursor-pointer"
                onMouseEnter={(e) => handleCardHover(card, e)}
                onMouseLeave={handleCardLeave}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {/* Card Image (if available) */}
                      {card.imageUrl && (
                        <div className="relative">
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-10 h-14 object-cover card-image card-3d"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-torch-glow/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded pointer-events-none"></div>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className={`${colors.text} font-medium truncate`}>
                          {card.name}
                        </p>
                        <p className={`${colors.accent} text-sm`}>
                          {card.quantity}x • {card.type}
                        </p>
                        {card.manaCost && (
                        <p className="text-xs text-gray-400 mt-1">
                          {card.manaCost}
                        </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={`${colors.text} font-bold`}>
                      {formatPrice(card.price)}
                    </div>
                    <div className={`${colors.accent} text-sm`}>
                      {formatPrice(card.price * card.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Preview */}
      <CardPreview
        card={previewCard}
        isVisible={showPreview}
        position={previewPosition}
        onClose={() => setShowPreview(false)}
      />
    </div>
  )
}

export default CardList
