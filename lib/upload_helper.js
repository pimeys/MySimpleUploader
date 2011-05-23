var sys = require('sys');

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

exports.generate_id = function() {
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
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
