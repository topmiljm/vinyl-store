const db = require("./db");

const clearProducts = db.prepare("DELETE FROM products");
clearProducts.run();

console.log("Products cleared");