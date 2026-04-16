const db = require("./db");

db.run("DELETE FROM products", () => {
  console.log("Products cleared");
});