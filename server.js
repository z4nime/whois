var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/', express.static('public'));
app.get('/', function(req, res){
  
});
var id;
var username ;
var online=0;
var data = [];
io.on('connection', function(socket){

  socket.on('login', function(user){
    id = user.id
    username = user;
    online++;
    data.push({"id":user.id,"name":user.name,"avatar":user.picture.data.url,"score":0});
    io.emit('online', online);
    io.emit('login', data);
    console.log(user.name + " : online ("+online+")");
  });
    
  socket.on('disconnect', function(){
    if(username!=undefined){
      online--;
      for(var i=0;i<data.length;i++){
        if(id === data[i].id)
          data.splice(i,1);
      }
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