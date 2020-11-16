/**
 * @author FXMEDIA Internet Pte. Ltd
 * @copyright (c) 2020 -- current
 */

(function (window, $) {

  window.WebAPI = {};
  // WebAPI.AUTH_TOKEN = 'eHBvOlg5ODczcG8xMjMhQA==';

  // default config
  WebAPI.API_BASE_URL = "";

  // internals
  var currentUnique = 1;

  WebAPI.GetUnique = function () {
    return currentUnique++;
  };

  WebAPI.LoadImage = function ($target, userOptions) {
    var options = $.extend({
      useBaseURL: true,
      url: "",
      onLoad: function () { },
      onError: function () { }
    }, userOptions);

    $target = $($target);

    $target.attr("src", (options.useBaseURL ? WebAPI.GetFilesPath() : "") + ($.isFunction(options.url) ? options.url() : options.url));
    $target.on("load", options.onLoad);
    $target.on("error", options.onError);
  };

  WebAPI.GetData = function ($target, userOptions) {
    var options = $.extend({
      url: "",
      request: {},
      method: "GET",
      onBeforeRequest: function ($target) { },
      onReceived: function ($target, data) { },
      onError: function ($target, error) { },
      onAfterRequested: function () { },
      useCookie: false,
      cache: false,
      getImage: false
    }, userOptions ? userOptions : {});
    var xhr;
    var xhrSetup = {
      data: options.request,
      type: options.method,
      crossDomain: true
    };
    var baseUrl = WebAPI.API_BASE_URL;

    if (typeof options.baseUrl != "undefined") {
      baseUrl = options.baseUrl;
    }

    $.extend(xhrSetup, {
      url: baseUrl + ($.isFunction(options.url) ? options.url() : options.url),
    });

    if (options.useCookie) {
      $.extend(xhrSetup, {
        xhrFields: {
          withCredentials: true
        }
      });
    }

    if (!options.getImage) {
      $.extend(xhrSetup, {
        dataType: 'json'
      });
    }

    if (options.cache) {
      $.extend(xhrSetup, {
        cache: true
      });
    }

    if (WebAPI.AUTH_TOKEN) {
      $.extend(xhrSetup, {
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', WebAPI.AUTH_TOKEN);
        }
      });
    }

    if ($.isFunction(options.onBeforeRequest)) {
      options.onBeforeRequest($target);
    }

    xhr = $.ajax(xhrSetup);

    xhr.done(function (result) {
      if ($.isFunction(options.onReceived)) {
        options.onReceived($target, result);
      }
    });

    xhr.fail(function (xhr, textStatus) {
      if ($.isFunction(options.onError)) {
        options.onError($target, xhr, textStatus);
      }
    });

    xhr.always(function () {
      if ($.isFunction(options.onAfterRequested)) {
        options.onAfterRequested();
      }
    });
  };

  WebAPI.For = function (target, payloads) {
    var $target = $(target);

    if ($target.length > 0) {
      WebAPI.GetData($target, payloads);
    }
  };

  WebAPI.ForJoin = function (id, requests, onLoaded) {
    var $base = $(id);

    if ($base.length > 0) {
      var totalRequests = requests.length;
      var completedRequests = 0;
      var failedRequests = 0;
      var responses = {};
      var finished = function () {
        var x = 0;

        requests.forEach(function (request, i) {
          if (!request.isFailed) {
            responses[request.name ? request.name : x++] = {
              $target: request.target,
              data: request.data
            };

            $.isFunction(request.onReceived) && request.onReceived(request.target, request.data);
          } else {
            $.isFunction(request.onError) && request.onError();
          }
        });

        if ($.isFunction(onLoaded)) {
          onLoaded(responses);
        }
      };

      requests.forEach(function (request, i) {
        request.isFailed = false;

        WebAPI.GetData($base.find(request.target), {
          url: request.url,
          method: request.method,
          request: request.request,
          onReceived: function ($target, result) {
            request.target = $target;
            request.data = result;
            completedRequests += 1;
          },
          onError: function () {
            request.isFailed = true;
            failedRequests += 1;
          },
          onAfterRequested: function () {
            if (completedRequests + failedRequests == totalRequests) {
              finished();
            }
          }
        });
      });
    }
  };

  WebAPI.LoadScript = function (scriptUrl, callback, userOptions) {
    var xhr = $.extend({}, {
      dataType: "script",
      cache: true,
      url: scriptUrl
    }, userOptions);
    var script = document.createElement("script");
    var url = xhr.url;

    if (xhr.cache) {
      url += "?t=" + (new Date().getTime()).toString(16) + WebAPI.GetUnique();
    }

    script.type = "text/javascript";
    script.src = url;
    script.onload = function () {
      if ($.isFunction(callback)) {
        callback();
      }
    };
    script.onerror = function (e) {
      try {
        console.log("can't load script (" + xhr.url + ").")
        console.log(e);
      } catch (error) { }
    };

    document.body.appendChild(script);

    return true;
  };

}(window, jQuery));
