// Requires
var fs = require('fs')
  , express = require('express')
  , formidable = require('formidable');

// Redis setup
var rclient = require('redis-node').createClient();
rclient.select(0);

// Express config
var app = express.createServer()
  , pub = __dirname + '/public';

// New upload code goes here
var upload = require('./lib/upload_helper.js');

// Express configuration
app.configure(function () {
  app.use(express.compiler({ src: pub, enable: ['sass'] }))
  app.use(express.methodOverride());
  app.use(express.static(pub));
  app.use(express.logger());
  app.use(express.bodyParser()); 
  app.use(express.cookieParser());
});
app.register('.haml', require('hamljs'));

// Routes

// GET, initialize upload
app.get('/init', function(req, res) {
  var upload_id = upload.generate_id();
  rclient.set(upload_id, 0);
  upload.respond_id(res, upload_id);
});

// GET, front page
app.get('/', function(req, res) {
  res.render('index.haml', {layout: false});
});

// POST, start upload
app.post('/', function(req, res) {
  var form = new formidable.IncomingForm();

  form.on("progress", function(recvd, total) {
    rclient.set(upload.parse_id(req.url), recvd / total);
  });

  form.parse(req, function(err, fields, files) {
    var upload_id = upload.parse_id(req.url);
    rclient.exists(upload_id, function(ex_err, exist) {
      if (exist) {
	fs.mkdir('./public/uploads/' + upload_id, '0775', function(err, stats) {
	  if (err) {
	    upload.error_invalid_id(res);
	  } else {
	    upload.success_file_received(res);
	  }
	});
      } else {
	upload.error_invalid_id(res);
      }
    });
  });
});

// GET, upload status
app.get('/status', function(req, res) {
  var upload_id = upload.parse_id(req.url);
  var progress = 0;

  rclient.exists(upload_id, function(ex_err, exist) {
    if (exist) {
      rclient.get(upload_id, function(get_err, val) {
	upload.respond_progress(res, val);
      });
    } else {
      upload.error_invalid_id(res);
    }
  });
});

// Start server
app.listen(80);
