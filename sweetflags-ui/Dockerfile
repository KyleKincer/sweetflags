# Build stage
FROM node:18 as build
# Set build mode argument with a default value
ARG BUILD_MODE=development

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build:$BUILD_MODE

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]