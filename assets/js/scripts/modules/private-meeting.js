import { EVENTS } from '../constants';
import { isLoggedIn, changeUserProfile } from './login';
import { api, storage, pubSub, debugLog } from '../services';
import * as responseModal from './response-modal';

let _listMeeting = {};

  // PRIVATE MEETING

  function _addPrivateMeetingFormSubmitEvent() {
    var $privateMeetingForm = $("#private-meeting").find(".form-private_meeting");

    $privateMeetingForm.submit(function (e) {
      e.preventDefault();

      var currentExhibitorId = _listExhibitorId[_boothPositionIndex];
      var formData = {};

      var date = $(this).find("#date").val()
      var time = $(this).find("#time").val()

      formData["startDate"] = date + " " + time;
      formData["agenda"] = $(this).find("#agenda").val();
      formData["company"] = $(this).find("#company").val();
      formData["exhibitorId"] = currentExhibitorId;
      formData["meetingRepId"] = $(this).find("#select-representative").val();

      if(isLoggedIn()){
        var user = getLoggedUser().userProfile;
        var userId = getLoggedUser().userId;
        formData["visitorId"] = userId;
      } else {
        formData["firstName"] = $(this).find("#first-name").val();
        formData["lastName"] = $(this).find("#last-name").val();
        formData["title"] = $(this).find("#form-title").val();
        formData["email"] = $(this).find("#email").val();
        formData["phone"] = $(this).find("#phone").val();
        formData["country"] = $(this).find("#select-country-private-meeting").val();
        formData["designation"] = $(this).find("#designation").val();

      }


      reqPrivateMeeting(formData);

      function formatDate(date){
        // date format = MM/dd/yyyy
        var splitDate = date.split("-")
        var year = splitDate[0]
        var day = splitDate[1]
        var month = splitDate[2]


        // required date format = MM/dd/yyyy
        var formattedDate =   day + "/" + month + "/" + year

        return formattedDate
      }



    })
  }

  function _updateRequestMeetingFormByUserLoginStatus(){
    if(isLoggedIn()){
      $contactInformation.remove()
    } else {

      var $privateMeetingForm = $("#private-meeting").find("form")
      var $contactInformationSection = $privateMeetingForm.find(".contact-information")
      var $submitDiv = $privateMeetingForm.find(".submit");

      if($contactInformationSection.length == 0){
        $contactInformation.insertBefore($submitDiv)
        _changeTitleDropdown();
        _changeCountryDropdown()
      }


    }
  }

  function reqPrivateMeeting(formData){
    var requestPrivateMeeting = api.get({
      $target: $(".form-login"),
      url: '/CreateMeetingForVisitor3D',
      request: JSON.stringify(formData),
      method: 'POST',
      onReceived: function onReceived($target, response) {
        if (response.Status == false) {
          _showResponseModal("Request private meeting fail : " + response.Message);
        } else {
          _showResponseModal("Private meeting successfully requested ");
        }
        $("#private-meeting").modal("hide")
      }
    });

  }

  function _changeRequestFormDateOption(startDate, endDate){

    var parsedStartDate = new Date(Date.parse(startDate.split(" ")[0]))
    var parsedEndDate = new Date(Date.parse(endDate.split(" ")[0]))


    var tempDate = new Date(parsedStartDate);
    var listDateToAdd = [];

    var $dateSelector = $("#date");
    var html = [];

    $dateSelector.html("");


    while(tempDate <= parsedEndDate){
      var newDate = new Date(tempDate);
      listDateToAdd.push(newDate);
      tempDate.setDate(tempDate.getDate() + 1);
    }

    $.each(listDateToAdd, function (index, dates) {
      var date = ("0" + (dates.getDate())).slice(-2);
      var month = dates.toLocaleString('en-GB', { month: 'long' });
      var year = dates.getFullYear();

      var dateStr = date + " " + month + " " + year
      var monthInt = ("0" + (dates.getMonth() + 1)).slice(-2);
      // var dateValue = year + "-" + monthInt + "-" + date + "";
      var dateValue = monthInt + "/" + date + "/" + year + "";

      (function addTemplate(){
        if(index == 0){
          html.push('<option value="'+dateValue+'" selected>'+dateStr+'</option>');
        } else {
          html.push('<option value="'+dateValue+'" >'+dateStr+'</option>');
        }
      })()

    });

    $dateSelector.html(html.join(""));

  }

  function _updateAvailableTimeOption(){

    var $time = $("#appt");
    var $selectRepInput = $("#select-representative");
    var $selectDateInput = $("#date");

    var dateSelected = $selectDateInput.val();
    var meetRepId = $selectRepInput.val();
    var exhibitorId = _listExhibitorId[_boothPositionIndex];


    getAvailableTime(meetRepId, dateSelected);

    function getAvailableTime(meetRepId, dateSelected){
      var getAvailableTime = api.get({
        $target: $('#appt'),
        url: '/GetAvailableTimeOfMeetingRepBySelectDateFrom3d',
        request: JSON.stringify({
          selectDate: dateSelected,
          meetingRepId: meetRepId,
          // exhibitorId: exhibitorId
        }),
        method: 'POST',
        onReceived: function onReceived($target, response) {
          if (response.Status == true) {
            var dates = JSON.parse(response.Data);
            var selectedTimelist = dates.times;
            updateOption(selectedTimelist)
          } else {}
        }
      });
    }

    function updateOption(listAvailableTime){
      var $time = $("#time");
      var html = [];
      $.each(listAvailableTime, function (index, time) {
        var timeStr = time.value;
        var timeIsSelected = time.isSelect;
        var timeValue = timeStr.slice(0,5);
        if(index == 0) {
        html.push('<option value="'+timeValue+'" selected>'+timeStr+'</option>');
        } else {
        html.push('<option value="'+timeValue+'">'+timeStr+'</option>');
        }
      });
      $time.html(html.join(""))
    }

  }

  function _addEventForUpdateAvailableEvent(){
    var $selectRepInput = $("#select-representative");
    var $selectDateInput = $("#date");
    var $btnRequest = $(".btn-request");

    $selectDateInput.change(function(){
      $this = $(this);
      _updateAvailableTimeOption();
    })

    $selectRepInput.change(function(){
      $this = $(this);
      _updateAvailableTimeOption();
    })

    $btnRequest.click(function (e) {
      $this = $(this);
      _updateAvailableTimeOption();
    });

  }

function init() {
  _addPrivateMeetingFormSubmitEvent();
  _updateRequestMeetingFormByUserLoginStatus();
  _addEventForUpdateAvailableEvent();
}

export { init, _changeRequestFormDateOption };
