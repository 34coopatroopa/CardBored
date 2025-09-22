#!/usr/bin/env node

/**
 * Build script to fetch Scryfall bulk data and create a lightweight lookup file
 * This eliminates the need for KV namespaces and makes the app work offline
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SCRYFALL_BULK_URL = 'https://api.scryfall.com/bulk-data/default-cards'
const OUTPUT_FILE = path.join(__dirname, 'public', 'cards.json')

async function fetchBulkData() {
  console.log('🔄 Fetching Scryfall bulk data metadata...')
  
  // Step 1: Get bulk data metadata
  const metaResponse = await fetch(SCRYFALL_BULK_URL)
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch bulk metadata: ${metaResponse.status}`)
  }
  
  const meta = await metaResponse.json()
  console.log(`📦 Bulk data size: ${(meta.size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`🔗 Download URL: ${meta.download_uri}`)
  
  // Step 2: Download the actual bulk data
  console.log('⬇️  Downloading bulk data...')
  const dataResponse = await fetch(meta.download_uri)
  if (!dataResponse.ok) {
    throw new Error(`Failed to fetch bulk data: ${dataResponse.status}`)
  }
  
  const cards = await dataResponse.json()
  console.log(`✅ Downloaded ${cards.length} cards`)
  
  return cards
}

function createLookupTable(cards) {
  console.log('🔧 Creating lightweight lookup table...')
  
  const lookup = {}
  let processedCount = 0
  
  for (const card of cards) {
    if (card.name && card.prices) {
      const normalizedName = card.name.toLowerCase().trim()
      
      // Only include cards with USD prices
      const usdPrice = card.prices.usd || card.prices.usd_foil
      if (usdPrice && parseFloat(usdPrice) > 0) {
        lookup[normalizedName] = {
          name: card.name,
          price: parseFloat(usdPrice),
          imageUrl: card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || null,
          setName: card.set_name || 'Unknown',
          manaCost: card.mana_cost || card.card_faces?.[0]?.mana_cost || '',
          type: card.type_line || card.card_faces?.[0]?.type_line || 'Unknown'
        }
        processedCount++
      }
    }
  }
  
  console.log(`📊 Created lookup for ${processedCount} cards with prices`)
  return lookup
}

async function saveLookupTable(lookup) {
  console.log('💾 Saving lookup table...')
  
  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE)
  await fs.mkdir(publicDir, { recursive: true })
  
  // Save the lookup table
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(lookup, null, 2))
  
  const stats = await fs.stat(OUTPUT_FILE)
  console.log(`✅ Saved to ${OUTPUT_FILE}`)
  console.log(`📏 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
}

async function main() {
  try {
    console.log('🚀 Starting Scryfall bulk data fetch...')
    
    const cards = await fetchBulkData()
    const lookup = createLookupTable(cards)
    await saveLookupTable(lookup)
    
    console.log('🎉 Build complete! Card data is ready for bundling.')
    console.log(`📈 Cards with prices: ${Object.keys(lookup).length}`)
    
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

main()
