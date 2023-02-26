FROM node:18-alpine


COPY package*.json /opt/search-lite/
COPY app.js /opt/search-lite/app.js
WORKDIR /opt/search-lite
RUN npm ci

USER node

EXPOSE 4000

CMD ["node", "app.js"]
