FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy source code
COPY . .

# Expose port
EXPOSE 8006

# Start script that generates client, runs migrations, then starts the server
CMD npx prisma generate && npx prisma db push && npm start
