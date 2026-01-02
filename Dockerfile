FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile && pnpm store prune

COPY . .

# Build the application
RUN pnpm run build

# Remove dev dependencies after build to reduce image size
RUN pnpm prune --prod && pnpm store prune

CMD ["pnpm", "run", "docker-start"]
