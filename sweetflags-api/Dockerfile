FROM --platform=linux/amd64 node:18 as build

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
RUN ls -la dist

FROM --platform=linux/amd64 node:18
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --from=build /usr/src/app/dist ./dist
RUN ls -la /app/dist

CMD ["npm", "run", "start"]
