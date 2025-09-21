import React, { useState } from 'react'

function Header() {
  const [easterEggActive, setEasterEggActive] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const handleBoxClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1
      
      if (newCount >= 5) {
        setEasterEggActive(true)
        setTimeout(() => setEasterEggActive(false), 3000)
        return 0 // Reset counter after triggering
      }
      
      return newCount
    })
  }
  return (
    <header className="bg-gradient-to-r from-dungeon-dark via-cardboard-dark to-dungeon-dark text-white py-8 shadow-2xl border-b-4 border-ancient-gold relative overflow-hidden">
      {/* Bored Cardboard Box */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
        <div className="relative">
          {/* Cardboard Box */}
          <div 
            className="w-16 h-16 md:w-20 md:h-20 bg-cardboard border-2 border-cardboard-dark rounded-lg shadow-lg cardboard-box hover:rotate-6 transition-transform duration-300 cursor-pointer select-none"
            onClick={handleBoxClick}
            title={`Click me! (${clickCount}/5)`}
          >
            {/* Bored Face */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Eyes */}
              <div className="flex gap-1 mb-1 bored-eyes">
                <div className="w-2 h-2 bg-dungeon-dark rounded-full"></div>
                <div className="w-2 h-2 bg-dungeon-dark rounded-full"></div>
              </div>
              {/* Mouth */}
              <div className="w-3 h-1 bg-dungeon-dark rounded-full"></div>
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
                    backgroundColor: ['#ff6b35', '#b8860b', '#ffd700', '#ff6b35'][i % 4],
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
              
              {/* Celebration Text */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-torch-glow text-black px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap animate-bounce">
                🎉 I'M NOT BORED ANYMORE! 🎉
              </div>
            </>
          )}
          
          {/* Click Progress Indicator */}
          {clickCount > 0 && clickCount < 5 && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-dungeon-dark/90 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              {clickCount}/5 clicks
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-shadow bg-gradient-to-r from-torch-glow to-ancient-gold bg-clip-text text-transparent">
          Cardbored
        </h1>
        <p className="text-xl md:text-2xl font-light opacity-90 text-ancient-gold">
          Don't break the bank. Break out the proxies.
        </p>
        <div className="mt-6 text-sm opacity-75 bg-dungeon-stone/30 rounded-lg p-3 max-w-4xl mx-auto border border-ancient-gold/30">
          <p className="text-gray-300">
            <span className="text-torch-glow font-semibold">Magic: The Gathering</span> is about the gathering - 
            the friends around the table, the stories we create, and the memories we forge together. 
            This tool helps ensure that financial barriers never stand between you and the magic of play.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Split your MTG decklist by price • Powered by Scryfall API
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header
