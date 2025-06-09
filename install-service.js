var Service = require('node-windows').Service;

var svc = new Service({
  name:'Random-FN Server',
  description: 'Random Student Selector Server',
  script: 'D:\\Random-FN\\server.js'
});

svc.on('install',function(){
  svc.start();
});

svc.install();
