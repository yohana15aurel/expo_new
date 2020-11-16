import { SETTINGS } from "../constants/settings";

const optionsDefault = {
  $target: false,
  minHeight: 300,
  showOnInit: true
};

const CLASS_WRAPPER = 'np-preloader-wrapper';

function Loader(optionsUser) {
  let options = $.extend({}, optionsDefault, optionsUser);

  if (typeof options.$target == 'boolean') {
    return;
  }

  let $loader = $(`<div class="np-preloader"></div>`);
  let $loaderItem = $(`<div class="np-preloader-item"></div>`);
  let $image = $(`<img src="" alt="loading image">`);

  $image.attr('src', SETTINGS.BASE_URL + 'assets/images/preloader.gif');
  $image.appendTo($loaderItem);
  $loaderItem.appendTo($loader);

  this.show = () => {
    options.$target.css('min-height', options.minHeight);
    options.$target.addClass(CLASS_WRAPPER);
    $loader.appendTo(options.$target);
    $loader.show(0);
  };

  this.hide = () => {
    $loader.fadeOut(350, () => {
      options.$target.removeClass(CLASS_WRAPPER);
      options.$target.css('min-height', '');
      $loader.detach();
    });
  };

  if (options.showOnInit) {
    this.show();
  }
}

export const createLoader = (optionsUser = optionsDefault) => new Loader(optionsUser);
