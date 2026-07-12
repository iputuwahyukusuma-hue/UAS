const express = require('express');
const cors = require('cors');
const path = require('path');
const noteRoutes = require('./routes/note.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Melayani file frontend (HTML/CSS/JS) di folder public
app.use(express.static(path.join(__dirname, '../public')));

// Mengarahkan ke rute API utama
app.use('/api', noteRoutes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}

module.exports = app;