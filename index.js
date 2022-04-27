const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 4000;


//TWO SIGNIFICANT MIDDLEWARE .........................................
app.use(cors())
app.use(express.json())

//database connection and REST API SECTION.............................
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sow4u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("emajohn").collection("product");

        //product load api from mongodb ..................................
        app.get('/product', async (req, res) => {
            const query = {}
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const cursor = productCollection.find(query)

            let products;
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray()
            }else{
                 products = await cursor.toArray()
            }
           
            res.send(products)
        })

        //server data counting api .......................................
        app.get('/productCount', async(req, res)=>{
            const count = await productCollection.estimatedDocumentCount()
            res.send({count})
        })

        //order cart product load api ....................................
        app.post('/productByKeys', async(req, res)=>{
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id))
            const query ={_id:{$in: ids}}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)

        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);







//general api ........................................................
app.get('/', (req, res) => {
    res.send('EMA JOHN NODE PROJECT SETTING')
})

//api listening the port ............................................
app.listen(port, () => {
    console.log('Ema John project is running on the PORT:: ', port);
})