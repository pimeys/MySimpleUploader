// Public class
function Data() {
  this.foo = "bar";
}

// Exports
exports.Data = Data;

// Private functions
function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

// Public functions
Data.prototype.generate_id = function() {
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}
