FROM node:18-alpine

WORKDIR /usr/src/app

# Create shared directory
RUN mkdir -p shared

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"] 