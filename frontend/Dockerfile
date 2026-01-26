# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build args
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_MAPS_KEY

# Set env vars for build time
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY

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
CMD ["/bin/sh", "-c", "sed -i \"s/listen 80;/listen ${PORT:-80};/g\" /etc/nginx/conf.d/default.conf && nginx -g \"daemon off;\""]
