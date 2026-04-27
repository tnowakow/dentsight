# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files for caching
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ .
RUN npm run build

# Stage 2: Setup Backend and Serve
FROM node:20-alpine

WORKDIR /app

# Install system dependencies if needed (e.g., for postgres client)
RUN apk add --no-cache python3 make g++

# Copy backend package files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from Stage 1 to the backend's public directory
# (Assuming the Express app serves static files from backend/public)
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "backend/server.js"]
