const Database = require("better-sqlite3");
const db = new Database("database.db");

// ==========================
// ALBUM ART FALLBACKS
// ==========================
const overrides = {
  "Pink Floyd-The Dark Side of the Moon":
    "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png",

  "Nirvana-Nevermind":
    "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg",
};

// ==========================
// ALBUM ART FETCHER
// ==========================
const getAlbumArt = async (artist, album) => {
  const key = `${artist}-${album}`;

  if (overrides[key]) return overrides[key];

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        artist + " " + album
      )}&entity=album&limit=20`
    );

    const data = await res.json();

    const normalize = (str) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");

    const targetArtist = normalize(artist);
    const targetAlbum = normalize(album);

    const match = data.results.find((item) => {
      return (
        normalize(item.artistName) === targetArtist &&
        normalize(item.collectionName).includes(targetAlbum)
      );
    });

    const image =
      match?.artworkUrl100 || data.results?.[0]?.artworkUrl100;

    return image
      ? image.replace("100x100", "500x500")
      : "https://via.placeholder.com/500?text=No+Image";
  } catch (err) {
    console.error("iTunes fetch error:", err);
    return "https://via.placeholder.com/500?text=No+Image";
  }
};

// ==========================
// SCHEMA CREATION
// ==========================
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  description TEXT,
  inventory INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total INTEGER NOT NULL,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  title TEXT,
  price INTEGER,
  quantity INTEGER,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// ==========================
// ADD COLUMN SAFELY
// ==========================
try {
  db.exec(`ALTER TABLE orders ADD COLUMN user_id INTEGER`);
} catch (err) {
  // ignore if column already exists
}

// ==========================
// PREPARED STATEMENTS
// ==========================
const countProducts = db.prepare("SELECT COUNT(*) as count FROM products");
const insertProduct = db.prepare(`
  INSERT INTO products (title, artist, price, image, description, inventory)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// ==========================
// SEED DATA
// ==========================
async function seedProducts() {
  const row = countProducts.get();

  if (row.count > 0) return;

  const products = [
    {
      title: "Abbey Road",
      artist: "The Beatles",
      price: 2999,
      description: "Classic 1969 album featuring Come Together and Here Comes The Sun.",
      inventory: 10,
    },
    {
      title: "The Dark Side of the Moon",
      artist: "Pink Floyd",
      price: 3199,
      description: "Legendary progressive rock album released in 1973.",
      inventory: 8,
    },
    {
      title: "Rumours",
      artist: "Fleetwood Mac",
      price: 2799,
      description: "One of the best-selling albums of all time.",
      inventory: 12,
    },
    {
      title: "Nevermind",
      artist: "Nirvana",
      price: 3099,
      description: "The album that defined 90s grunge.",
      inventory: 6,
    },
    {
      title: "Bitches Brew",
      artist: "Miles Davis",
      price: 2499,
      description: "The groundbreaking jazz fusion album.",
      inventory: 7,
    },
    {
      title: "OK Computer",
      artist: "Radiohead",
      price: 2999,
      description: "The album that defined 90s alternative rock.",
      inventory: 5,
    },
    {
      title: "Zeppelin IV",
      artist: "Led Zeppelin",
      price: 2999,
      description: "The fourth studio album by Led Zeppelin.",
      inventory: 5,
    },
    {
      title: "Purple Rain",
      artist: "Prince",
      price: 2799,
      description: "The soundtrack to the 1984 film.",
      inventory: 4,
    },
  ];

  const insertMany = db.transaction((items) => {
    for (const p of items) {
      const image = p.image || null;

      insertProduct.run(
        p.title,
        p.artist,
        p.price,
        image,
        p.description,
        p.inventory
      );
    }
  });

  // fetch images first (async), then insert
  const enriched = [];
  for (const p of products) {
    const image = await getAlbumArt(p.artist, p.title);
    enriched.push({ ...p, image });
  }

  insertMany(enriched);
}

seedProducts();

module.exports = db;