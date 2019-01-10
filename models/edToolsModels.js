"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// this is our schema to represent a blog
const edToolSchema = mongoose.Schema({
  title: {type: String, required: true},  
  url: { type: 'string', unique: true, required: true  },
  imageUrl: { type: 'string' },
  description: 'string',
  price: Number,
  rating: Number
});

edToolSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    url: this.url,    
    imageUrl: this.imageUrl,
    description: this.description,
    price: this.price,
    rating: this.rating
  };
};
 
const EdTool = mongoose.model('EdTool', edToolSchema);
module.exports = {EdTool};
