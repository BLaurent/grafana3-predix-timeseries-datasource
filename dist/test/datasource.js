"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PredixTimeSeriesDatasource = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _angular = require("angular");

var _angular2 = _interopRequireDefault(_angular);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _datemath = require("app/core/utils/datemath");

var _datemath2 = _interopRequireDefault(_datemath);

var _kbn = require("app/core/utils/kbn");

var _kbn2 = _interopRequireDefault(_kbn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PredixTimeSeriesDatasource = exports.PredixTimeSeriesDatasource = function () {
    function PredixTimeSeriesDatasource(instanceSettings, $q, backendSrv, $timeout, $http, templateSrv) {
        _classCallCheck(this, PredixTimeSeriesDatasource);

        this.type = instanceSettings.type;
        this.url = instanceSettings.url;
        this.name = instanceSettings.name;
        this.q = $q;
        this.http = $http;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        // the uaa token is stored here in the model
        this.uaaTokenCache = [];
        // these attributes are pulled from the datasource definition ui
        this.tsURL = instanceSettings.jsonData.tsURL;
        this.predixZoneId = instanceSettings.jsonData.predixZoneId;
        this.uaacURL = instanceSettings.jsonData.uaacURL;
        this.clientData = instanceSettings.jsonData.clientData;
        this.uaacType = instanceSettings.jsonData.uaacType;
        this.uaacGrantType = instanceSettings.jsonData.uaacGrantType;
        this.uaac_origin = instanceSettings.jsonData.uaac_origin;
        this.expand = true;
        console.log("predix time series datasource constructor finished");
    }

    // Required for hints


    _createClass(PredixTimeSeriesDatasource, [{
        key: "getMetrics",
        value: function getMetrics() {
            var _this = this;

            return this.fetchToken().then(function () {
                return _this.backendSrv.datasourceRequest({
                    url: _this.tsURL + '/v1/tags',
                    data: '',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + _this.uaaTokenCache.uaacToken,
                        'Predix-Zone-Id': _this.predixZoneId,
                        'Access-Control-Allow-Origin': _this.uaac_origin
                    }
                }).then(function (response) {
                    return _this.mapToTextValue(response.data.results);
                });
            });
        }
    }, {
        key: "getAttributesForMetric",
        value: function getAttributesForMetric(metricName) {
            var _this2 = this;

            return this.fetchToken().then(function () {
                var query = {
                    "start": "1d-ago",
                    "end": "1s-ago",
                    "tags": [{
                        "name": [metricName]
                    }]
                };
                return _this2.backendSrv.datasourceRequest({
                    url: _this2.tsURL + '/v1/datapoints',
                    data: JSON.stringify(query),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + _this2.uaaTokenCache.uaacToken,
                        'Predix-Zone-Id': _this2.predixZoneId,
                        'Access-Control-Allow-Origin': _this2.uaac_origin
                    }
                }).then(function (result) {
                    return _this2.mapToTextValue(Object.keys(result.data.tags[0].results[0].attributes));
                });
            });
        }
    }, {
        key: "getAttributeValues",
        value: function getAttributeValues(metricName, attributeName) {
            var _this3 = this;

            return this.fetchToken().then(function () {
                var query = {
                    "start": "1d-ago",
                    "end": "1s-ago",
                    "tags": [{
                        "name": [metricName]
                    }]
                };
                return _this3.backendSrv.datasourceRequest({
                    url: _this3.tsURL + '/v1/datapoints',
                    data: JSON.stringify(query),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + _this3.uaaTokenCache.uaacToken,
                        'Predix-Zone-Id': _this3.predixZoneId,
                        'Access-Control-Allow-Origin': _this3.uaac_origin
                    }
                }).then(function (result) {
                    return _this3.mapToTextValue(result.data.tags[0].results[0].attributes[attributeName]);
                });
            });
        }
    }, {
        key: "getAggregations",
        value: function getAggregations() {
            var _this4 = this;

            return this.fetchToken().then(function () {
                return _this4.backendSrv.datasourceRequest({
                    url: _this4.tsURL + '/v1/aggregations',
                    data: '',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + _this4.uaaTokenCache.uaacToken,
                        'Predix-Zone-Id': _this4.predixZoneId,
                        'Access-Control-Allow-Origin': _this4.uaac_origin
                    }
                }).then(function (response) {
                    var data = [];
                    _lodash2.default.each(response.data.results, function (elem) {
                        data.push({
                            name: elem.type,
                            type: elem.name
                        });
                    });
                    return _this4.mapToTextAndType(data);
                });
            });
        }
    }, {
        key: "mapToTextValue",
        value: function mapToTextValue(results) {
            return _lodash2.default.map(results, function (d, i) {
                return {
                    text: d,
                    expandable: true
                };
            });
        }
    }, {
        key: "mapToTextAndType",
        value: function mapToTextAndType(result) {
            return _lodash2.default.map(result, function (d, i) {
                return {
                    text: d.name,
                    expandable: false,
                    type: d.type
                };
            });
        }
    }, {
        key: "buildQueryParameters",
        value: function buildQueryParameters(options) {
            //remove placeholder targets
            options.targets = _lodash2.default.filter(options.targets, function (target) {
                return target.target !== 'select metric';
            });
            return options;
        }

        // Since we are limited on the amount of data that can be returned,
        // each metric gets its own query for maximum results

    }, {
        key: "SinglePredixTimeSeriesQuery",
        value: function SinglePredixTimeSeriesQuery(aQuery) {
            var deferred = this.q.defer();
            var request = this.backendSrv.datasourceRequest({
                url: this.tsURL + '/v1/datapoints',
                data: JSON.stringify(aQuery.fullQuery),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.uaaTokenCache.uaacToken,
                    'Predix-Zone-Id': this.predixZoneId,
                    'Access-Control-Allow-Origin': this.uaac_origin
                }
            }).then(function (result) {
                // we always get one tag back
                var tag = result.data.tags[0];
                var tagName = tag.name;
                if (typeof aQuery.targetAlias !== 'undefined' && aQuery.targetAlias.length > 0) {
                    tagName = aQuery.targetAlias;
                }
                // construct the response
                var a_metric = {
                    target: tagName,
                    datapoints: []
                };
                // add in the datapoints, picking the correct fields
                // predix has a "quality" field that is ignored
                _lodash2.default.each(tag.results[0].values, function (timeseries) {
                    var newseries = [timeseries[1], timeseries[0]];
                    a_metric.datapoints.push(newseries);
                });
                return a_metric;
            }).then(function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.error(error);
            });
            return deferred.promise;
        }
    }, {
        key: "getUAAToken",
        value: function getUAAToken() {
            var _this5 = this;

            return this.q(function (resolve, reject) {
                var now = new Date();
                var checkTime = new Date(now.getTime() + 1000 * 30);
                if (typeof _this5.uaaTokenCache.uaacTokenType === 'undefined' || typeof _this5.uaaTokenCache.expiresDTTM !== 'undefined' && _this5.uaaTokenCache.expiresDTTM < checkTime) {
                    var clientID = _this5.clientData.split(":")[0];
                    var clientSecret = _this5.clientData.split(":")[1];
                    var payload = encodeURI("client_id=" + clientID + "&client_secret=" + clientSecret + "&response_type=token&grant_type=client_credentials");
                    _this5.backendSrv.datasourceRequest({
                        method: 'POST',
                        url: _this5.uaacURL,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Basic ' + btoa(_this5.clientData)
                        },
                        data: payload
                    }).then(function (response) {
                        _this5.uaaTokenCache = [];
                        _this5.uaaTokenCache.uaacToken = response.data.access_token;
                        _this5.uaaTokenCache.uaacTokenType = response.data.token_type;
                        _this5.uaaTokenCache.uaacExpires = response.data.expires_in;
                        var timeObject = new Date();
                        //set the time and date that this token expires
                        timeObject = new Date(timeObject.getTime() + 1000 * response.data.expires_in);
                        _this5.uaaTokenCache.expiresDTTM = timeObject;
                        // console.log("Got a new token!");
                        // console.log($scope.datasource.uaaTokenCache);
                        resolve(_this5.uaaTokenCache);
                    }, function (error) {
                        console.log("Failed to get a token: " + error);
                        resolve("error");
                    });
                } else {
                    // console.log("we have a good token...");
                    resolve(_this5.uaaTokenCache);
                }
            });
        }
    }, {
        key: "fetchToken",
        value: function fetchToken() {
            var _this6 = this;

            // TODO: check if we already have a token and the expiration time is good
            return this.q(function (resolve, reject) {
                var aToken = _this6.getUAAToken();
                aToken.then(function (response) {
                    resolve();
                });
            });
        }
    }, {
        key: "MultiplePredixTimeSeriesQueries",
        value: function MultiplePredixTimeSeriesQueries(pendingQueries) {
            var _this7 = this;

            var deferred = this.q.defer();
            var predixTSCalls = [];
            _angular2.default.forEach(pendingQueries, function (aQuery) {
                predixTSCalls.push(_this7.SinglePredixTimeSeriesQuery(aQuery));
            });
            this.q.all(predixTSCalls).then(function (results) {
                var response = {
                    data: []
                };
                _angular2.default.forEach(results, function (result) {
                    response.data.push(result);
                });
                deferred.resolve(response);
            }, function (errors) {
                deferred.reject(errors);
            }, function (updates) {
                deferred.update(updates);
            });
            return deferred.promise;
        }

        // Called once per panel (graph)

    }, {
        key: "query",
        value: function query(options) {
            var _this8 = this;

            // not needed since we are using suggest vs value?
            // it isn't used anyways..
            //var query = this.buildQueryParameters(options);

            var queries = [];
            if (options.targets.length <= 0) {
                return this.q.when({
                    data: []
                });
            }
            if (typeof options.targets[0].metric === 'undefined') {
                return this.q.when({
                    data: []
                });
            }
            // the rest of this function is a promise
            var deferred = this.q.defer();

            // Iterate over each target and build our query, store inside
            _angular2.default.forEach(options.targets, function (target) {
                // there's no "next" option in here, so test and skip
                if (!target.hide && typeof target.metric !== 'undefined') {
                    // placeholder while query is built
                    var aQuery = {
                        "start": "15s-ago",
                        "end": "1s-ago",
                        "tags": [{
                            "name": ["placeholder"]
                        }]
                    };
                    aQuery.tags[0].name[0] = target.metric;
                    aQuery.tags[0].limit = options.maxDataPoints;
                    aQuery.start = options.range.from.valueOf();
                    aQuery.end = options.range.to.valueOf();
                    // now the filters
                    if (_typeof(target.attributes) !== undefined) {
                        // there are filters defined, loop through them
                        var attributes = {};
                        _angular2.default.forEach(target.attributes, function (attribute) {
                            var name = attribute.name;
                            var value = attribute.value;
                            // if the value is empty, skip it
                            if (value.length > 0) {
                                //var aHash = {};
                                //aHash[name] = value;
                                //attribute_list.push(aHash);
                                attributes[name] = value;
                            }
                        });
                        if (attributes !== null) {
                            // only add filters if some are defined
                            aQuery.tags[0].filters = {};
                            aQuery.tags[0].filters.attributes = attributes;
                            console.log(aQuery);
                        }
                    }
                    // Add the query and the target alias
                    // thhe alias will be used later for legend substitution if it is defined
                    queries.push({
                        fullQuery: aQuery,
                        targetAlias: target.alias
                    });
                } else {
                    console.log("hidden or empty, not adding to query");
                }
            });

            // Check if there are any metrics to query (they can all be hidden, or none at all)
            if (queries.length === 0) {
                // console.log("no tags visible or specified, no data to fetch");
                deferred.resolve({
                    data: []
                });
                return deferred.promise;
            }
            this.fetchToken().then(function () {
                var predixQueries = _this8.q.all({
                    first: _this8.MultiplePredixTimeSeriesQueries(queries)
                });
                predixQueries.then(function (results) {
                    // return results from predix query
                    deferred.resolve(results.first);
                });
            });
            return deferred.promise;
        }
    }, {
        key: "testDatasource",
        value: function testDatasource() {
            var _this9 = this;

            return this.fetchToken().then(function () {
                return _this9.backendSrv.datasourceRequest({
                    url: _this9.tsURL + '/v1/tags',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': _this9.uaaTokenCache.uaacToken,
                        'Predix-Zone-Id': _this9.predixZoneId,
                        'Access-Control-Allow-Origin': _this9.uaac_origin
                    }
                }).then(function (response) {
                    console.log(response);
                    if (response.status === 200) {
                        return {
                            status: "success",
                            message: "Data source is working",
                            title: "Success"
                        };
                    }
                });
            });
        }
    }]);

    return PredixTimeSeriesDatasource;
}();
//# sourceMappingURL=datasource.js.map
