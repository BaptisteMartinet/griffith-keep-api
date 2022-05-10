require('dotenv').config();
const express = require('express');

(async () => {
  const PORT = process.env.PORT ?? 3000;
  const app = express();
  app.get('/', (req, res) => { res.send('gg ca marche') });
  app.listen(PORT, () => { console.info(`Server running on port: ${PORT}`); });
})();
