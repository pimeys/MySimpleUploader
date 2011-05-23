// Requires
var fs = require('fs')
  , express = require('express')
  , formidable = require('formidable')
	, sanitizer = require('sanitizer')
	, ejs = require('ejs');

// Redis setup
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
  var upload_id = upload.generate_id();
  rclient.hmset(upload_id, {progress: 0});
  upload.respond_id(res, upload_id);
});

// POST, start upload
app.post('/:id', function(req, res) {
  var form = new formidable.IncomingForm();

  form.on("error", function(err) {
    fs.unlinkSync(files.file.path);
    upload.respond_error(err);
  });

  form.on("aborted", function() {
    fs.unlinkSync(files.file.path);
    upload.respond_error("aborted by user / timeout");
  });

  form.on("progress", function(recvd, total) {
    rclient.hmset(req.params.id, {progress: recvd / total});
  });

  form.parse(req, function(err, fields, files) {
    var upload_id = req.params.id;
    // Upload should exist
    rclient.exists(upload_id, function(ex_err, exist) {
      if (exist) {
		    var pub_dir = '/uploads/' + upload_id + '/';
			  var save_dir = './public' + pub_dir;
        // Make new directory with id to public/uploads
        fs.mkdir(save_dir, '0775', function(err, stats) {
          if (err) {
            upload.respond_error_invalid_id(res);
          } else {
            // Move the file to the upload dir
            var save_uri = save_dir + files.file.name;
            var pub_uri = pub_dir + files.file.name;
            fs.writeFile(save_uri, fs.readFileSync(files.file.path), function(err) {
              fs.unlinkSync(files.file.path);
              if (!err) {
                rclient.hmset(upload_id, {progress: 1, path: pub_uri});
                upload.respond_ok(res);
              } else {
                upload.respond_error(err);
              }
            });
          }
        });
      } else {
        upload.respond_error_invalid_id(res);
      }
    });
  });
});

// GET, upload status
app.get('/status/:id', function(req, res) {
  var upload_id = req.params.id;
  var progress = 0;

  rclient.exists(upload_id, function(ex_err, exist) {
    if (exist) {
      rclient.hmget(upload_id, "progress", "path", function(get_err, val) {
				upload.respond_progress(res, val);
      });
    } else {
      upload.respond_error_invalid_id(res);
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

// Start server
app.listen(80);
