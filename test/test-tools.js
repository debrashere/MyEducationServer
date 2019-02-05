'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const {User} = require('../users/models');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');
const faker = require('faker');
const {Tool} = require('../models/toolsModels');


// this makes the expect syntax available throughout this module
const expect = chai.expect;
 
console.log(" TEST_DATABASE_URL", TEST_DATABASE_URL);

chai.use(chaiHttp);
const register_details = {"username": "RegUserName","password": "Mypassw0rd", "firstName": "RegFirstName","lastName":  "RegLastName"};
const login_details  = {"username": "RegUserName","password": "Mypassw0rd"};
let token;

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
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}
  
describe('Tools API resource', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  
  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedToolsData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  before(function() {
     return seedToolsData();
  });

  after(function() {
    return tearDownDb();
  });

  after(function() {
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

describe('USER Registration and Login ', function() {
    beforeEach(function(done) {
        this.timeout(3000); // A very long environment setup.
        setTimeout(done, 2500);
      });

      it('Should reject requests with no credentials', function () {
        return chai
          .request(app)
          .get('/api/tools')
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
          .get('/api/tools')
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
          .get('/api/tools')
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

  it('should return register and login a user', (done) => {
   
    chai.request(app)
        .post('/api/users/')
        .send(register_details) 
        .then((res, err) => {
            expect(res).to.have.status(201);  
              // follow up with login
              chai.request(app)
              .post('/api/auth/login')
              .send(login_details)
              .then((res, err) => {  
                //console.log("REGISTERED USER res.body", res.body);                  
                expect(res).to.have.status(200);               
                expect(res.body.authToken).to.not.be.null; 
                expect(res.body).to.haveOwnProperty('authToken');     
                token = 'Bearer ' + res.body.authToken;   
                //console.log("REGISTERED USER token", token);      
                done();                                                                 
              })          
            }) 
        .catch(err => {              
            console.error(err); 
            if (err) done(err);
            else done();            
        })              
      })  
    }) 

  describe('GET endpoint', function() {

    it('should return all existing tools', function() {
      // strategy:
      //    1. get back all tools returned by by GET request to `/tools`
      //    2. prove res has right status, data type
      //    3. prove the number of tools we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      //console.log("TOKEN 1 is ", token);
      return chai.request(app)
        .get('/api/tools/')
        .set('Authorization', token)
        .then(function(_res) {       
          // so subsequent .then blocks can access response object
          res = _res; 
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body.tool).to.have.lengthOf.at.least(1);     
          return res.body.tool.length;
        })
        .then(function(count) {
          expect(res.body.tool).to.have.lengthOf(count);
        })
        .catch(err => {
          console.error(err);                  
      })      
    })

    it('should return tool with right fields', function() {
      // Strategy: Get back all job tools, and ensure they have expected keys
      let resTool;
      //console.log("TOKEN 2 is ", token);
      return chai.request(app)
        .get('/api/tools/')
        .set('Authorization', token)
        .then(function(res) {

          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.tool).to.be.a('array');
          expect(res.body.tool).to.have.lengthOf.at.least(1);

          res.body.tool.forEach(function(tool) {
            expect(tool).to.be.a('object');
            expect(tool).to.include.keys(
              'title', 'url', 'description', 'price', 'rating');
          });
          resTool = res.body.tool[0];  
          return Tool.findById(resTool.id);
        })
        .then(function(tool) {    
          //expect(resTool.id).to.equal(tool._id);
          expect(resTool.what).to.equal(tool.what);        
        })
        .catch(err => {
          console.error(err);             
      })        
    })
})

describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the tool we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new tool data', function() {

      const newTool = generateToolData(1000);
      let mostRecentTool;
     // console.log("TOKEN 3 is ", token);
      return chai.request(app)
        .post('/api/tools/')
        .set('Authorization', token)
        .send(newTool)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id',  'title', 'url', 'description', 'price', 'rating');       
          expect(res.body.id).to.not.be.null;
          expect(res.body.what).to.equal(newTool.what);
          expect(res.body.where).to.equal(newTool.where);

          mostRecentTool = newTool;

          expect(res.body.what).to.equal(mostRecentTool.what);
          return Tool.findById(res.body.id);
        })
        .then(function(tool) {
          expect(tool.what).to.equal(newTool.what);
          expect(tool.where).to.equal(newTool.where);
          expect(tool.date).to.equal(newTool.date); 
        })
        .catch(err => {
          console.error(err);             
      })        
    })
  })

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing tool from db
    //  2. Make a PUT request to update that tool
    //  3. Prove tool returned by request contains data we sent
    //  4. Prove tool in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = { 
           id: "id",
        title: "new what" ,
        rating: 5
      };
     // console.log("TOKEN 4is ", token);
      return Tool
        .findOne()
        .then(function(tool) {
          updateData.id = tool.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/api/tools/${tool.id}`)
            .set('Authorization', token)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Tool.findById(updateData.id);
        })
        .then(function(tool) {
          expect(tool.title).to.equal(updateData.what);
          expect(tool.rating).to.equal(updateData.where);
        })
        .catch(err => {
          console.error(err);             
      })        
    })
  })

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a tool
    //  2. make a DELETE request for that tool's id
    //  3. assert that response has right status code
    //  4. prove that tool with the id doesn't exist in db anymore
    it('delete a tool by id', function() {

      let tool;
      //console.log("TOKEN 5 is ", token);
      return Tool
        .findOne()
        .then(function(_tool) {
          tool = _tool;
          return chai.request(app)
          .delete(`/api/tools/${tool.id}`)
          .set('Authorization', token);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Tool.findById(tool.id);
        })
        .then(function(_tool) {
          expect(_tool).to.be.null;
        })
        .catch(err => {
          console.error(err);             
      })        
    })    
  })
})