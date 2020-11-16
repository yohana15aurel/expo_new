import { EVENTS } from './constants';
import { app, pubSub, debugLog } from './services';
import * as countdown from './modules/countdown';
import * as login from './modules/login';
import * as exhibitor from './modules/exhibitor';
import * as publicMeeting from './modules/public-meeting';
import * as privateMeeting from './modules/private-meeting';
import * as register from './modules/register';

import './controllers';
import './plugins';
import './debug';

// Entry points
app.onReady(() => {
  // Event: Logged in
  pubSub.subscribe(EVENTS.ON_LOGGED_IN, function (e, account) {
    debugLog('[user] LOGGED IN');
  });

  // Event: Logged out
  pubSub.subscribe(EVENTS.ON_LOGGED_OUT, function () {
    debugLog('[user] LOGGED OUT');
  });

  // Modules initialization
  countdown.init();
  login.init();
  // register.init();
  exhibitor.init();
  publicMeeting.init();
  privateMeeting.init();


});

$(() => {
  debugLog('app ready');
  app.ready();
});
