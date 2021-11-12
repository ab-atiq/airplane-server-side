const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// midleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwz2c.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('Database connected successfully');
        const database = client.db('airplane');
        const productCollection = database.collection('products');
        const reviewCollection = database.collection('reviews');
        const buyerCollection = database.collection('buyers');
        const userCollection = database.collection('users');

        //GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const products = await cursor.toArray();
            res.json(products);
        })

        // limit product
        app.get('/limitProducts', async (req, res) => {
            const cursor = productCollection.find({})
            const products = await cursor.limit(6).toArray();
            res.json(products);
        })

        //GET API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({})
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        // POST reviews 
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log('Hit the post API.', review);
            const result = await reviewCollection.insertOne(review);
            // console.log(result);
            res.json(result);
        })

        // POST places 
        app.post('/buyers', async (req, res) => {
            const buyer = req.body;
            // console.log('Hit the post API.', buyer);
            const result = await buyerCollection.insertOne(buyer);
            // console.log(result);
            res.json(result);
        })

        // POST users 
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log('Hit the post API.', user);
            const result = await userCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        })

        // upsert
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updataDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updataDoc, options);
            res.json(result);
        })

        // PUT Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //GET admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

    }
    finally {
        // await client.connect();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Airplane assignment server is running');
});

app.listen(port, () => {
    console.log("Server is running port", port);
})