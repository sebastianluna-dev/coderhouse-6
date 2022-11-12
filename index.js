import express from "express"
import { Server as HttpServer } from "http"
import { Server as IOServer } from "socket.io"
import db from "./db/db.js"
import productsRouter from "./routes/products.route.js"

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const createTables = async () => {
    if (!await db.schema.hasTable("messages")) {
        await db.schema.createTable("messages", table => {
            table.increments("id")
            table.string("username")
            table.string("profile_picture")
            table.text("message")
            table.bigInteger("datestamp")
        })
    }
    if (!await db.schema.hasTable("products")) {
        await db.schema.createTable("products", table => {
            table.increments("id")
            table.string("title")
            table.integer("price")
            table.text("image")
        })
    }

}

createTables()

app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}));

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: __dirname })
})

app.use("/products", productsRouter)

app.get("/messages", async (req, res) => {
    const messages = await db.select().table("messages")
    res.send(messages)
})


io.on('connection', (socket) => {
    socket.on("messageAdded", async (message) => {
        await db.insert(message).into("messages")
        io.sockets.emit("addMessage", [message])
    })
    socket.on("productAdded", async (product) => {
        io.sockets.emit("addProduct", product)
    })
    socket.on("productDeleted", async (id) => {
        io.sockets.emit("deleteProduct", id)
    })
})

httpServer.listen(3000, () => console.log('SERVER ON'))