const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config();
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Coffee Server is running')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oqwbmox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const coffeeCollections = client.db('coffeeDB').collection('coffee');
        const usersCollections = client.db('coffeeDB').collection('user');
        app.post('/add-coffees', async (req, res) => {
            const coffee = req.body;
            const result = await coffeeCollections.insertOne(coffee);
            res.send(result);
        })

        app.get('/coffees', async (req, res) => {
            const cursor = await coffeeCollections.find()
            const coffees = await cursor.toArray();
            res.send(coffees);
        })


        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollections.findOne(query);
            res.send(result);
        })

        app.delete('/coffees/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollections.deleteOne(query);
            res.send(result);
        })

        app.put('/coffee/update/:id', async (req, res) => {
            const id = req.params.id;
            const coffee = req.body;
            console.log(coffee);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const updateCoffee = {
                $set: {
                    name: coffee.name,
                    chef: coffee.chef,
                    supplier: coffee.supplier,
                    taste: coffee.taste,
                    category: coffee.category,
                    details: coffee.details,
                    photo: coffee.photo,
                }
            }
            const result = await coffeeCollections.updateOne(filter, updateCoffee, options);
            res.send(result);
        })


        // User Information

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const cursor = await usersCollections.find()
            const users = await cursor.toArray();
            res.send(users);
        })

        app.patch('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateUser = {
                $set: {
                    AtLastLogged: user.alLastLogged
                }
            }
            const result = await usersCollections.updateOne(filter, updateUser, options)
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollections.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Your coffee server is running on port:- ${port}`);
})