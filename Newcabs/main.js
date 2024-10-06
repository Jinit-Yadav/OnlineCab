import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import bcrypt from 'bcrypt';
import User from './models/userSchema.js';
import Driver from './models/driverSchema.js';
import CabBooking from './models/CabBooking.js';

const app = express();

var i=0;
// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


(async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/todo");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
})();

// Set the views directory path
app.set('views', './views');


// Routes
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    console.log("Home Page");
    res.render('Home');
});

app.get('/searching-driver', (req, res) => {
    res.render('searching-driver');
});

app.get('/about', (req, res) => {
    console.log("Info Page");
    res.render('Info');
});

app.get('/acceptedride', (req, res) => {
    console.log("Accept Page");
    res.render('Acceptedride');
});

app.get('/login', (req, res) => {
    console.log("Login Page");
    res.render('Login');
});

app.get('/contact', (req, res) => {
    console.log("Contact Page");
    res.render('Contact');
});

app.get('/signup', (req, res) => {
    console.log("Signup Page");
    res.render('Signup', { error: null });
});

app.get('/profile', (req, res) => {
    console.log("Profile Page");
    res.render('Profile', { error: null });
});

app.get('/driverlogin', (req, res) => {
    console.log("DriverLogin Page");
    res.render('DriverLogin',{ error: null });
});

app.get('//booking-confirmation', (req, res) => {
    console.log("DriverLogin Page");
    res.render('booking-confirmation',{ error: null });
});

app.get('/driversignup', (req, res) => {
    console.log("DriverSignup Page");
    res.render('DriverSignup', { error: null }); // Pass error as null initially
});

app.get('/driverprofile', (req, res) => {
    console.log("Driver Page");
    res.render('Driverprofile');
});

app.get('/Booking', (req, res) => {
    console.log("Booking Page");
    res.render('Booking'); // Pass error as null initially
});

// Signup route
app.post("/signup", async (req, res) => {
    const { uname, psw } = req.body;

    try {
        if (!uname || !psw) {
            return res.status(400).send('Username and password are required.');
        }
        const existingUser = await User.findOne({ uname });

        if (existingUser) {
            return res.status(400).send('User already exists. Please choose a different username.');
        }
        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(psw, saltRounds);

        // Create a new user
        const newUser = new User({
            uname,
            pwd: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();

        res.render('Login');
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).send('Error signing up user');
    }
});


app.post("/login", async (req, res) => {
    const { username, pwd } = req.body; // Changed password to pwd

    // Find the user in the database
    try {
        const user = await User.findOne({ uname: username });

        // If user does not exist
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the password is correct
        const validPassword = await bcrypt.compare(pwd, user.pwd); // Changed password to pwd
        if (!validPassword) {
            return res.status(401).send('Invalid password');
        }

        // Successful login
        res.render('Profile', { username: user.uname });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

function wapas(){
    var i=1;
}

app.get('/ride-info', async (req, res) => {
    try {
        const bookings = await CabBooking.find();
        res.render('ride-info', { bookings: bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});

app.post("/book-cab", async (req, res) => {
    const { name, source, destination, date } = req.body;
    try {
        // Check for available drivers
        const availableDrivers = await Driver.find({ available: true });

        if (availableDrivers.length === 0) {
            // If no drivers are available, render a page indicating the unavailability of drivers
            return res.render('no-drivers-available');
        }

        // Save the booking to the database
        const cabBooking = new CabBooking({
            name,
            source,
            destination,
            date: new Date(date)
        });
        await cabBooking.save();
        
        // Redirect to the booking confirmation page
        res.redirect('/booking-confirmation/' + cabBooking._id);
    } catch (error) {
        console.error('Error booking cab:', error);
        res.status(500).send('Error booking cab');
    }
});


app.get('/booking-confirmation/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await CabBooking.findById(bookingId);
        console.log('Booking details:', booking); // Add this line for debugging
        res.render('booking-confirmation', { booking: booking });
    } catch (error) {
        console.error('Error rendering booking confirmation:', error);
        res.status(500).send('Error rendering booking confirmation');
    }
});


app.get('/booking-confirmation/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await CabBooking.findById(bookingId);
        res.render('booking-confirmation', { booking: booking });
    } catch (error) {
        console.error('Error rendering booking confirmation:', error);
        res.status(500).send('Error rendering booking confirmation');
    }
});

app.post("/accept-ride", async (req, res) => {
    const { bookingId, driverId } = req.body;

    try {
        // Update the driver's availability status to false
        await Driver.findByIdAndUpdate(driverId, { available: false });

        // Update the booking with the driver's information
        await CabBooking.findByIdAndUpdate(bookingId, { driverId });

        // Redirect to the booking confirmation page
        res.redirect('/booking-confirmation/' + bookingId);
    } catch (error) {
        console.error('Error accepting ride:', error);
        res.status(500).send('Error accepting ride');
    }
});

app.get('/acceptedride/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const booking = await CabBooking.findById(id);
        res.render('Acceptedride', { booking: booking });
    } catch (error) {
        console.error('Error rendering Acceptedride:', error);
        res.status(500).send('Error rendering Acceptedride');
    }
});

// Middleware for logging requests
app.use((req, res, next) => {
    console.log("Received request body:", req.body);
    next();
});

app.post("/driverlogin", async (req, res) => {
    const { duname, dpwd } = req.body;

    try {
        // Find the driver in the database
        const driver = await Driver.findOne({ duname });

        // If driver does not exist
        if (!driver) {
            return res.status(404).send('Driver not found');
        }

        // Trim and normalize whitespace in the submitted password
        const submittedPassword = dpwd.trim();

        // Trim and normalize whitespace in the hashed password from the database
        const databasePassword = driver.dpwd.trim();

        // Log information for debugging
        console.log('Submitted password:', submittedPassword);
        console.log('Length of submitted password:', submittedPassword.length);
        console.log('Hashed password from database:', databasePassword);
        console.log('Length of hashed password from database:', databasePassword.length);
        console.log('Comparing passwords...');

        // Compare the passwords after converting both to the same format and encoding
        const validPassword = await bcrypt.compare(submittedPassword, databasePassword);

        // Log the result of the comparison
        console.log('Is password valid?', validPassword);

        // If passwords match
        if (validPassword) {
            console.log('Password is valid');
            
            // Update the driver's availability status to true
            await Driver.findByIdAndUpdate(driver._id, { available: true });

            // Render the Driverprofile page
            res.render('Driverprofile', { username: driver.duname });
        } else {
            console.log('Invalid password');
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// Driver Signup Route
app.post("/driversignup", async (req, res) => {
    const { uname, psw } = req.body;

    try {
        if (!uname || !psw) {
            return res.status(400).send('Username and password are required.');
        }

        // Check if the driver already exists in the database
        const existingDriver = await Driver.findOne({ duname: uname });
        if (existingDriver) {
            return res.status(400).send('Driver already exists. Please choose a different username.');
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(psw, saltRounds);

        // Create a new driver with hashed password
        const newDriver = new Driver({
            duname: uname,
            dpwd: hashedPassword
        });

        // Save the new driver to the database
        console.log("Saving new driver...");
        await newDriver.save();
        console.log("Driver registered successfully!");
        res.render('DriverLogin');
    } catch (error) {
        console.error('Error registering driver:', error);
        res.status(500).send('Error registering driver');
    }
});

// Middleware for logging requests

app.use((req, res, next) => {
    console.log("Received request body:", req.body);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send(`Something broke! Error: ${err.message}`);
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
