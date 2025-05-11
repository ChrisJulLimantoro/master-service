# Stage 1 - Build Stage
FROM node:23-alpine3.16 AS builder

# Install build dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source code and Prisma files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build


# Stage 2 - Production Stage
FROM node:23-alpine3.16

# Set working directory
WORKDIR /app


# For prisma to work with Alpine, we need to install the compatibility layer for OpenSSL
RUN apk add --update --no-cache openssl1.1-compat

# Copy only the built app and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies
RUN npm install --production

# Install ts-node for running TypeScript seeders
RUN npm install ts-node --save-dev
RUN npm install --save-dev @types/bcrypt
RUN npm install --save-dev @types/amqplib

# Copy Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
