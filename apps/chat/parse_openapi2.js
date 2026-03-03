const fs = require('fs');
const openapi = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));
const endpoint = openapi.paths['/api/v1/chat/sessions/{session_id}/messages'].post;
const reqBodyRef = endpoint.requestBody.content['application/json'].schema.$ref;
const refName = reqBodyRef.split('/').pop();
const schema = openapi.components.schemas[refName];

console.log('--- Request Schema Keys ---');
console.log(Object.keys(schema.properties));

if (schema.properties.models) {
  console.log('\n--- models field schema ---');
  console.log(JSON.stringify(schema.properties.models, null, 2));
}

