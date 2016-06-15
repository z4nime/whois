'use strict';
var app = angular.module('app', ['facebook','btford.socket-io'])
app.config(function(FacebookProvider) {
  FacebookProvider.init('573083182871799');
});
app.factory('mySocket', function (socketFactory) {
  return socketFactory();
});
app.controller('con', function($scope, Facebook ,mySocket) {
  mySocket.on('data', function(data){
      $scope.data = data
  });
  mySocket.emit('disconnect','a')
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
          document.getElementById("online").innerHTML = online;
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