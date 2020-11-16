(function (window, $, fx) {

  // https auto redirect
  if (location.hostname != 'localhost' && location.protocol !== 'https:') {
    location.replace('https:' + (location.href.substring(location.protocol.length)));
  }

  navbarFixed();
  // scroll();
  skip();
  loginRegis();
  toogleSearch();
  close_popup();
  scroll();
  showPopup();
  videoPlay();
  next_prevBooth();
  mapClick();
  listing();
  listGrid();
  share();
  guideHelp();
  dontShow();
  addHideMobileNavbarEvent();


  var boothLink = [
    './../xpo/booths/M01/M01.html',
    './../xpo/booths/M02/M02.html',
    './../xpo/booths/M03/M03.html',
    './../xpo/booths/M04/M04.html',
    './../xpo/booths/M05/M05.html',
    './../xpo/booths/M06/M06.html',
    './../xpo/booths/S01/S01.html',
    './../xpo/booths/S02/S02.html',
    './../xpo/booths/S03/S03.html',
    './../xpo/booths/SM01/SM01.html',
    './../xpo/booths/SS01/SS01.html',
    './../xpo/booths/L01/L01.html',
    './../xpo/booths/L02/L02.html',
    './../xpo/booths/L03/L03.html',
    './../xpo/booths/L04/L04.html'
  ];

  /*

  1. Fixed Navbar

  */

  //Navbar
  function navbarFixed() {
    $('[data-toggle=collapse-side]').click(function (e) {
      $('.side-collapse').toggleClass('open');
    });
    $('#close1').click(function () {
      $('.side-collapse').toggleClass('open');
    })
    $('#close2').click(function () {
      $('.side-collapse').toggleClass('open');
    })

    $(document).scroll(function () {
      var $nav = $(".navbar-static-top");
      $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });
    var expand = $('#expandMenu');
    var expandMenu = $('.navbar-mobile_detail')
    expand.click(function () {
      expandMenu.toggle()
    })
  }

  function addHideMobileNavbarEvent() {
    var navbarMenu = $(".navbar-nav").find("a");
    navbarMenu.click(function(){
      console.log("cek menu");
      $('.side-collapse').toggleClass('open');
    })
  }


  /*

  2. countDown

  */

  /*

      3. Skip

      */
  function skip() {
    var btnSkip = $(".button-skip")
    var btnScroll = $(".scroll")
    btnSkip.on('click', function () {
      location.replace("../xpomania-fe/xpo/xpo.html");
    });
    btnScroll.on('click', function () {
      $('.countdown-banner').css("display", "none");
      $('.welcome-banner').css("display", "none");
      $('.exhibition-layout').css("display", "block");
      $('.meeting-buttons').css("display", "none");
    });
  }
  /*

    4. toogle search

    */

  // Search Bar & Toggle
  function toogleSearch() {
    $('#toggle-search').on('click', function () {
      // $('#searchBar').toggle('display: inline-block');
      $("#search-page").modal()
      // $(".productWrapper").css("display", "none")
      // $("#exhibitor-search-content").show()

    });
  }


  /*

      5. Tooltip share button

      */
  // call bootstrap tooltip
  $(function () {
    $('body').tooltip({
      selector: '[data-toggle="tooltip"]',
      container: 'body'
    });
  });


  /*

      6. Close Pop up

      */
  function close_popup() {
    $(".close-key2").on('click', function () {
      $('.pop-up_key_instruction').css("display", "none");
    });
  }

  /*

      7. Scroll

      */
  function scroll() {
    var welcome = $('.welcome-banner');
    var exhibition = $('.exhibition-layout');
    var modalHelp = $('.modal_help_0')
    var popupInfo = $('.pop-up_key');
    var interval = 10000
    $('body').on('mousewheel DOMMouseScroll', function (e) {
      if (typeof e.originalEvent.detail == 'number' && e.originalEvent.detail !== 0) {
        if (e.originalEvent.detail > 0) {
          if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            welcome.hide()
            // hidePopup();
            exhibition.css("display", "block");
          }
        }
      } else if (typeof e.originalEvent.wheelDelta == 'number') {
        if (e.originalEvent.wheelDelta < 0) {
          if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            welcome.hide()
            exhibition.css("display", "block");
            // modalHelp.modal('show')
          }
        }
      }
    });

  }

  /*

         Modal Login Registrasi

         */
  function loginRegis() {
    var btnLogin = $('.btn-login');
    var btnRegis = $('.btn-regis');
    var regisForm = $('#open-register');
    var loginForm = $('#open-login');
    var loginRecover = $('#open-recover')
    var btnSign = $('.btn-sign')
    var btnRecover = $('.btn-recover')
    btnLogin.on('click', function () {
      regisForm.modal('hide');
    });
    btnRegis.on('click', function () {
      loginForm.modal('hide');
    });
    btnSign.on('click', function () {
      loginRecover.modal('hide')
    })
    btnRecover.on('click', function () {
      loginForm.modal('hide')
    })
  }






  /*

         set next and prev booth

         */
  function next_prevBooth() {

  }

  function mapClick() {
    // $('.spotClick').click(function () {
    //     $canvas = $('#canvas');
    //     $iframe = $canvas.find('iframe');

    //     var index = parseInt($(this).data("id")) - 1
    //     $iframe.attr('src', boothLink[index]);
    //     eqItem = index;
    //     $('#open-viewMap').modal('hide');
    // });
  }


  //Toggle Iframe Screen
  var meetingIframe = (function () {
    var $target;
    var $meetingBtns = $('.meeting-buttons');
    var $iframe = $('<iframe class="meeting jitsi-iframe" src="https://meet.xpomania.com/dcaf09fc71f7479c91d7d0a2865b7f85?token=rwLrmPLhuQaFNdwNICQDJJUpilgJ17Ufl3eW2qJv98fLyP58b6JcEybM7pqVfDrvjXIM7PWn6SYQVxLYVDlMaUTcoMSI3syLkdY5d4+5SSimvjfmz/j1ZY0p0RpHZuUdx52Q/d8Y0TSGNY6l3+havZFBk6ajoWS1p02KGT2EVV8=" allow="camera;microphone" allowfullscreen></iframe>');
    var options = {
      'class': {
        frameActive: 'active',
        isFullscreen: 'is-fullscreen',
        groupBtn: 'js-group-meet'
      },
      selector: {
        joinBtn: '.joinBtn',
        miniBtn: '.btn-minimize',
        fullBtn: '.btn-fullscreen',
        exitBtn: '.btn-exitmeeting',
        exitMobile: '.exitmeeting_mobile',
        iframeTarget: '.js-iframe-target'
      },
      ENUM: {}
    };
    var $targetIframe = $(options.selector.iframeTarget);
    var jitsiMeetingFullButton = function () {
      var $joinButton = $meetingBtns.find(options.selector.joinBtn);
      var $exitButton = $target.find(options.selector.exitBtn);
      var $exitBtnMobile = $target.find(options.selector.exitMobile);
      var $fullscreenButton = $target.find(options.selector.fullBtn);
      var $minimizeButton = $target.find(options.selector.miniBtn);
      var activeClass = options.class.frameActive;
      var isFullscreenClass = options.class.isFullscreen;
      var groupBtnClass = options.class.groupBtn;

      $joinButton.on("click", function (e) {
        e.preventDefault();

        if ($target.hasClass(activeClass)) {
          $target.removeClass(activeClass);
          $meetingBtns.removeClass(activeClass);

        } else {
          $target.addClass(activeClass);
          $iframe.appendTo(options.selector.iframeTarget);
          $meetingBtns.addClass(activeClass);

        }

      });

      $exitButton.on("click", function (e) {
        e.preventDefault();
        removeMeeting();
        // if ($target.hasClass(activeClass)) {
        //     $target.removeClass(activeClass);
        //     $meetingBtns.removeClass(activeClass);
        //     $target.removeClass(isFullscreenClass);
        //     $iframe.remove();
        // } else {
        //     $meetingBtns.addClass(activeClass);
        // }
        // $target.addClass(groupBtnClass);
      });
      $exitBtnMobile.on("click", function (e) {
        e.preventDefault();
        removeMeeting();
      });

      $fullscreenButton.on("click", function (e) {
        var dataLeftPosition = $(".jitsi-holder").attr("data-left");
        var dataTopPosition = $(".jitsi-holder").attr("data-top");
        e.preventDefault();
        if ($target.hasClass(isFullscreenClass)) {
          $target.removeClass(isFullscreenClass);
          $target.removeClass(activeClass);
          $target.addClass(groupBtnClass);
          $meetingBtns.removeClass(activeClass);

        } else {
          $target.css({'top': dataTopPosition, 'left' : 0})
          $target.addClass(isFullscreenClass);
          $target.addClass(activeClass);
          $target.removeClass(groupBtnClass);
          $meetingBtns.addClass(activeClass);

        }
      });

      $minimizeButton.on("click", function (e) {
        e.preventDefault();
        var dataLeftPosition = $(".jitsi-holder").attr("data-left");
        var dataTopPosition = $(".jitsi-holder").attr("data-top");
        dataLeftPosition = parseInt(dataLeftPosition)
        if ($target.hasClass(isFullscreenClass)) {
          $target.addClass(groupBtnClass);
          $target.removeClass(isFullscreenClass);
          $target.css({'top': dataTopPosition, 'left' : dataLeftPosition})
        } else {
          $target.addClass(isFullscreenClass);
          $target.removeClass(groupBtnClass);

        }

      });
    };

    var getActiveUrl = function () {
      return $.trim($targetIframe.find('iframe').attr('src'));
    };

    var showMeeting = function (url) {
      var activeClass = options.class.frameActive;
      $iframe = $('<iframe class="meeting jitsi-iframe" src="' + url + '" allow="camera;microphone" allowfullscreen></iframe>');

      removeMeeting();
      $target.addClass(activeClass);
      $iframe.appendTo(options.selector.iframeTarget);
      $meetingBtns.addClass(activeClass);
    };

    var removeMeeting = function () {
      var activeClass = options.class.frameActive;
      var isFullscreenClass = options.class.isFullscreen;
      var groupBtnClass = options.class.groupBtn;

      $target.removeClass(activeClass);
      $meetingBtns.removeClass(activeClass);
      $target.removeClass(isFullscreenClass);
      $targetIframe.empty();
      $target.addClass(groupBtnClass);
    };

    return {
      init: function (fx) {
        $target = $('.js-jitsi');

        if ($target.length > 0) {
          jitsiMeetingFullButton();
        }
      },
      showMeeting: showMeeting,
      getActiveUrl: getActiveUrl,
      removeMeeting: removeMeeting
    };
  }());

  window.meetingIframe = meetingIframe;

  //video seminar
  function videoPlay() {

    var videoSrc;
    var transition = $('#video-local')
    var video_seminar = $('#video-seminar')
    var seminar_youtube = $('#seminar-youtube')
    var modal_seminar = $('#open-viewSeminar')
    var close = $('#close-seminar')
    var toggle_seminar = $('.sticky-nav_seminar')
    var navbar_desktop = $('.nav-desktop')
    var navbar_mobile = $('.nav-mobile')
    var title = $('.live_stream')
    var content_seminar = $('.tab-content')
    var mq = window.matchMedia( "(max-width: 490px)" );
    $('.play-video').click(function () {
      var $play = $(this);
      if (!$play.data('clicked')) {
        videoSrc = $(this).data("local-video")
        close.css("display", "none")

        navbar_desktop.css("display", "none")
        navbar_mobile.css("display", "none")
        title.css("display", "none")
        content_seminar.css("display", "none")
        modal_seminar.on('shown.bs.modal', function (e) {
          transition.attr('src', videoSrc)
          transition.attr('autoplay', true)
          transition.attr('controls', false)
          transition.bind("ended", function () {
            transition.css("display", "none");
            close.css("display", "block")
            title.css("display", "block")
            content_seminar.css("display", "block")
            seminar_youtube.muted = false;
            if (mq.matches) {
              navbar_mobile.css("display", "block")
          }
          else {
            navbar_desktop.css("display", "block")
          }
          });
        })
      } else {
        transition.css("display", "none");
        close.css("display", "block")

        title.css("display", "block")
        seminar_youtube.attr('src', 'https://www.youtube.com/embed/gIB2egm7tL8');

      }
      $play.data('clicked', true);
    });
    modal_seminar.on('hide.bs.modal', function (e) {
      video_seminar.trigger('pause');
      seminar_youtube.attr('src', '');
    })
  }

  function listing() {
    $('.img-click').click(function () {
      $canvas = $('#canvas');
      $iframe = $canvas.find('iframe');

      var index = parseInt($(this).data("id")) - 1
      $iframe.attr('src', boothLink[index]);
      eqItem = index;
      $('#open-viewListing').modal('hide');

    });
  }


  // Hotspotter

  var viewmaphotspotter = (function () {
    var $hsarea = $('.hs-area');

    return {
      init: function () {
        if ($hsarea.length > 0) {
          $hsarea.hotspotter();
          $(window).bind('resize', function () {
            setTimeout(function () {
              $('.hs-area').hotspotter();
            }, 100);
          });
        }

      }
    };
  }());



  /*

         List Grid View

         */
  function listGrid() {
    var product = $('#productPage')
    if (product.length) {
      var lgView;
      if (product.hasClass('grid-view')) {
        lgView = "grid-view";

      } else {
        lgView = "list-view";
      };

      $('input[name="swap"]').on('click', function () {

        product.removeClass(lgView);
        lgView = $(this).val();
        product.addClass(lgView);
        $('.glyphicon').removeClass('active')
        $('#' + $(this).val()).addClass('active')
      });
    }
  }

  /*

       Share This

       */

  function share() {
    (function (document) {
      var shareButtons = document.querySelectorAll(".st-custom-button[data-network]");
      for (var i = 0; i < shareButtons.length; i++) {
        var shareButton = shareButtons[i];

        shareButton.addEventListener("click", function (e) {
          var elm = e.target;
          var network = elm.dataset.network;
        });
      }
    })(document);
  }

  /*

       Guide Help

       */

  function guideHelp() {
    var next = $('.btn_next')
    var skip = $('.btn_skip')

    next.on('click', function () {
      var index = parseInt($(this).data("id")) + 1
      var index2 = parseInt($(this).data("id"))
      $(".modal_help_" + index).modal('show')
      $(".modal_help_" + index2).modal('hide')
    })
    skip.on('click', function () {
      var index2 = parseInt($(this).data("id"))
      $(".modal_help_" + index2).modal('hide')
    })
  }


  /*

       Local Storage

       */

  function dontShow() {
    var btnScroll = $(".scroll")
    var btn_info = $('#info-btn');
    var modalHelp = $('.modal_help_0')
    var dontShow = $("#dontShow")
    var status = localStorage.getItem('chkStatus');

    function handleClick(event) {
      modalHelp.modal('show')
      if (status == 'true') {
        modalHelp.modal('hide')
        dontShow.attr('checked', true)
        event.preventDefault();
      } else {
        modalHelp.modal('show')
        dontShow.attr('checked', false)
      }
      dontShow.click(function () {
        if (this.checked) {
          modalHelp.modal('hide')
          event.preventDefault();
        } else {
          modalHelp.modal('show')
        }
        localStorage.setItem("chkStatus", this.checked);
      });
    }
    btnScroll.click(handleClick);
    // btn_info.click(handleClick);
  }

  /*

       Show Info

       */
  function showPopup() {
    var modalHelp = $('.modal_help_0')
    var btn_info = $('#info-btn');
    btn_info.on('click', function () {
      modalHelp.modal('show')
    });
  }




  $(function () {
    meetingIframe.init();
  });

}(window, jQuery, FXM));
