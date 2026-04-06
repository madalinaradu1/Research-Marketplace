import tagRepository from '../amplify/backend/function/researchmarketplace2a916c6aPostConfirmation/src/lib/tags/TagRepository.js';

async function testTagOperations() {
  console.log('Testing Tag Repository Operations\n');

  // Test 1: Get tag by ID
  console.log('1. Testing getTagById...');
  const tag = await tagRepository.getTagById('domain-cybersecurity');
  console.log('Result:', tag ? tag.display_name : 'Not found');

  // Test 2: Autocomplete with prefix "ma"
  console.log('\n2. Testing autocomplete with prefix "ma"...');
  const maResults = await tagRepository.autocompleteTags('ma');
  console.log('Results:', maResults.map(t => t.display_name));

  // Test 3: Autocomplete with prefix "cy"
  console.log('\n3. Testing autocomplete with prefix "cy"...');
  const cyResults = await tagRepository.autocompleteTags('cy');
  console.log('Results:', cyResults.map(t => t.display_name));

  console.log('\n4. Testing autocomplete with internal word prefix "engin"...');
  const enginResults = await tagRepository.autocompleteTags('engin');
  console.log('Results:', enginResults.map(t => t.display_name));

  // Test 5: Get children of Cybersecurity
  console.log('\n5. Testing getChildren for Cybersecurity...');
  const children = await tagRepository.getChildren('domain-cybersecurity');
  console.log('Children:', children.map(t => t.display_name));

  // Test 6: Resolve alias "ai"
  console.log('\n6. Testing resolveAlias for "ai"...');
  const aiTag = await tagRepository.resolveAlias('ai');
  console.log('Resolved to:', aiTag ? aiTag.display_name : 'Not found');

  console.log('\nAll tests complete!');  
}

testTagOperations().catch(console.error);
