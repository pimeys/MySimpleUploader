exports.error_invalid_id = function(res) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.write('invalid id');
  res.end();
};

exports.error = function(res, err) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.write(err);
  res.end();
};

exports.ok = function(res) {
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end('OK');
};

exports.progress = function(res, upload_status) {
  var response = {'progress': upload_status[0], 'path': upload_status[1]};
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(response));
  res.end();
};

exports.id = function(res, id) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(id);
  res.end();
};

exports.not_found = function(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404: Not found');
};
