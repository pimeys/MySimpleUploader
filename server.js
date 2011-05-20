// Requires
var sys = require('sys')
  , fs = require('fs')
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

app.get('/init', function(req, res) {
  var upload_id = upload.generate_id();
  rclient.set(upload_id, 0);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(upload_id);
  res.end();
});

app.get('/', function(req, res) {
  res.render('index.haml', {layout: false});
});

app.post('/', function(req, res) {
  var form = new formidable.IncomingForm();

  form.on("progress", function(recvd, total) {
    rclient.set(upload.parse_id(req.url), recvd / total);
  });

  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(sys.inspect({fields: fields, files: files}));
  });
});

app.get('/status', function(req, res) {
  var upload_id = upload.parse_id(req.url);
  var progress = 0;

  rclient.exists(upload_id, function(ex_err, exist) {
    if (exist) {
      rclient.get(upload_id, function(get_err, val) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write(val);
	res.end();
      });
    } else {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.write('invalid id');
      res.end();
    }
  });
});

app.listen(80);
