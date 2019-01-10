"use strict";

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { Author} = require('../models/blogModels');
const router = express.Router();
 
// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const { PORT, DATABASE_URL } = require("../config");
const app = express();
app.use(express.json());


// GET requests to /post
router.get("/", (req, res) => {
  Author.find() 
    .then(author => {
      res.json({
        Author: author.map(author => author.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});


// can also request by ID
router.get("/:id", (req, res) => {
  Author
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(author => res.json(author.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["firstName", "lastName", "userName"];
  console.log("Posting", req.body);
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

   // user name must not already exists
  Author    
  .find({userName: req.body.userName})
  .then( ( authors ) => { if (authors.length > 0)
    console.error(`User name ${req.body.userName} already exists`);
    return res.status(400).send(message);
   })
  .catch( ( err ) => { console.log(err) })

  Author.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName
  })
    .then(author => res.status(201).json(author.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.put("/:id", jsonParser, (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ["firstName", "lastName", "userName"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  
    // userName must not already exist for different user id
  Author    
    .find({userName: req.body.userName})
    .where('_id').ne(req.params.id)
    .then( ( authors ) => { if (authors.length > 0)
      console.error(`User name ${req.body.userName} already exists`);
      return res.status(400).send(message);
    })
    .catch( ( err ) => { console.log(err) })

  Author
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(author => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id", (req, res) => {
  Author.findByIdAndRemove(req.params.id)
    .then(author => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// catch-all endpoint if client makes request to non-existent endpoint
router.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});

module.exports = router;