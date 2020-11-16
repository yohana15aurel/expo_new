
/**
 * @author FXMEDIA Internet Pte. Ltd
 * @copyright (c) 2020 -- current
 */
(function ($) {
  /**
   * @module API
   * Abstract away window.WebAPI
   */
  //  WebApi base
  var api = function () {
    var BASE_URL = "/Umbraco/Api/Content";
    var WebAPI = window.WebAPI;
    var $window = $(window);
    var options = {
      $target: $window,
      baseUrl: (document.location.hostname == 'localhost' || document.location.hostname == 'fxm.web.id') ? 'https://dev.xpomania.com' + BASE_URL : BASE_URL,
      method: "GET",
      url: "",
      request: {},
      onBeforeRequest: function onBeforeRequest($target) {},
      onReceived: function onReceived($target, data) {},
      onError: function onError($target, error) {},
      onAfterRequested: function onAfterRequested() {},
      useCookie: false,
      cache: false,
      getImage: false
    };

    return {
      get: function get(userOptions) {
        var op = $.extend(true, {}, options, userOptions);
        WebAPI.GetData(op.$target, {
          baseUrl: op.baseUrl,
          url: op.url,
          request: op.request,
          method: op.method,
          onBeforeRequest: op.onBeforeRequest,
          onReceived: op.onReceived,
          onError: op.onError,
          onAfterRequested: op.onAfterRequested,
          useCookie: op.useCookie,
          cache: op.cache,
          getImage: op.getImage
        });
      },
      // The way to use it just like `.get` one, but wrapped in an array and
      // has a name (Must be unique!). Example:
      // moduleApi.multiple([
      //   {
      //     name: "blah...blah",
      //     options: {}
      //   },
      //   ...
      // ], function (responses) {})

      /*
          Real example:
          moduleApi.multiple([
            { name: "/GetAllLevels", options: { url: "/Umbraco/Api/Content/GetAllLevels" } },
            { name: "/GetAllModules", options: { url: "/Umbraco/Api/Content/GetAllModules" } },
          ], (r) => logger(r));
      */
      multiple: function multiple(listOfRequests, callback) {
        var module = this;
        var completed = {};
        var successCount = 0;
        var errorCount = 0;
        var totalRequests = 0;
        var requests = [];

        if (!$.isFunction(callback)) {
          callback = function callback() {};
        }

        $.each(listOfRequests, function (key, request) {
          if ($.isPlainObject(request) && request.name && $.isPlainObject(request.options) && typeof completed[request.name] == "undefined") {
            var name = request.name;
            var opts = $.extend(true, {}, options, request.options, {
              onReceived: function onReceived($t, response) {
                completed[name] = response;
                successCount += 1;
              },
              onError: function onError($t, response) {
                completed[name] = response;
                errorCount += 1;
              },
              onAfterRequested: function onAfterRequested() {
                if (totalRequests == successCount + errorCount) {
                  callback(completed);
                }
              }
            });
            totalRequests += 1;
            requests.push(opts);
          }
        });
        $.each(requests, function (key, request) {
          module.get(request);
        });
      },
      // The same as `.multiple` but this thing does sequentially instead of
      // concurrently
      sequent: function sequent(listOfRequests, callback) {
        var module = this;
        var completed = {};
        var successCount = 0;
        var errorCount = 0;
        var totalRequests = 0;
        var requests = [];

        if (!$.isFunction(callback)) {
          callback = function callback() {};
        }

        var next = function next() {
          module.get(requests.shift());
        };

        $.each(listOfRequests, function (key, request) {
          if ($.isPlainObject(request) && request.name && $.isPlainObject(request.options) && typeof completed[request.name] == "undefined") {
            var name = request.name;
            var opts = $.extend(true, {}, options, request.options, {
              onReceived: function onReceived($t, response) {
                completed[name] = response;
                successCount += 1;
              },
              onError: function onError($t, response) {
                completed[name] = response;
                errorCount += 1;
              },
              onAfterRequested: function onAfterRequested() {
                if (totalRequests == successCount + errorCount) {
                  callback(completed);
                } else {
                  next();
                }
              }
            });
            totalRequests += 1;
            requests.push(opts);
          }
        });
        next();
      }
    };
  }();

  var mapplic = function () {
    var MAP_SOURCE = '../assets/plugins/mapplic/venue.json';
    var $root;
    var $window;
    var mapDefaultOptions = {
      source: MAP_SOURCE,
      sidebar: false,
      minimap: false,
      markers: false,
      fillcolor: true,
      fullscreen: false,
      developer: false,
      mousewheel: true,
      maxscale: 2
    };
    var mapInstance;

    var attachEvents = function () {
      $root.on('mapready', function (e, self) {
        var viewportWidth = $window.width();

        if (viewportWidth < 330) {
          self.moveTo(0, 0.4, 0.33, 0);
        }

        if (viewportWidth < 480 && viewportWidth > 340) {
          self.moveTo(0, 0, 0.4, 0);
        }

        if (viewportWidth < 993 && viewportWidth > 490) {
          self.moveTo(0, 0.2, 0.9, 0);
        }

        if (viewportWidth < 1100 && viewportWidth > 994) {
          self.moveTo(0, 0.2, 1.1, 0);
        }

        if (viewportWidth < 3000 && viewportWidth > 1111) {
          self.moveTo(0, 0.26, 1.3, 0);
        }
      });
    };

    var init = function (userMapOptions) {
      $root = $("#floorPlan");

      if ($root.length == 0) {
        return;
      }

      attachEvents();

      $window = $(window);
      mapInstance = $root.mapplic($.extend(mapDefaultOptions, userMapOptions));
    };

    var getOption = function (key) {
      return mapDefaultOptions[key];
    };

    return {
      init: init,
      getOption: getOption
    };
  }();

  /**
   * @function zeroPad
   * This function transform: "2" to "002" if we call it like this:
   * `zeroPad(2, 3, '0')
   * @param {string} text Given string
   * @param {number} max maximum text length
   * @param {char} char character to be added to the left (default to 0)
   */
  var zeroPad = function (text, max, char) {
    text = typeof text != 'string' ? text.toString() : text;
    max = typeof max == 'undefined' ? 2 : ~~max;
    char = typeof char != 'string' ? '0' : char[0];
    var length = text.length;

    while (length < max) {
      text = char + text;
      length += 1;
    }

    return text;
  };

  var project = function () {
    var _data;

    _boothPositionIndex = 0, _listExhibitorId = [],
    _listExhibitor = {}, _listBoothOrder = [],
    _listPoster = {}, _listMeeting = {},
    _listBookmarkedContent = {}, _listVideos = {},
    _startDate = "", _dummyUserId = 1974,
    _autoLogoutInterval = {}, _listAgenda = {},
    _changeBoothViewMapFunc = "", defaultVideoThumbnail = "",
    _listTitle = {}, $contactInformation = $("#private-meeting").find(".contact-information");
    _changeExhibitorJsonDataFunc = "", _listCountryAndTimezone = {};
    // for hotspot click
    boothLink = ['./../xpo/booths/M01/M01.html', './../xpo/booths/M02/M02.html', './../xpo/booths/M03/M03.html', './../xpo/booths/M04/M04.html', './../xpo/booths/M05/M05.html', './../xpo/booths/M06/M06.html', './../xpo/booths/S01/S01.html', './../xpo/booths/S02/S02.html', './../xpo/booths/S03/S03.html', './../xpo/booths/SM01/SM01.html', './../xpo/booths/SS01/SS01.html', './../xpo/booths/L01/L01.html', './../xpo/booths/L02/L02.html', './../xpo/booths/L03/L03.html', './../xpo/booths/L04/L04.html'];

    function _variableInitiation() {
      // Api GET list Exhibitors
      var getListExhibitor = api.get({
        $target: $('#open-viewListing').find('.map-images').find('.row'),
        url: '/QueryExhibitors',
        request: {},
        method: 'POST',
        onReceived: function onReceived($target, data) {
          var datas = JSON.parse(data.Data);

          $target.html("");
          $.each(datas, function (index, exhibitor) {
            var status = exhibitor.exhibitor_status
            if(status == "Approved"){
              _listBoothOrder.push(exhibitor.booth_type);
              _addBoothToViewListing(exhibitor, $target);
            }
          }); // add event when prev button click

          _nextOrPrevBooth(); // nge get poster

          _getAllBoothPosterAndVideos(_listExhibitorId); // add event

          _AddViewListingClickEvent();

          _changeExhibitorJsonDataFunc = function changeLocationJson(data) {
            $.each(data.levels, function (index, level) {

              $.each(level.locations, function (index, location) {
                var boothType = location.title;
                var boothTypeIndex = _listBoothOrder.indexOf(boothType); // if booth selected is dont have any exhibitor / there is no exhibitor using this booth in api

                if (boothTypeIndex == -1) {
                  location["exhibitorName"] = boothType
                } else {
                  var exhibitorId = _listExhibitorId[boothTypeIndex];
                  var exhibitor = _listExhibitor[exhibitorId]
                  var exhibitorName = exhibitor.name;

                  location["exhibitorName"] = exhibitorName
                }
              });
            });

            return data;
          };

          $.getJSON(mapplic.getOption('source'), function (venue) {
            mapplic.init({
              source: _changeExhibitorJsonDataFunc(venue)
            });
          });
        }
      });

      var countdown = api.get({
        $target: $('#countdown'),
        url: '/GetEventSetting',
        request: {},
        method: 'POST',
        onReceived: function onReceived($target, result) {
          // change date format dd/mm/yyyy hh:mm to mm/dd/yyyy hh:mm

          var $countdownBanner = $('.countdown-banner');
          $countdownBanner.$title = $countdownBanner.find('.js-text-countdown-title');
          $countdownBanner.$subTitle = $countdownBanner.find('.js-text-countdown-subtitle');

          var data = JSON.parse(result.Data);

          defaultVideoThumbnail = data.defaultVideoThumbnail

          $countdownBanner.$title.html(data.title);
          $countdownBanner.$subTitle.html(data.description);

          var startDate = data.startDate.split('/');
          var dd = startDate[0];
          var mm = startDate[1];
          startDate[0] = mm;
          startDate[1] = dd;
          startDate = startDate.join("/");

          var endDate = data.endDate.split('/');
          dd = endDate[0];
          mm = endDate[1];
          endDate[0] = mm;
          endDate[1] = dd;
          endDate = endDate.join("/");

          _changeRequestFormDateOption(startDate,endDate);
          _countdown(startDate);
        }
      });
    }

    function zeroIfNegative(val) {
      return val < 0 ? 0 : val;
    }

    // Change Countdown time
    function _countdown(startDate) {
      let second = 1000;
      let minute = second * 60;
      let hour = minute * 60;
      let day = hour * 24;
      let countDown = new Date(Date.parse(startDate)).getTime();
      let elem_days = document.getElementById('days');
      let elem_hours = document.getElementById('hours');
      let elem_minutes = document.getElementById('minutes');
      let elem_seconds = document.getElementById('seconds');
      let countdown = $("#countdown");

      if (countdown.length != 0) {
        let checkCountdown = function (onFinished) {
          let now = new Date().getTime(),
          distance = countDown - now;
          elem_days.innerText = zeroIfNegative(Math.floor(distance / day));
          elem_hours.innerText = zeroIfNegative(Math.floor(distance % day / hour));
          elem_minutes.innerText = zeroIfNegative(Math.floor(distance % hour / minute));
          elem_seconds.innerText = zeroIfNegative(Math.floor(distance % minute / second));

          if (distance <= 0) {
            if ($.isFunction(onFinished)) {
              onFinished();
            }
          } else {
            setTimeout(checkCountdown, second);
          }
        };

        checkCountdown(function () {
          window.location.href = $('.btn-skip').attr('href');
        });
      }
    }


    // Exhibitor.js

    function _addBoothToViewListing(item, $target) {
      _listExhibitorId.push(item.id);
      _listExhibitor[item.id] = item;

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

    // FUNCTION THAT TRIGGER
    // BOOTH TO CHANGE

    // add change booth event

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
          _changeBoothHotspotThumbnail(boothId)
        }
      }, 200)

      _closePopups();

      _changeImagePopUp(boothId);

      _changeVideoPopUp(boothId);

      _updateBookmarkIcon();

      _changeMeetingPopup(boothId);

      _updateUserVisitHistory(boothId);

      _changeSidebarCompanyNameAndId(boothId);

      autoCloseMeetingPopup();

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

    function _AddViewListingClickEvent() {

      $(".view-listing").on("click", function () {
        // autoCloseMeetingPopup();
      });

      $('.img-click').on("click", function () {
        var boothId = $(this).data("id");

        _changeBooth(boothId);

        $('#open-viewListing').modal('hide');
      });
    } // function when next and previous booth button clicked


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



    // FUNCTION THAT HANDLE
    // DYNAMIC POSTER AND VIDEO POPUP

    // Dynamic Booth Poster and Videos
    function _getAllBoothPosterAndVideos(listBoothId) {
      var listLength = listBoothId.length
      $.each(listBoothId, function (index, boothId) {
        var listPosterAndVideos = _getBoothPosterAndVideos(boothId);
        _listPoster[boothId] = listPosterAndVideos.listPoster;
        _listVideos[boothId] = listPosterAndVideos.listVideos;

      });


    }

    function _getBoothPosterAndVideos(boothId) {

      var listPoster = [];
      var listVideos = [];
      api.get({
        $target: $('#countdown'),
        url: '/QueryHotspotsByExhibitor',
        request: JSON.stringify({
          exhibitorId: boothId
        }),
        method: 'POST',
        onReceived: function onReceived($target, result) {
          var hotspots = JSON.parse(result.Data);
          var listPosterAndVideos = hotspots.postersVideos;
          _listMeeting[boothId] = hotspots.meetingReps;

          // sort hotspot
          listPosterAndVideos.sort(function (a, b) {
            return a.sequence - b.sequence;
          });


          $.each(listPosterAndVideos, function (index, item) {
            // sort poster videos in each hotspot
            item.hotspots.sort(function (a, b) {
              return a.sequence - b.sequence;
            });

            if (item.type == "poster") {
              listPoster.push(item);
            } else {
              listVideos.push(item);
            }
          });
          // change image posters when first time loading (default)
          if (boothId == _listExhibitorId[0]) {
            _changeImagePopUp(boothId);

            _changeVideoPopUp(boothId);

          }

          if (boothId == _listExhibitorId[_listExhibitorId.length - 1]){
            _initiateSearchContent();
          }
        }
      });
      return {
        listPoster: listPoster,
        listVideos: listVideos
      };
    }



    // dynamic title name

    function _updateModalPopupTitleAndDesc() {
      _updateVideoTitle();

      _updatePosterTitle();

      function _updateVideoTitle() {
        var $modalPopup = $(".modal-popup_video:visible");
        var videoTitle = $modalPopup.find(".slick-active").find(".popup-video").data("title");
        var videoDesc = $modalPopup.find(".slick-active").find(".popup-video").data("desc");

        var modalTitle = $modalPopup.find(".modal-title");
        var modalDesc = $modalPopup.find(".modal-desc");

        modalTitle.html(videoTitle);
        modalDesc.html(videoDesc);

      }

      function _updatePosterTitle() {
        var $modalPopup = $(".modal-popup:visible");
        var posterTitle = $modalPopup.find(".slick-active").find(".popup-image").data("title");
        var posterDesc = $modalPopup.find(".slick-active").find(".popup-image").data("desc");
        var modalTitle = $modalPopup.find(".modal-title");
        var modalDesc = $modalPopup.find(".modal-desc");

        modalDesc.html(posterDesc);
        modalTitle.html(posterTitle);
      }
    }

    function _changeImagePopUp(boothId) {


      var listExhibitorPosterHotspot = _listPoster[boothId]; // make template when there is no poster uploaded / fewer than hotspots

      var $imgPopup = $(".modal-popup");
      $imgPopup.find(".modal-title").html("image not uploaded yet");
      $imgPopup.find('.modal-body').find('.slick-slider').html("");
      $imgPopup.find('.modal-footer').hide(); // looping every hotspot in booth

      var indexApprovedContent = 0;

      $.each(listExhibitorPosterHotspot, function (index, hotspot) {
        var html = [];
        var listPoster = [];
        var popupModalId = "#img-pop-up" + (indexApprovedContent + 1);
        var listPosterInHotspot = hotspot.hotspots;
        var posterStatus = hotspot.status;
        var $posterModal = $(popupModalId).find('.modal-body').find('.slick-slider'); // re-empty slick-slider to make it carousel again

        var posterIsAvailable = false;

        $posterModal.attr("class", "slick-slider");
        $posterModal.html("");

         // looping each poster in hotspot
        if(posterStatus == "Approved") {
          indexApprovedContent++
          $.each(listPosterInHotspot, function (index, poster) {
            posterStatus = poster.status
            if(posterStatus == "Approved") {
              posterIsAvailable = true
              html.push("<div><img class=\"popup-image\" src=\"" + poster.videoUrl + "\" alt=\"poster\" data-id=\"" + poster.id + "\" data-title=\"" + poster.title + "\" data-desc=\"" + poster.content + "\" ></div>");
              $(popupModalId).find(".button-fullscreen").attr('href',poster.videoUrl);
              listPoster.push(poster.videoUrl)
            }
          });
          $posterModal.append(html.join(''));
        }


        if (posterIsAvailable) {
          $(popupModalId).find(".modal-title").html(listPosterInHotspot[0].title);
          $(popupModalId).find(".modal-desc").html(listPosterInHotspot[0].content);
          var $modalFooter = $(popupModalId).find('.modal-footer').show();
          var $fullScreenButton = $(popupModalId).find(".button-fullscreen");

          $fullScreenButton.remove()

          var html_lightbox = []
          html_lightbox.push('<a href="'+listPoster[0]+'" class="buttons-social button-fullscreen setting-poster" title="" data-toggle="tooltip" data-placement="left">')
            html_lightbox.push('<img src="./../assets/images/fullscreen.svg" alt="more">')
          html_lightbox.push('</a>')

          $(popupModalId).find(".setting-btn").prepend(html_lightbox.join(""))


          _initiateLightbox($(popupModalId));
          _slick($posterModal);
        }
      });


    }


    function _changeVideoPopUp(boothId) {
      var listExhibitorVideosHotspot = _listVideos[boothId]; // make template when there is no videos uploaded / fewer than hotspots

      var $vidPopup = $(".modal-popup_video");
      $vidPopup.find(".modal-body").html("<div class='slick-slider'></div>");
      $vidPopup.find(".modal-title").html("video not uploaded yet");
      $vidPopup.find('.modal-body').find('.slick-slider').html("");
      $vidPopup.find('.modal-footer').hide();

      var indexApprovedContent = 0;

      $.each(listExhibitorVideosHotspot, function (index, hotspot) {
        var html = [];
        var popupModalId = "#vid-pop-up" + (indexApprovedContent + 1);
        var listVideoInHotspot = hotspot.hotspots;
        var $videoModal = $(popupModalId).find('.modal-body').find('.slick-slider');

        var videoStatus = hotspot.status;
        var videoIsAvailable = false

        if(videoStatus == "Approved"){
          indexApprovedContent++
          $.each(listVideoInHotspot, function (index, video) {
            videoStatus = video.status
            if(videoStatus == "Approved"){
              videoIsAvailable = true;
              var videoUrl = video.videoUrl;
              var youtubeId = getYoutubeID(videoUrl)
              if(youtubeId != ''){
                videoUrl = "https://www.youtube.com/embed/" + youtubeId
                html.push("<div><iframe class=\"popup-video\" width=\"100%\" src=\"" + videoUrl + "\" frameborder=\"0\"  allowfullscreen data-id=\"" + video.id + "\" data-title=\"" + video.title + "\" data-desc=\"" + video.content + "\" ></iframe></div>");
              } else {
                html.push("<div><video class=\"popup-video\" width=\"100%\" src=\"" + videoUrl + "\" frameborder=\"0\"  allowfullscreen controls data-id=\"" + video.id + "\" data-title=\"" + video.title + "\" data-desc=\"" + video.content + "\" ></video></div>");

              }
            }


          });
        }

        $videoModal.html(html.join(''));
        //change poster title shown
        if (videoIsAvailable) {
          $(popupModalId).find(".modal-title").html(listVideoInHotspot[0].title);
          $(popupModalId).find(".modal-desc").html(listVideoInHotspot[0].content);

          var $modalFooter = $(popupModalId).find('.modal-footer').show();

          _slick($videoModal);
        }



      });




    }

    function _changeBoothHotspotThumbnail(boothId) {
      var listExhibitorPosterHotspot = _listPoster[boothId];
      var listExhibitorVideoHotspot = _listVideos[boothId];
      var listReplacedTexture = verge.replacedTextures;

      $.each(listReplacedTexture, function (index, hotspot) {
        var hotspotType = hotspot[0];
        var matName = hotspot[0];
        var texName = hotspot[1];
        var hotspotNum = matName.slice(-2);

        // @handle Poster
        if (hotspotType.indexOf('Poster') != -1) {
          var blankSrc = "https://i.ibb.co/Pr2rKcC/Rectangle-1.png"
          var posterSrc = '';

          $.each(listExhibitorPosterHotspot, function (i, poster) {
            var posterNum = zeroPad(poster.sequence);

            if (poster.status == 'Approved' && hotspotNum == posterNum) {
              posterSrc = poster.videoUrl;
              return false;
            }
          });

          window.verge.replaceTexture(matName, texName, ((posterSrc != '') ? posterSrc : blankSrc), function() {});
        }

        // @handle Video
        else if (hotspotType.indexOf('Video') != -1 || hotspotType.indexOf('Screen') != -1) {
          var videoSrc = '';

          $.each(listExhibitorVideoHotspot, function (i, video) {
            var videoNum = zeroPad(video.sequence);

            if (video.status == 'Approved' && hotspotNum == videoNum) {
              videoSrc = video.videoUrl;
              return false;
            }
          });

          if (videoSrc != '') {
            window.verge.replaceTexture(matName, texName, verge.loadVideo(videoSrc), function() {});
            window.verge.playSound(verge.loadVideo(videoSrc), true);
            window.verge.volume(verge.loadVideo(videoSrc), 0);
          }
        }
      });
    }

    function _addStopVideoWhenModalClose(){
      var element = $(".modal-popup_video");
      var closebtn = element.find(".close");
      closebtn.click(function(){
        var $videoElement = element.find(".popup-video");
        $videoElement.each(function () {
          var videoSrc = $(this).attr("src")
          $(this).attr("src", videoSrc)
        })
      })
    }


    function _initiateLightbox(modalPopup){
      var $fullScreenButton = modalPopup.find(".button-fullscreen");
      var simpleLightBox = $fullScreenButton.simpleLightbox({});
      addFullscreenButtonClickEvent($fullScreenButton);

      function addFullscreenButtonClickEvent($fullscreenBtn){
        $fullscreenBtn.click(function (e) {
          var $btnClosed = $(".slbCloseBtn")
          $btnClosed.attr("title","close")
          $btnClosed.tooltip();

          $btnClosed.click(function(){
            var tooltipId = $(this).attr("aria-describedby")
            var $tooltip = $("#" + tooltipId)
            $tooltip.hide();
          })
        });
      }

    }

    function _updateFullscreenButtonHref(){
      var $modalPopup = $(".modal-popup:visible");
      var $posterImg = $modalPopup.find(".slick-active").find(".popup-image").attr("src");
      var $fullScreenButton = $modalPopup.find(".button-fullscreen");

      $fullScreenButton.remove()

      var html = []
      html.push('<a href="'+$posterImg+'" class="buttons-social button-fullscreen setting-poster" title="" data-toggle="tooltip" data-placement="left">')
        html.push('<img src="./../assets/images/fullscreen.svg" alt="more">')
      html.push('</a>')

      $modalPopup.find(".setting-btn").prepend(html.join(""))
      _initiateLightbox($modalPopup)
    }

    function getYoutubeID(url) {
      var ret = '';
      var trimmedUrl = $.trim(url);

      // the thing inside round bracket is youtube id
      var PATTERN = [
        /^https?:\/\/youtu\.be\/([a-zA-Z0-9_\-]{11})[^\s]{0,}$/,
        /^https?:\/\/www.youtube\.com\/watch\?v=([a-zA-Z0-9_\-]{11})[^\s]{0,}$/,
        /^https?:\/\/www.youtube\.com\/embed\/([a-zA-Z0-9_\-]{11})[^\s]{0,}$/
      ];

      $.each(PATTERN, function (k, vid) {
        if (vid.test(trimmedUrl)) {
          ret = trimmedUrl.replace(vid, '$1');
          return false;
        }
      });

      return ret;
    };

    // Handle download
    function _addDownloadClickEvent(){

      _addPosterDownloadClickEvent();

      function _addPosterDownloadClickEvent(){
        var $btnDownload = $(".modal-popup").find(".button-download")
        $btnDownload.on("click", function () {
          var $contentModal = $(".modal:visible");
          var $listPosterInActiveModal = $contentModal.find(".slick-slide").not('.slick-cloned').find(".popup-image");
          $listPosterInActiveModal.each(function(){
            $this = $(this);
            imgSrc = $this.attr("src");
            var fileName = $this.data("title");
            saveAs(imgSrc, fileName);
          })
        })
      }

    }


    // Video and Poster Popup

    function showPosterPopup(posterSrc, posterTitle, posterDesc){

      var $popupModal = $("#bookmark-poster-popup")
      var $popupModalBody = $popupModal.find(".modal-body");
      var $popupModalTitle = $popupModal.find(".modal-title");
      var $popupModalDesc = $popupModal.find(".modal-desc");

      var $popupModalFooter = $("#bookmark-poster-popup").find(".modal-footer");
      $popupModalFooter = $popupModalFooter.show();

      $popupModalBody.html("<div><img class=\"popup-image\" src=\"" + posterSrc + "\" alt=\"poster\"></div>");
      $popupModalTitle.html(posterTitle)

      if(posterDesc != undefined){
        $popupModalDesc.html(posterDesc)
      }

      $popupModal.modal("show");
    }

    function showVideoPopup(videoSrc, videoTitle, videoDesc){
      var $popupModal = $("#bookmark-video-popup")
      $popupModal.find(".modal-body").html("<div class='slick-slider'></div>");

      var $popupModalBody = $popupModal.find(".modal-body").find(".slick-slider");
      var $popupModalTitle = $popupModal.find(".modal-title");
      var $popupModalDesc = $popupModal.find(".modal-desc");

      $popupModalBody.html("<div><iframe class=\"popup-video\" width=\"100%\" src=\"" + videoSrc + "\" frameborder=\"0\"   allowfullscreen></iframe></div>");
      $popupModalTitle.html(videoTitle)

      var $popupModalFooter = $popupModal.find(".modal-footer");
      $popupModalFooter = $popupModalFooter.show();

      if(videoDesc != undefined){
        $popupModalDesc.html(videoDesc)
      } else { $popupModalDesc.html("") }

      $popupModal.modal("show");
      _slick($popupModalBody)
    }

    function _addVideoPopupCloseClickEvent(){
      var $popupModal = $("#bookmark-video-popup")
      var $closeBtn = $popupModal.find(".close")
      $closeBtn.click(function () {
        var $video = $popupModal.find(".popup-video");
        $video.attr("src","")
      });
    }



  // FUNCTION THAT HANDLE MEETING REP AND PRIVATE MEETING REQ

  // PUBLIC MEETING
    function  _changeMeetingPopup(boothId, fromSetInterval) {

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
            updateMeetingInterface(data.meetingReps, fromSetInterval)
          }


        }
      });

      function updateMeetingInterface(listMeeting, fromSetInterval){
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


          // Condition to make option in form not change by 15s interval  meeting status recheck event
          if(fromSetInterval != true){
            if(i == 0){
              privateMeetingHtml.push('<option value="'+meeting.id+'" selected>'+meeting.name+'</option>')
            } else {
              privateMeetingHtml.push('<option value="'+meeting.id+'">'+meeting.name+'</option>')
            }
          }


          if (i < count - 1) {
            html.push('<hr>');
          }
        });

        var meetingIframe = window.meetingIframe ? window.meetingIframe : {};

        // Condition to make option in form not change by 15s interval  meeting status recheck event
        if(fromSetInterval != true){
          $privateMeetingRep.html(privateMeetingHtml.join(''))
        }
        $container.html(html.join(''));

        addMeetingJoinEvent();
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
        _changeMeetingPopup(_listExhibitorId[_boothPositionIndex], true);
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
          formData["timezone"] = $(this).find("#select-timezone-private-meeting").val();
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

    function _addPrivateMeetingTimezoneUpdateEvent(){
      var $privateMeetingForm = $("#private-meeting").find(".form-private_meeting");
      var $selectCountry = $privateMeetingForm.find("#select-country-private-meeting");
      $selectCountry.change(function () {
        var $selectTimezone = $("#select-timezone-private-meeting");
        var countryVal = $selectCountry.val();
        var listTimezone = _listCountryAndTimezone[countryVal];
        var optionTimezone = []

        $.each(listTimezone, function (index, timezone) {
          var timezoneval = timezone.value;
          var timezonetext = timezone.text;

          optionTimezone.push("<option value='"+timezoneval+"'>"+timezonetext+"</option>")

        });

        $selectTimezone.html(optionTimezone.join(""));

      })
    }




    // FUNCTION THAT HANDLE
    // USER REGISTER AND LOGIN


    // register

    function _addFormRegisterSubmitEvent() {
      var $registerForm = $(".form-registration");
      var $registerFormInput = $registerForm.find("input");
      var $registerFormTitleInput = $registerForm.find(".title-register");
      var $registerFormCountryInput = $registerForm.find(".register-select-country");
      var $registerSubmitButton = $registerForm.find("#btn-reg");
      _addFormInputOnChangeEvent();

      $registerForm.submit(function (e) {
        e.preventDefault();
      });


      $registerSubmitButton.on("click", function () {
        formValidation();

        if ($registerForm[0].checkValidity() == true) {
          var userRawData = {};
          var user = {};
          $registerFormInput.each(function () {
            $this = $(this);
            var field = $this.attr("class");
            var value = $this.val();
            userRawData[field] = value;
          }); // change field (key) name to required name in api

          user["title"] = $registerFormTitleInput.val();
          user["firstName"] = userRawData["fname-regis"];
          user["lastName"] = userRawData["lname-regis"];
          user["email"] = userRawData["email-regis"];
          user["phone"] = userRawData["phone-regis"];
          user["country"] = $registerFormCountryInput.val();
          register(user);

          var regisForm = $('#open-register');
          regisForm.modal('hide');
        } else {}
      });

      function formValidation() {
        var isValid = true;
        var message = "";

        if (isValid) {
          (function confirmValidation() {
            var $baseEmail = document.getElementById("email-regis");
            var $confEmail = document.getElementById("conf-email");

            if ($baseEmail.value != $confEmail.value) {
              isValid = false;
              message = "Your confirmation email don't Match. Try again";
              $confEmail.setCustomValidity(message);
            } else {
              $confEmail.setCustomValidity('');
            }
          })();
        }
        return {
          isValid: isValid,
          message: message
        };
      }

      function _addFormInputOnChangeEvent() {
        emailConfirmationChangeEvent();

        function emailConfirmationChangeEvent() {
          var $confEmail = $("#conf-email");
          $confEmail.on("change keyup paste", function () {
            formValidation();
          });

        }

      }
    }

    function register(user) {
      var register = api.get({
        $target: $(".form-registration"),
        url: '/CreateVisitorFrom3D',
        request: JSON.stringify(user),
        method: 'POST',
        onReceived: function onReceived($target, data) {
          if (data.Status == false) {
            _showResponseModal("User registration fail : " + data.Message);
          } else {
            _showResponseModal("Your account was created successfully");
          }
        }
      });
    }

    //login
    function _addFormLoginSubmitEvent() {
      var $loginForm = $(".form-login");
      $loginForm.submit(function (e) {
        e.preventDefault();
        var user = {};
        user['email'] = $(".login-user").val();
        user['password'] = $(".pwd-login").val();
        login(user, "login")
        var loginForm = $('#open-login');
        loginForm.modal('hide');
      });
    }

    function login(user, elementTrggered) {
      var login = api.get({
        $target: $(".form-login"),
        url: '/LoginFrom3D',
        request: JSON.stringify(user),
        method: 'POST',
        onReceived: function onReceived($target, data) {
          if (data.Status == false) {
            _showResponseModal("User login fail : " + data.Message);
          } else {
            var account = JSON.parse(data.Data);
            FXM.cookie.set("userLogged", account);

            _showResponseModal("You are now logged in");

            _updateRequestMeetingFormByUserLoginStatus()

            _addAutoLogoutEvent();

            _autoFilLAccountSettingForm();

            _autoFillInquiryFormWhenLoggenIn();

            _changeRegisterToLogoutButton();

            _changeUserProfile();

            _updateBookmarkedContent();

            _updateUserVisitHistory(_listExhibitorId[_boothPositionIndex]);
          }
        }
      });
    }

    function _addForgotPasswordFunc(){
      var $recoverPasswordForm = $("#open-recover").find("form")

      $recoverPasswordForm.submit(function (e) {
        e.preventDefault();

        var email = $recoverPasswordForm.find(".login-user").val();
        submitRecoverPassForm(email)
      })

      function submitRecoverPassForm(email){
        var submit = api.get({
          $target: $(".form-registration"),
          url: '/ForgetPasswordFrom3D',
          request: JSON.stringify({
            email: email
          }),
          method: 'POST',
          onReceived: function onReceived($target, data) {
            if (data.Status == false) {
              _showResponseModal("Password recover failed. " + data.Message);
            } else {
              _showResponseModal("your password reset instruction will send to your email");
            }
          }
        });
      }
    }

    // add logout event

    function _addLogoutEvent() {
      var $logoutButton = $(".logout");
      var $signOutButton = $(".sign-out");
      var $signOutMobileButton = $(".menu-mobile").find("a:contains(Sign Out)");
      $logoutButton.on("click", function () {
        logout();
      });
      $signOutButton.on("click", function () {
        logout();
        $(".dropdown-account").removeClass("open");
      });
      $signOutMobileButton.on("click", function () {
        logout();
      });
    }

    function logout() {
      if (isLoggedIn()) {
        FXM.cookie.remove("userLogged");

        _showResponseModal("You have been logged out")

        _listBookmarkedContent = {}

        _changeUserProfile();

        _changeBackRegisterButton();

        _updateBookmarkIcon();

        _emptyInquiryForm();

        _updateRequestMeetingFormByUserLoginStatus()

        $("#open-register").modal("hide");
      }
    }

    function _addAutoLogoutEvent(){
      _addInterval();
      stopIntervalWhenUserActive();

      function _addInterval(){
        _autoLogoutInterval = setInterval(function () {
          if(isLoggedIn()){
              logout();
              clearInterval(_autoLogoutInterval);
          }
        }, 1000*60*30);
      }
      function stopIntervalWhenUserActive(){

        $(document).hammer().on('pan tap',function(ev){
          clearInterval(_autoLogoutInterval);
          _addInterval();
        });

        $("#booth-frame").contents().find("body").on("click", function(){
          clearInterval(_autoLogoutInterval);
          _addInterval();
        });

        $(document).mousemove(function(event){
          clearInterval(_autoLogoutInterval);
          _addInterval();
        });

        $(document).mousedown(function(event){
          clearInterval(_autoLogoutInterval);
          _addInterval();
        });

      }
    }

    // Check is user logged in and get logged user

    function  getLoggedUser() {
      var userId = "";
      var userProfile = "";
      var cookie = FXM.cookie.get();
      var cookieKeys = Object.keys(cookie);
      var cookieVals = Object.keys(cookie).map(function (e) {
        return cookie[e]
      })

      if (isLoggedIn()) {
        try {
          userProfile = JSON.parse(cookie["userLogged"]);
        } catch (err) {}
      }

      return {
        userId: userProfile.visitorId,
        userProfile: userProfile
      };
    }

    function isLoggedIn() {
      var cookie = FXM.cookie.get();
      var cookieKeys = Object.keys(cookie);

      if (cookieKeys.indexOf("userLogged")>-1) {
        return true;
      } else {
        return false;
      }
    }
    // change UI after user logged in

    function _changeRegisterToLogoutButton() {
      $target = $(".register").find(".button-blue");
      $target.parent().removeAttr("data-toggle");
      $target.parent().removeAttr("data-target");
      $target.addClass("logout");
      $target.html("Logout");

      _addLogoutEvent();
    }

    function _changeBackRegisterButton() {
      $target = $(".register").find(".button-blue");
      $target.html("Register");
      $target.removeClass("logout");
      $target.parent().attr("data-toggle", "modal");
      $target.parent().attr("data-target", "#open-register");
      $("#open-register").find(".close").trigger("click");
    }

    function _changeUserProfile() {
      var $target = $(".dropdown-account");

      if (isLoggedIn()) {
        var username = getLoggedUser().userProfile.firstName;
        var $dropdownToggle = $target.find(".dropdown-toggle");
        $dropdownToggle.attr("data-toggle", "dropdown");
        $dropdownToggle.removeAttr("data-target");
        $dropdownToggle.removeAttr("contenteditable");
        $dropdownToggle.html(username);
        $dropdownToggle.append('<span class="icon-user-circle-o"></span>'); // mobile change

        var $menuMobile = $(".navbar-default").find(".menu-mobile");
        $menuMobile.find(".register").remove();
        $menuMobile.children().show();
      } else {
        var $dropdownToggle = $target.find(".dropdown-toggle");
        $dropdownToggle.attr("data-toggle", "modal");
        $dropdownToggle.attr("data-target", "#open-register");
        $dropdownToggle.attr("contenteditable", "false");
        $dropdownToggle.html("Register"); // mobile change

        var $menuMobile = $(".navbar-default").find(".menu-mobile");
        $menuMobile.children().hide();
        $menuMobile.append('<a class="view-form register" data-toggle="modal" data-target="#open-register" contenteditable="false"><button class="btn-blue button-blue">Register</button></a>');
      }
    }

    // FUNCTION THAT TRIGGER
    // BOOKMARK CONTENT

    // Bookmark Content (Poster/Videos)

    function _addBookmarkButtonClickEvent() {

      // poster and video bookmark
      var $posterVideoBookmarkButton = $(".bookmark").find("img");
      $posterVideoBookmarkButton.on("click", function () {
        var contentModal = $(".modal:visible").find(".modal-body");
        var contentId = "";

        if (isLoggedIn()) {
          // if content is video
          var contentType = "poster-image";
          if(contentModal.find(".popup-video").length > 0){
            contentType = "video"
          }

          if (contentType == "video") {
            var videoActive = contentModal.find(".slick-active");
            contentId = videoActive.find("iframe").data("id");
            if(contentId == undefined){
              contentId = videoActive.find("video").data("id");
            }
          } else {
            // if content is poster
            var posterActive = contentModal.find(".slick-active");
            contentId = posterActive.find("img").data("id");
          }

          _bookmarkPosterAndVideo(contentId);

        } else {
          _showResponseModal("you need to <a class='login_here' data-toggle='modal' data-target='#open-login' data-dismiss='modal'>login</a>before bookmark any content");
          // _showResponseModal("You need to login before bookmark any content");
        }
      });

      // exhibitor bookmark
      var $exhibitorBookmarkButton =  $(".button-footer").find(".bookmark-button");
      $exhibitorBookmarkButton.on("click",function(){
        if(isLoggedIn()){
          var exhibitorId = _listExhibitorId[_boothPositionIndex]
          _bookmarkExhibitor(exhibitorId)
        } else{
          _showResponseModal("you need to <a class='login_here' data-toggle='modal' data-target='#open-login' data-dismiss='modal'>login</a>before bookmark this exhibitor");
          // _showResponseModal("You need to login before bookmark this exhibitor")
        }
      })


    }

    function _bookmarkPosterAndVideo(posterVideoId) {
      var userId = getLoggedUser().userId;
      var bookmarkPosterVideo = api.get({
        $target: $('#countdown'),
        url: '/SetBookmarkForVisitorFrom3D',
        request: JSON.stringify({
          visitorId: userId,
          posterVideoId: posterVideoId
        }),
        method: 'POST',
        onReceived: function onReceived($target, response) {
          if (response.Status == true) {
            _updateBookmarkedContent();
          } else {}
        }
      });
    }

    function _bookmarkExhibitor(exhibitorId) {
      var userId = getLoggedUser().userId;
      var bookmarkExhibitor = api.get({
        $target: $('#countdown'),
        url: '/SetBookmarkForVisitorFrom3D',
        request: JSON.stringify({
          visitorId: userId,
          boothId: exhibitorId
        }),
        method: 'POST',
        onReceived: function onReceived($target, response) {
          if(response.Status == true){
            _updateBookmarkedContent();
          }
        }
      });
    }

    function _updateBookmarkIcon() {

      _updatePosterBookmarkIcon();
      _updateVideoBookmarkIcon();
      _updateExhibitorBokmarkIcon();

      function _updatePosterBookmarkIcon(){
        var listBookmarkedContentId = Object.keys(_listBookmarkedContent);
        var bookmarkUnsavedSrc = "./../assets/images/bookmark.svg";
        var bookmarkSavedSrc = "./../assets/images/bookmark-white.svg";
        var $listPosterModal = $(".modal-popup");
        $listPosterModal.each(function(index) {
          var modal = $(this);
          var $bookmarkButton = modal.find(".bookmark").find("img");
          var posterActiveId = modal.find(".slick-active").find(".popup-image").data("id");

          if (posterActiveId != undefined) {
            posterActiveId = posterActiveId.toString();
          }

          if (listBookmarkedContentId.indexOf(posterActiveId)>-1) {
            $bookmarkButton.attr("src", bookmarkSavedSrc);
          } else {
            $bookmarkButton.attr("src", bookmarkUnsavedSrc);
          }
        });
      }

      function _updateVideoBookmarkIcon(){
        var listBookmarkedContentId = Object.keys(_listBookmarkedContent);
        var bookmarkUnsavedSrc = "./../assets/images/bookmark.svg";
        var bookmarkSavedSrc = "./../assets/images/bookmark-white.svg";

        var $listVideoModal = $(".modal-popup_video");

        $listVideoModal.each(function(index) {
          var modal = $(this);
          var $bookmarkButton = modal.find(".bookmark").find("img");
          var videoActiveId = modal.find(".slick-active").find(".popup-video").data("id");

          if(videoActiveId != undefined){
            videoActiveId = videoActiveId.toString();
          }

          if (listBookmarkedContentId.indexOf(videoActiveId)>-1) {
            $bookmarkButton.attr("src", bookmarkSavedSrc);
          } else {
            $bookmarkButton.attr("src", bookmarkUnsavedSrc);
          }

        });
      }

      function _updateExhibitorBokmarkIcon(){
        var listBookmarkedContentId = Object.keys(_listBookmarkedContent);
        var bookmarkUnsavedSrc = "./../assets/images/bookmark.svg";
        var bookmarkSavedSrc = "./../assets/images/bookmark-white.svg";

        var $bookmarkButton =  $(".button-footer").find(".bookmark-button").find("img");
        var exhibitorId = _listExhibitorId[_boothPositionIndex];

        if(exhibitorId != undefined){
          exhibitorId = exhibitorId.toString();
        }

        if (listBookmarkedContentId.indexOf(exhibitorId)>-1) {
          $bookmarkButton.attr("src", bookmarkSavedSrc);
        } else {
          $bookmarkButton.attr("src", bookmarkUnsavedSrc);
        }

      }

    }

    function _updateBookmarkedContent() {
      var listBookmarkedContent = [];

      if (isLoggedIn()) {
        var userId = getLoggedUser().userId;
        var getBookmarkedContent = api.get({
          $target: $("#open-bookmark").find(".bookmark-content").find(".row"),
          url: '/GetBookmarkForVisitorFrom3D',
          request: JSON.stringify({
            visitorId: userId
          }),
          method: 'POST',
          onReceived: function onReceived($target, response) {
            // if post api successfull
            if (response.Status == true) {
              listContent = JSON.parse(response.Data);
              _listBookmarkedContent = {};
              $.each(listContent, function (indexInArray, content) {
                _listBookmarkedContent[parseInt(content.id)] = content;
                listBookmarkedContent.push(content);
              });
              listBookmarkedContent.sort(function (a, b) {
                if(b.bookmarkDateTime == null || a.bookmarkDateTime == null){
                  return -1;
                }
                return new Date(b.bookmarkDateTime) - new Date(a.bookmarkDateTime);
              });
              _updateBookmarkModal(listBookmarkedContent);
              _updateBookmarkIcon();
              _addBookmarkedContentClickEvent();

            } else {
              // clear template if user first time logged in
                $target.html("<h4>You don't have any bookmark yet</h4>");
            }
          }
        });
      } else {
        var $target = $(".modal-bookmark").find(".bookmark-content").find(".row");
        var html = [];
        html.push("<h5>Please Login to see your bookmarked content</h5>");
        html.push('<div class="login-here"><a class="btn-login" data-toggle="modal" data-target="#open-login" contenteditable="false">login here!</a></div>');
        $target.html("");
        $target.append(html.join(""));
      }

      function _updateBookmarkModal(listBookmarkedContent) {
        var $target = $(".modal-bookmark").find(".bookmark-content").find(".row");
        $target.html("");
        var html = [];

        if(listBookmarkedContent.length == 0){
          $target.html("<h4>You don't have any bookmark yet</h4>")
        }

        $.each(listBookmarkedContent, function (index, content) {
          var thumbnailSrc = "";
          var contentCaption = "";
          var contentType = content.type;
          var contentId = content.id;

          if(contentType == "poster-image"){
            thumbnailSrc = content.url
            contentCaption = content.title
          }
          else if (contentType == "video") {
            thumbnailSrc = content.videoThumbnailUrl
            contentCaption = content.title

            if(thumbnailSrc == null){
              thumbnailSrc = "https://xpodev.xpomania.com/media/gmkohli2/video-thumbnail-car.jpg"
            }

          }
          else{
            thumbnailSrc = content.url
            contentCaption = content.exhibitorName
          }

          html.push('<div class="col-lg-2 col-md-4 col-sm-4 col-xs-12">');
          html.push('<div class="bookmark" data-id="'+contentId+'">');
          html.push("<img src=\"" + thumbnailSrc + "\" alt=\"" + contentCaption + "\"></img>");
          html.push('<div class="overlay"></div>');
          html.push("<figcaption>" + contentCaption + "</figcaption>");
          html.push('</div>');
          html.push('</div>');


        });
        $target.append(html.join(''));
      }
    }

    function _addBookmarkedContentClickEvent(){
      var $bookmarkedContent = $("#open-bookmark").find(".bookmark-content").find(".bookmark");
      $bookmarkedContent.on("click",function(){
        var $this = $(this);
        var id = $this.data("id");
        var content = _listBookmarkedContent[id];

        if(content.type == "poster-image"){
          showPosterPopup(content.url, content.title);
        }

        else if(content.type == "video"){
          var videoUrl = content.url;
          if(videoUrl == null){
            videoUrl = "https://www.youtube.com/embed/CUS2w4y2Qj4"
          }
          var youtubeId = getYoutubeID(videoUrl)
          if(youtubeId != ''){
            videoUrl = "https://www.youtube.com/embed/" + youtubeId
          }
          showVideoPopup(videoUrl, content.title);
        }

        else if(content.type == "booth"){
          var exhibitorId = content.exhibitorId;
          _changeBooth(exhibitorId);
        }

        $("#open-bookmark").modal("hide")

      })
    }

    // History

    function _updateUserVisitHistory(ExhibitorVisitedId) {
      if (isLoggedIn()) {
        var _setVisitorHistory = function _setVisitorHistory(ExhibitorVisitedId) {
          var currentDate = new Date();
          var date = currentDate.getDate();
          var month = currentDate.toLocaleString('en-GB', { month: 'long' })
          var year = currentDate.getFullYear();
          var hour = ("0" + (currentDate.getHours())).slice(-2);
          var minutes = ("0" + (currentDate.getMinutes())).slice(-2);
          var seconds = ("0" + (currentDate.getSeconds())).slice(-2);
          var formattedDate = date + " " + month + " " + year + ", " + hour + ":" + minutes + ":" + seconds;
          var setHistory = api.get({
            $target: $('#countdown'),
            url: '/SetHistoryForVisitorFrom3D',
            request: JSON.stringify({
              visitorId: getLoggedUser().userId,
              exhibitorId: ExhibitorVisitedId,
              datetime: formattedDate
            }),
            method: 'POST',
            onReceived: function onReceived($target, response) {
              if (response.Status == true) {
                _getVisitorHistory();
              } else {}
            }
          });
        };

        var _getVisitorHistory = function _getVisitorHistory() {
          var listBoothVisited = {};
          var getVisitHistory = api.get({
            $target: $('#countdown'),
            url: '/GetHistoryForVisitorFrom3D',
            request: JSON.stringify({
              visitorId: getLoggedUser().userId
            }),
            method: 'POST',
            onReceived: function onReceived($target, response) {
              if (response.Status == true) {
                listBoothVisited = JSON.parse(response.Data);
                listBoothVisited.sort(function (a, b) {
                  if(new Date(b.date) == new Date(a.date)){
                    return 1;
                  }
                  return new Date(b.date) - new Date(a.date);
                });
                _updateHistoryInterface(listBoothVisited);
              } else {}
            }
          });
          return listBoothVisited;
        };

        var _updateHistoryInterface = function _updateHistoryInterface(listBoothVisited) {
          var $historyContent = $("#open-history").find(".history-content");
          var html = [];
          html.push("<h3>HISTORY</h3>");
          $.each(listBoothVisited, function (index, booth) {
            var dateSplit = booth.date.split(":");
            var dateStr = dateSplit.slice(0,2).join(":")
            html.push("<div class=\"history-list\">");
            html.push("<div class=\"history-image\" >");
            html.push("<img src=\"" + booth.exhibitorThumbnail + "\" alt=\"history\" data-id=" + booth.exhibitorId + ">");
            html.push("</div>");
            html.push("<div class=\"history-desc\">");
            html.push("<div class=\"desc\">");
            html.push("<h4>Visited " + booth.exhibitorName + "</h4>");
            html.push("<p>" + dateStr + "</p>");
            html.push("</div>");
            html.push("</div>");
            html.push("</div>");
          });
          $historyContent.html("");
          $historyContent.append(html.join(''));

          _addHistoryImgClickEvent();
        };

        var _addHistoryImgClickEvent = function _addHistoryImgClickEvent() {
          $(".history-image").find("img").on("click", function () {
            var exhibitorId = $(this).data("id");

            _changeBooth(exhibitorId);

            $("#open-history").modal("hide");
          });
        };

        _setVisitorHistory(ExhibitorVisitedId);

      } else {
        var $target = $("#open-history").find(".history-content");
        var html = [];
        html.push("<h3>HISTORY</h3>");
        html.push("<h5>Please Login to see your booth visited history</h5>");
        html.push('<div class="login-here"><a class="btn-login" data-toggle="modal" data-target="#open-login" contenteditable="false">login here!</a></div>');
        $target.html("");
        $target.append(html.join(""));
      }
    }

    // Form Inquiry

    function _autoFillInquiryFormWhenLoggenIn() {
      var $inquiryForm = $(".form-enquiry");

      if (isLoggedIn()) {
        var currentUser = getLoggedUser().userProfile; // Get Form Input

        var inputName = $inquiryForm.find(".enq_name");
        var inputEmail = $inquiryForm.find(".enq_email");
        var inputPhone = $inquiryForm.find(".enq_phone");

        // fill enquiry form with known user data

        inputName.val(currentUser.firstName + " " + currentUser.lastName);
        inputEmail.val(currentUser.email);
        inputPhone.val(currentUser.phone);
      } else {
        _emptyInquiryForm()
    }


    }

    function _emptyInquiryForm(){
      var $inquiryForm = $(".form-enquiry");

      var inputName = $inquiryForm.find(".enq_name");
      var inputEmail = $inquiryForm.find(".enq_email");
      var inputPhone = $inquiryForm.find(".enq_phone");

      // fill enquiry form with known user data

      inputName.val("");
      inputEmail.val("");
      inputPhone.val("");
    }

    function _addEnquiryFormSubmitEvent() {
      var $inquiryForm = $(".form-enquiry");
      $inquiryForm.submit(function (e) {

        e.preventDefault()

        var enquiryData = getFormData();
        submitEnquiryForm(enquiryData)
        $("#open-enquiry").modal("hide")

        function getFormData() {
          var enquiryData = {};

          // Get Form Input Data
          enquiryData['name'] = $inquiryForm.find(".enq_name").val();
          enquiryData['email'] = $inquiryForm.find(".enq_email").val();
          enquiryData['officePhoneNumber'] = $inquiryForm.find(".enq_phone").val();
          enquiryData['mobileNumber'] = $inquiryForm.find(".enq_mobile").val();
          enquiryData['fax'] = $inquiryForm.find(".enq_fax").val();
          enquiryData['address1'] = $inquiryForm.find(".enq_address1").val();
          enquiryData['address2'] = $inquiryForm.find(".enq_address2").val();
          enquiryData['country'] = $inquiryForm.find(".enq_country").val();
          enquiryData['state'] = $inquiryForm.find(".enq_state").val();
          enquiryData['city'] = $inquiryForm.find(".enq_city").val();
          enquiryData['zipCode'] = $inquiryForm.find(".enq_zip").val();
          enquiryData['salesInquiry'] = $inquiryForm.find("#sales_enquiry").val();
          enquiryData['exhibitorId'] = _listExhibitorId[_boothPositionIndex];

          return enquiryData;
        }

        function submitEnquiryForm(enquiryFormData){
          var postAPIEnquiry = api.get({
            $target: $(".form-login"),
            url: '/SubmitEnquiryFormFrom3D',
            request: JSON.stringify(enquiryFormData),
            method: 'POST',
            onReceived: function onReceived($target, data) {
              if (data.Status == false) {
                _showResponseModal("Submit form fail : " + data.Message);
              } else {
                _showResponseModal("Enquiries sent successfully");
              }
            }
          });
        }

      });

    }


    // Account Setting

    function _autoFilLAccountSettingForm(){
      var $accountSettingForm = $(".form__account_setting");
      if (isLoggedIn()) {
        var currentUser = getLoggedUser().userProfile;

        // Get Form Input

        var inputName = $accountSettingForm.find("#disp_name");
        var inputEmail = $accountSettingForm.find("#email_account");
        var inputPhone = $accountSettingForm.find("#phone_account");

        // fill enquiry form with known user data

        inputName.val(currentUser.firstName + " " + currentUser.lastName);
        inputEmail.val(currentUser.email);
        inputPhone.val(currentUser.phone);

        var imageSrc = currentUser.profile_picture;
        var $profilePicture = $("#profile-picture");
        $profilePicture.attr("src",imageSrc)

        $("#curr_pass").val("")
        $("#new_pass").val("")
        $("#conf_new_pass").val("")


      }

    }

    function _addAccountSettingEvent(){

      _addProfilePicChangeEvent();
      _addSubmitEvent();

      function _addSubmitEvent(){
        var $accountSettingForm = $(".form__account_setting");
        var $accountSettingSubmitButton = $accountSettingForm.find(".btn-submit2");
        _addFormInputOnChangeEvent();

        $accountSettingForm.submit(function (e) {
          e.preventDefault();
        });


        $accountSettingSubmitButton.on("click", function () {
          formValidation();
          var formData = new FormData();

          if ($accountSettingForm[0].checkValidity() == true) {
            if(isLoggedIn()){
              var visitorId = getLoggedUser().userId;
              formData.append('visitorId', visitorId);

              var currentPassword = $("#curr_pass").val();
              formData.append('currentPassword', currentPassword);

              var phoneNumber = $("#phone_account").val();
              if(phoneNumber != ""){
                formData.append('phoneNumber', phoneNumber);
              }

              var newPassword = $("#new_pass").val();
              if(newPassword != ""){
                formData.append('newPassword', newPassword);
                formData.append('confirmNewPassword',newPassword)
              }

              var $profilePicForm = document.getElementById("profile-picture-input");
              if($profilePicForm.files.length > 0){
                var imageUpdate = $profilePicForm.files[0]
                formData.append('image', imageUpdate);
                var imageSrc = URL.createObjectURL(imageUpdate);
                var $profilePicture = $("#profile-picture");
                $profilePicture.attr("src",imageSrc)
              }

              submitForm(formData)

            }
          } else {}
        });


        function submitForm(formData){
          var BASE_URL = "/Umbraco/Api/Content";
          var baseUrl = (document.location.hostname == 'localhost' || document.location.hostname == 'fxm.web.id') ? 'https://dev.xpomania.com' + BASE_URL : BASE_URL
          var url = baseUrl + "/UpdateVisitorInfo";
          $.ajax({
            type: "POST",
            url: url,
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
              $(".modal-account_setting").modal("hide")
                if(data.Status == true){
                  _showResponseModal("Form successfully submitted")
                } else { _showResponseModal("Form submit fail : " + data.Message) }
              }
          });
          // var submit = api.get({
          //   $target: $(".form-login"),
          //   url: '/UpdateVisitorInfo',
          //   data: formData,
          //   method: 'POST',
          //   onReceived: function onReceived($target, data) {
          //     $(".modal-account_setting").modal("hide")
          //     if(data.Status == true){
          //       _showResponseModal("Form successfully submitted")
          //     } else { _showResponseModal("Form submit fail : " + data.Message) }
          //   }
          // })
        };

        function formValidation() {
          var isValid = true;
          var message = "";

          if (isValid) {
            (function passwordValidation() {
              var $passwordInput = document.getElementById("new_pass");
              var passwordToConfirm = $passwordInput.value;
              var regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?([^\w\s]|[_])).{10,}$/;

              // if password input not left empty
              if(passwordToConfirm != ""){
                if (!regex.test(passwordToConfirm)) {
                  isValid = false;
                  message = "Your password need contains at least one uppercase letter, lowercase letter, and special character. with minimum 10 characters in alphanumeric format. Example: Alph@numb1";
                  $passwordInput.setCustomValidity(message);
                } else {
                  $passwordInput.setCustomValidity('');
                }
              } else { $passwordInput.setCustomValidity('') }

            })();
          }

          if (isValid) {
            (function confirmationPasswordValidation() {
              var pass1 = document.getElementById("new_pass").value;
              var pass2 = document.getElementById("conf_new_pass").value;
                if (pass1 != pass2) {
                isValid = false;
                message = "Your password don't Match";
                document.getElementById("conf_new_pass").setCustomValidity(message);
              } else {
                document.getElementById("conf_new_pass").setCustomValidity('');
              }
            })();
          }
          return {
            isValid: isValid,
            message: message
          };
        }

        function _addFormInputOnChangeEvent() {
          passwordChangeEvent();
          passwordEmailConfirmationChangeEvent();

          function passwordEmailConfirmationChangeEvent() {
            var $passwordConfirmInput = $("#conf_new_pass");

            $passwordConfirmInput.on("change keyup paste", function () {
              formValidation();
            });

          }

          function passwordChangeEvent() {
            var $passwordInput = $("#new_pass");
            $passwordInput.on("change keyup paste", function () {
              formValidation();
            });
          }
        }
      }

      function _addProfilePicChangeEvent(){
        $('#profile-picture-input').change(function(e){
          var formData = new FormData();
          var $profilePicForm = document.getElementById("profile-picture-input");
          if($profilePicForm.files.length > 0){
            var imageUpdate = $profilePicForm.files[0]
            formData.append('image', imageUpdate);
            var imageSrc = URL.createObjectURL(imageUpdate);
            var $profilePicture = $("#profile-picture");
            $profilePicture.attr("src",imageSrc)
          }
        });

      }
    }


    // Event and Agenda

    function _updateAgendaInterface() {
      var getAgenda = api.get({
        $target: $('.speaker_schedule'),
        url: '/GetAgendaFrom3D',
        request: JSON.stringify({
          visitorId: getLoggedUser().userId
        }),
        method: 'POST',
        onReceived: function onReceived($target, response) {
          if (response.Status == true) {
            var datas = JSON.parse(response.Data);

            var html = [];
            var htmlZoomWebinar = [];

            var listRunningEvent = [];
            var listRecordedVideo = [];

            var $speakerSchedule = $("#speaker_schedule").find(".speaker_schedule").find(".row")
            var $zoomWebinarSchedule = $("#zoom_webinar").find(".speaker_schedule").find(".row")

            $speakerSchedule.html("");

            $.each(datas, function (index, data) {

              var name = data.AgendaDateName;
              var date = data.AgendaDate;
              var listAgendaTime = data.TimeList;

              // parsing date
              var parsedDate = new Date(Date.parse(date));
              var day = parsedDate.toLocaleString('en-GB', { weekday: 'long' })

              let formattedDate = day + ", " + date

              var thereIsAvailableEvent = false;
              var thereIsAvailableZoomWebinar = false;

              if(Object.keys(listAgendaTime).length != 0 ){
                (function addAgendaTemplate(){
                  html.push('<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">');
                    html.push('<h4>'+name+' </h4>');
                    html.push('<h5 class="date_agenda">'+formattedDate+' </h5>');

                  htmlZoomWebinar.push('<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">');
                    htmlZoomWebinar.push('<h4>'+name+' </h4>');
                    htmlZoomWebinar.push('<h5 class="date_agenda">'+formattedDate+' </h5>');


                  $.each(listAgendaTime, function (index, timelist) {
                    var listAgendaEvent = timelist.ProgrammeList;
                    var startDateTime = timelist.StartDateTime.split(" ")[0];
                    var endDateTime = timelist.EndDateTime.split(" ")[0];

                    var eventIsRunning = false;
                    var eventIsEnded = false;


                    (function formatDate(){
                      startDateTime = new Date(Date.parse(startDateTime + " " +  date));
                      endDateTime = new Date(Date.parse(endDateTime +" "+ date));

                      var currentDate = new Date();
                      // var currentDate = new Date(Date.parse("Thu Sep 24 2020 12:30:00 GMT+0700 (Western Indonesia Time)"))

                      if(currentDate > startDateTime && currentDate < endDateTime){
                        eventIsRunning = true;
                      }

                      if(currentDate > endDateTime){
                        eventIsEnded = true;
                      }

                      var hour = ("0" + (startDateTime.getHours()%12)).slice(-2);
                      var minutes = ("0" + (startDateTime.getMinutes())).slice(-2);

                      var AmOrPm = startDateTime.getHours() >= 12 ? 'P.M' : 'A.M';

                      startDateTime = hour + ":" + minutes + " " + AmOrPm

                      hour = ("0" + (endDateTime.getHours()%12)).slice(-2);
                      minutes = ("0" + (endDateTime.getMinutes())).slice(-2);

                      var AmOrPm = endDateTime.getHours() >= 12 ? 'P.M' : 'A.M';

                      endDateTime = hour + ":" + minutes + " " + AmOrPm
                    })();

                    $.each(listAgendaEvent, function (index, event) {

                      var eventName = event.AgendaEventName;
                      var eventDesc = event.Description;
                      var eventUrl = event.AgendaEventUrl;
                      var eventType = event.AgendaEventType;
                      var eventId = event.Id

                      _listAgenda[eventId] = event;

                      if(eventType == "Zoom Webinar"){
                        thereIsAvailableZoomWebinar = true
                      } else {
                        thereIsAvailableEvent = true;
                      }

                      if(eventType == "Zoom Webinar"){
                        (function addTemplate(){
                          htmlZoomWebinar.push('<div class="content_desc" data-type="'+eventType+'">');
                            htmlZoomWebinar.push('<div class="timeline">');
                              htmlZoomWebinar.push('<div class="dot"></div>');
                            htmlZoomWebinar.push('</div>');
                            htmlZoomWebinar.push('<div class="speaker_description">');
                              htmlZoomWebinar.push('<div class="content_description">');
                                htmlZoomWebinar.push('<p class="title_streaming">'+eventName+'</p>');
                                htmlZoomWebinar.push('<p class="date_streaming">'+date+' | '+startDateTime+' - '+endDateTime+'</p>');
                                htmlZoomWebinar.push('<div class="description_streaming">'+eventDesc+'</div>');
                                // if(eventIsRunning){
                                htmlZoomWebinar.push('<a class="status_streaming" href="#" data-url="'+eventUrl+'" data-title="'+eventName+'">JOIN WEBINAR</a>')
                                // }
                              htmlZoomWebinar.push('</div>');
                            htmlZoomWebinar.push('</div>');
                          htmlZoomWebinar.push('</div>');
                        })();
                      } else {
                        (function addTemplate(){
                          html.push('<div class="content_desc" data-type="'+eventType+'">');
                            html.push('<div class="timeline">');
                              html.push('<div class="dot"></div>');
                            html.push('</div>');
                            html.push('<div class="speaker_description">');
                              html.push('<div class="content_description">');
                                html.push('<p class="title_streaming">'+eventName+'</p>');
                                html.push('<p class="date_streaming">'+date+' | '+startDateTime+' - '+endDateTime+'</p>');
                                html.push('<div class="description_streaming">'+eventDesc+'</div>');
                              html.push('</div>');
                            html.push('</div>');
                          html.push('</div>');
                        })();
                      }



                      if(eventType == "Webinar"){
                        listRecordedVideo.push(event);
                      }

                      if(eventType == "Livestream"){
                        if(eventIsRunning){
                          listRunningEvent.push(event);
                        }
                        else if(eventIsEnded){
                          listRecordedVideo.push(event);
                        }
                      }

                      // }
                    });

                  });



                  if(!thereIsAvailableEvent){
                    html.pop()
                    html.pop()
                    html.pop()
                  } else {html.push('</div>')}

                  if(!thereIsAvailableZoomWebinar){
                    htmlZoomWebinar.pop()
                    htmlZoomWebinar.pop()
                    htmlZoomWebinar.pop()
                  } else {htmlZoomWebinar.push('</div>')}

                })()
              }

            });


            $speakerSchedule.html(html.join(""))
            $zoomWebinarSchedule.html(htmlZoomWebinar.join(""))

            changeActiveVideo(listRunningEvent)
            updateListRecordedVideo(listRecordedVideo)
            addJoinWebinarClickEvent()


          }
        }
      });

      function changeActiveVideo(listRunningEvent){
        var videoSeminarSection = $(".video-seminar__section");
        var liveSeminarUnavailabilityMsg = $("#open-viewSeminar").find(".seminar-unavailability-msg");
        var defaultVideoUrl = "http://fxm.web.id/app/xpomania/dev/assets/media/Google_CEO_Speech.mp4"
        var baseUrl = document.location.hostname

        if(listRunningEvent.length==0){
          liveSeminarUnavailabilityMsg.html("there is no available live seminar ");
          liveSeminarUnavailabilityMsg.css("display","block");
          videoSeminarSection.css("display","none");

          if(baseUrl == "demo.xpomania.com" || baseUrl == "localhost") {
            var videoYoutube = $("#seminar-youtube")
            var videoLocal = $("#video-seminar");

            liveSeminarUnavailabilityMsg.html("");
            liveSeminarUnavailabilityMsg.css("display","none");
            videoSeminarSection.css("display","block");
            videoSeminarSection.find("#video-seminar").css("display","none");

            videoLocal.attr("src",defaultVideoUrl)
            videoLocal.css("display","block");
            videoYoutube.css("display","none");
          }

        } else {

          liveSeminarUnavailabilityMsg.html("");
          liveSeminarUnavailabilityMsg.css("display","none");
          videoSeminarSection.css("display","block");
          videoSeminarSection.find("#video-seminar").css("display","none");

          var videoYoutube = $("#seminar-youtube")
          var videoLocal = $("#video-seminar");
          var videoUrl = listRunningEvent[0].AgendaEventUrl;
          var youtubeId = getYoutubeID(videoUrl)
          // youtube video
          if(youtubeId != ''){
            videoUrl = "https://www.youtube.com/embed/" + youtubeId
            videoYoutube.attr("src",videoUrl)
            videoYoutube.css("display","block");
            videoLocal.css("display","none");
          } else {
            videoLocal.attr("src",videoUrl)
            videoLocal.css("display","block");
            videoYoutube.css("display","none");
          }
        }
      }

      function updateListRecordedVideo(listRecordedVideo){

        var $recordedVideoSection = $("#record_video").find(".video_record-section");
        var html = [];

        $.each(listRecordedVideo, function (index, event) {
          var name = event.AgendaEventName;
          var videoUrl = event.AgendaEventUrl;
          var youtubeId = getYoutubeID(videoUrl);
          var videoThumbnail = "";
          if(youtubeId != ''){
            videoUrl = "https://www.youtube.com/embed/" + youtubeId
            videoThumbnail = "https://img.youtube.com/vi/"+youtubeId+"/mqdefault.jpg"
          } else {
            videoThumbnail = defaultVideoThumbnail;
          }

          (function addTemplate(){

            if(index%4 == 0){
              html.push('<div class="video_record">');
              html.push('<div class="row">');
            }

            html.push('<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">');
              html.push('<div class="video_desc">');
                html.push('<img src="'+videoThumbnail+'" alt="video" data-url="'+videoUrl+'" data-title="'+name+'">');
                html.push('<div class="desc">');
                  html.push('<p class="title">'+name+'</p>');
                html.push('</div>');
              html.push('</div>');
            html.push('</div>');

            if(index%4 == 3){
              html.push('</div>');
              html.push('</div>');
            }

          })()

        });

        $recordedVideoSection.html(html.join(""));
        addVideoThumbnailClickEvent();
      }

      function addVideoThumbnailClickEvent(){
        let $videoThumbnail = $(".video_desc").find("img");
        $videoThumbnail.click(function (e) {
          e.preventDefault();
          var $this = $(this);
          var videoUrl = $this.attr("data-url");
          var videoTitle = $this.attr("data-title")
          showVideoPopup(videoUrl, videoTitle)
        });
      }

      function addJoinWebinarClickEvent(){
        var liveNowButton = $("#zoom_webinar").find(".status_streaming");
        liveNowButton.click(function (e) {
          var url = $(this).attr("data-url")
          var title = $(this).attr("data-title")

          if(!isLoggedIn()){
            var $modalInputData = $("#open-input-webinar")

            $modalInputData.modal("show")
            $modalInputData.find("form").find("#webinar-data-url").val(url)
            $modalInputData.find("form").find("#webinar-data-title").val(title)

          } else {
            var name = getLoggedUser().userProfile.firstName
            var email = getLoggedUser().userProfile.email
            showZoomWebinar(url,name,email,title)
          }
        });
      }



    }

    function _addFormWebinarSumbitEvent(){
      var $formWebinarData = $("#open-input-webinar").find("form");
      $formWebinarData.submit(function (e) {
        e.preventDefault();

        var url = $formWebinarData.find("#webinar-data-url").val();
        var title = $formWebinarData.find("#webinar-data-title").val();
        var name = $formWebinarData.find("#webinar-data-name").val();
        var email = $formWebinarData.find("#webinar-data-email").val();

        $("#open-input-webinar").modal("hide")
        showZoomWebinar(url, name, email, title)

      })
    }

    function showZoomWebinar(url, name, email, title){

      url = url.replace("/portal/webinar","/public-pages/webinar")

      url = updateQueryStringParameter(url, "name", name)
      url = updateQueryStringParameter(url, "email", email)

      if(document.location.hostname == 'localhost' || document.location.hostname == 'fxm.web.id'){
        url = 'https://dev.xpomania.com' + url
      }


      var $modalWebinar = $("#open-webinar")
      $modalWebinar.find(".zoom-webinar-frame").attr("src",url)

      if(title != undefined){
        $modalWebinar.find(".modal-title").html(title)
      }

      $modalWebinar.modal("show")

      function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
          return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
          return uri + separator + key + "=" + value;
        }
      }
    }



    function _addViewWebinarVideoEvent(){
      var viewButton = $(".btn-webinar-video");
      viewButton.click(function (e) {
        var seminarLocalVideo = $("#video-seminar");
        seminarLocalVideo.css("display","none")

        var seminarYoutubeVideo = $("#seminar-youtube");
        var button = $(this);
        var eventId = button.data("id");
        var eventIsEnded = button.data("ended");
        if(eventIsEnded){
          var videoUrl = _listAgenda[eventId].AgendaEventUrl;
          var youtubeId = getYoutubeID(videoUrl)
          if(youtubeId != ''){
            videoUrl = "https://www.youtube.com/embed/" + youtubeId
          }
          seminarYoutubeVideo.attr("src",videoUrl)
          seminarYoutubeVideo.css("display","block")
        } else {
          var videoSeminarSection = $(".video-seminar__section");
          var liveSeminarUnavailabilityMsg = $("#open-viewSeminar").find(".modal-header").find(".seminar-unavailability-msg");
          var date = button.data("date");
          videoSeminarSection.css("display","none")
          liveSeminarUnavailabilityMsg.html("Video will be availabe at " + date)
          liveSeminarUnavailabilityMsg.css("display","block")
        }

      });
    }

    function _addSeminarButtonClickEvent(){
      var $seminarNavbarButton = $(".view-seminar");
      var $seminarTab = $("#open-viewSeminar").find(".nav-link")
      var $unavailabilityMsg = $(".seminar-unavailability-msg")
      $seminarNavbarButton.click(function (e) {
        e.preventDefault();
        _updateAgendaInterface()
      });
      $seminarTab.click(function(e) {
        var tabId = $(this).attr("href");
        if(tabId != "#live_stream"){
          $unavailabilityMsg.css("display","none");
        } else {
          if($unavailabilityMsg.html() != ""){
            $unavailabilityMsg.css("display","block");
          }
        }
      })
    }

    // SECTION THAT HANDLE
    // SEARCH FUNCTION

    function _initiateSearchContent() {
      emptySearchContent()
      _addSearchCategoryClickEvent();

      var $searchPage = $("#search-page");

      (function changeBoothIdAndCompanyNameFilterOption(){
        var listExhibitor = _listExhibitor;
        var $companyNameOption = $searchPage.find(".company-name");
        var $boothIdOption = $searchPage.find(".boothID");

        $companyNameOption.html('<option selected="true" value="">Company Name</option>');
        $boothIdOption.html('<option selected="true" value="">Booth Id</option>');

        $.each(listExhibitor, function (index, exhibitor) {
          var exhibitorId = exhibitor.id;
          var exhibitorName = exhibitor.name;

          (function changeCompanyNameIflterOpt(){
            $companyNameOption.append('<option value="'+exhibitorId+'">'+exhibitorName+'</option>')
          })();

          (function changeBoothIdIflterOpt(){
            $boothIdOption.append('<option value="'+exhibitorId+'">booth '+exhibitorId+'</option>')
          })();

        });
      })();


    }

    function _addSearchCategoryClickEvent(){
      var $searchCategoryMenu = $("#search-page").find(".search-category");

      (function defaultInit(){
        var $searchContent = $("#search-page").find(".productWrapper");
        $searchContent.css("display","none");
        $("#all-search-content").show();
      })();

      $searchCategoryMenu.click(function (e) {
        e.preventDefault();

        var $categoryMenu = $("#search-page").find(".search-category");
        var $searchContent = $("#search-page").find(".productWrapper");

        var $this = $(this)
        var categorySelected = $this.attr("data-content");

        $categoryMenu.removeClass("active");
        $this.addClass("active");

        var SearchCategorySelected = $this.attr("id");


        $searchContent.css("display","none");
        $("#"+categorySelected).show();

        if(SearchCategorySelected == "search-exhibitor"){
          $("#location").css("display","inline-block");
        } else if (SearchCategorySelected == "search-poster") {
          $('#location>option').attr('selected', false);
          $('#location>option:eq(0)').attr('selected', true);
          $("#location").css("display","none");
        } else if (SearchCategorySelected == "search-video") {
          $('#location>option').attr('selected', false);
          $('#location>option:eq(0)').attr('selected', true);
          $("#location").css("display","none");
        } else {
          $("#location").css("display","inline-block");
        }

      });
    }

    function emptySearchContent(){

      var $searchPage = $("#search-page")

      var $productWrapper = $searchPage.find(".productWrapper")
      $productWrapper.html("");

      var $result = $searchPage.find(".result");
      $result.html("0 Result(s)");

      var $searchLoading = $(".loading-search");
      $searchLoading.hide();


    }

    function showSearchMessage(msg){
      var $searchPage = $("#search-page");
      var $searchMsg = $searchPage.find(".search-message");

      $searchMsg.show();
      $searchMsg.find(".message").show()
      $searchMsg.find(".message").html(msg)
    }

    function searchFunction(){

      function searchAllContent({type, title, description, boothNumber, exhibitorName, exhibitorProfile, industry, location, boothId}){

        var $searchPage = $("#search-page");
        var $searchMsg = $searchPage.find(".search-message");

        hideMessage();


        if(title == "" && exhibitorName == "" && boothId == 0 && location == ""){
          emptySearchContent();
          return false;
        }

        var typeSearch = type

        if(location != ""){
          typeSearch = "exhibitor";
        } else {
          hideMessage();
        }

        var getListContent = api.get({
          $target: $('#exhibitor-search-content'),
          url: '/SearchFeatureFrom3D',
          request: JSON.stringify({
            type: typeSearch,
            title : title,
            description : description,
            boothNumber: boothNumber,
            exhibitorName: exhibitorName,
            exhibitorProfile: exhibitorProfile,
            industry: industry,
            location: location,
            boothId: boothId
          }),
          method: 'POST',
          onReceived: function onReceived($target, response) {
            if(response.Status == true){
              var listContent = JSON.parse(response.Data)

              if(listContent.length == 0){
                showSearchMessage("Sorry, no search result were found")
              } else if(location != ""){
                if(type == "exhibitor"){
                  hideMessage();
                } else {
                  showSearchMessage("Location only available for exhibitors booth");
                }
              } else {
                hideMessage();
              }

              if(type == "exhibitor"){
                updateSearchContent().updateExhibitor(listContent)
              } else if(type == "poster"){
                updateSearchContent().updatePoster(listContent)
              } else if(type == "video"){
                updateSearchContent().updateVideo(listContent)
              } else if(type == ""){
                updateSearchContent().updateAllContent(listContent)
              }




            }
          }
        });


        function hideMessage(){
          $searchMsg.hide();
          $searchMsg.find(".message").hide()
          $searchMsg.find(".message").html("")
        }

        function showSearchMessage(msg){
          var $searchPage = $("#search-page");
          var $searchMsg = $searchPage.find(".search-message");

          $searchMsg.show();
          $searchMsg.find(".message").show()
          $searchMsg.find(".message").html(msg)
        }


      }

      return{
        searchAllContent: searchAllContent
      }

    }

    function updateSearchContent(){
      var $searchPage = $("#search-page")

      function updateExhibitorContent(listExhibitor){

        var $exhibitorContainer = $searchPage.find("#exhibitor-search-content");
        var $result = $searchPage.find(".result");
        var $searchLoading = $(".loading-search");

        var html = [];

        var counter = 0;

        $exhibitorContainer.html("")

        if(listExhibitor.length != 0){
          $.each(listExhibitor, function (index, exhibitor) {

            var exhibitorId = exhibitor.id;
            var exhibitorName = exhibitor.name;
            var exhibitorThumbnail = exhibitor.booth_thumbnail;
            var exhibitorBoothNumber = exhibitor.booth_number;
            var exhibitorBoothType = exhibitor.booth_type;
            var exhibitorVisitUrl = exhibitor.booth_number;
            var exhibitorLocation = "";
            var exhibitorIndustry = exhibitor.industry;
            var exhibitorDescription = "";
            var exhibitorStatus = exhibitor.exhibitor_status;

            if(exhibitorStatus == "Approved"){
              (function addTemplate() {
                html.push('<li class="product-block">')
                  html.push('<div class="pb-upper">')
                    html.push('<div class="pb-image exhibitor_image">')
                      html.push('<img src="'+exhibitorThumbnail+'" border="0" alt="booth" class="pb-img">')
                    html.push('</div>')
                    html.push('<div class="pb-description exhibitor_desc">')
                      html.push('<h4>'+exhibitorName+'</h4>')
                      html.push('<h5 class="booth_id">BOOTH '+exhibitorId+"-"+exhibitorBoothType+"-"+exhibitorBoothNumber+'</h5>')
                      html.push('<h5 class="exhibitor_location">'+exhibitorLocation+'</h5>')
                      html.push('<h5 class="exhibitor_industry">'+exhibitorIndustry+'</h5>')
                      html.push('<h5 class="description exhibitor_overview">'+exhibitorDescription+'</h5>')
                      html.push('<div class="pb-button exhibitor_circle">')
                        html.push('<a href="#" class="btn-visit" data-id="'+exhibitorId+'">Visit</a>')
                        html.push('<a href="#" class="exhibition-more"  data-id="'+exhibitorId+'">&#x0003E;</a>')
                      html.push('</div>')
                    html.push('</div>')
                  html.push('</div>')
                html.push('</li>')
              })();
              counter ++;
            }
          });

        }

        $result.html(counter + " " + "result(s)")
        $searchLoading.hide();
        $exhibitorContainer.html(html.join(""))

        addVisitExhibitorClickEvent();

        if(counter == 0){
          showSearchMessage("Sorry, no search result were found")
        }

        function addVisitExhibitorClickEvent(){
          var $visitButton = $(".pb-button").find(".btn-visit");
          var $viewlistVisitButton = $exhibitorContainer.find(".pb-button").find(".exhibition-more");
          $visitButton.click(function (e) {
            e.preventDefault();
            var exhibitorId = $(this).attr("data-id");
            $("#open-search").modal("hide")
            $("#search-page").find(".close").trigger("click")
            _changeBooth(parseInt(exhibitorId));
          });
          $viewlistVisitButton.click(function (e) {
            e.preventDefault();
            var exhibitorId = $(this).attr("data-id");
            $("#open-search").modal("hide")
            $("#search-page").find(".close").trigger("click")
            _changeBooth(parseInt(exhibitorId));
          });
        }


      }

      function updatePosterContent(listPoster){
        var $posterContainer = $searchPage.find("#poster-search-content");
        var $result = $searchPage.find(".result");
        var $searchLoading = $(".loading-search");


        var html = [];

        var counter = 0

        $posterContainer.html("")

        $.each(listPoster, function (index, poster) {

          var posterId = poster.id;
          var posterTitle = poster.title;
          var posterUrl = poster.posterUrl;
          var posterDesc = poster.description;

          var exhibitorId = poster.exhibitorId;
          var exhibitor = _listExhibitor[exhibitorId]

          if(exhibitor == undefined){
            return;
          }

          var exhibitorBoothNumber = exhibitor.booth_number;
          var exhibitorBoothType = exhibitor.booth_type;

          boothId = exhibitorId + "-" + exhibitorBoothType + "-" + exhibitorBoothNumber;
          counter++
          (function addTemplate() {
            html.push('<li class="product-block exhibitor_block">')
              html.push('<div class="pb-upper">')
                html.push('<div class="pb-image exhibitor_image">')
                  html.push('<img src="'+posterUrl+'" border="0" alt="booth" class="pb-img" data-title="'+posterTitle+'" data-desc="'+posterDesc+'">')
                html.push('</div>')
                html.push('<div class="pb-description exhibitor_desc">')
                  html.push('<h4>'+posterTitle+'</h4>')
                  html.push('<h5 class="booth_id">BOOTH '+boothId+'</h5>')
                  html.push('<h5 class="description exhibitor_overview">'+posterDesc+' </h5>')
                  html.push('<div class="pb-button exhibitor_circle">')
                    html.push('<a href="#" class="exhibition-more"   data-title="'+posterTitle+'"   data-src="'+posterUrl+'" >&#x0003E;</a>')
                  html.push('</div>')
                html.push('</div>')
              html.push('</div>')
            html.push('</li>')
          })();

        });

        $result.html(counter + " " + "result(s)")

        if(counter == 0){
          showSearchMessage("Sorry, no search result were found")
        }

        $searchLoading.hide();
        $posterContainer.html(html.join(""))
        addImageClickEvent();

        function addImageClickEvent(){
          var $posterSearchImg = $posterContainer.find(".pb-img");
          var $posterArrowButton = $posterContainer.find(".exhibition-more")
          $posterSearchImg.click(function (e) {
            e.preventDefault();
            var posterSrc = $(this).attr("src");
            var posterTitle = $(this).attr("data-title");
            var posterDesc = $(this).attr("data-desc");

            showPosterPopup(posterSrc,posterTitle, posterDesc)
          });

          $posterArrowButton.click(function (e) {
            e.preventDefault();
            var posterSrc = $(this).attr("data-src");
            var posterTitle = $(this).attr("data-title");
            var posterDesc = $(this).attr("data-desc");

            showPosterPopup(posterSrc,posterTitle, posterDesc)

          });

        }


      }

      function updateVideoContent(listVideo){
        var $videoContainer = $searchPage.find("#video-search-content");
        var $result = $searchPage.find(".result");
        var $searchLoading = $(".loading-search");

        var html = [];

        var counter = 0

        $videoContainer.html("")

        $.each(listVideo, function (index, video) {


          var videoId = video.id;
          var videoTitle = video.title;
          var videoThumbnailUrl = video.videoThumbnailUrl;
          var videoUrl = video.videoUrl;
          var videoDesc = video.description

          var exhibitorId = video.exhibitorId;
          var exhibitor = _listExhibitor[exhibitorId]

          if(exhibitor == undefined){
            return;
          }

          var exhibitorBoothNumber = exhibitor.booth_number;
          var exhibitorBoothType = exhibitor.booth_type;

          boothId = exhibitorId + "-" + exhibitorBoothType + "-" + exhibitorBoothNumber;

          counter++

          (function addTemplate() {
            html.push('<li class="product-block exhibitor_block">')
              html.push('<div class="pb-upper">')
                html.push('<div class="pb-image exhibitor_image">')
                  html.push('<img src="'+videoThumbnailUrl+'" border="0" alt="booth" data-title="'+videoTitle+'" data-video="'+videoUrl+'" data-desc="'+videoDesc+'" class="pb-img">')
                html.push('</div>')
                html.push('<div class="pb-description  exhibitor_desc">')
                  html.push('<h4>'+videoTitle+'</h4>')
                  html.push('<h5 class="booth_id">BOOTH '+boothId+'</h5>')
                  html.push('<h5 class="description exhibitor_overview">'+videoDesc+'</h5>')
                  html.push('<div class="pb-button exhibitor_circle">')
                    html.push('<a href="#" class="exhibition-more"   data-title="'+videoTitle+'"   data-src="'+videoUrl+'" data-desc="'+videoDesc+'" >&#x0003E;</a>')
                  html.push('</div>')
                html.push('</div>')
              html.push('</div>')
            html.push('</li>')
          })();

        });


        $result.html(counter + " " + "result(s)")
        $searchLoading.hide();
        $videoContainer.html(html.join(""))
        addImageClickEvent();

        function addImageClickEvent(){
          var $posterSearchImg = $videoContainer.find(".pb-img");
          var $posterArrowButton = $videoContainer.find(".exhibition-more")

          $posterSearchImg.click(function (e) {
            e.preventDefault();
            var videoUrl = $(this).attr("data-video");
            var youtubeId = getYoutubeID(videoUrl)
            if(youtubeId != ''){
              videoUrl = "https://www.youtube.com/embed/" + youtubeId
            }

            var videoTitle = $(this).attr("data-title");
            var videoDesc = $(this).attr("data-desc");

            showVideoPopup(videoUrl, videoTitle, videoDesc)
          });

          $posterArrowButton.click(function (e) {
            e.preventDefault();
            var videoSrc = $(this).attr("data-src");
            var videoTitle = $(this).attr("data-title");
            var videoDesc = $(this).attr("data-desc");

            showVideoPopup(videoSrc, videoTitle, videoDesc)
          });

        }


      }

      function updateAllContent(listContent){
        var $searchContainer = $searchPage.find("#all-search-content");
        var $result = $searchPage.find(".result");
        var $searchLoading = $(".loading-search");

        var html = [];
        var counter = 0

        $searchContainer.html("")

        $.each(listContent, function (index, content) {
          var contentId = content.id;
          var contentName = content.name;
          var contentType = content.type;
          var thumbnailSrc = "";
          var companyName = "default - company name";
          var boothId = "";
          var title = "";
          var iconSrc = "./../assets/images/pin.png"
          var contentDesc = "Sports Car";
          var iconDesc = "default - London"
          var exhibitorId = "";
          var exhibitor = {};
          var videoUrl = "";

            if(contentType == "exhibitor"){
            iconDesc = content.exhibitor_country;

            exhibitor = content
            thumbnailSrc = exhibitor.booth_thumbnail;
            contentDesc = exhibitor.exhibitor_profile
            companyName = exhibitor.name;
            exhibitorId = exhibitor.id
            var exhibitorStatus = exhibitor.exhibitor_status;

            if(exhibitorStatus != "Approved"){
              return;
            }

            var exhibitorBoothNumber = exhibitor.booth_number;
            var exhibitorBoothType = exhibitor.booth_type;

            boothId = exhibitorId + "-" + exhibitorBoothType + "-" + exhibitorBoothNumber
            title = companyName;

          } else if(contentType == "poster"){
            iconDesc = "poster"
            iconSrc = "./../assets/images/photo.png"


            title = content.title;
            thumbnailSrc = content.posterUrl;
            exhibitorId = content.exhibitorId;
            exhibitor = _listExhibitor[exhibitorId];
            contentDesc = content.description

            if(exhibitor == undefined){
              return;
            }

            companyName = exhibitor.name;

            var exhibitorBoothNumber = exhibitor.booth_number;
            var exhibitorBoothType = exhibitor.booth_type;

            boothId = exhibitorId + "-" + exhibitorBoothType + "-" + exhibitorBoothNumber

          } else if(contentType == "video"){
            iconDesc = "video"
            iconSrc = "./../assets/images/video-gray.png"

            videoUrl = content.videoUrl

            title = content.title;
            thumbnailSrc = content.videoThumbnailUrl;
            exhibitorId = content.exhibitorId;
            exhibitor = _listExhibitor[exhibitorId];
            contentDesc = content.description

            if(exhibitor == undefined){
              return;
            }

            companyName = exhibitor.name;

            var exhibitorBoothNumber = exhibitor.booth_number;
            var exhibitorBoothType = exhibitor.booth_type;
            boothId = exhibitorId + "-" + exhibitorBoothType + "-" + exhibitorBoothNumber

          }

          (function addTemplate() {
            counter++;
            html.push('<li class="product-block exhibitor_block">')
              html.push('<div class="pb-upper">')
                html.push('<div class="pb-image exhibitor_image">')
                  html.push('<img src="'+thumbnailSrc+'" border="0" alt="booth" class="pb-img pb-img-'+contentType+'" data-video="'+videoUrl+'" data-title="' +title+ '" data-desc="'+ contentDesc +'" data-type="' +contentType+ '" data-exhibitor-id="' +exhibitorId+ '">')
                html.push('</div>')
                html.push('<div class="pb-description exhibitor_desc">')
                  html.push('<h3 class="title_search_all"  data-type="' +contentType+ '">'+title+'</h3>')
                  html.push('<h4 class="company_search_all">'+companyName+'</h4>')
                  html.push('<h4 class="booth_id"> Booth '+boothId+'</h4>')
                  html.push('<h5 class="description exhibitor_overview">'+contentDesc+'</h5>')
                  html.push('<div class="pb-button exhibitor_circle">')
                    html.push('<span class="search_all_media '+contentType+'-icon">')
                      html.push('<img class="img_search_all" src="'+iconSrc+'" alt="pin"> ' + iconDesc)
                    html.push('</span>')
                  html.push('</div>')
                html.push('</div>')
              html.push('</div>')
            html.push('</li>')
          })();
        });

        $searchContainer.html(html.join(""));
        $searchLoading.hide();
        $result.html(counter + " Result(s)");

        if(counter == 0){
          showSearchMessage("Sorry, no search result were found")
        }

        addImageClickEvent();
        addShowPopupEvent();

        function addImageClickEvent() {
          var $imageSearchImg = $searchContainer.find(".pb-img");
          $imageSearchImg.click(function (e) {
            e.preventDefault();
            var contentType = $(this).attr("data-type");
            if(contentType == "poster"){
              var posterSrc = $(this).attr("src");
              var posterTitle = $(this).attr("data-title");
              var posterDesc = $(this).attr("data-desc");

              showPosterPopup(posterSrc,posterTitle, posterDesc)
            } else if(contentType == "video"){
              var videoUrl = $(this).attr("data-video");
              var youtubeId = getYoutubeID(videoUrl)
              if(youtubeId != ''){
                videoUrl = "https://www.youtube.com/embed/" + youtubeId
              }
              var videoTitle = $(this).attr("data-title");
              var videoDesc = $(this).attr("data-desc");

              showVideoPopup(videoUrl,videoTitle, videoDesc)
            } else if(contentType == "exhibitor") {
              var exhibitorId = $(this).attr("data-exhibitor-id");
              $("#open-search").modal("hide")
              $("#search-page").find(".close").trigger("click")
              _changeBooth(parseInt(exhibitorId));
            }
          });
        }

        function addShowPopupEvent() {
          var $titleSearch = $searchContainer.find(".title_search_all");
          var $posterIcon = $searchContainer.find(".poster-icon");
          var $videoIcon = $searchContainer.find(".video-icon");
          var $exhibitorIcon = $searchContainer.find(".exhibitor-icon");


          $titleSearch.click(function (e) {
            e.preventDefault();
            var contentType = $(this).attr("data-type");
            var $productBlock = $(this).closest(".product-block")
            if(contentType == "poster"){
              var posterSrc = $productBlock.find(".pb-img").attr("src");
              var posterDesc = $productBlock.find(".pb-img").attr("data-desc");

              var posterTitle = $(this).html();
              showPosterPopup(posterSrc, posterTitle, posterDesc)
            } else if(contentType == "video") {
              var videoTitle = $(this).html();
              var videoUrl = $productBlock.find(".pb-img").attr("data-video");
              var videoDesc = $productBlock.find(".pb-img").attr("data-desc");

              var youtubeId = getYoutubeID(videoUrl)
              if(youtubeId != ''){
                videoUrl = "https://www.youtube.com/embed/" + youtubeId
              }
              showVideoPopup(videoUrl,videoTitle, videoDesc)
            } else if(contentType == "exhibitor") {
              var exhibitorId = $productBlock.find(".pb-img").attr("data-exhibitor-id")
              $("#open-search").modal("hide")
              $("#search-page").find(".close").trigger("click")
              _changeBooth(parseInt(exhibitorId));
            }
          })

          $posterIcon.click(function (e) {
            e.preventDefault();
            var $productBlock = $(this).closest(".product-block")
            var posterSrc = $productBlock.find(".pb-img").attr("src");
            var posterTitle = $productBlock.find(".title_search_all").html();
            showPosterPopup(posterSrc,posterTitle)
          })

          $videoIcon.click(function (e) {
            e.preventDefault();
            var $productBlock = $(this).closest(".product-block")
            var videoUrl = $productBlock.find(".pb-img").attr("data-video");
            var videoDesc = $productBlock.find(".pb-img").attr("data-desc");

            var youtubeId = getYoutubeID(videoUrl)
            if(youtubeId != ''){
              videoUrl = "https://www.youtube.com/embed/" + youtubeId
            }
            var videoTitle = $productBlock.find(".title_search_all").html();
            showVideoPopup(videoUrl,videoTitle, videoDesc)

          })

          $exhibitorIcon.click(function (e){
            e.preventDefault();
            var $productBlock = $(this).closest(".product-block");
            var exhibitorId = $productBlock.find(".pb-img").attr("data-exhibitor-id")
            $("#open-search").modal("hide")
            $("#search-page").find(".close").trigger("click")
            _changeBooth(parseInt(exhibitorId));
          })


        }



      }

      return{
        updateExhibitor: updateExhibitorContent,
        updatePoster: updatePosterContent,
        updateVideo: updateVideoContent,
        updateAllContent: updateAllContent
      }

    }

    function _addSearchEvent(){
      var $searchPage = $("#search-page");
      var $searchCategoryMenu = $("#search-page").find(".search-category");
      var $exhibitorName = $("#company-name");
      var $searchTextInput = $searchPage.find(".search-bar").find("input")
      var $location = $searchPage.find("#location")
      var $boothId = $searchPage.find("#boothID")

      $exhibitorName.change(function(){
        var SearchCategorySelected = $searchPage.find(".menu-search_left").find(".active").attr("id");
        var filter = getCurrentFilterSelected();
        search(SearchCategorySelected, filter);

        var exhibitorSelected = $exhibitorName.val();
        if(exhibitorSelected != ""){
          $boothId.attr("disabled","true");
        } else {
          $boothId.removeAttr("disabled");
        }

      })

      $boothId.change(function(){
        var SearchCategorySelected = $searchPage.find(".menu-search_left").find(".active").attr("id");
        var filter = getCurrentFilterSelected();
        search(SearchCategorySelected, filter);

        var boothId = $boothId.val();
        if(boothId != ""){
          $exhibitorName.attr("disabled","true");
        } else {
          $exhibitorName.removeAttr("disabled");
        }
      })

      $location.change(function(){
        var SearchCategorySelected = $searchPage.find(".menu-search_left").find(".active").attr("id");
        var filter = getCurrentFilterSelected();
        search(SearchCategorySelected, filter);
      })

      $searchCategoryMenu.click(function(){
        var SearchCategorySelected = $(this).attr("id");
        var filter = getCurrentFilterSelected();
        search(SearchCategorySelected, filter);

        var boothId = $boothId.val();
        if(boothId != ""){
          $exhibitorName.attr("disabled","true");
        } else {
          $exhibitorName.removeAttr("disabled");
        }
      })

      $searchTextInput.on('input',function(){
        var SearchCategorySelected = $searchPage.find(".menu-search_left").find(".active").attr("id");
        var filter = getCurrentFilterSelected();
        search(SearchCategorySelected, filter);
      })

      function search(SearchCategorySelected, filter) {
        var $searchLoading = $(".loading-search");
        $searchLoading.show();

        if(SearchCategorySelected == "search-exhibitor"){
          filter["type"] = "exhibitor"
        } else if (SearchCategorySelected == "search-poster") {
          filter["location"] = ""
          filter["type"] = "poster"
        } else if (SearchCategorySelected == "search-video") {
          filter["location"] = ""
          filter["type"] = "video"
        } else {
          filter["type"] = ""
        }
        searchFunction().searchAllContent(filter)
      }

      function getCurrentFilterSelected(){
        var filter = {}
        var SearchCategorySelected = $searchPage.find(".menu-search_left").find(".active").attr("id");

        var searchInput = $searchTextInput.val();
        var exhibitorSelected = $exhibitorName.val();
        var boothId = $boothId.val();
        var location = $location.val();

        filter["exhibitorName"] = searchInput
        filter["title"] = searchInput
        filter["boothId"] = boothId
        filter["location"] = location

        if(boothId == ""){
          filter["boothId"] = 0
        }

        if(exhibitorSelected != ""){
          filter["boothId"] = exhibitorSelected
        }

        return filter
      }

    }

    function _addCloseSearchModalEvent() {
      var $searchPage = $("#search-page");
      var $closeBtn = $searchPage.find(".close");

      $closeBtn.click(function (e) {
        var $formInput  = $searchPage.find(".search-bar ").find("input")
        $formInput.val("")

        $('#location>option').attr('selected', false);
        $('#location>option:eq(0)').attr('selected', true);

        $('#boothID>option').attr('selected', false);
        $('#boothID>option:eq(0)').attr('selected', true);

        $('#company-name>option').attr('selected', false);
        $('#company-name>option:eq(0)').attr('selected', true);

        emptySearchContent();
        hideMessage();

      });

      function hideMessage(){
        var $searchMsg = $searchPage.find(".search-message");
        $searchMsg.hide();
        $searchMsg.find(".message").hide()
        $searchMsg.find(".message").html("")
      }

    }

    // Change Country and Title dropdown in form

    function _changeCountryDropdown(){

      getCountry();

      function getCountry(){
        var listCountry = []
        var getCountry = api.get({
          $target: $(".register-country"),
          url: '/GetCountryAndTimeZone',
          method: 'POST',
          onReceived: function onReceived($target, data) {
            if (data.Status == false) {
              _showResponseModal("get data fail : " + data.Message);
            } else {
              listCountry = JSON.parse(data.Data);
                _changeCountryDropdownInterface(listCountry);
            }
          }
        });
      }

      function _changeCountryDropdownInterface(listCountry){

        updateEnqForm(listCountry)
        updateRegistrationForm(listCountry)
        updatePrivatemeetingForm(listCountry)
        updateSearchLocationOption(listCountry)

        function updateRegistrationForm(listCountry){
          var $dropdown = $("#register-select-country");
          var html = [];
          $.each(listCountry, function (index, country) {
            var countryVal = country.value;
            var countryText = country.text;
            // register
            html.push("<option value='"+countryVal+"'>"+countryText+"</option>")
          });
          $dropdown.html('<option value="" disabled selected>Select Country</option>')
          $dropdown.append(html.join(""));
        }

        function updateEnqForm(listCountry){
          var $dropdown = $("#enq_country");
          var html = [];
          $.each(listCountry, function (index, country) {
            var countryVal = country.value;
            var countryText = country.text;
            html.push("<option value='"+countryVal+"'>"+countryText+"</option>")
          });
          $dropdown.html('<option value="" disabled selected>Country*</option>')
          $dropdown.append(html.join(""));

        }

        function updatePrivatemeetingForm(listCountry){
          var $dropdown = $("#select-country-private-meeting");
          var html = [];
          $.each(listCountry, function (index, country) {
            var countryVal = country.value;
            var countryText = country.text;
            _listCountryAndTimezone[countryVal] = country.TimeZone;
            html.push("<option value='"+countryVal+"'>"+countryText+"</option>")
          });
          $dropdown.html('<option value="" disabled selected>Country*</option>')
          $dropdown.append(html.join(""));
        }

        function updateSearchLocationOption(listCountry){
          var $dropdown = $("#location");
          var html = [];
          $.each(listCountry, function (index, country) {
            var countryVal = country.value;
            var countryText = country.text;
            // register
            html.push("<option value='"+countryVal+"'>"+countryText+"</option>")
          });
          $dropdown.html('<option value="" selected>Location</option>')
          $dropdown.append(html.join(""));
        }

      }



    }

    function _changeTitleDropdown(){

      getTitle();

      function getTitle(){
        var listTitle = []
        var getTItle = api.get({
          $target: $(".title-register"),
          url: '/GetListOfItemsOfAClassificationByName',
          request: JSON.stringify({
            name:"titles"
          }),
          method: 'POST',
          onReceived: function onReceived($target, data) {
            if (data.Status == false) {
              _showResponseModal("get data fail : " + data.Message);
            } else {
              listTitle = JSON.parse(data.Data);
              _changeTitleDropdownInterface(listTitle);
            }
          }
        });
      }

      function _changeTitleDropdownInterface(listTitle){

        updateRegistrationForm(listTitle)
        updatePrivateMeetingForm(listTitle)


        function updateRegistrationForm(listTitle){
          var $dropdown = $("#title-register");
          var html = [];
          $.each(listTitle, function (index, title) {
            var val = title.value;
            var text = title.text;
            _listTitle[text] = val
            // register
            html.push("<option value='"+val+"'>"+text+"</option>")
          });
          $dropdown.html('<option value="" disabled selected>Title*</option>')
          $dropdown.append(html.join(""));
        }

        function updatePrivateMeetingForm(listTitle){
          var $dropdown = $("#form-title");
          var html = [];
          $.each(listTitle, function (index, title) {
            var val = title.value;
            var text = title.text;
            // register
            html.push("<option value='"+val+"'>"+text+"</option>")
          });
          $dropdown.html('<option value="" disabled selected>Title*</option>')
          $dropdown.append(html.join(""));
        }


      }


    }




    // Modals
    function _showResponseModal(message) {

      var newMsg = sentenceCase(message, true);

      var $responseModal = $("#action-response");
      $responseModal.find(".message").html(newMsg);
      // $responseModal.find(".message").html("you need to <a class='login_here' data-toggle='modal' data-target='#open-login' data-dismiss='modal'>login</a>before");
      $responseModal.modal("show");

      function sentenceCase(input, lowercaseBefore) {
        input = ( input === undefined || input === null ) ? '' : input;
        if (lowercaseBefore) { input = input.toLowerCase(); }
        return input.toString().replace( /(^|\. *)([a-z])/g, function(match, separator, char) {
            // return separator + char.toUpperCase();
        return match.toUpperCase();
        });
      }
    }

    // Slick

    function _slick(element) {
      if (element.children().length > 0) {
        element.slick({
          centerMode: true,
          centerPadding: '0px',
          dots: true,

          /* Just changed this to get the bottom dots navigation */
          infinite: true,
          speed: 300,
          slidesToShow: 1,
          slidesToScroll: 1,
          adaptiveHeight: true,
          arrows: true
        });
      }
      _addSlickEvent(element);
      _updateBookmarkIcon();

    }

    function _addSlickEvent(element) {
      element.on('afterChange', function (event, slick, currentSlide, nextSlide) {

        _updateBookmarkIcon();
        _updateModalPopupTitleAndDesc();
        _updateFullscreenButtonHref();
      });

      element.on('beforeChange', function (event, slick, currentSlide, nextSlide) {

        var $videoElement = $('.slick-active').find(".popup-video")
        videoSrc = $videoElement.attr("src")

        if($videoElement.length > 0){
          $videoElement.attr("src",videoSrc)
        }


      });
    }

    function _init() {
      _variableInitiation();

      _AddViewListingClickEvent();

      _addFormRegisterSubmitEvent();

      _addPrivateMeetingFormSubmitEvent();

      _addPrivateMeetingTimezoneUpdateEvent();

      _updateRequestMeetingFormByUserLoginStatus();

      _addUpdateParticipantEvent()

      _addFormLoginSubmitEvent();

      _addBookmarkButtonClickEvent();

      _addEnquiryFormSubmitEvent()

      _updateBookmarkedContent();

      _updateUserVisitHistory();

      _changeUserProfile();

      _addDownloadClickEvent();

      _addAutoLogoutEvent();

      _addAccountSettingEvent();

      _updateAgendaInterface();

      _addSeminarButtonClickEvent();

      _changeCountryDropdown();

      _changeTitleDropdown();

      _addEventForUpdateAvailableEvent();

      _addSearchEvent();

      _addCloseSearchModalEvent();

      _addVideoPopupCloseClickEvent();

      _initDraggableMeetingBox();

      _addForgotPasswordFunc();

      _addFormWebinarSumbitEvent();

      _addStopVideoWhenModalClose();

      _changeBoothViewMapFunc =  function _addViewmapHotspotClickEvent(boothType) {

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


      if (isLoggedIn()) {
        _changeRegisterToLogoutButton();
        _autoFillInquiryFormWhenLoggenIn();
        _autoFilLAccountSettingForm();
      }
    }

    return {
      init: _init
    };
  }();

  $(function () {
    project.init({});
  });
})(jQuery);
