const express = require('express');
const cors = require('cors');
const corsConfig = require('./src/configs/cors.config');
const pgConfig = require('./src/configs/pg.config');
require('dotenv').config();

pgConfig.connect();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(corsConfig));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send("Mood Tracker API. Welcome!");
});

app.use('/auth', authRoute);
app.use('/moods', moodRoute);

app.listen(PORT, () => {
    console.log(`[v] Server running on port ${PORT}!`);
});
