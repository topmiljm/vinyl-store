const overrides = {
  "Pink Floyd-The Dark Side of the Moon":
    "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png",

  "Nirvana-Nevermind":
    "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg"
};

const getAlbumArt = async (artist, album) => {
  const key = `${artist}-${album}`;

  if (overrides[key]) {
    return overrides[key];
  }

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        artist + " " + album
      )}&entity=album&limit=20`
    );

    const data = await res.json();

    const normalize = str =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");

    const targetArtist = normalize(artist);
    const targetAlbum = normalize(album);

    const match = data.results.find(item => {
      const apiArtist = normalize(item.artistName);
      const apiAlbum = normalize(item.collectionName);

      return (
        apiArtist === targetArtist &&
        apiAlbum.includes(targetAlbum)
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


const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

  // ==========================
  // PRODUCTS TABLE
  // ==========================
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT,
      description TEXT,
      inventory INTEGER DEFAULT 0
    )
  `);

  // ==========================
  // ORDERS TABLE
  // ==========================
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================
  // ORDER ITEMS TABLE
  // ==========================
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      title TEXT,
      price INTEGER,
      quantity INTEGER,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )
  `);

  // ==========================
  // USERS TABLE
  // ==========================
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================
  // ADD user_id TO ORDERS (if not exists)
  // ==========================
  db.run(`ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id)`
    , (err) => {
      // Ignore error — column already exists after first run
    });

  // ==========================
  // SEED PRODUCTS (only if empty)
  // ==========================
  // db.run("DELETE FROM products");

  db.get("SELECT COUNT(*) as count FROM products", async (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (row.count === 0) {
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
          description: "The fourth and final studio album by the English rock band.",
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

      for (const product of products) {
        const image = await getAlbumArt(product.artist, product.title);

        db.run(
          `INSERT INTO products (title, artist, price, image, description, inventory)
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            product.title,
            product.artist,
            product.price,
            image,
            product.description,
            product.inventory,
          ]
        );
      }
    }
  });
});

module.exports = db;