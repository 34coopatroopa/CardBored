import React, { useState } from 'react'

function Mascot({ type = 'default', position = 'bottom-right', size = 'medium' }) {
  const [clickCount, setClickCount] = useState(0)
  const [easterEggActive, setEasterEggActive] = useState(false)

  const handleClick = () => {
    setClickCount(prev => prev + 1)
    
    if (clickCount >= 4) {
      setEasterEggActive(true)
      setTimeout(() => setEasterEggActive(false), 3000)
    }
  }

  const getMascotConfig = () => {
    switch (type) {
      case 'angry':
        return {
          face: (
            <>
              {/* Angry Eyes */}
              <div className="flex gap-1 mb-1">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
              {/* Angry Mouth */}
              <div className="w-4 h-1 bg-red-600 rounded-full transform rotate-12"></div>
            </>
          ),
          color: 'bg-red-900/20 border-red-600/50',
          easterEgg: {
            message: '😡 I HATE EXPENSIVE CARDS!',
            particles: ['#dc2626', '#ef4444', '#f87171', '#fca5a5']
          }
        }
      case 'sleepy':
        return {
          face: (
            <>
              {/* Sleepy Eyes */}
              <div className="flex gap-1 mb-1">
                <div className="w-2 h-1 bg-blue-600 rounded-full transform -rotate-12"></div>
                <div className="w-2 h-1 bg-blue-600 rounded-full transform rotate-12"></div>
              </div>
              {/* Sleepy Mouth */}
              <div className="w-3 h-1 bg-blue-600 rounded-full"></div>
            </>
          ),
          color: 'bg-blue-900/20 border-blue-600/50',
          easterEgg: {
            message: '😴 Zzz... Wake me when prices drop...',
            particles: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
          }
        }
      case 'confused':
        return {
          face: (
            <>
              {/* Confused Eyes */}
              <div className="flex gap-1 mb-1">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              </div>
              {/* Question Mark */}
              <div className="text-yellow-600 text-xs font-bold">?</div>
            </>
          ),
          color: 'bg-yellow-900/20 border-yellow-600/50',
          easterEgg: {
            message: '🤔 Why are cards so expensive?',
            particles: ['#ca8a04', '#eab308', '#facc15', '#fde047']
          }
        }
      case 'happy':
        return {
          face: (
            <>
              {/* Happy Eyes */}
              <div className="flex gap-1 mb-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              {/* Happy Mouth */}
              <div className="w-3 h-2 bg-green-600 rounded-full border-2 border-green-600" style={{ borderTop: 'none' }}></div>
            </>
          ),
          color: 'bg-green-900/20 border-green-600/50',
          easterEgg: {
            message: '😊 I love budget decks!',
            particles: ['#16a34a', '#22c55e', '#4ade80', '#86efac']
          }
        }
      default:
        return {
          face: (
            <>
              {/* Default Bored Eyes */}
              <div className="flex gap-1 mb-1 bored-eyes">
                <div className="w-2 h-2 bg-dungeon-dark rounded-full"></div>
                <div className="w-2 h-2 bg-dungeon-dark rounded-full"></div>
              </div>
              {/* Default Mouth */}
              <div className="w-3 h-1 bg-dungeon-dark rounded-full"></div>
            </>
          ),
          color: 'bg-cardboard/20 border-cardboard-dark/50',
          easterEgg: {
            message: '🎉 I\'M NOT BORED ANYMORE!',
            particles: ['#ff6b35', '#b8860b', '#ffd700', '#ff6b35']
          }
        }
    }
  }

  const config = getMascotConfig()
  
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <div className={`absolute ${positionClasses[position]} opacity-60 hover:opacity-100 transition-opacity duration-300`}>
      <div className="relative">
        {/* Mascot Box */}
        <div 
          className={`${sizeClasses[size]} ${config.color} border-2 rounded-lg shadow-lg cardboard-box hover:rotate-6 transition-transform duration-300 cursor-pointer select-none`}
          onClick={handleClick}
        >
          {/* Face */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {config.face}
          </div>
          
          {/* Cardboard Texture Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1 left-2 right-2 h-px bg-cardboard-dark/50"></div>
            <div className="absolute top-3 left-2 right-2 h-px bg-cardboard-dark/30"></div>
            <div className="absolute top-5 left-2 right-2 h-px bg-cardboard-dark/40"></div>
            <div className="absolute top-7 left-2 right-2 h-px bg-cardboard-dark/20"></div>
            <div className="absolute top-9 left-2 right-2 h-px bg-cardboard-dark/30"></div>
          </div>
          
          {/* Tape */}
          <div className="absolute top-2 left-1 right-1 h-1 bg-yellow-400/60 rounded-sm"></div>
          <div className="absolute bottom-2 left-1 right-1 h-1 bg-yellow-400/60 rounded-sm"></div>
        </div>
        
        {/* Floating Animation */}
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full bg-torch-glow/10 rounded-lg"></div>
        </div>
        
        {/* Easter Egg Effect */}
        {easterEggActive && (
          <>
            {/* Confetti Particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 particle"
                style={{
                  left: `${50 + Math.cos(i * 30) * 30}%`,
                  top: `${50 + Math.sin(i * 30) * 30}%`,
                  backgroundColor: config.easterEgg.particles[i % config.easterEgg.particles.length],
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
            
            {/* Celebration Text */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-torch-glow text-black px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap animate-bounce">
              {config.easterEgg.message}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Mascot
