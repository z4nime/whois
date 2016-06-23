var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/', express.static('public'));
app.get('/', function(req, res){
  
});
var id;
var user_play = [];
var real = [];
var Who_disconnect;
io.on('connection', function(socket){

  socket.on('login', function(user){
    id = user.id
    user_play.push({"client_id":socket.client.id});
    io.emit('online', user_play.length);
    console.log(user.name + " : online ("+user_play.length+")");
  });

  socket.on('score', function(res){
    for(var i=0;i<user_play.length;i++){
      //console.log("user : " +user_play[i].client_id + " client : " + socket.client.id)
      if(socket.client.id==user_play[i].client_id){
        if(real.length == 0){
          real.push({"client_id":user_play[i].client_id,"id":res.id,"name":res.name,"avatar":res.avatar,"score":res.score});
        }
        else{
          real.splice(i,1);
          real.push({"client_id":user_play[i].client_id,"id":res.id,"name":res.name,"avatar":res.avatar,"score":res.score});
        }
      }
    }
    io.emit('data', real);
  })
  socket.on('disconnect', function(){
    for(var i=0;i<real.length;i++){
      if(socket.client.id==real[i].client_id){
        Who_disconnect=real[i].name;
        real.splice(i,1);
      }
    }
    for(var i=0;i<user_play.length;i++){
      if(socket.client.id==user_play[i].client_id){
        user_play.splice(i,1);
        io.emit('online', user_play.length);
        io.emit('data', real);
        console.log(name + " : offline ("+user_play.length+")");
      }
    }

  });
});


app.set('port',(process.env.PORT || 3000))
http.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port'));
});