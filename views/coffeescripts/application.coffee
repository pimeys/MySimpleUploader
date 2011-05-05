updateProgress = (evt) ->
  if evt.lengthComputable
    percentComplete = evt.loaded / evt.total
  else
    percentComplete = 0

transferComplete = (evt) ->
  alert "Transfer complete"

transferFailed = (evt) ->
  alert "Error"

transferCanceled = (evt) ->
  alert "Canceled"

$ ->
  $('#file_upload').click () ->
    req = new XMLHttpRequest
    req.addEventListener "progress", updateProgress, false
    req.addEventListener "load", transferComplete, false
    req.addEventListener "error", transferFailed false
    req.addEventListener "abort", transferCanceled, false

