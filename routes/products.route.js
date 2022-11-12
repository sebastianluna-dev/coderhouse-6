import express from "express"
import db from "../db/db.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const products = await db.select().table("products")
    res.send(products)
})

router.post("/", async (req, res) => {

    const product = {
        title: req.body.title,
        price: parseInt(req.body.price),
        image: req.body.image
    }

    const id = await db.insert(product).into("products")
    console.log(id)
    if (Array.isArray(id)) {
        if (id.length > 0) {
            res.send({...product, id: id[0]})
            return
        }
    }
    res.send(false)
})

router.get("/:id", async (req, res) => {
    const { id } = req.params
    const products = await db("products").where('id', id)
    if (Array.isArray(products)) {
        if (products.length > 0) {
            res.send(products[0])
        } else {
            res.send(false)
        }
        return
    }
    res.send(false)
    
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params
    const product = await db("products").where('id', parseInt(id)).del()
    if ( product === 0 ) {
        res.send(true)
    } else {
        res.send(false)
    }
})
 
export default router