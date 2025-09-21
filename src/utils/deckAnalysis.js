// Deck analysis utilities for MTG decklists

// Parse mana cost string to extract mana symbols
export function parseManaCost(manaCost) {
  if (!manaCost) return { colorless: 0, colors: {} }
  
  const colors = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
  let colorless = 0
  
  // Remove curly braces and split by color symbols
  const cleanCost = manaCost.replace(/[{}]/g, '')
  
  // Match generic mana (numbers)
  const genericMatches = cleanCost.match(/\d+/g)
  if (genericMatches) {
    colorless = genericMatches.reduce((sum, num) => sum + parseInt(num), 0)
  }
  
  // Count color symbols
  const colorSymbols = ['W', 'U', 'B', 'R', 'G', 'C']
  colorSymbols.forEach(color => {
    const matches = cleanCost.match(new RegExp(color, 'g'))
    if (matches) {
      colors[color] = matches.length
    }
  })
  
  return { colorless, colors }
}

// Calculate total mana cost for a card
export function getTotalManaCost(manaCost) {
  const parsed = parseManaCost(manaCost)
  return parsed.colorless + Object.values(parsed.colors).reduce((sum, count) => sum + count, 0)
}

// Analyze deck statistics
export function analyzeDeck(cards) {
  const stats = {
    totalCards: 0,
    manaCurve: {},
    colorDistribution: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    lands: 0,
    creatures: 0,
    spells: 0,
    artifacts: 0,
    enchantments: 0,
    planeswalkers: 0,
    instants: 0,
    sorceries: 0,
    avgManaCost: 0,
    maxManaCost: 0,
    manaFixing: 0,
    competitiveLevel: 'Casual',
    deckType: 'Unknown'
  }
  
  let totalManaCost = 0
  let cardsWithManaCost = 0
  
  cards.forEach(card => {
    const quantity = card.quantity || 1
    stats.totalCards += quantity
    
    // Analyze mana curve
    const manaCost = getTotalManaCost(card.manaCost)
    if (manaCost > 0) {
      totalManaCost += manaCost * quantity
      cardsWithManaCost += quantity
      stats.maxManaCost = Math.max(stats.maxManaCost, manaCost)
      
      if (!stats.manaCurve[manaCost]) {
        stats.manaCurve[manaCost] = 0
      }
      stats.manaCurve[manaCost] += quantity
    }
    
    // Analyze colors
    const parsedMana = parseManaCost(card.manaCost)
    Object.keys(parsedMana.colors).forEach(color => {
      stats.colorDistribution[color] += parsedMana.colors[color] * quantity
    })
    
    // Categorize by type
    const type = card.type?.toLowerCase() || ''
    if (type.includes('land')) {
      stats.lands += quantity
      
      // Check for mana fixing lands
      if (type.includes('dual') || type.includes('shock') || type.includes('fetch') || 
          type.includes('triome') || type.includes('pain') || type.includes('check')) {
        stats.manaFixing += quantity
      }
    } else if (type.includes('creature')) {
      stats.creatures += quantity
    } else if (type.includes('instant')) {
      stats.instants += quantity
      stats.spells += quantity
    } else if (type.includes('sorcery')) {
      stats.sorceries += quantity
      stats.spells += quantity
    } else if (type.includes('artifact')) {
      stats.artifacts += quantity
    } else if (type.includes('enchantment')) {
      stats.enchantments += quantity
    } else if (type.includes('planeswalker')) {
      stats.planeswalkers += quantity
    }
  })
  
  // Calculate averages
  if (cardsWithManaCost > 0) {
    stats.avgManaCost = (totalManaCost / cardsWithManaCost).toFixed(2)
  }
  
  // Determine competitive level based on card prices and composition
  const totalValue = cards.reduce((sum, card) => sum + (card.price * card.quantity), 0)
  const expensiveCards = cards.filter(card => card.price > 10).length
  const avgCardPrice = cards.length > 0 ? totalValue / cards.length : 0
  
  if (totalValue > 1000 || expensiveCards > 10) {
    stats.competitiveLevel = 'Competitive'
  } else if (totalValue > 500 || expensiveCards > 5) {
    stats.competitiveLevel = 'Semi-Competitive'
  } else if (totalValue > 200 || expensiveCards > 2) {
    stats.competitiveLevel = 'Budget Competitive'
  } else {
    stats.competitiveLevel = 'Casual'
  }
  
  // Determine deck type
  const creatureRatio = stats.creatures / stats.totalCards
  const spellRatio = stats.spells / stats.totalCards
  const landRatio = stats.lands / stats.totalCards
  
  if (creatureRatio > 0.4) {
    stats.deckType = 'Aggro/Midrange'
  } else if (spellRatio > 0.6) {
    stats.deckType = 'Control/Combo'
  } else if (landRatio > 0.4) {
    stats.deckType = 'Ramp/Landfall'
  } else {
    stats.deckType = 'Balanced'
  }
  
  return stats
}

// Get color identity from mana costs
export function getColorIdentity(cards) {
  const colors = new Set()
  
  cards.forEach(card => {
    const parsed = parseManaCost(card.manaCost)
    Object.keys(parsed.colors).forEach(color => {
      if (parsed.colors[color] > 0) {
        colors.add(color)
      }
    })
  })
  
  return Array.from(colors).sort()
}

// Format color identity for display
export function formatColorIdentity(colorIdentity) {
  if (colorIdentity.length === 0) return 'Colorless'
  if (colorIdentity.length === 1) {
    const colorNames = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green', C: 'Colorless' }
    return colorNames[colorIdentity[0]] || colorIdentity[0]
  }
  if (colorIdentity.length === 2) {
    const colorNames = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G', C: 'C' }
    return colorIdentity.map(c => colorNames[c] || c).join('')
  }
  return `${colorIdentity.length}-Color`
}

// Calculate mana curve efficiency
export function getManaCurveEfficiency(manaCurve) {
  const totalCards = Object.values(manaCurve).reduce((sum, count) => sum + count, 0)
  if (totalCards === 0) return 'Unknown'
  
  const lowCost = (manaCurve[1] || 0) + (manaCurve[2] || 0)
  const midCost = (manaCurve[3] || 0) + (manaCurve[4] || 0)
  const highCost = Object.keys(manaCurve).filter(cost => parseInt(cost) >= 5)
    .reduce((sum, cost) => sum + (manaCurve[cost] || 0), 0)
  
  const lowRatio = lowCost / totalCards
  const midRatio = midCost / totalCards
  const highRatio = highCost / totalCards
  
  if (lowRatio > 0.5) return 'Aggro'
  if (highRatio > 0.3) return 'Ramp/Control'
  if (midRatio > 0.4) return 'Midrange'
  return 'Balanced'
}

// Get deck archetype suggestions
export function getDeckArchetype(stats, colorIdentity) {
  const colors = colorIdentity.length
  const creatureRatio = stats.creatures / stats.totalCards
  const avgCost = parseFloat(stats.avgManaCost)
  
  if (colors === 0) return 'Colorless Ramp/Artifacts'
  if (colors === 1) {
    if (creatureRatio > 0.4) return `${formatColorIdentity(colorIdentity)} Aggro`
    return `${formatColorIdentity(colorIdentity)} Control`
  }
  
  if (creatureRatio > 0.4 && avgCost < 3) {
    if (colors === 2) return 'Aggro'
    return 'Multicolor Aggro'
  }
  
  if (avgCost > 4) {
    if (colors >= 3) return 'Multicolor Control'
    return 'Midrange/Control'
  }
  
  if (colors >= 3) return 'Multicolor Midrange'
  return 'Two-Color Midrange'
}
