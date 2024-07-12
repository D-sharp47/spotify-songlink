FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5173

RUN npm run build

CMD npm run preview