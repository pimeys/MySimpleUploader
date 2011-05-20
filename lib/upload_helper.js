var sys = require('sys');

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

exports.generate_id = function() {
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

exports.parse_id = function(url) {
  return url.split('=')[1].replace(/[\/.$\\*~<>|]/gi, '');
}

exports.error_invalid_id = function(res) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.write('invalid id');
  res.end();
}

exports.success_file_received = function(res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('received upload');
  res.end();
}

exports.respond_progress = function(res, progress) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(progress);
  res.end();
}

exports.respond_id = function(res, id) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(id);
  res.end();
}
