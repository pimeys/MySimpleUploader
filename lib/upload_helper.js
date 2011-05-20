function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

exports.generate_id = function() {
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

exports.parse_id = function(url) {
  return url.split('=')[1].replace(/[\/.$\\*~<>|]/gi, '');
}
