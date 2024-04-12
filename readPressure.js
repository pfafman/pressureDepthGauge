!/usr/bin/node

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
        const result = execSync('python',["./readSensor.py"]);
        console.log(result);

        lines = result.split(/\r?\n/);
        //postData({'depth': lines[1]});

    } catch (error) {
        console.log("Error:", error.message);
    }
}

raspi.init(() => {

    console.log("Raspi Init: new Serial");

    var serial = new Serial({portId: "/dev/serial0", baudRate: 9600});
    
    console.log("Raspi Init: new Serial Created");

    serial.open(() => {
        console.log("Serial opened ...");
        
        serial.on('data', async (byte) => {
            i++;
            data.push(byte[0])
            //console.log("Data:[", byte.length, ']:',i, ':', byte[0]);

            if (data[0] != 255) {
                i = 0;
                data = [];
            }
            if (i == 4) {
                let sum = checkSum(data);
                if (sum != data[3]) {
                    console.log("Checksum Error", sum, data);
                } else {
                    let distance = 0.0393701 * (data[1]*256 + data[2]);
		            //console.log("Distance", distance);
                    if ((distance < 0) || (distance > 70)) {
                        console.log("Bad Value", distance);
                    } else {
                        ave += distance;
                        aveCnt++;
                        if (minValue > distance) {
                            minValue = distance;
                        }
                        if (maxValue < distance) {
                            maxValue = distance;
                        }
                        if (aveCnt > 100) {
                            ave /= aveCnt;
                            if ( ((maxValue - ave) > 1) || ((ave - minValue) > 1) ) {
                                console.log("Noisy", ave.toFixed(3), minValue.toFixed(3), maxValue.toFixed(3));
                                resetData();
                            } else {
                                console.log("");
                                console.log("Post distance: (", aveCnt, ") ", ave.toFixed(3), minValue.toFixed(3), maxValue.toFixed(3));
                                postData({'depth': ave});
                                resetData();
                            }
                        }
                    }
                }
                i = 0;
                data = [];
            }
        });
    });
});

