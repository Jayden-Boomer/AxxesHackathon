const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Serve static files from the "public" folder
app.use(express.static('public'));

// Path to the CSV file (using comma as delimiter)
const csvFilePath = path.join(__dirname, 'users.csv');

// Helper function to generate a random RGB color string
function getRandomRGB() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

// Ensure CSV file exists with headers
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'username,password,color\n', 'utf8');
}

// Sign Up Endpoint: Add user if they do not already exist.
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Read the CSV file to check for existing user
  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const lines = data.split('\n').slice(1); // Skip header
    for (const line of lines) {
      if (!line.trim()) continue; // Skip empty lines
      // Since the color field contains commas, only split the first two commas
      const parts = line.split(',');
      const fileUsername = parts[0];
      if (fileUsername === username) {
        return res.status(409).json({ error: 'User already exists' });
      }
    }
    
    // User does not exist; create new entry
    const randomColor = getRandomRGB();
    // Enclose the color in quotes to avoid comma issues in CSV
    const csvLine = `${username},${password},"${randomColor}"\n`;
    fs.appendFile(csvFilePath, csvLine, (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'User signed up successfully', color: randomColor });
    });
  });
});

// Sign In Endpoint: Validate user credentials and return stored color.
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const lines = data.split('\n').slice(1); // Skip header
    let userFound = false;
    let userColor = '';

    for (const line of lines) {
      if (!line.trim()) continue; // Skip empty lines
      // Split only on the first two commas; the rest belongs to the color field
      const parts = line.split(',');
      const fileUsername = parts[0];
      const filePassword = parts[1];
      // Join the rest back in case the color field contained commas
      const fileColorRaw = parts.slice(2).join(',').trim();
      // Remove enclosing quotes from the color field if present
      const fileColor = fileColorRaw.replace(/^"|"$/g, '');
      
      if (fileUsername === username && filePassword === password) {
        userFound = true;
        userColor = fileColor;
        break;
      }
    }

    if (userFound) {
      res.json({ message: 'User signed in successfully', color: userColor });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
