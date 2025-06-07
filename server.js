const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';

app.use(cors());
app.use(express.json());

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all books or by email
app.get('/api/books', (req, res) => {
  const { email } = req.query;
  const books = readData();
  if (email) {
    return res.json(books.filter(b => b.email === email));
  }
  res.json(books);
});

// POST a new book
app.post('/api/books', (req, res) => {
  const books = readData();
  const newBook = { id: uuidv4(), ...req.body };
  books.push(newBook);
  writeData(books);
  res.status(201).json(newBook);
});

// PUT update book by id
app.put('/api/books/:id', (req, res) => {
  const books = readData();
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }
  books[index] = { ...books[index], ...req.body };
  writeData(books);
  res.json(books[index]);
});

// DELETE book by id
app.delete('/api/books/:id', (req, res) => {
  let books = readData();
  const filtered = books.filter(b => b.id !== req.params.id);
  if (filtered.length === books.length) {
    return res.status(404).json({ message: 'Book not found' });
  }
  writeData(filtered);
  res.json({ message: 'Deleted successfully' });
});

app.get('/', (req, res) => {
  res.send('Book API is running');
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));