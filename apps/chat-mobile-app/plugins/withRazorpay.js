let withDangerousMod;
try {
  withDangerousMod = require('expo/config-plugins').withDangerousMod;
} catch {
  withDangerousMod = require('@expo/config-plugins').withDangerousMod;
}
const fs = require('fs');
const path = require('path');

function withRazorpay(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf-8');

      if (!podfile.includes('razorpay-pod')) {
        podfile = podfile.replace(
          /use_expo_modules!/,
          `use_expo_modules!
  # razorpay-pod
  pod 'razorpay-pod', '~> 1.3.4'`
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return cfg;
    },
  ]);
}

module.exports = withRazorpay;
