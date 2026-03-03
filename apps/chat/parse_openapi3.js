const fs = require('fs');
const openapi = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));

Object.entries(openapi.components.schemas).forEach(([name, schema]) => {
  if (name === 'SendMessageRequest') {
    console.log('--- SendMessageRequest models ---');
    console.log(JSON.stringify(schema.properties.models, null, 2));
  }
});
