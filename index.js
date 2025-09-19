import express from 'express';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const publicPath = path.resolve('public');
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

const dbName = "TodoList";
const collectionName = "Tasks";
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const connection = async () => {
    const conn = await client.connect();
    return conn.db(dbName);
};

// ------------------- ROUTES -------------------

// Show all tasks
app.get('/', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const result = await collection.find().toArray();
    resp.render("list", { result });
});

// Show add form
app.get('/add', (req, resp) => {
    resp.render("add");
});

// Handle add form
app.post('/add', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    await collection.insertOne(req.body);
    resp.redirect('/');
});

// Handle delete
app.post('/delete/:id', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    resp.redirect('/');
});

// Show update form
app.get('/update/:id', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);
    const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (result) {
        resp.render("update", { result });
    } else {
        resp.send("Task not found");
    }
});

// Handle update form
app.post('/update/:id', async (req, resp) => {
    const db = await connection();
    const collection = db.collection(collectionName);

    await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { title: req.body.title, details: req.body.details } }
    );

    resp.redirect('/');
});

// Start server
app.listen(3200, () => {
    console.log("Server running at http://localhost:3200");
});
