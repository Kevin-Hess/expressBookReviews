const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

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

// ---- Internal raw data routes (used by the axios-based routes below) ----
public_users.get('/internal/books', function (req, res) {
  return res.status(200).json(books);
});
public_users.get('/internal/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book);
  return res.status(404).json({ message: "Book not found" });
});

// Task 1 & Task 10: Get the list of all books - async/await callback with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/internal/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Task 2 & Task 11: Get book details based on ISBN - Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/internal/isbn/${isbn}`)
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  })
    .then((book) => res.status(200).json(book))
    .catch(() => res.status(404).json({ message: "Book not found for the provided ISBN" }));
});

// Task 3 & Task 12: Get book details based on author - Promises
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getByAuthor = new Promise((resolve, reject) => {
    const result = [];
    Object.keys(books).forEach((isbn) => {
      if (books[isbn].author === author) {
        result.push({ isbn: isbn, ...books[isbn] });
      }
    });
    if (result.length > 0) resolve(result); else reject();
  });
  getByAuthor
    .then((result) => res.status(200).json({ booksbyauthor: result }))
    .catch(() => res.status(404).json({ message: "No books found for the provided author" }));
});

// Task 4 & Task 13: Get all books based on title - async/await with Promise
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const result = await new Promise((resolve, reject) => {
      const found = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
          found.push({ isbn: isbn, ...books[isbn] });
        }
      });
      if (found.length > 0) resolve(found); else reject();
    });
    return res.status(200).json({ booksbytitle: result });
  } catch (error) {
    return res.status(404).json({ message: "No books found for the provided title" });
  }
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

module.exports.general = public_users;
