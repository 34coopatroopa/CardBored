#!/usr/bin/env node

/**
 * Build script to fetch Scryfall bulk data and create a lightweight lookup file
 * This eliminates the need for KV namespaces and makes the app work offline
 * Now includes change detection for automated updates
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
  console.log(`📅 Last updated: ${meta.updated_at}`)
  
  // Step 2: Download the actual bulk data
  console.log('⬇️  Downloading bulk data...')
  const dataResponse = await fetch(meta.download_uri)
  if (!dataResponse.ok) {
    throw new Error(`Failed to fetch bulk data: ${dataResponse.status}`)
  }
  
  const cards = await dataResponse.json()
  console.log(`✅ Downloaded ${cards.length} cards`)
  
  return { cards, metadata: meta }
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

async function saveLookupTable(lookup, metadata) {
  console.log('💾 Saving lookup table...')
  
  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE)
  await fs.mkdir(publicDir, { recursive: true })
  
  // Add metadata to the lookup table
  const dataWithMetadata = {
    _metadata: {
      lastUpdated: metadata.updated_at,
      totalCards: Object.keys(lookup).length,
      fetchedAt: new Date().toISOString(),
      version: metadata.version || 'unknown'
    },
    ...lookup
  }
  
  // Save the lookup table
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(dataWithMetadata, null, 2))
  
  const stats = await fs.stat(OUTPUT_FILE)
  console.log(`✅ Saved to ${OUTPUT_FILE}`)
  console.log(`📏 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
  
  return dataWithMetadata
}

async function checkForChanges(newData) {
  try {
    const existingData = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf8'))
    const existingMetadata = existingData._metadata
    
    if (existingMetadata && existingMetadata.lastUpdated === newData._metadata.lastUpdated) {
      console.log('ℹ️  No changes detected - card data is up to date')
      return false
    }
    
    console.log(`🔄 Changes detected! Previous update: ${existingMetadata?.lastUpdated || 'unknown'}`)
    console.log(`🆕 New update: ${newData._metadata.lastUpdated}`)
    return true
  } catch (error) {
    console.log('ℹ️  No existing data found - will create new file')
    return true
  }
}

async function main() {
  try {
    console.log('🚀 Starting Scryfall bulk data fetch...')
    
    const { cards, metadata } = await fetchBulkData()
    const lookup = createLookupTable(cards)
    const dataWithMetadata = await saveLookupTable(lookup, metadata)
    
    const hasChanges = await checkForChanges(dataWithMetadata)
    
    if (hasChanges) {
      console.log('🎉 Build complete! Card data has been updated.')
      console.log(`📈 Cards with prices: ${Object.keys(lookup).length}`)
      console.log(`📅 Last Scryfall update: ${metadata.updated_at}`)
    } else {
      console.log('✅ Card data is already up to date - no changes needed')
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

main()
