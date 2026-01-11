# Build stage
FROM oven/bun:1.3-debian AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build args for environment variables (set at build time)
ARG VITE_API_URL
ARG VITE_REGISTRATION_ENABLED=false
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_REGISTRATION_ENABLED=$VITE_REGISTRATION_ENABLED

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
