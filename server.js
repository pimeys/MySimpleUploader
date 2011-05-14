var sys = require('sys');
var express = require('express');
var formidable = require('formidable');

var app = express.createServer();
var pub = __dirname + '/public';
var uploads = {};

function get_param(str, idx) {
  return str.split('=')[idx];
}

app.configure(function () {
  app.use(express.compiler({ src: pub, enable: ['sass'] }))
  app.use(express.methodOverride());
  app.use(express.static(pub));
  app.use(express.logger());
  app.use(express.bodyParser()); 
});

app.register('.haml', require('hamljs'));

app.get('/', function(req, res) {
  res.render('index.haml', {layout: false});
});

app.post('/', function(req, res) {
  var form = new formidable.IncomingForm();

  form.on("progress", function(recvd, total) {
    var status_id = get_param(req.url, 1);
    uploads[status_id] = recvd / total;
    sys.puts("Received: " + recvd + "/" + total);
  });

  form.parse(req, function(err, fields, files) {
    var status_id = get_param(req.url, 1);
    delete uploads[status_id];
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(sys.inspect({fields: fields, files: files}));
  });
});

app.get('/status', function(req, res) {
  var status_id = get_param(req.url, 1);
  var progress = 0;
  if (status_id && uploads[status_id])
  {
    progress = uploads[status_id];  
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(progress.toString());
  res.end();
});

app.listen(3000);
