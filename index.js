const fs = require('fs');
const express = require('express');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
let data=0;
let screenTime=0;
let totalScreen=0;
const wssweb = new WebSocket.Server({ noServer: true });
const wssESP32 = new WebSocket.Server({ noServer: true });
const uploadimageweb = new WebSocket.Server({ noServer: true });
const Imagefit = new WebSocket.Server({ noServer: true });
let esp32Connection = null;
let wssconnection = null;
let wssuploadImage=null;
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended :false}))
const port =process.env.PORT || 3000;;
let imagefit='contain';
let processedBuffer;
  
let imagePixcel = Array.from({ length: 28 }, () => Array(56).fill(0));


app.get('/', async(req, res) => {
    res.render('home');
  });


 



  server.on('upgrade', (request, socket, head) => {
    const url = request.url;

    if (url === '/esp32') {
        wssESP32.handleUpgrade(request, socket, head, (ws) => {
            wssESP32.emit('connection', ws, request);
        });
    } else if(url === '/senddevice') {
        // Default to web client WebSocket if no specific path is matched
        wssweb.handleUpgrade(request, socket, head, (ws) => {
          wssweb.emit('connection', ws, request);
        });
      }
        else if(url === '/uploadimage') {
          // Default to web client WebSocket if no specific path is matched
          uploadimageweb.handleUpgrade(request, socket, head, (ws) => {
           uploadimageweb.emit('connection', ws, request);
          });
    }
    else if(url === '/fit') {
      // Default to web client WebSocket if no specific path is matched
      Imagefit.handleUpgrade(request, socket, head, (ws) => {
        Imagefit.emit('connection', ws, request);
      });
}
    else{

    }
});

//imagefit
Imagefit.on('connection',(ws) =>{
  console.log('New WebSocket imagefit');
  ws.on('messsage', async(message)=>{
 
   console(message); //imagefit=message;
    console.log(hello);
    // processImageBuffer(processedBuffer);

  });

  Imagefit.onerror = (error) => {
    console.error('WebSocket error:', error);
};
 // Handle connection close
 Imagefit.on('close', () => {
  console.log('WebSocket connection closed');

});

});





// WebSocket connection logic
wssweb.on('connection', (ws) => {
  console.log('New WebSocket connection');
  wssconnection = ws;
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      console.log(`Received:`);
      const receivedArray = JSON.parse(message);
      
      data = receivedArray.data;
      screenTime = receivedArray.screenTime;
      let designName=receivedArray.designName;
      //totalScreen=receivedArray.totalScreen;
      // console.log('screen1', screenTime);
      if (esp32Connection && esp32Connection.readyState === WebSocket.OPEN) {
        esp32Connection.send(JSON.stringify({ data, screenTime, designName }));
        //console.log('Data sent to ESP32:', { data, screenTime });
        //wssweb.send("message sent");
      }
      else {
        console.log('device is not online');
        //wssweb.send("Device is not active");
      }
    } catch (error) {
      console.error('Error handling message from web client:', error);
    }
  });
  // Handle connection close
  wssweb.on('close', () => {
    console.log('WebSocket connection closed');
    wssconnection = null;
  });
});


// WebSocket connection logic for ESP32 clients
wssESP32.on('connection', (ws) => {
  console.log('New WebSocket connection for ESP32');
  esp32Connection = ws;
  ws.on('message', (message) => {
  });

  ws.on('close', () => {
      console.log('ESP32 WebSocket connection closed');
      esp32Connection = null;
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


uploadimageweb.on('connection', (ws) => {
  console.log('New WebSocket upload image');
  wssuploadImage=ws;

  // Send a message when a client connects
  //ws.send('Hello from WebSocket server');

  // Handle incoming messages
  ws.on('message', async(message) => {
    if (Buffer.isBuffer(message)) {
        // If message is a binary buffer
        fs.writeFile('received_image.jpg', message, (err) => {
            if (err) {
                console.error('Error saving binary image:', err);
                ws.send('Error saving binary image');
            } else {
                console.log('Binary image saved successfully');
                ws.send('Binary image received and saved');
            }
        });
        await processImageBuffer(message);
    } else if (typeof message === 'string' && message.startsWith('data:image/')) {
        // If message is a Base64 string
        const base64Data = message.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFile('received_image.jpg', buffer, (err) => {
            if (err) {
                console.error('Error saving Base64 image:', err);
                ws.send('Error saving Base64 image');
            } else {
                console.log('Base64 image saved successfully');
                ws.send('Base64 image received and saved');
            }
        });
        await processImageBuffer(buffer);
    } else {
        console.error('Unsupported message format or data encoding');
    }
});


  // Handle connection close
  uploadimageweb.on('close', () => {
      console.log('WebSocket connection closed');
  });
});


async function processImageBuffer(buffer) {
  try {

      // Process the image using sharp
     processedBuffer = await sharp(buffer)
  .resize(56, 28, { fit: imagefit }) //contain, cover, fill
  .grayscale()
  .raw()
  .threshold(128) 
  .toBuffer((err, buffer, info) => {
    if (err) {
      console.error('Error processing image:', err);
    } else {
      // Extract pixel data into a 2D array
      let index = 0;
      for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 56; j++) {
           imagePixcel[i][j] = buffer[index] < 128 ? 0 : 1; // 0 for black, 255 for white
           index++;
        }
      }
      const payload={
        imagePixcel: imagePixcel,
      }
     // console.log(imagePixcel);
      wssuploadImage.send(JSON.stringify(payload));
    }
  }) 
      // Additional handling of processedBuffer (e.g., send back, save to file, etc.)
  } catch (error) {
      console.error('Error processing image:', error);
  }
}