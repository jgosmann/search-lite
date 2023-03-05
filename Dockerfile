FROM node:18-alpine

RUN apk add curl

COPY package*.json /opt/search-lite/
COPY app.js /opt/search-lite/app.js
WORKDIR /opt/search-lite
RUN npm ci

USER node

HEALTHCHECK --start-period=5s CMD ["curl", "--fail", "--header", "Content-Type: application/json", "http://localhost:4000/graphql?query=%7B__typename%7D"]

EXPOSE 4000

CMD ["node", "app.js"]
