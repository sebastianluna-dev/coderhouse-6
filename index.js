const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const File = require("./services/products.service")
const file = new File("products.txt")
const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}));

const messages = [
    {
        username: "John Denton",
        profilePicture: "https://iphoneros.com/wp-content/uploads/2022/05/pixewatch.jpg",
        message: "Hi, How's it doing?",
        date: "10/26/2022"
    },
    {
        username: "Levi Smith",
        profilePicture: "https://iphoneros.com/wp-content/uploads/2022/05/pixewatch.jpg",
        message: "Hi man, I'm doing great!",
        date: "10/26/2022"
    },
    {
        username: "Meredith Grey",
        profilePicture: "https://iphoneros.com/wp-content/uploads/2022/05/pixewatch.jpg",
        message: "Hello guys!, it's nice to talk with you again",
        date: "10/26/2022"
    },
]

app.get("/messages", (req, res) => {
    res.send(messages)
})

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: __dirname })
})

app.get("/products", async (req, res) => {
    const products = await file.getAll()
    res.send(products)
})

app.post("/products", async (req, res) => {
    const product = {
        title: req.body.title,
        price: parseInt(req.body.price),
        image: req.body.image
    }
    const products = await file.save(product)
    res.send(products)
})

app.put("/products", async (req, res) => {
    const product = {
        title: req.body.title,
        price: parseInt(req.body.price),
        image: req.body.image,
        id: parseInt(req.body.id)
    }
    const replacedProduct = await file.replaceById(product)
    res.send(replacedProduct)
})

app.get("/products/randomProduct", async (req, res) => {
    const randomProduct = await file.getRandom()
    res.send(randomProduct)
})

app.get("/products/:id", async (req, res) => {
    const { id } = req.params
    const product = await file.getById(parseInt(id))
    res.send(product)
})

app.delete("/products/:id", async (req, res)=> {
    const { id } = req.params
    const product = await file.deleteById(parseInt(id))
    res.send(product)
})


io.on('connection', (socket) => {
    socket.on("messageAdded", (message) => {
        messages.push(message)
        io.sockets.emit("addMessage", [message])
    })
    socket.on("productAdded", (product) => {
        io.sockets.emit("addProduct", product)
    })
    socket.on("productDeleted", (id) => {
        io.sockets.emit("deleteProduct", id)
    })
})

httpServer.listen(3000, () => console.log('SERVER ON') )