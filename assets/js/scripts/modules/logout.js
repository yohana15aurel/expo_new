import { EVENTS } from '../constants';
import { isLoggedIn, changeUserProfile } from './login';
import { storage } from '../services';
import * as responseModal from './response-modal';

function addLogoutEvent() {
  let $logoutButton = $(".logout");
  let $signOutButton = $(".sign-out");
  let $signOutMobileButton = $(".menu-mobile").find("a:contains(Sign Out)");
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

function addAutoLogoutEvent() {
  let autoLogoutInterval;

  function addInterval() {
    autoLogoutInterval = setInterval(function () {
      if (isLoggedIn()) {
        logout();
        clearInterval(autoLogoutInterval);
      }
    }, 1000 * 60 * 5);
  }

  function stopIntervalWhenUserActive() {
    $(document).mousemove(function (event) {
      clearInterval(autoLogoutInterval);
      addInterval();
    });
    $(document).mousedown(function (event) {
      clearInterval(autoLogoutInterval);
      addInterval();
    });
  }

  addInterval();
  stopIntervalWhenUserActive();
}

function logout() {
  if (isLoggedIn()) {
    storage.user.clear();
    responseModal.show("You have been logged out");

    // TODO
    // _listBookmarkedContent = {}
    changeUserProfile();
    changeBackRegisterButton();
    // _updateBookmarkIcon();
    // _emptyInquiryForm();

    $("#open-register").modal("hide");
    pubSub.publish(EVENTS.ON_LOGGED_OUT);
  }
}

function changeBackRegisterButton() {
  var $target = $(".register").find(".button-blue");
  $target.html("Register");
  $target.removeClass("logout");
  $target.parent().attr("data-toggle", "modal");
  $target.parent().attr("data-target", "#open-register");
  $("#open-register").find(".close").trigger("click");
}

function init() {
  addLogoutEvent();
}

export { init, addAutoLogoutEvent, addLogoutEvent };
