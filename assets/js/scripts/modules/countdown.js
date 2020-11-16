import { API_ENDPOINTS } from '../constants';
import { api } from '../services';
import { _changeRequestFormDateOption } from './private-meeting'

var defaultVideoThumbnail = "";

function setCountdown(startDate) {
  let second = 1000;
  let minute = second * 60;
  let hour = minute * 60;
  let day = hour * 24;
  let countDown = new Date(Date.parse(startDate)).getTime();
  let elem_days = document.getElementById('days');
  let elem_hours = document.getElementById('hours');
  let elem_minutes = document.getElementById('minutes');
  let elem_seconds = document.getElementById('seconds');
  let checkCountdown = (onFinished) => {
    let now = new Date().getTime(),
    distance = countDown - now;
    elem_days.innerText = Math.floor(distance / day);
    elem_hours.innerText = Math.floor(distance % day / hour);
    elem_minutes.innerText = Math.floor(distance % hour / minute);
    elem_seconds.innerText = Math.floor(distance % minute / second);

    if (distance <= 0) {
      if ($.isFunction(onFinished)) {
        onFinished();
      }
    } else {
      setTimeout(checkCountdown, second);
    }
  };

  checkCountdown(() => {
    window.location.href = $('.btn-skip').attr('href');
  });
}

function init() {



  let $countdown = $('#countdown');

  if ($countdown.length == 0) {
    return;
  }

  api.get({
    $target: $countdown,
    url: API_ENDPOINTS.GET_EVENT_SETTING,
    request: {},
    method: 'POST',
    onReceived: function onReceived($target, result) {
      // change date format dd/mm/yyyy hh:mm to mm/dd/yyyy hh:mm
      var $countdownBanner = $('.countdown-banner');
      $countdownBanner.$title = $countdownBanner.find('.js-text-countdown-title');
      $countdownBanner.$subTitle = $countdownBanner.find('.js-text-countdown-subtitle');

      var data = JSON.parse(result.Data);

      setDefaultVideoThumbnail(data.defaultVideoThumbnail)

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

      _changeRequestFormDateOption(startDate)
      setCountdown(startDate);
    }
  });
}

function getDefaultVideoThumbnail(){
  return defaultVideoThumbnail;
}

function setDefaultVideoThumbnail(videoUrl){
  defaultVideoThumbnail = videoUrl;
}

export { init, getDefaultVideoThumbnail };
