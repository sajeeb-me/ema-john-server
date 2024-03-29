const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yqd4a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("emaJohn").collection("product");

        app.get('/product', async (req, res) => {
            // console.log(req.query)
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {}
            const cursor = productCollection.find(query)
            let products;
            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
                // const products = await cursor.limit(10).toArray();
            }
            res.send(products)
        })
        app.get('/productCount', async (req, res) => {
            const totalProducts = await productCollection.estimatedDocumentCount()
            res.send({ totalProducts })
        })

        // use post to get products by ids
        app.post('/productByKeys', async (req, res) => {
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id))
            const query = { _id: { $in: ids } }
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
            console.log(keys)
        })

    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("John is running and waiting for eme.")
})

app.listen(port, () => {
    console.log("listening: ", port)
})