# User Management API

Demo API, managing users in a MongoDB.


## Installation

To get setup, clone this repo and run `npm install`

This will download all the necessary dependencies.


### Prerequisites before running

It is expected you have a running local MongoDB, read here if you haven't already installed MongoDB [https://docs.mongodb.com/manual/installation/]

The API expects there to be a MongoDB created called UsersDB locally, i.e.: `mongodb://localhost:27017/UsersDB`.
Please make sure you have created this before running the API.

To get MongoDB running locally you will want to run `sudo mongod`


## Running the API

To get the API up and running, from the commandline run `npm start`

The API will be running on [http://localhost:4000](http://localhost:4000)


## Running the tests

To run the tests on the commandline, run `npm test`
This will lint the code, run the Mocha & Chai tests as well as print out the test coverage report.


## Documentation

Live documentation is provided in Swagger at [http://localhost:4000/documentation]


## This API should fullfil the following criteria:

- implement creation, reading and deletion of users​
- for deletion of a user, an API key `secretkey` should be provided in the request as you see fit
- have a User model which has the following attributes: username, email, password. Feel free to add others if you wish​
- have User model should be persistable, but there's no expectation that the storage engine would be used in production, so a flat file database such as SQLite would be fine
- have passwords which are stored securely​
- have some sort of documentation (tests are fine)
