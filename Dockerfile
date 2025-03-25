FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:22.12-alpine AS release

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json* /app/package-lock.json*
COPY --from=builder /app/pnpm-lock.yaml* /app/pnpm-lock.yaml*

# Use a non-root user for security
USER node

ENTRYPOINT ["node", "dist/index.js"]