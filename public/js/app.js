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
    {"avatar":"./images/characters/450070.png","name":"Suzumiya Haruhi","choice":["Suzumiya Harupi","Suzumiya Haruhi"]},
    {"avatar":"./images/characters/Natsuki_Subaru_Anime.png","name":"Subaru Natsuki","choice":["Subaru Natsuki","Subaru Natsuke"]},
    {"avatar":"./images/characters/Emilia_Anime_2.png","name":"Emilia","choice":["Emilie","Emilia"]},
    {"avatar":"./images/characters/300489.jpg","name":"Puck","choice":["Pung","Puck"]},
    {"avatar":"./images/characters/49712631d35ef74abf2f5f05ee7fcdfe_480.jpg","name":"Felt","choice":["Fate","Felt"]},
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
    $scope.score =0;
    mySocket.emit('login', $scope.me()); 
    $('#game_over').fadeIn(500);
  }
  $scope.answer = function(ans){
    if(ans === $scope.true.name){
      $scope.goOn();
      ++$scope.score;
      mySocket.emit('login', $scope.me()); 
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