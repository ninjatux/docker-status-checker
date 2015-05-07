var Virgilio = require('virgilio');

var config = {
    logger: {
        level: 'info',
        name: 'status-aggregator'
    },
    http: {
        port: process.env.PORT ? process.env.PORT : 9090
    }
};

var endpoints = process.env.API_HEALTH_ENDPOINTS ?
    process.env.API_HEALTH_ENDPOINTS.split(',') : '';

var virgilio = new Virgilio(config);

var Promise = virgilio.Promise;
var request = Promise.promisify(require('request'));

virgilio.loadModule$(require('virgilio-http'));

virgilio.http.get('/status')
    .addHandler(function statusHandler(req, res) {
        var virgilio = this;
        virgilio.log$.info('Checks requested');
        var failed = false;
        var responseObj = {};
        var checks = [];
        endpoints.forEach(function (endpoint) {
            checks.push(request(endpoint));
        });
        Promise.settle(checks).then(function (results) {
            virgilio.log$.info('Checks completed');
            results.forEach(function (result) {
                if(result.isFulfilled()) {
                    var response = result.value()[0];
                    responseObj[response.request.host] = 'OK';
                } else if(result.isRejected()) {
                    failed = true;
                    var err = result.reason();
                    responseObj[err.cause.hostname] = err.message;
                }
            });
        })
        .then(function () {
            if (failed) {
                res.send(500, responseObj);
            } else {
                res.send(200, 'OK');
            }
        });
    });
