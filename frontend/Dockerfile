# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Railway maps this dynamically, but Nginx listens on 80 inside)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
