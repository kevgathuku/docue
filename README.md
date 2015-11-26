# Document Management System

[![Circle CI](https://circleci.com/gh/kevgathuku/document-management-system/tree/master.svg?style=shield)](https://circleci.com/gh/kevgathuku/document-management-system/tree/master)

The system manages documents, users and roles.

Each document defines access rights i.e. which roles can access it and the date it was published.

Users are categorized by roles. Each user must have a role defined for them.

## Installation

- Clone the repo locally and navigate to the newly created folder

    `$ git clone https://github.com/kevgathuku/document-management-system`
    `$ cd document-management-system`

 - Install the app dependencies

    `$ npm install`

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
