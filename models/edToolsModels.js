"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// this is our schema to represent blog post comments
const commentSchema = mongoose.Schema({
  author: {type: String, required: false}, 
  content: {type: String, required: false},  
});


// this is our schema to represent educational tools
const edToolSchema = mongoose.Schema({
  title: {type: String, required: true},  
  url: { type: 'string', unique: true, required: true  },
  imageUrl: { type: 'string' },
  description: 'string',
  price: Number,
  rating: Number
});

const blogPostSchema = mongoose.Schema({ 
  toolId: {type: mongoose.Schema.Types.ObjectId, ref: 'EdTool'},
  title: 'string',   
  comments: [commentSchema]
});

blogPostSchema.pre('find', function(next) {
  this.populate('toolId');
  next();
});

blogPostSchema.pre('findOne', function(next) {
  this.populate('toolId');
  next();
});


blogPostSchema.pre('find', function(next) {
  this.populate('comment');
  next();
});

blogPostSchema.pre('findOne', function(next) {
  this.populate('comment');
  next();
});


blogPostSchema.virtual('toolTitle').get(function() {
  return `${this.EdTool.title} ${this.EdTool.id}`.trim();
});

commentSchema.methods.serialize = function() {
  return {
    id: this._id,
    author: this.author,
    content: this.content
  };
};

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    toolId: this.toolId,
    title: this.title,
    comments: this.comments
  };
};

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
 
const BlogPost = mongoose.model('BlogPost', blogPostSchema);
const Comment = mongoose.model('Comment', commentSchema);
const EdTool = mongoose.model('EdTool', edToolSchema);
module.exports = {BlogPost, Comment, EdTool};
