const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User'); // Import User model

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection string from MongoDB Atlas
const mongoURI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/<your-database>?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Set the server selection timeout to 5 seconds
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    });

// Routes
app.get('/', (req, res) => {
    res.redirect('/dashboard'); // Redirect to /dashboard or you can render it directly
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/g', (req, res) => {
    res.render('g', { user: null, error: null });
});

app.get('/g2', (req, res) => {
    res.render('g2');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Route to handle G2 form submission
app.post('/add-g2-user', async (req, res) => {
    const { firstName, lastName, age, licenseNumber, make, model, year, plateNumber } = req.body;
    try {
        const user = new User({
            firstName,
            lastName,
            age,
            licenseNumber,
            carDetails: {
                make,
                model,
                year,
                plateNumber
            }
        });
        await user.save();
        res.status(201).send('User created');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Route to handle G form submission and retrieve user data
app.post('/get-user', async (req, res) => {
    const { licenseNumber } = req.body;
    try {
        const user = await User.findOne({ licenseNumber });
        if (user) {
            res.render('g', { user, error: null });
        } else {
            res.render('g', { user: null, error: 'No User Found' });
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Route to handle car information update
app.post('/update-car', async (req, res) => {
    const { licenseNumber, make, model, year, plateNumber } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { licenseNumber },
            {
                $set: {
                    'carDetails.make': make,
                    'carDetails.model': model,
                    'carDetails.year': year,
                    'carDetails.plateNumber': plateNumber
                }
            },
            { new: true, runValidators: true }
        );
        if (user) {
            res.render('g', { user, error: null });
        } else {
            res.render('g', { user: null, error: 'No User Found' });
        }
    } catch ( err) {
        res.status(500).send('Server error');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
