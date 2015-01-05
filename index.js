"user strict";

var http = require('http');
var querystring = require('querystring');
var jsdom = require('jsdom');
var request = require('request');
var fs = require("fs");

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

exports.getCamSettings = function(hostname, port, user, pass, cb) {
  var jquery = fs.readFileSync("node_modules/jquery/dist/jquery.js", "utf-8");
  var uri = 'http://' +  user + ':' + pass + '@' + hostname + ":" + port 
            + "/adm/file.cgi?next_file=event.htm";
  jsdom.env({
    url: uri,
    src: [jquery],
    done: function(err, window){
      if (err) throw err;
      var $ = window.$;
      var motionCheck = $('input[name=h_en_trig]').val();
      console.log(motionCheck);
      var result = {
        motionDetection: motionCheck === '1' ? true : false
      }
      cb(err, result);
    }
  });

}
