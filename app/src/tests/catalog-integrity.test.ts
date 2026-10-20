import { CANONICAL_TOOLS, STUDIOS, getToolById, searchTools } from '../data/registry';

console.log('--- RUNNING CATALOG INTEGRITY VERIFICATION ---');

// 1. Total count
if (CANONICAL_TOOLS.length !== 500) {
  throw new Error(`Expected exactly 500 tools, found ${CANONICAL_TOOLS.length}`);
}
console.log('✓ Exactly 500 tools found in canonical registry.');

// 2. Unique IDs
const ids = CANONICAL_TOOLS.map((t) => t.id);
const uniqueIds = new Set(ids);
if (uniqueIds.size !== 500) {
  throw new Error(`Duplicate IDs detected! Unique count: ${uniqueIds.size}`);
}
console.log('✓ All 500 tool IDs are unique.');

// 3. ID range 1 to 500
for (let i = 1; i <= 500; i++) {
  if (!uniqueIds.has(i)) {
    throw new Error(`Missing tool ID: ${i}`);
  }
}
console.log('✓ All tool IDs 1 through 500 are present sequentially.');

// 4. AI Studio constraint (IDs 401-416 must be coming_soon)
for (let i = 401; i <= 416; i++) {
  const tool = getToolById(i);
  if (!tool) throw new Error(`Tool #${i} not found`);
  if (tool.status !== 'coming_soon') {
    throw new Error(`Tool #${i} (${tool.name}) must be "coming_soon", found: ${tool.status}`);
  }
  if (tool.studioId !== 'ai') {
    throw new Error(`Tool #${i} must belong to "ai" studio, found: ${tool.studioId}`);
  }
}
console.log('✓ AI Studio tools (401-416) are strictly Coming Soon.');

// 5. IDs 179 and 180 are distinct
const t179 = getToolById(179);
const t180 = getToolById(180);
if (!t179 || !t180) throw new Error('IDs 179 and 180 must both exist');
if (t179.id === t180.id) throw new Error('179 and 180 must have distinct IDs');
console.log('✓ IDs 179 and 180 are distinct routes.');

// 6. Search validation
const mergeResults = searchTools('merge');
if (mergeResults.length === 0) throw new Error('Search for "merge" returned no results');
const id4Results = searchTools('4');
if (!id4Results.some((t) => t.id === 4)) throw new Error('Search for ID "4" failed');
console.log(`✓ Search engine functioning (found ${mergeResults.length} tools for "merge").`);

// 7. Studios count
if (STUDIOS.length !== 16) {
  throw new Error(`Expected 16 studios, found ${STUDIOS.length}`);
}
console.log('✓ Exactly 16 studios registered.');

console.log('--- ALL INTEGRITY AUDITS PASSED SUCCESSFULLY ---');
