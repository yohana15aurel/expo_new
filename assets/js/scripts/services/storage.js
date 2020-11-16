import { SETTINGS } from '../constants/settings';
import { trim } from './helpers';

/**
 * @service Storage
 * This module will abstract away 3rd party plugin of storage. The data will
 * be removed when user close the browser.
 * ... and encrypted! =)
 * @dependency
 * - store.js
 * - SE encryptor and decryptor
 */
let storageType = trim(SETTINGS.STORAGE_TYPE.toLowerCase);

let KEY_STORE_USER = "____ud____";
let KEY_STORE_API = "____api____";
let KEY_DATA_USER = "user";
let KEY_DATA_API_DEFAULT = "api-default";

// SE.e||SE.d
let SE=function(){
  function n(n){let r,t,e,u,c,h,o,a,f,d=0,l=""
  if(!n)return n
  do r=n[d++],t=n[d++],e=n[d++],a=r<<16|t<<8|e,u=a>>18&63,c=a>>12&63,h=a>>6&63,o=63&a,l+=i.charAt(u)+i.charAt(c)+i.charAt(h)+i.charAt(o)
  while(d<n.length)
  return f=n.length%3,(f?l.slice(0,f-3):l)+"===".slice(f||3)}function r(n){let r,t,e,u,c,h,o,a,f=0,d=[]
  if(!n)return n
  n+=""
  do u=i.indexOf(n.charAt(f++)),c=i.indexOf(n.charAt(f++)),h=i.indexOf(n.charAt(f++)),o=i.indexOf(n.charAt(f++)),a=u<<18|c<<12|h<<6|o,r=a>>16&255,t=a>>8&255,e=255&a,d.push(r),64!==h&&(d.push(t),64!==o&&d.push(e))
  while(f<n.length)
  return d}function t(n,r){return n.charCodeAt(Math.floor(r%n.length))}function e(n,r){return r.split("").map(function(r,e){return r.charCodeAt(0)^t(n,e)})}function u(n,r){return r.map(function(r,e){return String.fromCharCode(r^t(n,e))}).join("")}let i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  return{e:function(r,t){return t=e(r,t),n(t)},d:function(n,t){return t=r(t),u(n,t)}}
}();

// To store user and login data { user: {...}, api: {...}, ... }
let storageData = {};

// Check-state, only first-time read
let hasInit = {};

let myStorage = (function () {
  let storageService = () => {
    if (storageType == 'sessionstorage') {
      return window.sessionStorage;
    } else {
      return window.localStorage;
    }
  };
  let storage = store.createStore({
    read(key) {
      return storageService().getItem(key);
    },
    write(key, data) {
      return storageService().setItem(key, data);
    },
    each(fn) {
      for (let i = storageService().length - 1; i >= 0; i--) {
        let key = storageService().key(i);

        fn(this.read(key), key);
      }
    },
    remove(key) {
      return storageService().removeItem(key);
    },
    clearAll() {
      return storageService().clear();
    }
  });

  return storage;
}());

let diskRead = function (key) {
  return myStorage.get(key);
};

let diskWrite = function (key, data) {
  let e = SE.e(key, JSON.stringify(data));

  myStorage.set(key, e);
};

let run = function (storageDataType, keyStore, callback) {
  if (!hasInit[storageDataType]) {
    hasInit[storageDataType] = true
    let data = diskRead(keyStore);

    if (typeof data == "undefined") {
      data = {};
    } else {
      data = JSON.parse(SE.d(keyStore, data))
    }

    storageData[storageDataType] = data;
  }

  if ($.isFunction(callback)) {
    callback(storageData[storageDataType]);
  }
};

let composeStorage = (keyStore, keyData) => {
  return {
    set(key, value) {
      run(keyData, keyStore, function (data) {
        data[key] = value;

        diskWrite(keyStore, data);
      });
    },
    get(key) {
      let result;

      run(keyData, keyStore, function (data) {
        result = data[key];
      });

      return result;
    },
    delete(key) {
      run(keyData, keyStore, function (data) {
        delete data[key];

        diskWrite(keyStore, data);
      });
    },
    clear() {
      storageData[keyData] = {};

      diskWrite(keyStore, storageData[keyData]);
    },
    loop(onEachLoop) {
      run(keyData, keyStore, function (data) {
        $.each(data, function (key, value) {
          onEachLoop(key, value);
        });
      });
    },
    expose() {
      run(keyData, keyStore, function (data) {});
      return storageData[keyData];
    }
  }
};

export const storage = {
  user: composeStorage(KEY_STORE_USER, KEY_DATA_USER),
  api: composeStorage(KEY_STORE_API, KEY_DATA_API_DEFAULT)
};
