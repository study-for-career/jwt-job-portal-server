require('dotenv').config()

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.port || 5000;


// Middlewear
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.get('/', (req, res) => {
    res.send('Server Side is Working')
})

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token

    console.log(token);

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    // next()

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized Access" })
        }
        req.user = decoded
        next()
    }
    )

}
// V6JJxuiDlCvPQmgY
// user-job-portal


const uri = "mongodb+srv://user-job-portal:V6JJxuiDlCvPQmgY@cluster0.b8foj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        const jobsCollection = client.db('jobPortal').collection('jobsCollection');

        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/job', verifyToken, async (req, res) => {
            const email = req.query.email;

            console.log('req.cookies')


            const query = { email: email }
            // const query = { hr_email: email }
            const cursor = jobsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.findOne(query)
            res.send(result)
        })


        app.post('/jobs', async (req, res) => {
            const jobData = req.body
            const result = await jobsCollection.insertOne(jobData)
            res.send(result)
        })

        //auth APIs

        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '5h' })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false
                })
                .send({ success: true })
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('server is running...')
})