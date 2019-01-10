"use strict";

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { EdTool }= require('../models/edToolsModels');
const router = express.Router();
 
// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const { PORT, DATABASE_URL } = require("../config");
const app = express();
app.use(express.json());

// GET requests to /post
router.get("/", (req, res) => {
  EdTool
    .findOne()
    .then(edTool => res.json(edTool.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

// can also request by ID
router.get("/:id", (req, res) => {
  EdTool
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)  
    .then(edTool => res.json(edTool.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["title", "url", "description","price"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  EdTool
    .findById(req.body.Id)
    .then(edTool => {
      if (edTool) {
        console.log("EdTool find by Id", req.body);        
        EdTool
          .create({
            title: req.body.title,
            url: req.body.url,
            imageUrl: req.body.imageUrl,
            description: [req.body.description],
            price: req.body.price ,   
            rating: req.body.rating    
          })
          .then(
            edTool => res.status(201).json({            
              id: edTool.id,
              url: edTool.url,
              imageUrl: edTool.imageUrl,
              title: edTool.title,  
              description: edTool.description, 
              price: edTool.price,                             
              rating: edTool.rating
            }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });        
      }
      else {
        const message = `EdTool not found`;
        console.error(message);
        return res.status(400).send(message);
      }
    })
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
  const updateableFields = ["title", "url", "imageUrl", "description","price", "rating"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  EdTool
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(edTool => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id", (req, res) => {
  EdTool.findByIdAndRemove(req.params.id)
    .then(edTool => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// catch-all endpoint if client makes request to non-existent endpoint
router.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});

module.exports = router;