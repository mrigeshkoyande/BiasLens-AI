FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy everything (including .env.production)
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Build will now find the keys in .env.production
RUN npm run build

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
