var PORT = 8888;

var HOSTS = [
  '192.168.1.10',
  '192.168.1.11',
  '192.168.1.12',
  '192.168.1.13',
  '192.168.1.14',
  '192.168.1.15',
  '192.168.1.16',
  '192.168.1.17',
  '192.168.1.18',
];

var TIME = 0;
var SELECT_SHADER = 1;


var dgram = require('dgram');
var host;

var cnt = 0;
var sockets = [];
for (var i=0; i<HOSTS.length; i++) {
  sockets[i] = dgram.createSocket('udp4');
}

for (var i=0; i<HOSTS.length; i++) {
  // cnt = Math.floor(Math.random()*3.999);
  var message = new Buffer([0]);
  sockets[i].send(message, 0, message.length, PORT, HOSTS[i], function(err, bytes) {
    if (err) throw err;
  });
}

var cnt2 = 0;

setInterval (()=> {
  cnt2 = (cnt2+1)%3;
  if (cnt2==0) {
    for (var i=0; i<HOSTS.length; i++) {
      // cnt = Math.floor(Math.random()*3.999);
      var message = new Buffer([2,cnt]);
      // sockets[i].send(message, 0, message.length, PORT, HOSTS[i], function(err, bytes) {
      //   if (err) throw err;
      // });
    }
  }

  var hide = 0;
  if (cnt2==0) hide = 1;

  for (var i=0; i<HOSTS.length; i++) {

    message = new Buffer([3,hide]);
    sockets[i].send(message, 0, message.length, PORT, HOSTS[i], function(err, bytes) {
      if (err) throw err;
    });
  }

  cnt = (cnt+1)%2;
},40);
