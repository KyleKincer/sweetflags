# Set build mode argument with a default value
ARG BUILD_MODE=development

# Build stage
FROM gitlab-registry.sweetwater.com/it/devops/dockerfiles/node-18-alpine:1.0.0 as build
ARG BUILD_MODE

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
FROM nginx:alpine-slim

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]