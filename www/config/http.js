'use strict';

app.config(['$httpProvider', function($httpProvider) {
  // cors needs to pass cookies
  $httpProvider.defaults.withCredentials = true;
  // Prefer standard header-based HTTP post params to Angular's default JSON post params
  $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
  $httpProvider.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
  //$httpProvider.defaults.headers.post['Accept'] = 'application/json';
  //$httpProvider.defaults.headers.put['Accept'] = 'application/json';
  $httpProvider.defaults.transformRequest = function(data){
    if (data === undefined) { return data; }
    return $.param(data);
  }
}]);
