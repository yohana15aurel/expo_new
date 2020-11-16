import { SETTINGS } from "../constants/settings";

/**
 * @method isPage
 * This method will check:
 * `<div class="js-controller" data-controller="CONTROLLER_ID"></div>`
 * @return boolean TRUE if matches controllerId, FALSE otherwise
 */
let isController = (controllerId) => {
  return $('.js-controller').filter(`[data-controller="${controllerId}"]`).length > 0;
};

let isFunction = (x) => typeof x == 'function';

let onElement = (selector, callback) => {
  let $target = $(selector);

  if ($target.length > 0 && isFunction(callback)) {
    callback();
  }
};

let redirect = (link = '') => {
  if (link == '' || link == '#' || /^javascript/.test(link)) {
    return;
  }

  if (/^\//.test(link)) {
    link = SETTINGS.BASE_URL + link.substring(1);
  }

  window.location.href = link;
};

let delay = (duration, fn) => setTimeout(fn, duration);

let debugRun = (fn) => {
  if (SETTINGS.IS_DEBUG) {
    fn();
  }
};

let trim = (v) => {
  if (typeof v != 'string') {
    return '';
  } else {
    return v.replace(/^\s*|\s*$/g, '');
  }
};

/**
 * @function timeToSeconds
 * @param {string} time
 * Convert hh:?mm:ss format to seconds
 */
let timeToSeconds = (time) => {
  if (isFinite(time)) {
    return time;
  }

  let isTime = /^(\d+:)?\d{1,2}:\d{1,2}$/;
  let times = time.replace(/^\s+|\s+$/g, "").split(":");

  if (!isTime.test(time) || (times.length != 3 && times.length != 2)) {
    return 0;
  }

  return times.length == 3 ?
    (~~times[0] * 3600) + (~~times[1] * 60) + ~~times[2] :
    (~~times[0] * 60) + ~~times[1];
};

let objectPropertyExist = (object, arrOfKeys) => {
  let exist = true;
  let currObject = object;

  if (arrOfKeys.length == 0) {
    exist = false;
  }

  $.each(arrOfKeys, function (i, key) {
    if (typeof currObject[key] != "undefined") {
      currObject = currObject[key];
    } else {
      exist = false;
    }
  });

  return exist;
};

let getRandomNumber = (from = 0, to = 1) => {
  from = Math.ceil(from);
  to = Math.floor(to);

  return Math.floor(Math.random() * (to - from + 1)) + from;
};

let debugLog = (() => {
  let counter = 1;

  let pad = (txt) => {
    txt = txt.toString();
    let padLength = 3;
    let txtLength = txt.length;
    let remainder = padLength - txtLength;

    while (remainder-- > 0) {
      txt = '0' + txt;
    }

    return txt;
  };

  return function () {
    if (SETTINGS.IS_DEBUG) {
      console.log(`-------------------------(DEBUG: #${pad(counter)})-------------------------`);
      console.log.apply(null, arguments);

      counter += 1;
    }
  };
})();

export {
  isController,
  isFunction,
  onElement,
  trim,
  redirect,
  delay,
  debugRun,
  debugLog,
  timeToSeconds,
  objectPropertyExist,
  getRandomNumber
};
