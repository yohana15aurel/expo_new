function show(message) {
  var capMessage = message.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  var $responseModal = $("#action-response");
  $responseModal.find(".message").html(capMessage);
  $responseModal.modal("show");
}

export { show };
