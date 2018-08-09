const fs = require('fs');

module.exports.copyFileSync = (src, dest) => {
  if (!fs.existsSync(src)) {
    return false;
  }
  const data = fs.readFileSync(src, 'utf-8');
  fs.writeFileSync(dest, data);
};