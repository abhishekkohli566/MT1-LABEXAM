import express from "express";

const app = express();
const PORT = 4000;

app.use(express.json());

let cart = [
    {
        id: 1,
        productName: "Wireless Mouse",
        price: 799,
        quantity: 2,
        category: "Electronics"
    },
    {
        id: 2,
        productName: "Keyboard",
        price: 1299,
        quantity: 1,
        category: "Electronics"
    },
    {
        id: 3,
        productName: "USB Cable",
        price: 299,
        quantity: 3,
        category: "Accessories"
    }
];

// GET /cart - Retrieve all cart items
app.get("/cart", (req, res) => {
    const items = cart.map(item => ({
        ...item,
        totalPrice: item.price * item.quantity
    }));

    res.status(200).json(items);
});

// GET /cart/:id - Retrieve a cart item by ID
app.get("/cart/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            error: "Invalid product ID"
        });
    }

    const item = cart.find(product => product.id === id);

    if (!item) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    res.status(200).json({
        ...item,
        totalPrice: item.price * item.quantity
    });
});

// POST /cart - Add a new product
app.post("/cart", (req, res) => {
    const { id, productName, price, quantity, category } = req.body;

    if (
        id === undefined ||
        !productName ||
        price === undefined ||
        quantity === undefined ||
        !category
    ) {
        return res.status(400).json({
            error: "Required fields: id, productName, price, quantity and category"
        });
    }

    if (
        !Number.isInteger(Number(id)) ||
        !Number.isFinite(Number(price)) ||
        !Number.isInteger(Number(quantity)) ||
        Number(price) < 0 ||
        Number(quantity) <= 0
    ) {
        return res.status(400).json({
            error: "Invalid id, price or quantity"
        });
    }

    if (cart.some(item => item.id === Number(id))) {
        return res.status(400).json({
            error: "Product ID already exists"
        });
    }

    const newProduct = {
        id: Number(id),
        productName,
        price: Number(price),
        quantity: Number(quantity),
        category
    };

    cart.push(newProduct);

    res.status(201).json({
        message: "Product added successfully",
        product: {
            ...newProduct,
            totalPrice: newProduct.price * newProduct.quantity
        }
    });
});

// PUT /cart/:id - Update product details
app.put("/cart/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            error: "Invalid product ID"
        });
    }

    const item = cart.find(product => product.id === id);

    if (!item) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    const { productName, price, quantity, category } = req.body;

    if (
        productName === undefined &&
        price === undefined &&
        quantity === undefined &&
        category === undefined
    ) {
        return res.status(400).json({
            error: "Provide at least one field to update"
        });
    }

    if (price !== undefined &&
        (!Number.isFinite(Number(price)) || Number(price) < 0)) {
        return res.status(400).json({
            error: "Price must be a non-negative number"
        });
    }

    if (quantity !== undefined &&
        (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0)) {
        return res.status(400).json({
            error: "Quantity must be a positive integer"
        });
    }

    if (productName !== undefined) item.productName = productName;
    if (price !== undefined) item.price = Number(price);
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (category !== undefined) item.category = category;

    res.status(200).json({
        message: "Product updated successfully",
        product: {
            ...item,
            totalPrice: item.price * item.quantity
        }
    });
});

// DELETE /cart/:id - Remove a product
app.delete("/cart/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            error: "Invalid product ID"
        });
    }

    const index = cart.findIndex(product => product.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    const deletedProduct = cart.splice(index, 1)[0];

    res.status(200).json({
        message: "Product deleted successfully",
        product: deletedProduct
    });
});

// Invalid route handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Invalid JSON / general error handler
app.use((err, req, res, next) => {
    console.error(err);

    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            error: "Invalid JSON request body"
        });
    }

    res.status(500).json({
        error: "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Express Server running at http://localhost:${PORT}`);
});
