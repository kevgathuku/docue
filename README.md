# Document Management System

[![Circle CI](https://circleci.com/gh/kevgathuku/document-management-system/tree/master.svg?style=shield)](https://circleci.com/gh/kevgathuku/document-management-system/tree/master)   [![Coverage Status](https://coveralls.io/repos/kevgathuku/document-management-system/badge.svg?branch=master&service=github)](https://coveralls.io/github/kevgathuku/document-management-system?branch=master)

The system manages documents, users and roles.

Each document defines access rights i.e. which roles can access it and the date it was published.

Users are categorized by roles. Each user must have a role defined for them.

## Installation

- Clone the repo locally and navigate to the newly created folder

    `$ git clone https://github.com/kevgathuku/document-management-system`

    `$ cd document-management-system`

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

    `$ cd document-management-system`

 - Run the tests through the following command:

    `$ npm test`
