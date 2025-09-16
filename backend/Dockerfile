FROM node:24

# Goes to app directory
WORKDIR /app

# Copy package.json which contains dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything in this backend folder into the app directory
COPY . .

# Set environment variables and expose the port for use
ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]