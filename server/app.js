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

const isValidUrl = (url) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );

  return pattern.test(url);
}

app.post('/shorten', (req, res) => {
  let originalUrl = req.body.longUrl;
  if (!isValidUrl(originalUrl)) {
    res.status(400).send({ error: { message: 'Invalid url' }});
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
    res.status(404).send({ error: { message: 'Not Found' }});
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;