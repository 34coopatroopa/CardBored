import React, { useState } from 'react'

function RatingModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Store rating in localStorage
    const ratings = JSON.parse(localStorage.getItem('cardboredRatings') || '[]')
    const newRating = {
      id: Date.now(),
      rating,
      feedback,
      name: name || 'Anonymous',
      timestamp: new Date().toISOString()
    }
    
    ratings.push(newRating)
    localStorage.setItem('cardboredRatings', JSON.stringify(ratings))
    
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
      setRating(0)
      setFeedback('')
      setName('')
    }, 2000)
  }

  const handleStarClick = (value) => {
    setRating(value)
  }

  const handleStarHover = (value) => {
    setHoverRating(value)
  }

  const handleStarLeave = () => {
    setHoverRating(0)
  }

  const getStarColor = (starValue) => {
    const currentRating = hoverRating || rating
    if (starValue <= currentRating) {
      return 'text-yellow-400'
    }
    return 'text-gray-400'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dungeon-dark/95 border-2 border-ancient-gold rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ancient-gold/30">
          <h2 className="text-2xl font-bold text-ancient-gold">Rate Cardbored</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-torch-glow mb-2">Thank You!</h3>
              <p className="text-gray-300">Your rating has been saved!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  How would you rate Cardbored?
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      className="text-4xl transition-colors duration-200 hover:scale-110 transform"
                    >
                      <span className={getStarColor(star)}>★</span>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-400">
                    {rating === 0 ? 'Click a star to rate' :
                     rating === 1 ? 'Poor' :
                     rating === 2 ? 'Fair' :
                     rating === 3 ? 'Good' :
                     rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                </div>
              </div>

              {/* Name (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or nickname"
                  className="w-full px-3 py-2 border border-gray-600 bg-dungeon-stone text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-torch-glow focus:border-transparent"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think! What did you like? What could be improved?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-600 bg-dungeon-stone text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-torch-glow focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rating === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default RatingModal
