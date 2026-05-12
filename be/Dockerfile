FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 8006

# Start script that runs migrations then starts the server
CMD npx prisma db push && npm start
