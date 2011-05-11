var express = require('express');
var fs = require('fs');
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
    var fileName = null;
    var fileStream = null;
    var headers = null;

    parser.on('part', function(part) {
      part.on('headers', function(head) {
	console.log(head);
      });

      debugger;

      console.log("Started part, name = " + part.name + ", filename = " + part.filename);
      fileName = "./public/uploads/" + part.filename;
      fileStream = fs.createWriteStream(fileName);

      fileStream.addListener("error", function(err) {
	console.log("Got error while writing to file '" + fileName + "': ", err);
      });
      
      fileStream.addListener("drain", function() {
	req.resume();
      });

      part.data = function(chunk) {
	req.pause();
	console.log("Writing chunk");
	fileStream.write(chunk, "binary");
      };

      part.end = function() {
	fileStream.addListener("drain", function() {
	  fileStream.end();
	
	  console.log("Upload complete!");

	  res.sendHeader(200, { 'Content-Type': 'text/plain' });
	  res.write("Thank you!");
	  res.end();
	  sys.puts("\n=> DONE");
	});
      };
    });
  }
});

app.listen(3000);
