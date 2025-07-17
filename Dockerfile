# Base stage
FROM node:current-alpine3.22 AS base
WORKDIR /app

# Create a non-root user
RUN adduser -D -s /bin/sh appuser

# Install Angular CLI 
RUN npm install -g @angular/cli@19.2.14
RUN ng version

# Copy package.json and package-lock.json
# This is done separately to leverage Docker's caching mechanism
# so that we don't have to reinstall dependencies if only application code changes
COPY package*.json ./
# Install dependencies
RUN npm ci --no-cache

# Copy the rest of the application files
COPY . .

# Development stage
FROM base AS dev
EXPOSE 4200
# Ensure all dependencies are properly installed
RUN npm install
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "1000"]

# Production build stage
FROM base AS build
WORKDIR /app

RUN ng build
CMD ["npm", "run", "serve:ssr"]
EXPOSE 4000

# Production build stage (no SSR)
FROM base AS build-no-ssr

# Build the Angular app for production (no SSR)
RUN ng build

# Use nginx as the production server
FROM nginx:alpine AS production-no-ssr

# Copy the built app from build-no-ssr stage to nginx
COPY --from=build-no-ssr /app/dist/*/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
