FROM    node:5.7
# Install app dependencies
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
# Bundle app source
COPY . /usr/src/app
EXPOSE  8080
ENV PORT 8080
CMD ["npm", "start"]
