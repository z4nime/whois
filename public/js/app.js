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
  $scope.json = [
    {"avatar":"http://cdn.myanimelist.net/images/characters/4/277146.jpg","name":"Lelouch Lamperouge","choice":["Lelouch Lamperoage","Lelouch Lamperouge"]},
    {"avatar":"http://cdn.myanimelist.net/images/characters/12/274103.jpg","name":"Luffy Monkey D","choice":["Luffy Monkey D","Luffy Mankey D"]},
    {"avatar":"http://cdn.myanimelist.net/images/characters/9/72533.jpg","name":"Edward Elric","choice":["Edward Elric","Edword Elric"]},
    {"avatar":"http://cdn.myanimelist.net/images/characters/6/122643.jpg","name":"Rintarou Okabe","choice":["Rentarou Okabe","Rintarou Okabe"]},
    {"avatar":"http://cdn.myanimelist.net/images/characters/15/241479.jpg","name":"Gintoki Sakata","choice":["Gintoki Sakata","Gintoke Sakata"]},
  ];
  $scope.score =0;
  mySocket.on('data', function(data){
      $scope.data = data;
  });

  $scope.getRandom = function(){
    var random = Math.floor(Math.random() * $scope.json.length) + 0  ;
    $scope.characters = $scope.json[random];
    return $scope.characters;
  }
  $scope.startGame = function(){
    $('#press_start').fadeOut(500);
    $scope.true = $scope.getRandom();
    //$scope.timeOut();
  }
  $scope.goOn = function(){
    $scope.true = $scope.getRandom();
    //$scope.timeOut();
    //$scope.json.splice()
  }

  $scope.timeOut = function(){
    $scope.time =10000;
    cfpLoadingBar.set(0.1);
    cfpLoadingBar.start();
    setTimeout(function(){
      cfpLoadingBar.complete()
      $scope.over = true;
      $scope.score =0;
      mySocket.emit('login', $scope.me()); 
      $('#game_over').fadeIn(500);
    },$scope.time);
  }

  $scope.continue = function(){
    $('#game_over').fadeOut(500);
    $scope.startGame();
  }
  $scope.gameOver = function(){
    cfpLoadingBar.complete()
    $scope.over = true;
    Facebook.api('/me?fields=id,name,picture', function(response) {
      $scope.score =0;
      var user = {"id":response.id,"name":response.name,"avatar":response.picture.data.url,"score":$scope.score};
      mySocket.emit('score', user); 
      $('#game_over').fadeIn(500);
    });
  }

  $scope.answer = function(ans){
    if(ans === $scope.true.name){
      $scope.goOn();
      Facebook.api('/me?fields=id,name,picture', function(response) {
        ++$scope.score;
        var user = {"id":response.id,"name":response.name,"avatar":response.picture.data.url,"score":$scope.score};
        mySocket.emit('score', user); 
      });
    }
    else
      $scope.gameOver();
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
    $scope.user;
    Facebook.api('/me?fields=id,name,picture', function(response) {
      $scope.user = {"id":response.id,"name":response.name,"avatar":response.picture.data.url,"score":$scope.score};
      mySocket.emit('login', $scope.user); // send
    });
    return $scope.user;
  };
});