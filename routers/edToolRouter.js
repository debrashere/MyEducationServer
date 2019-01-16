"use strict";

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
//router.use(bodyParser.json());
const { EdTool }= require('../models/edToolsModels');

const passport = require('passport');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {session: false});
 
// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const { PORT, DATABASE_URL } = require("../config");
const app = express();
app.use(express.json());

// can also request by ID
router.get("/:id", jwtAuth, (req, res) => {
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

// GET requests 
router.get('/', jwtAuth, (req, res) => {
  let toQuery = "";

    if (req.query && req.query != {}) {
      toQuery = {};
      const queryableFields = ["title", "price", "rating" ];

      queryableFields.forEach(field => {
        if (field in req.query) {
          toQuery[field] = req.query[field];
        }
      });      
            
      if (!toQuery || toQuery == {}) {
        const message =
          `The input did not contains any queryable fields. ` +
          `Must contain one or more of the following: (${queryableFields}).`;
        console.error(message);
        return res.status(400).json({ message: message });
      }
    }        
        
  EdTool.find(toQuery )    
    .then(tools => {
      console.log("edToolRouter get response", tools.map(tool => tool.serialize()));
      res.status(201).json({
          edTools: tools.map(tool => tool.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });  
    
});

router.post("/", jwtAuth, jsonParser, (req, res) => {
  console.log("edToolsrouter post req.body",req.body);
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
  .create({
    title: req.body.title,
    url: req.body.url,
    imageUrl: req.body.imageUrl,
    description: req.body.description,
    price: req.body.price ,   
    rating: req.body.rating    
  })                     
  .then( tool => {
    const edTool = tool.serialize();  
    console.log("edToolsrouter result tool.serialize()",edTool);           
    res.status(201).json(edTool);
  })    
  .catch( err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    })         
  })    


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

router.delete("/:id", jwtAuth, (req, res) => {
  EdTool.findByIdAndRemove(req.params.id)
    .then(edTool => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// catch-all endpoint if client makes request to non-existent endpoint
router.use("*", jwtAuth, function(req, res) {
  res.status(404).json({ message: "Not Found" });
});

module.exports = router;