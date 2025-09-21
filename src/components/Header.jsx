import React from 'react'

function Header() {
  return (
    <header className="bg-gradient-to-r from-dungeon-dark via-cardboard-dark to-dungeon-dark text-white py-8 shadow-2xl border-b-4 border-ancient-gold">
      <div className="container mx-auto px-4 text-center">
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
