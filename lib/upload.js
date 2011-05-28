var sys = require('sys');
var fs = require('fs');
var sanitizer = require('sanitizer')

// redis setup
var rclient = require('redis-node').createClient();
rclient.select(0);

exports.initialize = function(callback) {
  var upload_id = generate_id();
  rclient.hmset(upload_id, {progress: 0});
  callback(upload_id);
};

exports.exists = function(upload_id) {
  var result = false;
  rclient.hmget(upload_id, "path", function(err, val) {
    if (val[0]) {
      result = true;
    }
  });
  return result;
};

exports.publish_upload = function(req, files, callback) {
  var upload_id = req.params.id;
  var pub_dir = '/uploads/' + upload_id + '/';
  var save_dir = './public' + pub_dir;
  var save_uri = save_dir + files.file.name;
  var pub_uri = pub_dir + files.file.name;

  rclient.exists(upload_id, function(err, exist) {
    if (exist) {
      // Make new directory with id to public/uploads
      fs.mkdir(save_dir, '0775', function(err, stats) {
        if (err) {
          callback('invalid_id');
        } else {
          // Move the file to the upload dir
          fs.writeFile(save_uri, fs.readFileSync(files.file.path), function(err) {
            fs.unlinkSync(files.file.path);
            if (!err) {
              rclient.hmset(upload_id, {progress: 1, path: pub_uri});
            }
            callback(err);
          });
        }
      });
    } else {
      callback('invalid_id');
      upload.respond_error_invalid_id(res);
    }
  });
};

exports.update_progress = function(upload_id, value, callback) {
  rclient.hmset(upload_id, value);
};

exports.rm_tmp_file = function(path) {
  fs.unlinkSync(path);
};

exports.info = function(upload_id, callback) {
  rclient.exists(upload_id, function(err, exist) {
    if (exist) {
      rclient.hmget(upload_id, "progress", "path", function(err, val) {
        callback(err, val);  
      });
    } else {
      callback('invalid_id');
    }
  });
};

exports.insert_comment = function(req, callback) {
  var upload_id = req.params.id;
  var comment = req.body.comment != '' ? sanitizer.escape(req.body.comment) : 'No comment';

  rclient.exists(upload_id, function(err, exist) {
    if (err) {
      callback(err);
    } else if (exist) {
      rclient.hmset(upload_id, {comment: comment});
      callback();
    } else {
      callback(err);
    }
  });
};

exports.display = function(upload_id, callback) {
  rclient.exists(upload_id, function(err, exist) {
    if (exist) {
      rclient.hmget(upload_id, "path", "comment", function(err, val) {
        callback(err, val[0], val[1]);
      });
    } else {
      callback(err);
    }
  });
};

// Private

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
};

function generate_id() {
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
};

