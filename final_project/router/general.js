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

// ---- Internal raw-data routes consumed by the Axios-based routes below ----
public_users.get('/internal/books', function (req, res) {
  return res.status(200).json(books);
});

// Task 1 & Task 10: Get the list of all books - async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/internal/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch the list of books.", error: error.message });
  }
});

// Task 2 & Task 11: Get book details based on ISBN - Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`${BASE_URL}/internal/books`)
    .then((response) => {
      const allBooks = response.data;
      const book = allBooks[isbn];
      if (book) {
        return res.status(200).json(book);
      }
      return res.status(404).json({ message: `No book found for the provided ISBN ${isbn}` });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Unable to fetch the book by ISBN.", error: error.message });
    });
});

// Task 3 & Task 12: Get book details based on author - Promise callbacks with Axios
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  axios.get(`${BASE_URL}/internal/books`)
    .then((response) => {
      const allBooks = response.data;
      const result = [];
      Object.keys(allBooks).forEach((isbn) => {
        if (allBooks[isbn].author === author) {
          result.push({ isbn: isbn, ...allBooks[isbn] });
        }
      });
      if (result.length > 0) {
        return res.status(200).json({ booksbyauthor: result });
      }
      return res.status(404).json({ message: `No books found for the author ${author}` });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Unable to fetch the books by author.", error: error.message });
    });
});

// Task 4 & Task 13: Get all books based on title - async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(`${BASE_URL}/internal/books`);
    const allBooks = response.data;
    const result = [];
    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].title === title) {
        result.push({ isbn: isbn, ...allBooks[isbn] });
      }
    });
    if (result.length > 0) {
      return res.status(200).json({ booksbytitle: result });
    }
    return res.status(404).json({ message: `No books found for the title ${title}` });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch the books by title.", error: error.message });
  }
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "No book found for the provided ISBN." });
  }
  const reviews = book.reviews;
  if (reviews && Object.keys(reviews).length > 0) {
    return res.status(200).json(reviews);
  }
  return res.status(200).json({ message: "No reviews found for this book." });
});

module.exports.general = public_users;
