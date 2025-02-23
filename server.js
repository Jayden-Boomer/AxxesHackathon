import { PinataSDK } from "pinata";
// require('dotenv').config();
// const fetch = require('node-fetch');
//import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();

// Access the environment variables
const PINATA_JWT = process.env.PINATA_JWT//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwMjJkYTlmNy04ZWJjLTQ4NDUtYjcwMi05MzNjYWNkMTBlMTgiLCJlbWFpbCI6ImtiaGFnYXZhdHVsYTEyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5ODY2N2E0NWU0ZDNiNDQ4Yjk3ZSIsInNjb3BlZEtleVNlY3JldCI6IjE0M2I0NmEwM2I3MmNkOWZhYWY1NDdmZjFkZjM4M2E1YjI5OTQ4NjE3ODJiYzQ4ZmNhYjdkZjYwNWEyYWNjZjMiLCJleHAiOjE3NjMzMjUwMTZ9.wujRdsZw66hFGW__2AzREhhVOqv-TFcYcdOecOkoRWY";
const GATEWAY_URL = process.env.GATEWAY_URL//"cyan-impossible-impala-669.mypinata.cloud";


const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  //process.env.PINATA_JWT,
  pinataGateway: GATEWAY_URL,
  //process.env.GATEWAY_URL,
});

import {uploadUserFiles, fetchFilesByUsername } from './pinataStuff.js';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';


const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Serve static files from the "public" folder
app.use(express.static('public'));

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    // Inside your /signup endpoint after writing to the CSV file
    fs.appendFile(csvFilePath, csvLine, (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
      // Call uploadUserFiles with the username
    uploadUserFiles(username)
      .then(() => {
        console.log('User files uploaded successfully.');
      })
      .catch((uploadError) => {
        console.error('Error uploading user files:', uploadError);
      });

    res.json({ message: 'User signed up successfully', color: randomColor });
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

    // if (userFound) {
    //   res.json({ message: 'User signed in successfully', color: userColor });
    // } else {
    //   res.status(401).json({ error: 'Invalid username or password' });
    // }

    // Call uploadUserFiles with the username
    fetchFilesByUsername(username)
    .then(() => {
      console.log('User files fetched successfully.');
    })
    .catch((uploadError) => {
      console.error('Error fetching user files:', uploadError);
    });

   res.json({ message: 'User signed in successfully', color: userColor });

  });
});

app.post('/gpt-submit', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Please enter something into the chat' });
  }

  res.json({ message: 'Successfully submitted chat'});
  // const filepath = path.join(__dirname, 'userData/*');
  // fs.readFile(filepath, 'utf8', (err, data) => {
  //   if (err) {
  //     console.error('Error reading CSV file:', err);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
    
  // });
});

app.post('/upload-file', async (req, res) => {
  const { fileContents, userName, category } = req.body;
  if (!fileContents || !userName || !category) {
    return res.status(400).json({ error: 'fileContents, userName, and category are required.' });
  }
  try {
    const uploadResult = await pinataFunctions.uploadUserFile(fileContents, userName, category);
    res.json({ message: 'File uploaded successfully', uploadResult });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

app.get('/get-file', async (req, res) => {
  const { userName, category } = req.query;
  if (!userName || !category) {
    return res.status(400).json({ error: 'userName and category are required.' });
  }
  try {
    const fileData = await pinataFunctions.fetchFileByUserNameAndCategory(userName, category);
    if (fileData) {
      res.json({ message: 'File fetched successfully', fileData });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Error fetching file' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
