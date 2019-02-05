'use strict';

module.exports = {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'https://immense-savannah-21266.herokuapp.com',
    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://mlab01User:Fit4newyear@ds121135.mlab.com:21135/myeducationprod',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://mlab01User:Fit4newyear@ds221115.mlab.com:21115/myeducationtest',
    PORT:process.env.PORT || 21135,
    TEST_PORT:process.env.TEST_PORT || 21115,
    JWT_SECRET:process.env.JWT_SECRET || 'mYS#CretSt*ng',
    JWT_EXPIRY:process.env.JWT_EXPIRY || '7d' 
};  