# Document Management System

[![Build Status](https://travis-ci.org/kevgathuku/docue.svg?branch=master)](https://travis-ci.org/kevgathuku/docue)   [![Coverage Status](https://coveralls.io/repos/github/kevgathuku/docue/badge.svg?branch=master)](https://coveralls.io/github/kevgathuku/docue?branch=master) [![codecov.io](https://codecov.io/github/kevgathuku/docue/coverage.svg?branch=master)](https://codecov.io/github/kevgathuku/docue?branch=master)

[View on Pivotal Tracker](https://www.pivotaltracker.com/n/projects/1515788)

The system manages documents, users and roles.

Each document defines access rights i.e. which roles can access it and the date it was published.

Users are categorized by roles. Each user must have a role defined for them.

## Installation

- Clone the repo locally and navigate to the newly created folder

    ```bash
    git clone https://github.com/kevgathuku/docue
  cd docue
    ```


 - Install the app dependencies

    ```bash
    npm install
    ```

 - Copy the `.env.example` file to `.env`

     ```bash
     cp .env.example .env
     ```

 - Replace the values in the `.env` file with the appropriate values
         - `PORT` - The port where you want the application to be run
         - `SECRET` - A hard to guess string that is used in encrypting the tokens
         - `MONGODB_URL` - The URL to your MongoDB Database
         - `NODE_ENV` - The environment you are running the code in i.e `development`, `test` or `production`
             The default value of `development` is fine and should work for most cases

 - Start the project by running

    ```bash
    npm start
    ```

  It can be accessed on `http://localhost:3000`

## Running in Docker

Docker is an awesome tool that helps you run your apps and all their dependencies in a containerized environment. This way you don't have to think about setting up your local environment. It's awesome. Learn more about [Docker](https://www.docker.com/what-docker)

You need Docker, Docker Machine and Docker Compose to proceed. You can follow the installation instructions below:

 - [Install Docker](https://docs.docker.com/engine/installation/)
 - [Install Docker Machine](https://docs.docker.com/machine/install-machine/)
 - [Install Docker Compose](https://docs.docker.com/compose/install/)

NB: Before the following, please ensure you have cloned the repo locally, you have navigated to the `docue` folder and have set the environment variables in the `.env` file as described above

Build and run the docker version by running the following command:

```bash
docker-compose up

```

If this runs successfully, the app can be accessed on `http://localhost:49160`

## Running tests

The tests are run using `jasmine` on the command line

To run the tests, use the following steps:

 - Navigate to the project folder

    `$ cd docue`

 - Run the tests through the following command:

    `$ npm test`
