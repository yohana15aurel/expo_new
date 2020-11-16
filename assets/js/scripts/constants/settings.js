export const SETTINGS = {
  BASE_URL: typeof window.baseUrl != "undefined" ? window.baseUrl : "",
  API_BASE_URL: "/Umbraco/Api/Content",
  STORAGE_TYPE: 'localstorage',

  /** Disable this on production mode */
  IS_DEBUG: true,

  /** This is used for API service */
  ENABLE_CACHE_CLEARING: false
};
