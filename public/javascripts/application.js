helpers = {
  s4: function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  },
  guid: function() {
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4()
  }
}

file_upload = {
  file_input: '#file_input',
  form: '#file_upload_form',
  iframe: 'upload_target',
  // Events
  initialize: function(files) {
    // File selected
    $(this.file_input).change(function() {
	$(file_upload.form).attr('target', file_upload.iframe);
	$(file_upload.form).submit();
    });
  }
}

$(document).ready(function() {
  file_upload.initialize()
});
