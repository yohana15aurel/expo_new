import { $html } from '../services';

const app = (function () {
  let isReady = false;
  let callbacks = [];

  let onReady = (callback) => {
    if ($.isFunction(callback) && !isReady) {
      callbacks.push(callback);
    } else {
      callback();
    }
  };

  let ready = () => {
    if (!isReady && (isReady = true)) {
      checkQueues();
      $html.addClass('app--is-ready');
    }
  };

  let checkQueues = () => {
    $.each(callbacks, (k, callback) => callback());
  };

  return {
    onReady: onReady,
    ready: ready
  };
}());

export { app };
