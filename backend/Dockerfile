FROM node:18-alpine

WORKDIR /usr/src/app

# Windows repo uses capitalized Package.json; map to lowercase for Node
COPY Package.json ./package.json
COPY Package-lock.json ./package-lock.json

# Install production dependencies
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

# Run migrations + seeds automatically, then start server
CMD ["sh", "-c", "node src/scripts/migrate.js && node src/scripts/seed.js && node src/app.js"]