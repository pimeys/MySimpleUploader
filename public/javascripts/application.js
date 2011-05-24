file_upload = {
  upload_id: null,
  initialize: function(files) {
    $('#file_upload_form').submit(function() {
      progress_updater();
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
  console.log(upload_status);

  if (percentage < 100) {
    $('#upload_progress').text('Status: ' + percentage + '%');
    setTimeout("progress_updater()", 1000);
  } else {
    upload_ready(upload_status);
  }
}

function upload_ready(upload_status) {
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
    success: function(data) {
      upload_status = data;
    }
  });

  return upload_status;
}

