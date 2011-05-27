file_upload = {
  upload_id: null,
  timer: null,
  initialize: function(files) {
    $('#file_upload_form').submit(function() {
      file_upload.timer = setInterval(function() { progress_updater(); }, 1500);
    });
    $('#file_input').change(function() {
      initialize_and_start_upload();
    });
  }
}

function initialize_and_start_upload(data) {
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
}

function progress_updater() {
  var upload_status = get_upload_status(file_upload.upload_id);
  var percentage = Math.round(parseFloat(upload_status.progress) * 100);
  if (percentage < 100) {
    $('#upload_progress').text('Status: ' + percentage + '%');
  } else if (percentage == 100 && !upload_status.path) {
    $('#upload_progress').text('Status: finalizing...');
  } else {
    upload_ready(upload_status);
  }
}

function upload_ready(upload_status) {
  clearInterval(file_upload.timer);
  $('#link_to_file').attr('href', upload_status.path);
  $('#upload_progress').addClass('hidden');
  $('#upload_progress').text('Status: 0%');
  $('#link_to_file').removeClass('hidden');
  $('#submit_comment').removeClass('hidden');
  $('#comment_form').attr('action', '/comment/' + file_upload.upload_id);
}

function get_upload_status(id) {
  var upload_status = null;

  $.ajax({
    url: '/status/' + id,
    async: false,
    cache: false,
    success: function(data) {
      upload_status = data;
    }
  });

  return upload_status;
}

