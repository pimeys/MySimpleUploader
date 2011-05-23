file_upload = {
  timer: null,
  upload_id: null,
  initialize: function(files) {
    $('#file_upload_form').submit(function(evt) {
      file_upload.progress_updater();
    });
    $('#file_input').change(function() {
      $('#file_upload_form').attr('target', 'upload_target');
      $.ajax({
				url: '/init',
				success: function(data) {
					$('#file_upload_form').attr('action', '/' + data);
					file_upload.upload_id = data;
					$('#file_upload_form').submit();
					$('#upload_progress').removeClass('hidden');
					$('#comment_form').removeClass('hidden');
					$('#file_input').attr('disabled', 'disabled');
				}
			});
    });
  },
  progress_updater: function() {
    $.ajax({
      url: '/status/' + file_upload.upload_id,
      success: function(data) {
				var percentage = Math.round(parseFloat(data.progress) * 100);
				$('#upload_progress').text('Status: ' + percentage + '%');
				if (percentage < 100) {
					file_upload.timer = setTimeout("file_upload.progress_updater()", 1000);
				} else {
					$('#link_to_file').attr('href', data.path);
					$('#upload_progress').addClass('hidden');
					$('#upload_progress').text('Status: 0%');
					$('#link_to_file').removeClass('hidden');
					$('#submit_comment').removeClass('hidden');
					$('#comment_form').attr('action', '/comment/' + file_upload.upload_id);
				}
      }
    });
  }
}

$(document).ready(function() {
  file_upload.initialize()
});
