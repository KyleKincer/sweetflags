# Use the official Node.js image as the base image
FROM gitlab-registry.sweetwater.com/it/devops/dockerfiles/node-18-alpine:1.0.0 as build

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

FROM gitlab-registry.sweetwater.com/it/devops/dockerfiles/node-18-alpine:1.0.0
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --from=build /usr/src/app/dist /app/dist

# Start the application using the compiled JavaScript
CMD ["npm", "run", "start"]
