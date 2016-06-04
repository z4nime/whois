var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/', express.static('public'));
app.get('/', function(req, res){
  
});
var username ;
var online=0;
io.on('connection', function(socket){

  socket.on('login', function(user){
    username = user;
    online++;
    io.emit('online', online);
    io.emit('login', user);
    console.log(user + " : online ("+online+")");
  });
    
  socket.on('disconnect', function(){
    if(username!=undefined){
      online--;
      io.emit('online', online);
      console.log(username + " : offline ("+online+")");
    }
  });
});

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });
app.set('port',(process.env.PORT || 3000))
http.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port'));
});