var sys = require('sys');
var fs = require('fs');

// redis setup
var rclient = require('redis-node').createClient();
rclient.select(0);

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
}

exports.initialize = function(callback) {
  var upload_id = generate_id();
  rclient.hmset(upload_id, {progress: 0});
  callback(upload_id);
}

exports.respond_error_invalid_id = function(res) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.write('invalid id');
  res.end();
}

exports.respond_error = function(res, err) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.write(err);
  res.end();
}

exports.respond_ok = function(res) {
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end('OK');
}

exports.respond_progress = function(res, upload_status) {
	var response = {'progress': upload_status[0], 'path': upload_status[1]};
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(response));
  res.end();
}

exports.respond_id = function(res, id) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(id);
  res.end();
}

exports.respond_404 = function(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404: Not found');
}

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

generate_id = function() {
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

