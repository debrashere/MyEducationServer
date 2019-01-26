"use strict";
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { User }= require('../users/models');
const { Blog, Comment }= require('../models/toolsModels');
const app = express();
app.use(express.json());

const passport = require('passport');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {session: false});

// GET requests to /post
router.get("/",  jwtAuth, (req, res) => {
  Blog
    .find()
   // .populate('comments')
    .then(blogs => {;
      res.status(201).json({
        blogs: blogs.map(blog => blog.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

// can also request by ID
router.get("/:id",  jwtAuth, (req, res) => {
  console.log("ROUTER get blog by id ", req.params);
  Blog
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)  
    .populate('comments')
    .then(blog => {   
      console.log("ROUTER get blog by id response ", blog);
       res.json(blog ? blog.serialize() : {});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.post("/", jwtAuth, jsonParser, (req, res) => {
  const requiredFields = [ "content", 'toolId', 'userId' ];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  User
    .findById(req.body.userId)
    .then(user => {
      if (user) {     
        Blog
          .create({
            toolId: req.body.toolId,              
            comments: [{
              author: req.body.userId,
              content: req.body.content}]      
          })
          .then(
            blog => {   
              res.status(201).json(blog.serialize());    
            }
          )
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });        
      }
      else {
        const message = `User not found`;
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.put("/:id", jwtAuth, jsonParser, (req, res) => {
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
  const updateableFields = [ "content", "authors", "comments"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Blog
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/:id",  jwtAuth, (req, res) => {
  Blog.findByIdAndRemove(req.params.id)
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// catch-all endpoint if client makes request to non-existent endpoint
router.use("*", function(req, res) {
  res.status(404).json({ message: "Not Found" });
});

module.exports = router;