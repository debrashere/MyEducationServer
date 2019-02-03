'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const faker = require('faker');
const {Tool, Blog} = require('../models/toolsModels');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

const blogs = [

  {"blogId": "blogid1", "comments": [{"author": "author1", "content": 'content1'}]},
  {"blogId": "blogid2", "comments": [{"author": "author2", "content": 'content2'}]}
]


// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedBlogsData() {

    console.info('           seeding tools data');
    const seedData = [];
  
    const tools = tool.find();
    console.info('           fetched tools data', tools);
    for (let i=1; i<=tools-1; i++) {   
      seedData.push(generateBlogData(tools[i]));  
    }
    // this will return a promise
    return Tool.insertMany(seedData).catch(err => {
        console.log("BLOGS ERROR ------------------ ERR",err);
        console.error(err)
    });  
  }
  
  // generate an object represnting a user.
  // can be used to generate seed data for db
  // or request.body data
  function generateBlogData(tool) {
     
    let blog = {
          toolId: 'toolId' + tool._id,
          comments: [{author: 'author', content: "content"}]
    };
    return blog;
  }

 

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedToolsData() {
    console.info('           seeding tools data');
    const seedData = [];
  
    for (let i=1; i<=100; i++) {   
      seedData.push(generateToolData(i));  
    }
    // this will return a promise

   // const tools = Tool.find();
    //console.info('           fetched tools data', tools);
    return Tool.insertMany(seedData).catch(err => console.error(err));  
  }
  
  // generate an object represnting a user.
  // can be used to generate seed data for db
  // or request.body data
  function generateToolData(randomNumber) {
     
    let tool = {
          title: faker.company.companyName(),
          url: faker.internet.url() + randomNumber,
      description: faker.lorem.sentences(),
      price: faker.commerce.price() ,
      rating: randomNumber
    };
    return tool;
  }

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blogs endpoint', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedToolsData();
  });

  beforeEach(function() {
    return seedBlogsData();
  });

  after(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    it('tiny test case', function(done){
        console.log('waiting 6 seconds');
        setTimeout(function(){
            console.log('waiting over.');
            done();
        }, 6000)
    })
});

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName
      })
    );
  });

  afterEach(function () {
    return User.remove({});
  });

  describe('/api/blogs', function () {
  /*
    beforeEach(function() {
        it('tiny test case', function(done){
            console.log('waiting 6 seconds');
            setTimeout(function(){
                console.log('waiting over.');
                done();
            }, 6000)
        })
    });
    */
 
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .get('/api/blogs')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        {
          username,
          firstName,
          lastName
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      );

      return chai
        .request(app)
        .get('/api/blogs')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should send protected data', function () {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      let response = null;
      return chai
        .request(app)
        .get('/api/blogs')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          response = res;
          expect(res).to.have.status(201);      
          expect(res.body).to.have.lengthOf.at.least(1);
          return res.body.length;
        })
        .then(function(count) {
          expect(response.body).to.have.lengthOf(count);
        });
    });
  });
});
