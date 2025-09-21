import React from 'react'
import { analyzeDeck, getColorIdentity, formatColorIdentity, getManaCurveEfficiency, getDeckArchetype } from '../utils/deckAnalysis'
import Mascot from './Mascot'

function DeckStats({ cards }) {
  if (!cards || cards.length === 0) {
    return null
  }

  const stats = analyzeDeck(cards)
  const colorIdentity = getColorIdentity(cards)
  const curveEfficiency = getManaCurveEfficiency(stats.manaCurve)
  const archetype = getDeckArchetype(stats, colorIdentity)

  const manaCurveData = Object.keys(stats.manaCurve)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(cost => ({
      cost: parseInt(cost),
      count: stats.manaCurve[cost]
    }))

  const maxCurveCount = Math.max(...manaCurveData.map(d => d.count), 1)

  const getCompetitiveLevelColor = (level) => {
    switch (level) {
      case 'Competitive': return 'text-red-400'
      case 'Semi-Competitive': return 'text-orange-400'
      case 'Budget Competitive': return 'text-yellow-400'
      case 'Casual': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getCompetitiveLevelBg = (level) => {
    switch (level) {
      case 'Competitive': return 'bg-red-900/20 border-red-600/50'
      case 'Semi-Competitive': return 'bg-orange-900/20 border-orange-600/50'
      case 'Budget Competitive': return 'bg-yellow-900/20 border-yellow-600/50'
      case 'Casual': return 'bg-green-900/20 border-green-600/50'
      default: return 'bg-gray-900/20 border-gray-600/50'
    }
  }

  return (
    <div className="bg-dungeon-stone/80 rounded-xl shadow-lg p-6 border border-cardboard-dark relative">
      <h2 className="text-2xl font-bold mb-4 text-ancient-gold">Deck Statistics</h2>
      
      {/* Happy Mascot for good stats, Angry for expensive */}
      <Mascot 
        type={stats.competitiveLevel === 'Casual' ? 'happy' : 'angry'} 
        position="top-right" 
        size="small" 
      />
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dungeon-dark/50 rounded-lg p-3 text-center border border-gray-600/30">
          <div className="text-xl font-bold text-torch-glow">{stats.totalCards}</div>
          <div className="text-xs text-gray-400">Total Cards</div>
        </div>
        
        <div className="bg-dungeon-dark/50 rounded-lg p-3 text-center border border-gray-600/30">
          <div className="text-xl font-bold text-ancient-gold">{stats.avgManaCost}</div>
          <div className="text-xs text-gray-400">Avg CMC</div>
        </div>
        
        <div className="bg-dungeon-dark/50 rounded-lg p-3 text-center border border-gray-600/30">
          <div className="text-xl font-bold text-blue-400">{stats.lands}</div>
          <div className="text-xs text-gray-400">Lands</div>
        </div>
        
        <div className="bg-dungeon-dark/50 rounded-lg p-3 text-center border border-gray-600/30">
          <div className="text-xl font-bold text-green-400">{stats.creatures}</div>
          <div className="text-xs text-gray-400">Creatures</div>
        </div>
      </div>

      {/* Competitive Level */}
      <div className={`${getCompetitiveLevelBg(stats.competitiveLevel)} rounded-lg p-4 mb-6 border`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold text-lg ${getCompetitiveLevelColor(stats.competitiveLevel)}`}>
              {stats.competitiveLevel}
            </h3>
            <p className="text-sm text-gray-400">{archetype}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Curve: {curveEfficiency}</div>
            <div className="text-xs text-gray-400">{formatColorIdentity(colorIdentity)}</div>
          </div>
        </div>
      </div>

      {/* Mana Curve */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Mana Curve</h3>
        <div className="space-y-3">
          {manaCurveData.map(({ cost, count }, index) => (
            <div key={cost} className="flex items-center gap-4 group">
              <div className="w-10 text-sm font-mono text-gray-300 bg-dungeon-dark/50 rounded px-2 py-1 text-center border border-gray-600/30">
                {cost}
              </div>
              <div className="flex-1 bg-dungeon-dark rounded-full h-6 overflow-hidden relative group-hover:mana-glow">
                <div 
                  className="bg-gradient-to-r from-torch-glow via-ancient-gold to-torch-glow h-full transition-all duration-1000 ease-out relative group-hover:shadow-lg group-hover:shadow-torch-glow/30"
                  style={{ 
                    width: `${(count / maxCurveCount) * 100}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent mana-bar"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-torch-glow/20 via-transparent to-ancient-gold/20 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-200 drop-shadow-lg transition-all duration-300 group-hover:text-white">
                    {count > 0 ? count : ''}
                  </span>
                </div>
              </div>
              <div className="w-12 text-sm text-gray-400 text-right font-mono">
                {count > 0 ? `${((count / stats.totalCards) * 100).toFixed(1)}%` : ''}
              </div>
            </div>
          ))}
        </div>
        
        {/* Curve Analysis */}
        <div className="mt-4 p-3 bg-dungeon-dark/30 rounded-lg border border-gray-600/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Curve Analysis:</span>
            <span className={`font-semibold ${
              curveEfficiency === 'Aggro' ? 'text-red-400' :
              curveEfficiency === 'Ramp/Control' ? 'text-blue-400' :
              curveEfficiency === 'Midrange' ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {curveEfficiency}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {curveEfficiency === 'Aggro' && 'Low-cost, aggressive strategy'}
            {curveEfficiency === 'Ramp/Control' && 'High-cost, controlling strategy'}
            {curveEfficiency === 'Midrange' && 'Balanced, versatile strategy'}
            {curveEfficiency === 'Balanced' && 'Well-distributed mana costs'}
          </div>
        </div>
      </div>

      {/* Color Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Color Distribution</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(stats.colorDistribution).map(([color, count]) => {
            const colorClasses = {
              W: 'bg-white text-black',
              U: 'bg-blue-500 text-white',
              B: 'bg-black text-white',
              R: 'bg-red-500 text-white',
              G: 'bg-green-500 text-white',
              C: 'bg-gray-400 text-black'
            }
            
            if (count === 0) return null
            
            return (
              <div key={color} className={`${colorClasses[color]} rounded p-2 text-center text-xs font-bold`}>
                <div>{color}</div>
                <div>{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card Type Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-400">{stats.instants}</div>
          <div className="text-xs text-blue-300">Instants</div>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-400">{stats.sorceries}</div>
          <div className="text-xs text-purple-300">Sorceries</div>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <div className="text-lg font-bold text-yellow-400">{stats.artifacts}</div>
          <div className="text-xs text-yellow-300">Artifacts</div>
        </div>
        
        <div className="bg-pink-900/20 border border-pink-600/30 rounded-lg p-3">
          <div className="text-lg font-bold text-pink-400">{stats.enchantments}</div>
          <div className="text-xs text-pink-300">Enchantments</div>
        </div>
        
        <div className="bg-indigo-900/20 border border-indigo-600/30 rounded-lg p-3">
          <div className="text-lg font-bold text-indigo-400">{stats.planeswalkers}</div>
          <div className="text-xs text-indigo-300">Planeswalkers</div>
        </div>
        
        <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-3">
          <div className="text-lg font-bold text-emerald-400">{stats.manaFixing}</div>
          <div className="text-xs text-emerald-300">Mana Fixing</div>
        </div>
      </div>

      {/* Deck Analysis */}
      <div className="mt-6 p-4 bg-dungeon-dark/30 rounded-lg border border-ancient-gold/20">
        <h3 className="text-lg font-semibold text-ancient-gold mb-2">Deck Analysis</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong className="text-torch-glow">Archetype:</strong> {archetype}</p>
          <p><strong className="text-torch-glow">Mana Curve:</strong> {curveEfficiency}</p>
          <p><strong className="text-torch-glow">Competitive Level:</strong> {stats.competitiveLevel}</p>
          {stats.manaFixing > 0 && (
            <p><strong className="text-torch-glow">Mana Fixing:</strong> {stats.manaFixing} lands</p>
          )}
          <p><strong className="text-torch-glow">Land Ratio:</strong> {((stats.lands / stats.totalCards) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}

export default DeckStats
