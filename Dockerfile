FROM node:14.19-alpine

ARG CI

RUN apk update -f && \
  apk add bash

ADD package.json yarn.lock /

ENV BIND_HOST=0.0.0.0
ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

RUN set -ex; \
  # if [ -z "$CI" ]; then \
    yarn install;
  # else \
  #   yarn install --frozen-lockfile && yarn cache clean; \
  # fi;

WORKDIR /app
ADD . /app

EXPOSE 3000
EXPOSE 35729

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
CMD ["start"]
