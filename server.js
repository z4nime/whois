var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/', express.static('public'));
app.get('/', function(req, res){
  
});
var id;
var username;
var data = [
// {"id":1,"name":"s","score":4},
// {"id":0,"name":"w","score":10},
// {"id":5,"name":"a","score":5}
];
io.on('connection', function(socket){

  socket.on('login', function(user){
    id = user.id
    username = user.name;
    data.push({"client_id":socket.client.id,"id":user.id,"name":user.name,"avatar":user.picture.data.url,"score":0});
    io.emit('online', data.length);
    io.emit('data', data);
    console.log(user.name + " : online ("+data.length+")");
  });
  socket.on('disconnect', function(){
    for(var i=0;i<data.length;i++){
      if(socket.client.id==data[i].client_id){
        var name=data[i].name;
        data.splice(i,1);
        io.emit('online', data.length);
        io.emit('data', data);
        console.log(name + " : offline ("+data.length+")");
      }
    }

  });
});


app.set('port',(process.env.PORT || 3000))
http.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port'));
});