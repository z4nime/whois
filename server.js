var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/', express.static('public'));

var real = [];
var Who_disconnect;
io.on('connection', function(socket){
  socket.on('login', function(user){
    real.push({"client_id":socket.client.id,"id":user.id,"name":user.name,"avatar":user.avatar,"score":user.score});
    io.emit('online', real.length);
    console.log(user.name + " : online ("+real.length+")");
  });

  socket.on('score', function(res){
    for(var i=0;i<real.length;i++){
      if(socket.client.id==real[i].client_id){
        real.splice(i,1);
        real.push({"client_id":socket.client.id,"id":res.id,"name":res.name,"avatar":res.avatar,"score":res.score});
      }
    }
    io.emit('data', real);
  })
  socket.on('disconnect', function(){
    for(var i=0;i<real.length;i++){
      if(socket.client.id==real[i].client_id){
        Who_disconnect=real[i].name;
        real.splice(i,1);
        io.emit('data', real);
      }
    }
    io.emit('online', real.length);
    console.log(Who_disconnect + " : offline ("+real.length+")");
  });
});


app.set('port',(process.env.PORT || 3000))
http.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port'));
});
