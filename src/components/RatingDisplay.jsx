import React, { useState, useEffect } from 'react'

function RatingDisplay() {
  const [ratings, setRatings] = useState([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const storedRatings = JSON.parse(localStorage.getItem('cardboredRatings') || '[]')
    setRatings(storedRatings)
  }, [])

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const displayedRatings = showAll ? ratings : ratings.slice(0, 3)

  if (ratings.length === 0) return null

  return (
    <div className="bg-dungeon-stone/30 rounded-lg p-4 border border-ancient-gold/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-ancient-gold">User Ratings</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-torch-glow">{averageRating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-600'}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-400">({ratings.length} rating{ratings.length !== 1 ? 's' : ''})</span>
        </div>
      </div>

      <div className="space-y-3">
        {displayedRatings.map((rating) => (
          <div key={rating.id} className="bg-dungeon-dark/50 rounded p-3 border border-gray-600/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-200">{rating.name}</span>
                {renderStars(rating.rating)}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(rating.timestamp).toLocaleDateString()}
              </span>
            </div>
            {rating.feedback && (
              <p className="text-sm text-gray-300 italic">"{rating.feedback}"</p>
            )}
          </div>
        ))}
      </div>

      {ratings.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-torch-glow hover:text-orange-400 transition-colors"
        >
          {showAll ? 'Show Less' : `Show All ${ratings.length} Ratings`}
        </button>
      )}
    </div>
  )
}

export default RatingDisplay
