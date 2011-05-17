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
      $(file_upload.form).attr('target', file_upload.iframe);
      $.ajax({
	url: '/init',
	success: function(data) {
	  $(file_upload.form).submit();
	}
      });
    });
  },
  progress_updater: function() {
    $.ajax({
      url: '/status',
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
