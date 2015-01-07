"use strict";

var http = require('http');
var querystring = require('querystring');
var jsdom = require('jsdom');
var fs = require('fs');
var async = require('async');
var path = require('path');

/**
 * Applies settings to an ip camera. Only given settings are modified.
 * Example settings:
 * {
 *   led: true,
 *   motionDetection: true,
 *   allowMobileStreaming: true
 * }
 */
exports.editCamSettings = function(hostname, port, user, pass, settings, cb) {
  var postData = {todo: 'save'};

  if (settings.led !== undefined) {
    postData["LEDs"] = settings.led ? 1 : 0;
    postData["h_LEDs"] = settings.led ? 1 : 0;
  }  
  if (settings.motionDetection !== undefined) {
    postData["h_en_trig"] = settings.motionDetection ? 1: 0;
    if (settings.motionDetection) {
      postData["en_trig"] = 'en_trig';
    }
  }
  if (settings.allowMobileStreaming !== undefined) {
    postData["en_mb"] = settings.allowMobileStreaming ? 1 : 0;
    postData["h_en_mb"] = settings.allowMobileStreaming ? 1 : 0;
  }

  var data = querystring.stringify(postData);
  var postOptions = {
    hostname: hostname,
    port: port,
    path: '/adm/file.cgi',
    method: 'POST',
    auth: user + ':' + pass,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    }
  };

  var request = http.request(postOptions, function(res) {
    cb(null);
  })

  request.on('error', function(e) {
    cb(e.message);
  });

  request.write(data);
  request.end();
}

/**
 * Reads settings from ip cam's web server.
 * @returns {
 *   led: boolean
 *   motionDetection: bool
 *   allowMobileStreaming: bool
 */
exports.getCamSettings = function(hostname, port, user, pass, cb) {
  var urlPrefix = 'http://' +  user + ':' + pass + '@' + hostname + ":" + port ;

  // Some settings are on different pages. Run each request in parallel
  // and combine results.
  async.parallel([
    function(callback) {
      var url = urlPrefix + '/adm/file.cgi?next_file=event.htm';
      getDomValues(url, ['input[name=h_en_trig]'], function(err, result) {
        callback(err, result);
      });
    },
    function(callback) {
      var url = urlPrefix + '/adm/file.cgi?next_file=basic.htm';
      getDomValues(url, ['input[name=h_LEDs]'], function(err, result) {
        callback(err, result);
      });
    },
    function(callback) {
      var url = urlPrefix + '/adm/file.cgi?next_file=image.htm';
      getDomValues(url, ['input[name=h_en_mb]'], function(err, result) {
        callback(err, result);
      });
    }
  ],
  function(err, results) {
    var temp = mergeObjects(results[0], results[1]);
    results = mergeObjects(results[2], temp);
    var result = {
      led:                  results['input[name=h_LEDs]'] === '1' ? true : false,
      motionDetection:      results['input[name=h_en_trig]'] === '1' ? true : false,
      allowMobileStreaming: results['input[name=h_en_mb]'] === '1' ? true : false
    };
    cb(err, result);
  });
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function mergeObjects(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

/**
 * Scrapes a list of dom selection queries from given url.
 * @param  url of site
 * @param  array of jquery dom selector queries
 * @param  Function(err, {'dom selector query': jQuery .val()})
 * @return {[type]}
 */
function getDomValues(url, domQueries, cb) {
  var jquery = fs.readFileSync(path.resolve(__dirname, "node_modules/jquery/dist/jquery.js"), "utf-8");
  jsdom.env({
    url: url,
    src: [jquery],
    done: function(err, window){
      if (err) cb(err, null)
      var $ = window.$;
      var result = {};
      
      for (var i = 0; i < domQueries.length; i++) {
        result[domQueries[i]] = $(domQueries[i]).val();
      }
      cb(err, result);
    }
  });
}
