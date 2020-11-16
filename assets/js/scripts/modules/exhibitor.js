import { EVENTS } from '../constants';
import {_changeMeetingPopup, _closePopups, autoCloseMeetingPopup} from './public-meeting';
import { api, storage, pubSub, debugLog } from '../services';
import * as responseModal from './response-modal';

let _boothPositionIndex = 0,
_listExhibitorId = [],
_listExhibitor = {},
_listBoothOrder = [];


function variableInitiation() {
  // Api GET list Exhibitors
  var getListExhibitor = api.get({
    $target: $('#open-viewListing').find('.map-images').find('.row'),
    url: '/QueryExhibitors',
    request: {},
    method: 'POST',
    onReceived: function onReceived($target, data) {
      var datas = JSON.parse(data.Data);
      $target.html("");
      $.each(datas, function (index, item) {
        _addBoothToViewListing(item, $target);
      });
     /**
     * @TODO
        _getAllBoothPosterAndVideos(_listExhibitorId);
     */
      _AddViewListingClickEvent();
      _nextOrPrevBooth();
    }
  });
}

// add change booth function and event

function _changeBooth(boothId) {
  var $iframe = $('#booth-frame');
  var localVerge
  window.verge = undefined;

  var boothIndex = _listExhibitorId.indexOf(boothId);
  var boothType = _listBoothOrder[boothIndex];

  if(boothIndex != -1){
    var exhibitor = _listExhibitor[parseInt(boothId)]
    var exhibitorUrl = exhibitor.exhibitor_booth_url;
    $iframe.attr('src', exhibitorUrl);
  } else {
    $iframe.attr('src', "./../xpo/booths/" + boothType + "/" + boothType + ".html");
  }

  if(document.location.hostname == "localhost") {
    $iframe.attr('src', "./../xpo/booths/" + boothType + "/" + boothType + ".html");
  }

  _boothPositionIndex = boothIndex;

  var checkVerge = setInterval(function () {
    if(window.verge != undefined){
      localVerge = window.verge
      clearInterval(checkVerge)
      // _changeBoothHotspotThumbnail(boothId)
    }
  }, 200)

  _closePopups();

  // _changeImagePopUp(boothId);

  // _changeVideoPopUp(boothId);

  // _updateBookmarkIcon();

  // _changeMeetingPopup(boothId);

  // _updateUserVisitHistory(boothId);

  _changeSidebarCompanyNameAndId(boothId);

  autoCloseMeetingPopup();

}

function _addBoothToViewListing(item, $target) {
  _listExhibitorId.push(item.id);
  _listExhibitor[item.id] = item;
  _listBoothOrder.push(item.booth_type);

  var booth_logo = item.logo;
  var booth_thumbnail = item.booth_thumbnail;

  if (booth_logo == undefined || booth_logo == null) {
    booth_logo = './../assets/images/listing_1.png';
  }

  if (booth_thumbnail == undefined || booth_thumbnail == null) {
    booth_thumbnail = './../assets/images/BOOTH 3D-Perspective-4.jpg';
  }

  var html = [];
  html.push('<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">');
  html.push('<div class="images-booth">');
  html.push('<div class="content-overlay"></div>');
  html.push("<img class=\"content-image \" src=\"" + booth_thumbnail + "\" alt=\"booth1\">");
  html.push('<div class="content-details fadeIn-top">');
  html.push("<img class=\"img-click\" src=\"" + booth_logo + "\" alt=\"listing\" id=\"booth" + item.booth_type + "\" data-booth=\"" + item.booth_type + "\" data-id=" + item.id + ">");
  html.push('</div>');
  html.push('</div>');
  html.push('</div>');
  $target.append(html.join(''));
}

function _AddViewListingClickEvent() {

  $(".view-listing").on("click", function () {
    // autoCloseMeetingPopup();
  });

  $('.img-click').on("click", function () {
    var boothId = $(this).data("id");

    _changeBooth(boothId);

    $('#open-viewListing').modal('hide');
  });
}

// add event when prev button click

function _nextOrPrevBooth() {
  var next = $('#next_button');
  var prev = $('#prev_button');
  var iframe = $('#booth-frame'); // inital default displayed booth

  _changeBooth(_listExhibitorId[0]); // addEvent for next and prev button


  next.on('click', function () {
    _boothPositionIndex++;

    if (_boothPositionIndex >= _listExhibitorId.length) {
      _boothPositionIndex = 0;
    }

    var boothId = _listExhibitorId[_boothPositionIndex];

    _changeBooth(boothId);
  });
  prev.on('click', function () {
    _boothPositionIndex--;

    if (_boothPositionIndex < 0) {
      _boothPositionIndex = _listExhibitorId.length - 1;
    }

    var boothId = _listExhibitorId[_boothPositionIndex];

    _changeBooth(boothId);
  });
}

function _addViewmapHotspotClickEvent() {
  $('.spotClick').click(function () {
    var boothLinkIndex = parseInt($(this).data("id")) - 1;
    var boothType = boothLink[boothLinkIndex].split("/")[4];

    var boothTypeIndex = _listBoothOrder.indexOf(boothType); // if booth selected is dont have any exhibitor / there is no exhibitor using this booth in api


    if (boothTypeIndex == -1) {
      $canvas = $('#canvas');
      $iframe = $canvas.find('iframe');
      $iframe.attr('src', boothLink[boothLinkIndex]);
      responseModal.show("there is no exhibitor using this booth in api/portal. poster, videos, sidebar company name displayed is only template");
    } else {
      var exhibitorId = _listExhibitorId[boothTypeIndex];

      _changeBooth(exhibitorId);
    }

    $('#open-viewMap').modal('hide');
  });
}

// function add click event to view lisitng booth thumbnail
function _changeSidebarCompanyNameAndId(exhibitorId){

  $('#booth-frame').load(function(){
    var exhibitor = _listExhibitor[exhibitorId];
    var exhibitorName = exhibitor.name;
    var exhibitorBoothNumber = exhibitor.booth_number;
    var exhibitorBoothType = exhibitor.booth_type;

    var $companyNameSidebar = $("#booth-frame").contents().find(".nav-menu");
    var $exhibitorName = $companyNameSidebar.find(".exhibitorName");
    var $exhibitorId = $companyNameSidebar.find(".exhibitorId");

    if($exhibitorId.length != 0){
      $exhibitorId.remove()
    }

    if($exhibitorName.length != 0){
      $exhibitorName.remove()
    }

    $("#booth-frame").contents().find(".nav-menu").find("li:first-child").html("");

    $companyNameSidebar.prepend("<li class='exhibitorId'>"+exhibitorId+"-"+exhibitorBoothType+"-"+exhibitorBoothNumber+"</li>")
    $companyNameSidebar.prepend("<li class='exhibitorName'>"+exhibitorName+"</li>")

    $exhibitorName = $companyNameSidebar.find(".exhibitorName");
    $exhibitorId = $companyNameSidebar.find(".exhibitorId");

    var $pink =  "#D0667A"

    $exhibitorId.css("color",$pink)
    $exhibitorName.css("font-weight","bold")

  });
}




function init() {
  variableInitiation();
  _addViewmapHotspotClickEvent();
  window._changeBoothViewMapFunc =  function _addViewmapHotspotClickEvent(boothType) {

    // var boothLinkIndex = parseInt($(this).data("id")) - 1;
    var boothTypeIndex = _listBoothOrder.indexOf(boothType); // if booth selected is dont have any exhibitor / there is no exhibitor using this booth in api
    var boothSrc = './../xpo/booths/'+boothType+'/'+boothType+'.html';

    if (boothTypeIndex == -1) {
      // $canvas = $('#canvas');
      // $iframe = $canvas.find('iframe');
      // $iframe.attr('src', boothSrc);

      _showResponseModal("Sorry, currently there is no exhibitor using this booth");

    } else {
      var exhibitorId = _listExhibitorId[boothTypeIndex];
      var exhibitor = _listExhibitor[exhibitorId]
      updateMapplicTooltip(exhibitor)
      // _changeBooth(exhibitorId);
    }

    // $('#open-viewMap').modal('hide');
    function updateMapplicTooltip(exhibitor){

      var exhibitorName = exhibitor.name;
      var exhibitorBoothNumber = exhibitor.booth_number;
      var exhibitorId = exhibitor.id;
      var exhibitorBoothType = exhibitor.booth_type;

      var boothId = "Booth " + exhibitorBoothType;

      var $mapplicTooltipContent = $(".mapplic-tooltip:not(.mapplic-hovertip)").find(".mapplic-tooltip-content");

      $mapplicTooltipContent.find(".mapplic-tooltip-title").html(exhibitorName)
      $mapplicTooltipContent.find(".mapplic-tooltip-description").html(boothId + '<button class="btn-visit-exhibitor" id="btn-visit-exhibitor" type="submit" data-id="'+exhibitorId+'"> Visit </button>')


      var $visitBtn = $mapplicTooltipContent.find(".mapplic-tooltip-description").find(".btn-visit-exhibitor");
      $visitBtn.click(function (e) {

        var exhibitorId = parseInt($(this).attr("data-id"))


        _changeBooth(exhibitorId)
        $("#open-viewMap").modal("hide")
      })

    }

  }
}

export { init };
