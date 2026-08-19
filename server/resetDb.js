const db = require("./db");

async function reset() {
    const clearProducts = db.prepare("DELETE FROM products");
    clearProducts.run();
    console.log("Products cleared");


    await db.seedProducts();
    console.log("Products reseeded");
}

reset();