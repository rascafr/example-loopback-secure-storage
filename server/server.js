'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const opn = require('opn');
const app = module.exports = loopback();

/*
 * body-parser is a piece of express middleware that
 *   reads a form's input and stores it as a javascript
 *   object accessible through `req.body`
 *
 */
const bodyParser = require('body-parser')

// Multer so we can upload files easily
const multer = require('multer');

// -- Add your pre-processing middleware here --

app.enable('trust proxy')
// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json())
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true
}))
// file upload
app.use(multer().any()); // for parsing multipart/form-data

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('=== SecureStorage component demo');
    console.log('=== Check ' + 'https://github.com/rascafr/loopback-secure-storage');
    console.log('=== Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('=== Browse the example REST API at %s%s', baseUrl, explorerPath);
      opn(baseUrl + explorerPath); // open API in browser
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
