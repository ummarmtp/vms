const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const https = require('https');
const app = express();
const server = https.createServer(app);
let data=0;
let screenTime=0;
const wssweb = new WebSocket.Server({ noServer: true });
const wssESP32 = new WebSocket.Server({ noServer: true });
let esp32Connection = null;
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended :false}))
const port =process.env.PORT || 3000;;

  



app.get('/', async(req, res) => {
    res.render('home');
  });
  app.get('/esp32', async(req, res) => {
    res.send('hello');
    console.log('hello');
  });

 

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('upgrade', (request, socket, head) => {
    const url = request.url;

    if (url === '/esp32') {
        wssESP32.handleUpgrade(request, socket, head, (ws) => {
            wssESP32.emit('connection', ws, request);
        });
    } else {
        // Default to web client WebSocket if no specific path is matched
        wssweb.handleUpgrade(request, socket, head, (ws) => {
          wssweb.emit('connection', ws, request);
        });
    }
});


// WebSocket connection logic
wssweb.on('connection', (ws) => {
    console.log('New WebSocket connection');
    

    // Send a message when a client connects
    //ws.send('Hello from WebSocket server');

    // Handle incoming messages
    ws.on('message', (message) => {
       try{
       console.log(`Received:`);
       const receivedArray = JSON.parse(message);
      // const checksome=receivedArray.checkSome;
        data=receivedArray.data;
       screenTime=receivedArray.screenTime;
      // console.log('screen1', screenTime);
       if (esp32Connection && esp32Connection.readyState === WebSocket.OPEN) {
        esp32Connection.send(JSON.stringify({ data, screenTime }));
        //console.log('Data sent to ESP32:', { data, screenTime });
        wssweb.send("message sent");
    }
    else{
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
    });
});


// WebSocket connection logic for ESP32 clients
wssESP32.on('connection', (ws) => {
  console.log('New WebSocket connection for ESP32');
  esp32Connection = ws;
  ws.on('message', (message) => {
      // try {
      //     const receivedData = JSON.parse(message);
      //     console.log('Data received from ESP32:', receivedData);
      //     // Handle data from ESP32 here
      // } catch (error) {
      //     console.error('Error handling message from ESP32:', error);
      // }


  });

  ws.on('close', () => {
      console.log('ESP32 WebSocket connection closed');
      esp32Connection = null;
  });
});

  // ****
// const sharp = require('sharp');

// // Input image file path
// const inputFilePath = __dirname +'/public/image/input.jpg'; // Replace with your image file path
// const outputFilePath = __dirname +'/public/image/output.png'; // Output file path
// let data = new Array(28).fill().map(() => new Array(56));
// // Resize the image to 28x56 pixels
// sharp(inputFilePath)
// .resize(56, 28, { fit: 'contain' }) //contain, cover, fill
//   .grayscale()
//   .threshold(128) 
//   .toFile(outputFilePath, (err, info) => {
//     if (err) {
//       console.error('Error resizing image:', err);
//     } else {
//       console.log('Image successfully resized:', info);
//     }
//   })
  // .toBuffer((err, buffer, info) => {
  //   if (err) {
  //     console.error('Error processing image:', err);
  //   } else {
  //     // Extract pixel data into a 2D array
  //     let index = 0;
  //     for (let i = 0; i < 28; i++) {
  //       for (let j = 0; j < 56; j++) {
  //         // Each pixel's brightness value (0-255) is stored in the data array
  //         // For black and white, you can treat values < 128 as black (0), and >= 128 as white (1)
  //         data[i][j] = buffer[index] < 128 ? 0 : 255; // 0 for black, 255 for white
  //         index++;
  //       }
  //     }
  //     //console.log('Image successfully resized and converted to pixel data:', data);
  //     //console.log(data);
  //   }
  // })
// *********