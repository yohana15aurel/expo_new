import { SETTINGS } from '../constants';
import { $window, storage } from '../services';

/**
 * @service Api
 * @dependency
 * - WebAPI
 */
let api = (function () {
  let BASE_URL = SETTINGS.API_BASE_URL;
  let WebAPI = window.WebAPI;
  let options = {
    $target: $window,
    baseUrl: (document.location.hostname == 'localhost' || document.location.hostname == 'fxm.web.id') ? 'https://dev.xpomania.com' + BASE_URL : BASE_URL,
    method: "GET",
    url: "",
    request: {},
    onBeforeRequest: function ($target) { },
    onReceived: function ($target, data) { },
    onError: function ($target, error) { },
    onAfterRequested: function () { },
    useCookie: false,
    cache: false,
    cacheRequest: false,
    getImage: false
  };

  return {
    get: function (userOptions) {
      let op = $.extend(true, {}, options, userOptions);

      if (op.cacheRequest) {
        let cachedData = storage.api.get(op.url);

        if (typeof cachedData != 'undefined') {
          op.onReceived(op.$target, cachedData)
          return;
        }
      } else {
        if (SETTINGS.ENABLE_CACHE_CLEARING) {
          storage.api.delete(op.url);
        }
      }

      WebAPI.GetData(op.$target, {
        baseUrl: op.baseUrl,
        url: op.url,
        request: op.request,
        method: op.method,
        onBeforeRequest: op.onBeforeRequest,
        onReceived: ($target, data) => {
          if (op.cacheRequest) {
            storage.setApi(op.url, data);
          }

          op.onReceived($target, data);
        },
        onError: op.onError,
        onAfterRequested: op.onAfterRequested,
        useCookie: op.useCookie,
        cache: op.cache,
        getImage: op.getImage
      });
    },
    /*
      The way to use it just like `.get` one, but wrapped in an array and
      has a name (Must be unique!). Example:
      moduleApi.multiple([
        {
          name: "blah...blah",
          options: {}
        },
        ...
      ], function (responses) {})
      Real example:
      moduleApi.multiple([
        { name: "/GetAllLevels", options: { url: "/Umbraco/Api/Content/GetAllLevels" } },
        { name: "/GetAllModules", options: { url: "/Umbraco/Api/Content/GetAllModules" } },
      ], (r) => logger(r));
    */
    multiple: function (listOfRequests, callback) {
      let module = this;
      let completed = {};
      let successCount = 0;
      let errorCount = 0;
      let totalRequests = 0;
      let requests = [];

      if (!$.isFunction(callback)) {
        callback = function () {};
      }

      $.each(listOfRequests, function (key, request) {
        if (
          $.isPlainObject(request) && request.name &&
          $.isPlainObject(request.options) &&
          typeof completed[request.name] == "undefined"
        ) {
          let name = request.name;
          let opts = $.extend(true, {}, options, request.options, {
            onReceived: function ($t, response) {
              completed[name] = response;
              successCount += 1;
            },
            onError: function ($t, response) {
              completed[name] = response;
              errorCount += 1;
            },
            onAfterRequested: function () {
              if (totalRequests == (successCount + errorCount)) {
                callback(completed)
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
    sequent: function (listOfRequests, callback) {
      let module = this;
      let completed = {};
      let successCount = 0;
      let errorCount = 0;
      let totalRequests = 0;
      let requests = [];

      if (!$.isFunction(callback)) {
        callback = function () {};
      }

      let next = function () {
        module.get(requests.shift());
      };

      $.each(listOfRequests, function (key, request) {
        if (
          $.isPlainObject(request) && request.name &&
          $.isPlainObject(request.options) &&
          typeof completed[request.name] == "undefined"
        ) {
          let name = request.name;
          let opts = $.extend(true, {}, options, request.options, {
            onReceived: function ($t, response) {
              completed[name] = response;
              successCount += 1;
            },
            onError: function ($t, response) {
              completed[name] = response;
              errorCount += 1;
            },
            onAfterRequested: function () {
              if (totalRequests == (successCount + errorCount)) {
                callback(completed)
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
}());

export { api };
