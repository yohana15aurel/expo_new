import { EVENTS } from '../constants';
import { isLoggedIn, changeUserProfile } from './login';
import { api, storage, pubSub, debugLog } from '../services';
import * as responseModal from './response-modal';

let _listMeeting = {};

function  _changeMeetingPopup(boothId) {

  api.get({
    $target: $('#public-meeting'),
    url: '/QueryHotspotsByExhibitor',
    request: JSON.stringify({
      exhibitorId: boothId
    }),
    method: 'POST',
    onReceived: function onReceived($target, result) {
      if(result.Status == true){
        var data = JSON.parse(result.Data);
        _listMeeting[boothId] = data.meetingReps;
        updateMeetingInterface(data.meetingReps)
      }


    }
  });

  function updateMeetingInterface(listMeeting){
    var $modal = $('#public-meeting');
    var $container = $modal.find('.representative-list');
    var html = [];
    var count = $.isArray(listMeeting) ? listMeeting.length : 0; // Render meeting

    var $privateMeetingRep = $(".form-private_meeting").find(".select-representative")
    var privateMeetingHtml = [];


    if(count == 0){
      privateMeetingHtml.push('<option value="0" disabled selected>meeting representative is not available</option>')
      $("#public-meeting").find(".title-popup").html("There is no representative in this exhibitor")
    } else {
      $("#public-meeting").find(".title-popup").html("Select one of our representative")
    }

    $.each(listMeeting, function (i, meeting) {
      var id = meeting.id;
      var name = meeting.name;
      var image = meeting.profileImage;
      var url = meeting.publicMeetingUrl;
      var repId  = url.split("?")[0];
      var status = meeting.status;
      var participant = -1;

      repId = repId.split("/")[3];

      participant = getMeetingParticipant(url, repId)

      if (url.indexOf("https://") == -1) {
        url = url.replace("http://", "https://");
      }

      // change private meeting representative select option
      if(i == 0){
        privateMeetingHtml.push('<option value="'+meeting.id+'" selected>'+meeting.name+'</option>')
      } else {
        privateMeetingHtml.push('<option value="'+meeting.id+'">'+meeting.name+'</option>')
      }

      var classDot = "default";
      var buttonJoin = "default";

      if (status == "Available"){
        classDot = "green-dot"
        buttonJoin = "btn-join"
        if(participant >= 10){
          status = "Full"
          classDot = "red-dot"
          buttonJoin = "btn-join_off"
        }
      }
      else if (status == "Offline") {
        classDot = "red-dot"
        buttonJoin = "btn-join_off"
      }
      else {
        classDot = "gray-dot"
        buttonJoin = "btn-join_off"
      }



      html.push('<div class="representative">')
        html.push('<div class="row">')
          html.push('<div class="col-lg-8 col-md-8 col-sm-8 col-xs-8">')
            html.push('<div class="speaker-img">')
              html.push('<img src="' + image + '" alt="meeting representative image">')
              html.push('<div class="status-speaker">')
                html.push('<p>'+name+'</p>')
                html.push('<div class="'+classDot+'">')
                  html.push('<span>'+status+'</span>')
                html.push('</div>')
                if(status == "Available"){
                  html.push('<div class="participant">')
                    html.push("participant(s) : " + participant + " / 10")
                  html.push('</div>')
                }
              html.push('</div>')
            html.push('</div>')
          html.push('</div>')
          html.push('<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">')
            if(status == "Available" && participant < 10){
             html.push('<button class="'+ buttonJoin +'" id="join-meeting" type="submit" data-id="'+repId+'" data-status="'+status+'" data-url="' + url + '"> JOIN </button>')
            }
          html.push('</div>')
        html.push('</div>')
      html.push('</div>')


      if (i < count - 1) {
        html.push('<hr>');
      }
    });

    var meetingIframe = window.meetingIframe ? window.meetingIframe : {};
    $privateMeetingRep.html(privateMeetingHtml.join(''))
    $container.html(html.join(''));

    addMeetingJoinEvent();
    _updateAvailableTimeOption();
  }

}

function addMeetingJoinEvent(){
  var $modal = $('#public-meeting');
  var $container = $modal.find('.representative-list');

  $container.find('.btn-join').on('click', function (e) {
    var repId = $(this).attr("data-id");
    var url = $.trim($(this).attr('data-url'));
    var participant = getMeetingParticipant(url, repId)
    if (meetingIframe.getActiveUrl() == url) {
      return;
    }
    if(participant < 10){
      meetingIframe.showMeeting(url);
    } else { showResponseModal("Sorry, representative is currently full") }

    var $meetingBox = $(".jitsi-holder")

    var initialLeftPosition = $meetingBox.position().left
    var initialTopPosition = $meetingBox.position().top


    $meetingBox.attr("data-left", initialLeftPosition);
    $meetingBox.attr("data-top", initialTopPosition);

    var updateMeetingStatus = setTimeout(function() {
      _changeMeetingPopup(_listExhibitorId[_boothPositionIndex]);
      clearTimeout(updateMeetingStatus);
    }, 15  * 1000);

  });

  $container.find('.btn-join_off').on('click',function(e) {
    var status = $(this).attr("data-status");
    _showResponseModal("Sorry, representative is currently " + status);
  });
}

function _addUpdateParticipantEvent() {

  var $btnExitMeeting = $(".btn-exitmeeting")
  var $btnExitMeetingMobile = $(".btn-exitmeeting_mobile")

  var updateTimeout = setInterval(function() {
    _changeMeetingPopup(_listExhibitorId[_boothPositionIndex]);
  }, 30  * 1000);

  $btnExitMeeting.click(function (e) {
    var updateMeetingStatus = setTimeout(function() {
      _changeMeetingPopup(_listExhibitorId[_boothPositionIndex]);
      clearTimeout(updateMeetingStatus);
    }, 2  * 1000);
  });

  $btnExitMeetingMobile.click(function (e) {
    var updateMeetingStatus = setTimeout(function() {
      _changeMeetingPopup(_listExhibitorId[_boothPositionIndex]);
      clearTimeout(updateMeetingStatus);
    }, 2  * 1000);
  });

}

function getMeetingParticipant(url, repId){
  var urlDomain = url.split("/")[2];
  var getParticipantUrl = "https://"+urlDomain+"/api/room-participant?roomname=" + repId
  var participant = -1;


  $.ajax({
    async: false,
    type: "GET",
    url: getParticipantUrl,
    contentType: false,
    processData: false,
    success: function (data) {
      var parsedData = JSON.parse(data);
      participant = parsedData["participants"]
      console.log("participant meeting check ", getParticipantUrl, participant);


    }
  });
  return participant;
}

function _initDraggableMeetingBox(){
  var $meetingBox = $(".jitsi-holder")


  $meetingBox.draggable({
    axis:"x",
    handle:".btn-drag",
    containment: ".exhibition-layout",
    stop: function( event, ui ) {
      var $meetingBox = $(".jitsi-holder")

      var currentLeftPosition = ui.position.left
      var currentTopPosition = ui.position.top

      var $toggleButton = $meetingBox.find(".toggle-buttons")
      var $toggleButtonRight = $meetingBox.find(".toggle-buttons-right")

      $meetingBox.attr("data-left", currentLeftPosition);
      $meetingBox.attr("data-top", currentTopPosition);

      if(currentLeftPosition < 390){
        $toggleButton.attr("class","toggle-buttons-right")
      } else {
        $toggleButtonRight.attr("class","toggle-buttons")
      }
    },

  })
}


function autoCloseMeetingPopup() {
  $(".btn-exitmeeting").trigger("click")
  $(".btn-exitmeeting_mobile").trigger("click")
}


function _closePopups() {
  $('#public-meeting, #vid-pop-up1, .modal-popup').hide(0);
}

function init() {
  _addUpdateParticipantEvent();
  _initDraggableMeetingBox();
}

export { init, _closePopups, _changeMeetingPopup, autoCloseMeetingPopup };
