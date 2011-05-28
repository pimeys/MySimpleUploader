// Requires
var fs = require('fs')
  , express = require('express')
  , formidable = require('formidable')
	, sanitizer = require('sanitizer')
	, ejs = require('ejs');

// redis setup
var rclient = require('redis-node').createClient();
rclient.select(0);

// Express config
var app = express.createServer()
  , pub = __dirname + '/public';

// Upload helper functions
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
app.set('view engine', 'ejs');

// Routes

// GET, initialize upload
app.get('/init', function(req, res) {
  upload.initialize(function(upload_id) {
    upload.respond_id(res, upload_id);
  });
});

// POST, start upload
app.post('/:id', function(req, res) {
  var form = new formidable.IncomingForm();

  form.on("error", function(err) {
    upload.rm_tmp_file(files.file.path);
    upload.respond_error(err);
  });

  form.on("aborted", function() {
    upload.rm_tmp_file(files.file.path);
    upload.respond_error("aborted by user / timeout");
  });

  form.on("progress", function(recvd, total) {
    upload.update_progress(req.params.id, {progress: recvd / total})
  });

  form.parse(req, function(err, fields, files) {
    upload.publish_upload(req, files, function(err) {
      if (err) {
        upload.respond_error(err);
      } else {
        upload.respond_ok(res);
      }
    });
  });
});

// GET, upload status
app.get('/status/:id', function(req, res) {
  upload.info(req.params.id, function(err, info) {
    if (err) {
      upload.respond_error_invalid_id(res);
    } else {
      upload.respond_progress(res, info);
    }
  });
});

// POST, set file comment
app.post('/comment/:id', function(req, res) {
  var upload_id = req.params.id;

  rclient.exists(upload_id, function(err, exist) {
    if (exist) {
      var comment = req.body.comment != '' ? sanitizer.escape(req.body.comment) : 'No comment';

      rclient.hmset(upload_id, {comment: comment});
      res.redirect('/u/' + upload_id);
    } else {
      upload.respond_error_invalid_id(res);
    }
  });
});

// GET, display upload
app.get('/u/:id', function(req, res) {
  rclient.exists(req.params.id, function(err, exist) {
    if (exist) {
      rclient.hmget(req.params.id, "path", "comment", function(err, val) {
        if (!err) {
          var params = {
            file_url: val[0],
            file_comment: val[1],
            layout: false
          };
          res.render('view.html.ejs', params);
        }
      });
    } else {
      upload.respond_404(res);
    }
  });
});

// GET, 404 for everything else
app.get('*', function(req, res) {
  upload.respond_404(res);
});

// Start server
app.listen(80);
