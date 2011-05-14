helpers = {
  
  s4: function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  },
  guid: function() {
    return this.s4() + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + this.s4() + this.s4()
  },
}

file_upload = {
  file_input: '#file_input',
  form: '#file_upload_form',
  iframe: 'upload_target',
  progress_field: '#upload_progress',
  timer: null,
  upload_id: null,
  // Events
  initialize: function(files) {
    $(file_upload.form).submit(function(evt) {
      file_upload.progress_updater();
    });
    // File selected
    $(this.file_input).change(function() {
      file_upload.upload_id = helpers.guid();
      $('#upload_id').val(file_upload.upload_id);
      $(file_upload.form).attr('target', file_upload.iframe);
      $(file_upload.form).attr('action', '/?id=' + file_upload.upload_id);

      file_upload.progress_updater();
      $(file_upload.form).submit();
    });
  },
  progress_updater: function() {
    $.ajax({
      url: '/status?id=' + file_upload.upload_id,
      success: function(data) {
	var percentage = Math.round(parseFloat(data) * 100);
	$(file_upload.progress_field).text(percentage + '%');
	if (percentage < 100) {
	  file_upload.timer = setTimeout("file_upload.progress_updater()", 1000);
	}
      }
    });
  }
}

$(document).ready(function() {
  file_upload.initialize()
});
