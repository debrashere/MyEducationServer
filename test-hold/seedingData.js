'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module
const expect = chai.expect;

const {Tool, Blog} = require('../models/toolsModels');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const {TEST_DATABASE_URL} = require('../config');

let seededUsers = [];
let seededTools = []
const tools = [
    {"title": "title", "url": "url", "description": "description", "price":10.00, "rating": 1},
    {"title": "title2", "url": "url2", "description": "description2", "price":30.00, "rating": 2}
  ]
  
  const users = [
      {"firstName": "beebee", "lastName": "sanders", "username": "bsanders", "password": generatePassword()},
      {"firstName": "deedee", "lastName": "sanders", "username": "dsanders", "password": generatePassword()},
      {"firstName": "demo", "lastName": "user", "username": "demoUser", "password": generatePassword()}
   
    ]

console.log("DEBUG seeding TEST_DATABASE_URL", TEST_DATABASE_URL);

chai.use(chaiHttp);
let token;
 
    
function seedToolsData() {
    console.info('BEFORE seeding tools data');
    const seedData = [];
    seedData.push(tools);
    // this will return a promise
    return Tool.insertMany(tools).catch(err => {
      console.error(err)
      console.info("this is an error " + err);
  
    });
  }
      
function generatePassword() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiYnNhbmRlcnMiLCJmaXJzdE5hbWUiOiJiZWViZWUiLCJsYXN0TmFtZSI6InNhbmRlcnMifSwiaWF0IjoxNTQ4NTY2NTQ4LCJleHAiOjE1NDkxNzEzNDgsInN1YiI6ImJzYW5kZXJzIn0.WAICPV-T0eJhN_pn1tl9mQ4dTQomlYw_kuTDhh-4I0w';
    //return  'Mypassw0rd';
}

function generateuserData(id) {
  return {
    username:faker.internet.userName(),
    password: generatePassword(),
    firstName: faker.name.firstName(),
    lastName:  faker.name.lastName()
  };
}

function seedUserData() {
  console.info('BEFORE seeding user data');
  const seedData = [];

  for (let i=1; i<=50; i++) {
    seedData.push(generateuserData());
  }
  seedSpecificUserData();
  seededUsers = seedData;
  return User.insertMany(seedData).catch(err => console.error(err)); 
}

function generateTool(randomRating, randomNumber) {
  return {
          title: faker.company.companyName(),
            url: faker.internet.url() + randomNumber,
    description: faker.lorem.sentences(),
          price: faker.commerce.price() > 100 ? faker.commerce.price() /10  : faker.commerce.price(),
         rating: randomRating
  }
}

function generateComments(users) {
  let commentsCount = Math.floor((Math.random() * 7) + 1);
  let comments = [];
  for (let index =0; index<= commentsCount-1; index++) {
    let userIndex = Math.floor((Math.random() * 40) + 1);
    comments.push({
      author: users[userIndex].username,
      content: faker.lorem.sentences(),
      rating: randomRating,
      commentDate: faker.date.between('2018-01-01', '2019-02-21') 
    });
   }
  return comments;
}

 
function seedSpecificUserData() {
    console.info('seeding users data');
    const seedData = [];
    seedData.push(users);
    // this will return a promise
    return User.insertMany(users).catch(err => console.error(err));
}
  
 
function exit (code) {
  function done() {
    draining--;
    console.log(`Draining down to ${draining}`);
    if (draining <= 0) {
      process.exit(Math.min(code, 255));
    }
  }

  process.on('exit', function(realExitCode) {
    console.log(`Process is exiting with ${realExitCode}`);
  });

  var draining = 0;
  var streams = [process.stdout, process.stderr];

  streams.forEach(function (stream) {
    // submit empty write request and wait for completion
    draining += 1;
    console.log(`Draining up to ${draining}`);
    stream.write('', done);
  });

  console.log('Starting extra call to done().');
  done();
  console.log('Extra call to done() finished.');
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('BEFORE Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('TEST SUITE Seeding Database', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedJobProspectData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  this.beforeAll(function() {
    return runServer(TEST_DATABASE_URL);
  });

    this.beforeAll(function() {
        return tearDownDb();
    });
    
    this.beforeAll(function() {
      return seedUserData();
  });

    this.beforeAll(function() {
      return seedToolsData();
    });

    this.afterAll(function() {
  return closeServer();
});

/*
  after(function() {
    exit();
  });
  */


  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('SEEDING DATA', function() {
    beforeEach(function(done) {
      this.timeout(3000); // A very long environment setup.
      setTimeout(done, 2500);
    });

    it('should seed data ', function() {
        return chai.request(app)
       
      .get('/api/users')
      .then(function(res) { 
        for (let index=0; index<= res.body.length -60; index++) {
          let toolCount = Math.floor((Math.random() * 20) + 1);
          for (let counter =0; counter<= toolCount-1; counter++) {
            let randomRating = Math.floor((Math.random() * 5) +1);
            let tool = generateTool(randomRating, counter);
                Tool.create(tool)
                .then (newTool => {                  
                  if(newTool) {
                    seededTools.push(newTool);                                                                                  
                  }
                  else {
                    console.log(" Tool Create Failed", newTool);
                  }
                })                                            
                .catch( err => {
                   console.debug(" DEBUG error posting err", err);            
                }) 
            }
        }          
        expect(200).to.equal(200);                 
      })   
    })
 
    it('should seed BLOG data ', function() {
      let seededBlogs = [];   
      for (let index=0; index<= seededUsers.length -60; index++) {
        let blogCount = Math.floor((Math.random() * 5 ) +1);
        for (let counter =0; counter<= blogCount-1; counter++) {
          let comments = generateComments(seededUsers);   
          let toolIndex = Math.floor((Math.random() * seededTools.length -1 ) +1);    
          seededBlogs.push({toolId: seededTools[toolIndex]._id,  comments: comments });
        }
      }
        Blog.insertMany(seededBlogs).catch(err => {
          console.error(err)   
        });
      expect(200).to.equal(200); 
    })
  })
})    

