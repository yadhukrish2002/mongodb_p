const express = require('express');// Import the express
const bodyParser = require('body-parser');// Import the body_parse
const mongoose = require('mongoose');// Import the mongoose
const app = express();// create app
const port = 3000;// define port number
const validation = require('./validation'); // Import the validation module

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Create a User schema and model
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});
//access collection from the database
const User = mongoose.model('users', UserSchema);
const admin = mongoose.model('Admin', UserSchema);

app.set('view engine', 'ejs');// setting view engine
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//login page
app.get('/', (req, res) => {
  res.render('login');
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let emailError = '';
  let passwordError = '';
  // Check if the username is a valid email using the validateEmail function from the validation module
  if (!validation.validateEmail(email)) {
    emailError = 'Invalid email address';
  }
  // Validate the password using the isPasswordValid function from the validation module
  const passwordValidationResult = validation.isPasswordValid(password);
  if (passwordValidationResult) {
    passwordError = passwordValidationResult;
  }
  // If there are errors, render the login page with the error messages
  if (emailError || passwordError) {
    return res.render('login', { emailError, passwordError });
  }
  // Check if the email and password exist in the database
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      emailError = 'Email or password is incorrect';
      return res.render('login', { emailError });
    }
    if (password != user.password) {
      passwordError = 'Email or password is incorrect';
      return res.render('login', { passwordError });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
  // Redirect to the home page on successful login
  res.redirect('/home');
});

//sign up page
app.get('/signin', (req, res) => {
  res.render('signin');
});
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  let emailError = '';
  let passwordError = '';
  // Check if the username is a valid email using the validateEmail function from the validation module
  if (!validation.validateEmail(email)) {
    emailError = 'Invalid email address';
  }
  // Validate the password using the isPasswordValid function from the validation module
  const passwordValidationResult = validation.isPasswordValid(password);
  if (passwordValidationResult) {
    passwordError = passwordValidationResult;
  }
  // If there are errors, render the sign-in page with the error messages
  if (emailError || passwordError) {
    return res.render('signin', { emailError, passwordError });
  }
  // Check if the email already exists in the database
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      emailError = 'Email already exists';
      return res.render('signin', { emailError });
    }
    // password before saving it to the database
    const newUser = new User({ email: email, password: password });
    await newUser.save();//saving
  } catch (error) {
    console.error(error);
    return res.status(500).send(' Server Error');
  }
  // Redirect to the home page on successful sign-in
  res.redirect('/home');
});
//admin login page
app.get('/admin', (req, res) => {
  res.render('admin');
});
app.post('/admin', async (req, res) => {
  const { email, password } = req.body;
  let emailError = '';
  let passwordError = '';
  // Check if the username is a valid email using the validateEmail function from the validation module
  if (!validation.validateEmail(email)) {
    emailError = 'Invalid email address';
  }
  // Validate the password using the isPasswordValid function from the validation module
  const passwordValidationResult = validation.isPasswordValid(password);
  if (passwordValidationResult) {
    passwordError = passwordValidationResult;
  }
  // If there are errors, render the login page with the error messages
  if (emailError || passwordError) {
    return res.render('admin', { emailError, passwordError });
  }
  // Check if the email and password exist in the database
  try {
    const user = await admin.findOne({ email: email });
    if (!user) {
      emailError = 'Email or password is incorrect';
      return res.render('admin', { emailError });
    }
    if (password != admin.password) {
      passwordError = 'Email or password is incorrect';
      return res.render('admin', { passwordError });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
  // Redirect to the home page on successful login
  res.redirect('/admin_interface');
});

//admin interface
app.get('/admin_interface', async (req, res) => {
  try {
    // Fetch all documents from the database
    const user = await User.find();
    // Render the EJS template and pass the data
    res.render('admin_interface', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});

//home page
app.get('/home', (req, res) => {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
