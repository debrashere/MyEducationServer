"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// this is our schema to represent blog comments
const commentSchema = mongoose.Schema({
  author: {type: String, required: true}, 
  content: {type: String, required: true}, 
  rating: {type: Number, required: true, default:1.0},
  commentDate:  {type: Date, required: true, default: Date.now},  
});


// this is our schema to represent educational tools
const toolSchema = mongoose.Schema({
  title: {type: String, required: true},  
  url: { type: 'string', unique: true, required: true  },
  description: 'string',
  price: Number,
  rating: Number
});

const myToolsSchema = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  Tools: [{toolId: {type: String, unique: true, required: true},          
         comments: [{comment: {type: String} }],
         rating: {type: Number, required: true} 
        }]
});

const blogSchema = mongoose.Schema({ 
  toolId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tool'}, 
  comments: [commentSchema]
});

commentSchema.methods.serialize = function() {
  return {
    id: this._id,
    author: this.author,
    content: this.content,
    rating: this.rating
  };
};

myToolsSchema.pre('find', function(next) {
  this.populate('user');
  next();
});

myToolsSchema.pre('findOne', function(next) {
  this.populate('user');
  next();
});

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
})


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
 
myToolsSchema.methods.serialize = function() {
  return {
    id: this._id,
    user: this.user,
    tools: this.tools,
    rating: this.rating
  };
}

const Blog = mongoose.model('Blog', blogSchema);
//const Comment = mongoose.model('Comment', commentSchema);
const Tool = mongoose.model('Tool', toolSchema);
module.exports = {Blog, Tool};
