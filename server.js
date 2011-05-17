// Requires
var sys = require('sys')
  , fs = require('fs')
  , express = require('express')
  , formidable = require('formidable')
  , cjson = require('cjson')
  , config = cjson.load('./config/general.json');

// Redis setup
var rclient = require('redis-node').createClient()
  , connect = require('connect')
  , RedisStore = require('connect-redis');
rclient.select(0);

// Express config
var app = express.createServer()
  , pub = __dirname + '/public';

// This should be refactored to Redis
var uploads = {};

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

// Public functions
function generate_id() {
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

// New upload code goes here
var upload_data = require('./lib/upload.js').Data();

// Express configuration
app.configure(function () {
  app.use(express.compiler({ src: pub, enable: ['sass'] }))
  app.use(express.methodOverride());
  app.use(express.static(pub));
  app.use(express.logger());
  app.use(express.bodyParser()); 
  app.use(express.cookieParser());
  app.use(express.session({ secret: config.session_secret, store: new RedisStore })); 
});

app.register('.haml', require('hamljs'));

app.get('/init', function(req, res) {
  req.session.upload_id = generate_id();
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end();
});

app.get('/', function(req, res) {
  res.render('index.haml', {layout: false});
});

app.post('/', function(req, res) {
  var form = new formidable.IncomingForm();

  form.on("progress", function(recvd, total) {
    uploads[req.session.upload_id] = recvd / total;
  });

  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(sys.inspect({fields: fields, files: files}));
  });
});

app.get('/status', function(req, res) {
  var progress = 0;
  var status_id = req.session.upload_id;

  if (status_id && uploads[status_id])
  {
    progress = uploads[status_id];  
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(progress.toString());
  res.end();
});

app.listen(80);
