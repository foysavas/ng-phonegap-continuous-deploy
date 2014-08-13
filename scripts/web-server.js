var connect = require('connect')
  , http = require('http')
  , cors = require('connect-xcors')
  , os = require('os')
  , sleep = require('sleep')
  ;

console.log('');
/*
console.log('Use a same-origin policy disabled WebKit browser:');
console.log('  OSX:');
console.log('    open -a "Safari" --args --disable-web-security');
console.log('    open -a "Chromium" --args --disable-web-security');
console.log('  Linux:');
console.log('    chromium --disable-web-security');
console.log('');
*/
console.log('Listening on http://'+os.hostname()+':3001');
console.log('---');
console.log('');

var SIMULATE_SLOW_CONNECTION = false;

var app = connect()
  .use(function(req,res,next) {
    console.log(req.method + ": " + req.url);
    next();
  })
  .use(function(req,res,next){
    if (req.headers && req.headers.origin) {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", 'Accept, Content-Type, X-Requested-With');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }
    if (req.method.match(/^OPTIONS$/i)) {
      return res.end();
    }
    next();
  })
  .use(function(req,res,next){
    if (SIMULATE_SLOW_CONNECTION) {
      if (!req.url.match(/^\/res\//)) {
        sleep.sleep(1);
      }
    }
    next();
  })
  .use(connect.static('www'))
  ;

http.createServer(app).listen(3001);
