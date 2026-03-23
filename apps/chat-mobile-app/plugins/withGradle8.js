let withDangerousMod;
try {
  withDangerousMod = require('expo/config-plugins').withDangerousMod;
} catch {
  withDangerousMod = require('@expo/config-plugins').withDangerousMod;
}
const fs = require('fs');
const path = require('path');

function withGradle8(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const propsPath = path.join(
        cfg.modRequest.platformProjectRoot,
        'gradle',
        'wrapper',
        'gradle-wrapper.properties'
      );
      if (fs.existsSync(propsPath)) {
        let content = fs.readFileSync(propsPath, 'utf-8');
        // Pin to Gradle 8.13 — Gradle 9 breaks React Native, AGP needs >=8.13
        content = content.replace(
          /gradle-\d+\.\d+(\.\d+)?-bin\.zip/,
          'gradle-8.13-bin.zip'
        );
        fs.writeFileSync(propsPath, content);
      }
      return cfg;
    },
  ]);
}

module.exports = withGradle8;
