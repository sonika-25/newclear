FROM node:24

# goes to app directory
WORKDIR /app

# copy package.json which contains dependencies
COPY package*.json ./

# install dependencies
RUN npm install

# copy everything in this frontend folder into the app directory
COPY . .

# set environment variables and expose the port for us
ENV HOST=0.0.0.0
EXPOSE 5173

# command to run
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]