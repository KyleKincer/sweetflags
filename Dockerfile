FROM gitlab-registry.sweetwater.com/it/devops/dockerfiles/node-18-alpine:1.0.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port your application will run on
EXPOSE 3000

# Start the application using the compiled JavaScript
CMD ["npm", "run", "start:prod"]
