#!/usr/bin/node

const http  = require('http');
const execSync = require("child_process").execSync;


postData = (data) => {

    var postData = JSON.stringify(data);

    var options = {
      hostname: 'kyotehut.lan',
      port: 4000,
      path: '/api/insertPressureDepth/',
      method: 'POST',
      headers: {
           'Content-Type': 'application/json',
           'Content-Length': postData.length
         }
    };

    var req = http.request(options, (res) => {
      console.log('postdata statusCode:', res.statusCode);
      // console.log("");

      res.on('data', (d) => {
        process.stdout.write(d);
      });
    });

    req.on('error', (e) => {
	   console.error("postData",e);
    });

    console.log("postData", data);
    req.write(postData,'utf8');
    req.end();
}



while (true) {
    try {
        
        const result = execSync('./readSensor.py').toString().trim();
        //console.log(result);

        lines = result.split(/\r?\n/);
        console.log("Sending:", lines[1]);
        postData({'depth': lines[1]});

    } catch (error) {
        console.log("Error:", error.message);
    }
}

