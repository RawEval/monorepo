const fs = require('fs');
const openapi = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));
const endpoint = openapi.paths['/api/v1/chat/sessions/{session_id}/messages'].post;
const reqBodyRef = endpoint.requestBody.content['application/json'].schema.$ref;
const refName = reqBodyRef.split('/').pop();
const schema = openapi.components.schemas[refName];

console.log('--- Request Schema ---');
console.log(JSON.stringify(schema, null, 2));

if (schema.properties && schema.properties.models && schema.properties.models.items && schema.properties.models.items.$ref) {
  const modelRefName = schema.properties.models.items.$ref.split('/').pop();
  console.log('\n--- Model Item Schema ---');
  console.log(JSON.stringify(openapi.components.schemas[modelRefName], null, 2));
}

