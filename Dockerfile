# Pulling nodejs base image
FROM mhart/alpine-node:0.12

# Skip npm install if package.json didn't changed
ADD package.json /tmp/package.json

RUN apk --no-cache add ca-certificates libssh2 libcurl expat pcre git && \
    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc && \
    cd /tmp && \
    npm install --production && \
    rm -f ~/.npmrc && \
    apk del git

RUN mkdir -p /opt/status-checker && cp -a /tmp/node_modules /opt/status-checker

# Loading application code
WORKDIR /opt/status-checker
ADD . /opt/status-checker

# Expose API port
EXPOSE 9090

CMD ["node", "."]
