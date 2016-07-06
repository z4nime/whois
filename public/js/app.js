'use strict';

var app = angular.module('app', ['facebook','btford.socket-io'/*,'angular-loading-bar'*/, 'ngAnimate'])
app.config(function(FacebookProvider) {
  FacebookProvider.init('573083182871799');
});
// app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
//   cfpLoadingBarProvider.includeSpinner = false;
// }]);
app.factory('mySocket', function (socketFactory) {
  return socketFactory();
});

app.controller('upload',function($scope,$http){
  $scope.datas = [];
  $scope.init = function(){
    $http.get("https://api.myjson.com/bins/rubt").success(function(data){
      $scope.datas = data;
    });
  }
  $scope.submit = function(url,name,ch,ch2){
    $scope.datas.push({"avatar":url,"name":name,"choice":[ch,ch2]});
    $scope.name ="";
    $scope.url="";
    $scope.ch="";
    $scope.ch2="";
  }
  $scope.save = function(){
    $http.put("https://api.myjson.com/bins/rubt",$scope.datas)
    .then(function successCallback(response) {
      console.log(response)
    }, function errorCallback(response) {

    });

  }
})
app.controller('con', function($scope, Facebook ,mySocket/*,cfpLoadingBar*/,$http,$interval,$timeout) {
  $scope.json = [];
  $scope.count;
  $scope.score =0;
  $scope.postScore =0;
  var stopIn;
  var stopOut;
  $scope.init = function(){
    $http.get("https://api.myjson.com/bins/rubt").success(function(data){
      $scope.json = data;
    });
  }
  mySocket.on('data', function(data){
      $scope.data = data;
  });

  $scope.getRandom = function(){
    $scope.count = Math.floor(Math.random() * $scope.json.length) + 0  ;
    $scope.characters = $scope.json[$scope.count];
    return $scope.characters;
  }
  $scope.startGame = function(){
    $scope.init();
    $('#press_start').fadeOut(500);
    $scope.true = $scope.getRandom();
    $scope.countTime();
  }
  $scope.goOn = function(){
    $scope.json.splice($scope.count,1);
    $scope.true = $scope.getRandom();
    $timeout.cancel(stopOut);
    $interval.cancel(stopIn);
    $scope.countTime();
  }

  $scope.countTime = function(){
    $scope.time = 10
    stopIn = $interval(function(){
      if($scope.time>0)
        $scope.time--
    },1000);
    stopOut = $timeout(function(){
      $scope.gameOver();
      $interval.cancel(stopIn);
    },10000)
  }

  $scope.continue = function(){
    $('#game_over').fadeOut(500);
    $scope.startGame();
  }
  $scope.gameOver = function(){
    $timeout.cancel(stopOut);
    $interval.cancel(stopIn);

    Facebook.api('/me?fields=id,name,picture', function(response) {
      $scope.over = true;
      $scope.postScore = $scope.score;
      $scope.score =0;
      var user = {"id":response.id,"name":response.name,"avatar":response.picture.data.url,"score":$scope.score};
      mySocket.emit('score', user);
      $('#game_over').fadeIn(500);
    });
  }
  $scope.postFB = function(){
    Facebook.ui({
      method: 'feed',
      link: 'https://who-ami.herokuapp.com/',
      description: '+++ คุณได้คะแนน '+$scope.postScore+' แต้ม +++',
      caption:'มาทายกันเถอะว่าฉันคือใครในเหล่าตัวละครอนิเมะ',
      picture: './images/logo.png',
    }, function(response){});
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
