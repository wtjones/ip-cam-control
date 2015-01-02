"user strict";

var http = require('http');
var querystring = require('querystring');
  
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