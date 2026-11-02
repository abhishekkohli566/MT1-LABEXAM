import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cart = [
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

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(data, null, 2));
}

function sendHtml(res, statusCode, html) {
    res.writeHead(statusCode, {
        "Content-Type": "text/html; charset=utf-8"
    });
    res.end(html);
}

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(new Error("Invalid JSON request body"));
            }
        });

        req.on("error", reject);
    });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    try {
        // A2: Routing + GET /
        if (req.method === "GET" && url.pathname === "/") {
            return sendHtml(
                res,
                200,
                `<!DOCTYPE html>
                <html>
                <head><title>Shopping Cart</title></head>
                <body>
                    <h1>Welcome to Shopping Cart Management</h1>
                    <p>Node.js HTTP Module Application</p>
                </body>
                </html>`
            );
        }

        // GET /cart
        if (req.method === "GET" && url.pathname === "/cart") {
            return sendJson(res, 200, cart);
        }

        // GET /about
        if (req.method === "GET" && url.pathname === "/about") {
            return sendHtml(
                res,
                200,
                `<h1>Shopping Cart Application</h1>
                 <p>This application demonstrates Node.js HTTP, FS modules,
                 routing, HTTP methods and shopping cart management.</p>`
            );
        }

        // GET /home - serve index.html using FS module
        if (req.method === "GET" && url.pathname === "/home") {
            const filePath = path.join(__dirname, "public", "index.html");

            fs.readFile(filePath, "utf8", (error, data) => {
                if (error) {
                    console.error("File reading error:", error);
                    return sendJson(res, 500, {
                        error: "Unable to read index.html"
                    });
                }

                res.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                res.end(data);
            });

            return;
        }

        // POST /add-to-cart
        if (req.method === "POST" && url.pathname === "/add-to-cart") {
            let product;

            try {
                product = await readRequestBody(req);
            } catch (error) {
                return sendJson(res, 400, { error: error.message });
            }

            const { id, productName, price, quantity } = product;

            if (
                id === undefined ||
                !productName ||
                price === undefined ||
                quantity === undefined
            ) {
                return sendJson(res, 400, {
                    error: "Required fields: id, productName, price and quantity"
                });
            }

            if (
                !Number.isInteger(Number(id)) ||
                !Number.isFinite(Number(price)) ||
                !Number.isInteger(Number(quantity)) ||
                Number(price) < 0 ||
                Number(quantity) <= 0
            ) {
                return sendJson(res, 400, {
                    error: "Invalid id, price or quantity"
                });
            }

            if (cart.some(item => item.id === Number(id))) {
                return sendJson(res, 400, {
                    error: "Product ID already exists"
                });
            }

            const newProduct = {
                id: Number(id),
                productName,
                price: Number(price),
                quantity: Number(quantity),
                category: product.category || "General"
            };

            cart.push(newProduct);

            return sendJson(res, 201, {
                message: "Product added successfully",
                product: newProduct
            });
        }

        // 404 invalid routes
        return sendJson(res, 404, {
            error: "Route not found"
        });
    } catch (error) {
        console.error("Server error:", error);
        return sendJson(res, 500, {
            error: "Internal server error"
        });
    }
});

server.listen(PORT, () => {
    console.log(`HTTP Server running at http://localhost:${PORT}`);
});
