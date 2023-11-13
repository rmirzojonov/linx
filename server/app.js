const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const generate = require('./generator.js');

const app = express();
const port = process.env.PORT || 3000;

const urlDatabase = {};
const usedShortUrls = new Set();

app.use(cors());

app.use(bodyParser.json());

app.post('/shorten', (req, res) => {
  let originalUrl = req.body.longUrl;
  if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
    res.status(400).send('Invalid url');
    return;
  }

  const generateShortUrl = () => {
    const shortUrl = generate();
    if (!usedShortUrls.has(shortUrl)) {
      return shortUrl;
    }

    return generateShortUrl();
  };

  const shortUrl = generateShortUrl();

  const expirationTime = Date.now() + 24 * 60 * 60 * 1000;

  urlDatabase[shortUrl] = { originalUrl, expirationTime };
  usedShortUrls.add(shortUrl);

  res.json({ shortUrl: process.env.DOMAIN + "/" + shortUrl });
});

app.get('/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const urlEntry = urlDatabase[shortUrl];

  if (urlEntry && urlEntry.expirationTime > Date.now()) {
    res.redirect(urlEntry.originalUrl);
  } else {
    res.status(404).send('Not Found');
  }
});

setInterval(() => {
  const now = Date.now();
  for (const [shortUrl, entry] of Object.entries(urlDatabase)) {
    if (entry.expirationTime <= now) {
      usedShortUrls.delete(shortUrl);
      delete urlDatabase[shortUrl];
    }
  }
}, 3600000); // Run every hour (3600000 milliseconds)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
