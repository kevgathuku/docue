FROM node:6
# Install app dependencies
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install --production
# Bundle app source
COPY . /usr/src/app
RUN npm run deploy
EXPOSE  3000
CMD ["npm", "start"]
