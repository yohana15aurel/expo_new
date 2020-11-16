import { isFunction } from './helpers';

/**
 * @service PubSub
 */
const pubSub = (() => {
  let subscribers = {};
  let subscribersCounter = {};

  /**
   * @method subscribe
   * @param {string} channel
   * @param {function} callback
   * @return {number} subscribeId
   * This method will subscribe to specific channel and returns `subscribeId`
   * when subscribed. `subscribeId` will be used for `unsubscribe` method.
   */
  let subscribe = (channel = '', callback) => {
    if (!isFunction(callback) || channel == '') {
      return
    }

    if (typeof subscribers[channel] == 'undefined') {
      subscribers[channel] = [];
      subscribersCounter[channel] = 0;
    }

    subscribers[channel].push(callback);

    subscribersCounter[channel] = subscribersCounter[channel] + 1;

    return (subscribersCounter[channel] - 1);
  };

  let unsubscribe = (channel = '', subscribeId = -1) => {
    let channelSubscribers = subscribers[channel];

    if (subscribeId < 0 || typeof channelSubscribers == 'undefined') {
      return;
    }

    channelSubscribers[subscribeId] = 0;
  };

  let publish = (channel, data) => {
    let channelSubscribers = subscribers[channel];

    if ($.isArray(channelSubscribers) && channelSubscribers.length > 0) {
      let event = {
        channel: channel
      };

      $.each(channelSubscribers, (k, subscriber) => {
        if (isFunction(subscriber)) {
          subscriber(event, data);
        }
      });
    }
  };

  return { subscribe, publish, unsubscribe };
})();

export { pubSub };
