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
# ENV MONGO_URI=mongodb+srv://vo-phillip:COMP30022@scheduling-care-aws.zy6q99p.mongodb.net/?retryWrites=true&w=majority&appName=scheduling-care-aws

CMD ["node", "index.js"]