FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copying the rest of the code is important for the initial build, 
# although docker-compose mounts the volume for hot reloading.
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
