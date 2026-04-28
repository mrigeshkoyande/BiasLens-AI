FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED 1

# Build the app
RUN npm run build

EXPOSE 3000
ENV PORT 3000

# Regular next start
CMD ["npm", "start"]
