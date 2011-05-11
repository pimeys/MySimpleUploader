var express = require('express');
var app = express.createServer();
var pub = __dirname + '/public';
var multipart = require('./lib/multipart-stack/');

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
  var parsed = multipart.parseContentType(req.headers['content-type']);
  if (parsed.type == 'multipart') {
    var parser = new multipart.Parser(req, parsed.boundary);
    parser.on('part', function(part) {
      part.on('headers', function(headers) {
	console.log(headers);
      });
    });
  }
});

app.listen(3000);
