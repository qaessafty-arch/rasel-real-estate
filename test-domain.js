/**
 * Automated Domain Logic Test Suite for Rasel Real Estate
 * Tests:
 * 1. Area conversions (m² <-> Donum <-> Olk)
 * 2. Rectangular parcel geometry (Frontage × Depth = Area)
 * 3. Dual-currency formatting (USD and IQD)
 * 4. WhatsApp message generation and URL encoding
 */

const assert = require('assert');

// 1. Dōnum and Olk conversion logic
function donumToSqm(donum, olk = 0) {
  return (Number(donum || 0) * 2500) + (Number(olk || 0) * 100);
}

function sqmToDonum(sqm) {
  const donum = Math.floor(sqm / 2500);
  const remainder = sqm % 2500;
  const olk = Math.floor(remainder / 100);
  const remainderSqm = remainder % 100;
  return { donum, olk, remainderSqm };
}

// 2. Rectangular lot area
function calculateParcelArea(frontage, depth) {
  if (frontage <= 0 || depth <= 0) return 0;
  return Math.round(frontage * depth * 100) / 100;
}

// 3. Currency formatters
function formatPriceUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPriceIQD(amount) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount) + ' د.ع';
}

console.log('--- RUNNING RASEL REAL ESTATE DOMAIN TESTS ---');

// Test 1: Exact Donum Conversion
assert.strictEqual(donumToSqm(1, 0), 2500, '1 Donum must equal 2500 m²');
assert.strictEqual(donumToSqm(0, 1), 100, '1 Olk must equal 100 m²');
assert.strictEqual(donumToSqm(2, 5), 5500, '2 Donums and 5 Olks must equal 5500 m²');
console.log('✓ Test 1 Passed: Donum and Olk to SQM conversion is accurate.');

// Test 2: Inverse SQM to Donum & Olk
const lot5500 = sqmToDonum(5500);
assert.strictEqual(lot5500.donum, 2, '5500 m² must yield 2 Donums');
assert.strictEqual(lot5500.olk, 5, '5500 m² must yield 5 Olks');
assert.strictEqual(lot5500.remainderSqm, 0, '5500 m² has 0 remainder');

const lot2735 = sqmToDonum(2735);
assert.strictEqual(lot2735.donum, 1, '2735 m² yields 1 Donum');
assert.strictEqual(lot2735.olk, 2, '2735 m² yields 2 Olks (200 m²)');
assert.strictEqual(lot2735.remainderSqm, 35, '2735 m² has 35 m² remainder');
console.log('✓ Test 2 Passed: SQM to Donum, Olk, and remainder decomposition is accurate.');

// Test 3: Rectangular Parcel Geometry
assert.strictEqual(calculateParcelArea(10, 25), 250, '10m frontage × 25m depth must equal 250 m²');
assert.strictEqual(calculateParcelArea(12.5, 20), 250, '12.5m frontage × 20m depth must equal 250 m²');
assert.strictEqual(calculateParcelArea(0, 25), 0, 'Invalid frontage must return 0');
console.log('✓ Test 3 Passed: Rectangular parcel area computation is accurate.');

// Test 4: Currency formatting
assert.ok(formatPriceUSD(150000).includes('$150,000'), 'USD formatting is correct');
assert.ok(formatPriceIQD(200000000).includes('200,000,000 د.ع'), 'IQD formatting is correct');
console.log('✓ Test 4 Passed: Dual-currency formatting (USD & IQD) is accurate.');

// Test 5: WhatsApp URL Safety
const dummyProperty = {
  title: 'خانووی مۆدێرن لە هەولێر',
  code: 'RSL-101',
  price: '$180,000'
};
const rawText = `🏡 NASHVILLE HOUSE: ${dummyProperty.title} (${dummyProperty.code}) - ${dummyProperty.price}`;
const encoded = encodeURIComponent(rawText);
assert.ok(!encoded.includes(' '), 'Encoded WhatsApp message must have no raw spaces');
assert.ok(decodeURIComponent(encoded) === rawText, 'Decoded message must match original');
console.log('✓ Test 5 Passed: WhatsApp message encoding is safe and reversible.');

// Test 6: Intelligent Coordinate Parsing
function parseCoordinatesInput(input) {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();
  const atMatch = clean.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const qMatch = clean.match(/[?&](?:q|ll)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  const rawMatch = clean.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
  if (rawMatch) return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };
  const floats = clean.match(/-?\d+\.\d+/g);
  if (floats && floats.length >= 2) return { lat: parseFloat(floats[0]), lng: parseFloat(floats[1]) };
  return null;
}

const parsed1 = parseCoordinatesInput('36.2085, 43.9852');
assert.strictEqual(parsed1.lat, 36.2085, 'Direct comma-separated latitude matches');
assert.strictEqual(parsed1.lng, 43.9852, 'Direct comma-separated longitude matches');

const parsed2 = parseCoordinatesInput('https://www.google.com/maps/@36.2162,43.9981,17z');
assert.strictEqual(parsed2.lat, 36.2162, 'Google Maps @lat,lng parsed correctly');
assert.strictEqual(parsed2.lng, 43.9981, 'Google Maps @lat,lng parsed correctly');

const parsed3 = parseCoordinatesInput('https://maps.google.com/?q=36.1911,44.0092');
assert.strictEqual(parsed3.lat, 36.1911, 'Google Maps query URL parsed correctly');
console.log('✓ Test 6 Passed: Intelligent coordinate & Google Maps URL parsing is accurate.');

// Test 7: Compact Price Formatting for Map Badges
function formatPriceCompact(price, currency = 'USD') {
  if (!price || isNaN(price)) return 'N/A';
  if (currency === 'USD') {
    if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (price >= 1_000) return `$${Math.round(price / 1_000)}k`;
    return `$${price}`;
  } else {
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace(/\.0$/, '')}M د.ع`;
    if (price >= 1_000) return `${Math.round(price / 1_000)}k د.ع`;
    return `${price} د.ع`;
  }
}

assert.strictEqual(formatPriceCompact(180000, 'USD'), '$180k', 'Compact $180k is correct');
assert.strictEqual(formatPriceCompact(1200000, 'USD'), '$1.2M', 'Compact $1.2M is correct');
assert.strictEqual(formatPriceCompact(250000000, 'IQD'), '250M د.ع', 'Compact 250M IQD is correct');
console.log('✓ Test 7 Passed: Compact price tag formatting for map pins is accurate.');

console.log('--- ALL DOMAIN LOGIC TESTS PASSED SUCCESSFULLY (7/7) ---');
