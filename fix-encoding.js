const fs = require('fs');

const paths = ['pages/index.js', 'pages/legacy-home.js'];

paths.forEach(path => {
  try {
    const text = fs.readFileSync(path, 'latin1');
    fs.writeFileSync(path, text, { encoding: 'utf8' });
    console.log('Successfully rewrote:', path);
  } catch (err) {
    console.error('Error rewriting', path, ':', err.message);
  }
});
