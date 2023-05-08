FROM gitlab-registry.sweetwater.com/it/devops/dockerfiles/node-18-alpine:1.0.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port your app will run on
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev"]
