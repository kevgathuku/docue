# Document Management System

[![Build Status](https://travis-ci.org/kevgathuku/react-docms.svg?branch=master)](https://travis-ci.org/kevgathuku/react-docms)   [![Coverage Status](https://coveralls.io/repos/github/kevgathuku/react-top40/badge.svg?branch=master)](https://coveralls.io/github/kevgathuku/react-top40?branch=master)

The system manages documents, users and roles.

Each document defines access rights i.e. which roles can access it and the date it was published.

Users are categorized by roles. Each user must have a role defined for them.

## Installation

- Clone the repo locally and navigate to the newly created folder

    `$ git clone https://github.com/kevgathuku/react-docms`

    `$ cd react-docms`

 - Install the app dependencies

    `$ npm install`

 - Rename the `.env.example` file to `.env`

     `$ mv .env.example .env`

 - Replace the values in the `.env` file with the appropriate values
         - `PORT` - The port where you want the application to be run
         - `SECRET` - A hard to guess string that is used in encrypting the tokens
         - `MONGODB_URL` - The URL to your MongoDB Database
         - `NODE_ENV` - The environment you are running the code in i.e `development`, `test` or `production`
             The default value of `development` is fine and should work for most cases

 - Start the project by running

    `$ npm start`

  It can be accessed on `http://localhost:3000`

## Running tests

The tests are run using `jasmine` on the command line

To run the tests, use the following steps:

 - Navigate to the project folder

    `$ cd react-docms`

 - Run the tests through the following command:

    `$ npm test`
