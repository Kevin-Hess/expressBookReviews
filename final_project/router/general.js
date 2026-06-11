const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the list of all books available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({ message: "Book not found for the provided ISBN" });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = [];
  const isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if (books[isbn].author === author) {
      result.push({ isbn: isbn, ...books[isbn] });
    }
  });
  if (result.length > 0) {
    return res.status(200).json({ booksbyauthor: result });
  }
  return res.status(404).json({ message: "No books found for the provided author" });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const result = [];
  const isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if (books[isbn].title === title) {
      result.push({ isbn: isbn, ...books[isbn] });
    }
  });
  if (result.length > 0) {
    return res.status(200).json({ booksbytitle: result });
  }
  return res.status(404).json({ message: "No books found for the provided title" });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found for the provided ISBN" });
});

// ============================================================
// Task 10 - Section: Get book details using Promises / Async-Await with Axios
// These routes demonstrate consuming the application's own REST API
// asynchronously using axios. The server must be running for them to work.
// ============================================================
const BASE_URL = "http://localhost:5000";

// Task 10 (Option2 Task 10): Get all books - Using async/await callback function
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Task 10 (Option2 Task 11): Search by ISBN - Using Promises
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(404).json({ message: "Book not found for the provided ISBN", error: error.message }));
});

// Task 10 (Option2 Task 12): Search by Author - Using async/await
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "No books found for the provided author", error: error.message });
  }
});

// Task 10 (Option2 Task 13): Search by Title - Using Promises
public_users.get('/promise/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(404).json({ message: "No books found for the provided title", error: error.message }));
});

module.exports.general = public_users;
