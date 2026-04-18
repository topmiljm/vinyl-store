
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const term = req.query.term;

  if (!term) {
    return res.json([]);
  }

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        term
      )}&entity=album&limit=10`
    );

    const data = await response.json();

    // clean + normalize results
    const results = data.results.map(item => ({
      id: item.collectionId,
      title: item.collectionName,
      artist: item.artistName,
      image: item.artworkUrl100.replace("100x100", "300x300"),
      price: 2999 // you can randomize or set default
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;