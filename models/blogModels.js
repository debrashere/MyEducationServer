"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// this is our schema to represent a blog
const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

const commentSchema = mongoose.Schema({ content: 'string' });

const blogPostSchema = mongoose.Schema({
  toolId: {type: String, required: true},
  title: 'string',
  content: 'string',
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author' }],
  comments: [commentSchema]
});

blogPostSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogPostSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    toolId: this.toolId,
    title: this.title,
    authors: this.authors,
    content: this.content,
    comments: this.comment
  };
};

authorSchema.methods.serialize = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    userName: this.userName
  };
};

commentSchema.methods.serialize = function() {
  return {
    id: this._id,
    content: this.content
  };
};

const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model('BlogPost', blogPostSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = {BlogPost, Author, Comment};
