FROM node:14-alpine

WORKDIR /usr/src/app
COPY ./server/package*.json ./server/
COPY ./client/package*.json ./client/

RUN cd client && npm install

RUN apk add bluez-dev

WORKDIR /usr/src/app/server
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
     && npm install \
     && apk del .gyp 

WORKDIR /usr/src/app
COPY . .

EXPOSE 8080 4000

RUN apk update && apk add bash
CMD [ "bash", "./run.sh" ]