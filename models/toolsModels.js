"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// this is our schema to represent blog post comments
const commentSchema = mongoose.Schema({
  author: {type: String, required: false}, 
  content: {type: String, required: false},  
});


// this is our schema to represent educational tools
const toolSchema = mongoose.Schema({
  title: {type: String, required: true},  
  url: { type: 'string', unique: true, required: true  },
  description: 'string',
  price: Number,
  rating: Number
});

const blogSchema = mongoose.Schema({ 
  toolId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tool'}, 
  comments: [commentSchema]
});

commentSchema.methods.serialize = function() {
  return {
    id: this._id,
    author: this.author,
    content: this.content
  };
};

blogSchema.pre('find', function(next) {
  this.populate('comments');
  next();
});

blogSchema.pre('findOne', function(next) {
  this.populate('comments');
  next();
});

blogSchema.pre('find', function(next) {
  this.populate('toolId');
  next();
});

blogSchema.pre('findOne', function(next) {
  this.populate('toolId');
  next();
});

blogSchema.virtual('toolTitle').get(function() {
  return `${this.Tool.id}`.trim();
});



// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogSchema.methods.serialize = function() {
  return {
    id: this._id,
    toolId: this.toolId,
    comments: this.comments
  };
};

toolSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    url: this.url,    
    description: this.description,
    price: this.price,
    rating: this.rating
  };
};
 
const Blog = mongoose.model('Blog', blogSchema);
//const Comment = mongoose.model('Comment', commentSchema);
const Tool = mongoose.model('Tool', toolSchema);
module.exports = {Blog, Tool};
