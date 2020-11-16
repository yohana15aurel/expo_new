import { API_ENDPOINTS, EVENTS, KEYS } from '../constants';
import { api, storage, pubSub, debugLog } from '../services';
import * as responseModal from './response-modal';
import * as logout from './logout';

function addFormLoginSubmitEvent() {
  let $loginForm = $(".form-login");

  $loginForm.submit(function (e) {
    e.preventDefault();
    let user = {};
    user['email'] = $(".login-user").val();
    user['password'] = $(".pwd-login").val();
    login(user, "login")
    let loginForm = $('#open-login');
    loginForm.modal('hide');
  });
}

function addLoggedInEvent() {
  pubSub.subscribe(EVENTS.ON_LOGGED_IN, function (e, account) {
    debugLog('[internal] login', account);
    logout.addAutoLogoutEvent();

    // TODO
    // _autoFilLAccountSettingForm();
    // _autoFillInquiryFormWhenLoggenIn();
    changeRegisterToLogoutButton();
    changeUserProfile();
    // _updateBookmarkedContent();
    // _updateUserVisitHistory(_listExhibitorId[_boothPositionIndex]);
  });
}

function login(user, loginFrom) {
  api.get({
    $target: $(".form-login"),
    url: API_ENDPOINTS.LOGIN_FROM_3D,
    request: JSON.stringify(user),
    method: 'POST',
    onReceived: function onReceived($target, data) {
      if (data.Status == false) {
        responseModal.show("user login fail : " + data.Message);
      } else {
        let account = JSON.parse(data.Data);
        storage.user.set(KEYS.USER_INFO, account);

        if (loginFrom == "register") {
          responseModal.show("your account was created successfully and you are now logged in");
        } else {
          responseModal.show("you are now logged in");
        }

        pubSub.publish(EVENTS.ON_LOGGED_IN, account);
      }
    }
  });
}

function getLoggedUser() {
  let userInfo = isLoggedIn() ? storage.user.get(KEYS.USER_INFO) : {};

  return {
    userId: userInfo.visitorId,
    userProfile: userInfo
  };
}

function isLoggedIn() {
  return (typeof storage.user.get(KEYS.USER_INFO) != 'undefined');
}

function changeRegisterToLogoutButton() {
  let $target = $(".register").find(".button-blue");
  $target.parent().removeAttr("data-toggle");
  $target.parent().removeAttr("data-target");
  $target.addClass("logout");
  $target.html("Logout");

  logout.addLogoutEvent();

}

function changeUserProfile() {
  var $target = $(".dropdown-account");

  if (isLoggedIn()) {
    var username = getLoggedUser().userProfile.firstName;
    var $dropdownToggle = $target.find(".dropdown-toggle");
    $dropdownToggle.attr("data-toggle", "dropdown");
    $dropdownToggle.removeAttr("data-target");
    $dropdownToggle.removeAttr("contenteditable");
    $dropdownToggle.html(username);
    $dropdownToggle.append('<span class="icon-user-circle-o"></span>'); // mobile change

    var $menuMobile = $(".navbar-default").find(".menu-mobile");
    $menuMobile.find(".register").remove();
    $menuMobile.children().show();
  } else {
    var $dropdownToggle = $target.find(".dropdown-toggle");
    $dropdownToggle.attr("data-toggle", "modal");
    $dropdownToggle.attr("data-target", "#open-register");
    $dropdownToggle.attr("contenteditable", "false");
    $dropdownToggle.html("Register"); // mobile change

    var $menuMobile = $(".navbar-default").find(".menu-mobile");
    $menuMobile.children().hide();
    $menuMobile.append('<a class="view-form register" data-toggle="modal" data-target="#open-register" contenteditable="false"><button class="btn-blue button-blue">Register</button></a>');
  }
}

function _addForgotPasswordFunc(){
  var $recoverPasswordForm = $("#open-recover").find("form")

  $recoverPasswordForm.submit(function (e) {
    e.preventDefault();

    var email = $recoverPasswordForm.find(".login-user").val();
    submitRecoverPassForm(email)
  })

  function submitRecoverPassForm(email){
    var submit = api.get({
      $target: $(".form-registration"),
      url: '/ForgetPasswordFrom3D',
      request: JSON.stringify({
        email: email
      }),
      method: 'POST',
      onReceived: function onReceived($target, data) {
        if (data.Status == false) {
          _showResponseModal("Password recover failed. " + data.Message);
        } else {
          _showResponseModal("your password reset instruction will send to your email");
        }
      }
    });
  }
}

function init() {
  addFormLoginSubmitEvent();
  addLoggedInEvent();
  changeUserProfile();
  _addForgotPasswordFunc();
  if(isLoggedIn()){
    changeRegisterToLogoutButton();
  }
}

export { init, isLoggedIn, getLoggedUser, changeUserProfile };
