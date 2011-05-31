// Requires
var express = require('express');
var formidable = require('formidable');
var ejs = require('ejs');

// Express config
var app = express.createServer();
var pub = __dirname + '/public';

// Hoptoad error notifier
var hoptoad = require('hoptoad-notifier').Hoptoad;
process.addListener('uncaughtException', function(error) {
  // Optionally provide a callback.
  Hoptoad.notify(error, function(err) {
    if (err) {
      throw err;
    } else {
      console.log('Error sent to Hoptoad.');
    }
  });
});

// Upload functions
var upload = require('./lib/upload.js');

// Responses
var response = require('./lib/response.js');

// Express configuration
app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.static(pub));
  app.use(express.logger());
  app.use(express.bodyParser()); 
  app.use(express.cookieParser());
});
app.set('view engine', 'ejs');

// Routes

// GET, initialize upload
app.get('/init', function(req, res) {
  upload.initialize(function(upload_id) {
    response.id(res, upload_id);
  });
});

// POST, start upload
app.post('/:id', function(req, res) {
  if (upload.exists(req.params.id)) {
    response.error("invalid id");
    return;
  }

  var form = new formidable.IncomingForm();

  form.on("error", function(err) {
    response.error(res, err);
  });

  form.on("aborted", function() {
    response.error(res, "aborted by user / timeout");
  });

  form.on("progress", function(recvd, total) {
    upload.update_progress(req.params.id, {progress: recvd / total});
  });

  form.parse(req, function(err, fields, files) {
    upload.publish_upload(req, files, function(err) {
      if (err) {
        response.error(res, err);
      } else {
        response.ok(res);
      }
    });
  });
});

// GET, upload status
app.get('/status/:id', function(req, res) {
  upload.info(req.params.id, function(err, info) {
    if (err) {
      response.error(res, 'invalid_id');
    } else {
      response.progress(res, info);
    }
  });
});

// POST, set file comment
app.post('/comment/:id', function(req, res) {
  upload.insert_comment(req, function(err) {
    if (err) {
      response.error(res, err);
    } else {
      res.redirect('/u/' + req.params.id);
    }
  });
});

// GET, display upload
app.get('/u/:id', function(req, res) {
  upload.display(req.params.id, function(err, url, comment) {
    if (err) {
      response.not_found(res);
    } else {
      var params = {
        file_url: url,
        file_comment: comment,
        layout: false
      };
      res.render('view.html.ejs', params);
    }
  });
});

// GET, 404 for everything else
app.get('*', function(req, res) {
  response.not_found(res);
});

// Start server
app.listen(80);
