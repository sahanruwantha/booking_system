FROM node:18-alpine

WORKDIR /usr/src/app

# Create shared directory
RUN mkdir -p shared

COPY package*.json ./

RUN npm install

RUN cp ./src/database.db shared/app.db

RUN ls -la

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 