#!/usr/bin/node

const http  = require('node:http');
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
            console.log(`BODY: ${d}`);
        });

        res.on('end', () => {
            console.log('No more data in response.');
        });
    })

    .on('error', (e) => {
	   console.error("Post Error",e);
    });

    console.log("postData", postData);
    req.write(postData,'utf8');
    req.end();
    //console.log("end", req);
}



while (true) {
    try {
        
        const result = execSync('./readSensor.py').toString().trim();
        //console.log(result);

        lines = result.split(/\r?\n/);
        console.log("Sending:", lines[1]);
        postData(lines[1]);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

