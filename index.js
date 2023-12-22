const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p37usk1.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const taskCollection = client.db('TaskDB').collection('Tasks');

        // Add Task API
        app.post('/addtask', async (req, res) => {
            try {
                const newTask = req.body;
                const result = await taskCollection.insertOne(newTask);
                res.json({ insertedId: result.insertedId });
            } catch (error) {
                console.error('Error adding task:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });


        app.get('/tasks/:status', async (req, res) => {
            const status = req.params.status;
            const query = { status: status };
            const result = await taskCollection.find(query).toArray();
            res.send(result);
        });

        //Inprogress status
        app.patch('/inprogress/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = req.body;
            const updateTask = {
                $set: {
                    status: updatedDoc.status
                }
            }
            const result = await taskCollection.updateOne(filter, updateTask);
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task server is running')
})

app.listen(port, () => {
    console.log(`Task Server is running on port: ${port}`)
})