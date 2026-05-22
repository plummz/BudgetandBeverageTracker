/**
 * Generate all PWA icon sizes from source.svg using sharp.
 * Run: node scripts/gen-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT  = join(ROOT, 'public', 'icons')
const SVG  = readFileSync(join(OUT, 'source.svg'))

mkdirSync(OUT, { recursive: true })

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

async function gen(size, name) {
  const file = join(OUT, name ?? `icon-${size}.png`)
  await sharp(SVG)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(file)
  console.log(`  ✓ ${name ?? `icon-${size}.png`}  (${size}×${size})`)
}

console.log('Generating BudgetFlow icons from source.svg …\n')

for (const sz of SIZES) await gen(sz)

await gen(180, 'apple-touch-icon.png')
await gen(512, 'icon-maskable-512.png')
await gen(32,  'favicon-32.png')

console.log('\nAll icons written to public/icons/')
