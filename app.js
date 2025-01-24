const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
let db;
async function connectDB() {
    try {
        const client = new MongoClient(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await client.connect();
        db = client.db('sandeep'); // Connect to the "sandeep" database
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

// Handle form submission with POST request
app.post('/add-user', async (req, res) => {
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
        return res.send('<h3 style="color:red;">All fields are required!</h3><a href="/">Go Back</a>');
    }

    try {
        const newUser = {
            name,
            email,
            age: parseInt(age),
            createdAt: new Date(),
        };

        await db.collection('users').insertOne(newUser);
        res.send(`<h3 style="color:green;">User ${name} added successfully!</h3><a href="/">Go Back</a>`);
    } catch (error) {
        res.status(500).send('<h3 style="color:red;">Failed to add user</h3><a href="/">Go Back</a>');
    }
});

// Route to retrieve all users
app.get('/users', async (req, res) => {
    try {
        const users = await db.collection('users').find().toArray();
        let userList = '<h2>Users List:</h2><ul>';
        users.forEach(user => {
            userList += `<li>${user.name} - ${user.email} - ${user.age} years old</li>`;
        });
        userList += '</ul><br><a href="/">Go Back</a>';
        res.send(userList);
    } catch (error) {
        res.status(500).send('Failed to fetch users');
    }
});

// Start server after connecting to the database
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});
