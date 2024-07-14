# Stage 1: Build the Vite application
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the built files using Nginx
FROM nginx:1.23.3

# Copy built files from the build stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY . .

# Copy custom nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80
# for test commit 4

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
