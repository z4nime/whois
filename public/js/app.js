'use strict';
var app = angular.module('app', ['facebook','btford.socket-io','chieffancypants.loadingBar', 'ngAnimate'])
app.config(function(FacebookProvider) {
  FacebookProvider.init('573083182871799');
});
app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
}]);
app.factory('mySocket', function (socketFactory) {
  return socketFactory();
});
app.controller('con', function($scope, Facebook ,mySocket,cfpLoadingBar) {

  mySocket.on('data', function(data){
      $scope.data = data
  });

  $scope.startGame = function(){
    $('#press_start').fadeOut(500);
    cfpLoadingBar.start();
    cfpLoadingBar.set(0.1);
    setTimeout(function(){
      cfpLoadingBar.complete()
      $scope.over = true;
      $('#game_over').fadeIn(500);
    },10000);
  }
  $scope.continue = function(){
    $('#game_over').fadeOut(500);
    $scope.startGame();
  }
  $scope.checkFB = function(){
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.login();
      }
    });
  }

  $scope.login = function() {
    Facebook.login(function(response) {
      if(response.status === 'connected') {
        $scope.loggedIn = true;
        $scope.me();
        mySocket.on('online',function(online){
          $scope.online = online;
        });
      } else {
        $scope.loggedIn = false;
      }
    });
  };

  $scope.me = function() {
    Facebook.api('/me?fields=id,name,picture', function(response) {
      $scope.user = response;
      mySocket.emit('login', $scope.user); // send
    });
  };
});