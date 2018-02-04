# UE BOILERPLATE SERVICE ES6 MONGOOSE
# Copyright 2018 United Effects LLC

FROM mhart/alpine-node:9
LABEL author="bmotlagh@unitedeffects.com"

RUN mkdir /src
COPY . /src
WORKDIR /src

RUN mv /src/config-changeme.js /src/config.js
RUN yarn

EXPOSE 3000

CMD ["yarn", "start"]