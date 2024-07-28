# Use a Node.js base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json .
COPY build-css.json .
COPY quick.json .
COPY preload.js .
COPY electron-builder.yml .

# Copy the assets and renderer folders
COPY assets ./assets
COPY renderer ./renderer

# Install dependencies
RUN npm install

# Install electron-builder globally
RUN npm install -g electron-builder

# Build the CSS
RUN npm run build-css

# Build the Electron application for all platforms
RUN npx electron-builder -mwl

# The application's built files will be in the dist/ directory
