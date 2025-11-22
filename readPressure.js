#!/usr/bin/node

const http  = require('node:http');
const execSync = require("child_process").execSync;
const os = require('os');

const hostname = os.hostname();

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


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
        if (res.statusCode != 200) {
            console.log('postdata statusCode:', res.statusCode);
            // console.log("");
        }

        res.on('data', (d) => {
            //console.log(`BODY: ${d}`);
        });

        res.on('end', () => {
            //console.log('No more data in response.');
        });
    })

    .on('error', (e) => {
	   console.error("Post Error",e);
    });

    //console.log("postData", postData);
    req.write(postData,'utf8');
    req.end();
    //console.log("end", req);
}


let depth = 0;
let count = 0;

async function repeatedLoop() {
    while (true) {
        try {
            
            depth = 0;
            count = 0;
            
            while (count < 10) {

                const result = execSync('./readSensor.py').toString().trim();
                //console.log(result);

                lines = result.split(/\r?\n/);
                depth += Number(lines[1]);
                count++;
                await sleepNow(250)
            }

            depth /= count;

            console.log("Sending:", depth);
            postData(
                {
                    'depth': depth,
                    'host': hostname
                },
            );

            await sleepNow(5000)

        } catch (error) {
            console.log("Error:", error.message);
        }
    }
};


repeatedLoop();
