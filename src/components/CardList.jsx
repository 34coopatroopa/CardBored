import React from 'react'
import { formatPrice } from '../utils/decklistUtils'

function CardList({ title, subtitle, cards, totalValue, color, icon }) {
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
              <div key={card.id || index} className="p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {/* Card Image (if available) */}
                      {card.imageUrl && (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-10 h-14 object-cover rounded border shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
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
    </div>
  )
}

export default CardList
