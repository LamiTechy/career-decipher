const fs = require('fs');

const paths = ['pages/index.js', 'pages/legacy-home.js'];

paths.forEach(path => {
  try {
    let text = fs.readFileSync(path, 'utf8');
    // Remove UTF-8 BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }
    fs.writeFileSync(path, text, { encoding: 'utf8' });
    console.log('Stripped BOM from:', path);
  } catch (err) {
    console.error('Error with', path, ':', err.message);
  }
});
