

let data = new Array(4); // Create the first dimension
let screen=1;
for (let i = 0; i < 4; i++) {
    data[i] = new Array(4); // Create the second dimension
    for (let j = 0; j < 4; j++) {
        data[i][j] = new Array(4); // Create the third dimension
        for (let k = 0; k < 4; k++) {
            data[i][j][k] = new Array(7).fill(65535);; // Create the fourth dimension
        }
    }
}

let screenTime=new Array(4).fill(3);
const Time=document.querySelector('#screenTime');

Time.value=screenTime[screen-1];

const rows = 4; // 4 rows of modules
const cols = 7; // 7 columns of modules
const moduleRows = 7; // Number of rows per module
const moduleCols = 8; // Number of columns per module
const ledMatrix = document.getElementById('led-matrix');

// Ensure ledMatrix exists
if (!ledMatrix) {
    console.error('No element found with id "led-matrix"');
} else {
    // Loop through rows and columns to create modules
    for (let j = 0; j < rows; j++) {  // Loop for each row
        // Create a row container for each row of modules
        const rowContainer = document.createElement('div');
        rowContainer.classList.add('horizontal');
        ledMatrix.appendChild(rowContainer);

        for (let i = 0; i < cols; i++) {  // Loop for each column in the row
            // Create individual modules and add the proper class name
            const module = document.createElement('div');
            module.classList.add(`module${j}${i}`);  // Dynamic class for each module
            rowContainer.appendChild(module);
        }
    }
}

// Now handle the creation of cells inside each module
const moduleAll = document.querySelectorAll('[class^="module"]'); // Select all modules
moduleAll.forEach((module, index) => {
    // Create cells for each module
  
    const cellcol = document.createElement('div');
    cellcol.classList.add('cellcol');
    
    for (let j = 0; j < moduleRows; j++) {
        const cellrow = document.createElement('div');
        cellrow.classList.add('cellrow');

        for (let i = 0; i < moduleCols; i++) {
            const cell = document.createElement('div');
            const cellNumber=module.className.replace('module', '');
            let name="led"+cellNumber.toString()+i.toString()+j.toString();
           //console.log(name);//this call is used to update led in screen 
           cell.classList.add(name);
            cell.classList.add('cell');
         
           
            
          
            cell.addEventListener('click', () => {
                const moduleNumber=module.className.replace('module', '');
   // console.log(`row=${moduleNumber.charAt(0)}  col=${moduleNumber.charAt(1)}`)
                cell.classList.toggle('on'); // Toggle LED state
                let line=0;
                let pos=0;
                const cellColor = window.getComputedStyle(cell).backgroundColor;
                if(j<4)
                {
                     line=j+1;
                     pos=7-i+8;
                     updateArray(line, pos, cellColor, moduleNumber.charAt(0), moduleNumber.charAt(1), screen);  

                }
                else{
                     line=j-3;
                     pos=7-i;
                     updateArray(line, pos, cellColor,moduleNumber.charAt(0), moduleNumber.charAt(1), screen);
                }
                
               

            });
            cellrow.appendChild(cell);
        }

        cellcol.appendChild(cellrow);
    }

    module.appendChild(cellcol);  // Append the cellcol inside the module
});


function updateArray(line, pos, cellColor, j, i,k) //inside loop i and j exchange
{
    setTimeout(() => {
      //  const cellColor = window.getComputedStyle(cell).backgroundColor;
        if (cellColor === 'rgb(255, 69, 0)') { // Ensure correct format with no spaces
           //console.log(`line ${line}, pos: ${pos}`);
           // console.log('on');
             data[k-1][j][line-1][i]=data[k-1][j][line-1][i] & ~(1 << pos);
            console.log(data[k-1][j][line-1][i]);
            // console.log(k);
            
        } else {
            //console.log(`line ${line}, pos: ${pos}`);
            //console.log('off');
            data[k-1][j][line-1][i]= data[k-1][j][line-1][i] | (1 << pos);
            console.log(data[k-1][j][line-1][i]);
           // console.log(k);
        }
    }, 0)
}



function updateScreen(screen, data) {
    const leds = document.querySelectorAll('[class^="led"]');
    // Ensure the `screen` value is within bounds for your data array
    if (screen < 1 || screen > data.length) {
        console.error('Invalid screen index');
        
        return;
    }
     leds.forEach(led => {
      
        const row=Number(led.className.charAt(3));
        const col=Number(led.className.charAt(4));

        const rowLine=Number(led.className.charAt(6));
        const posLine=Number(led.className.charAt(5));
        let pos;
        let line;
        if(rowLine<4)
            {
                  line=rowLine;
                  pos=7-posLine+8;
                 
            }
            else{
                  line=rowLine-4;
                  pos=7-posLine;
               
            }
            // console.log(screen);
            // console.log(row);
            // console.log(line);
            // console.log(col);
            // console.log(pos);
            if((data[screen-1][row][line][col] >> pos) & 1)       //(value >> bitPos) & 1
            {
                led.classList.remove('on');
                
            }
            else
            {
                led.classList.add('on');
                //console.log("hello");
    
            }
          
       

    });

}
const buttons = document.querySelectorAll('.button');
const sendDevice = document.querySelector('#sendDevice')
const fillScreen = document.querySelector('#fillScreen');
const clearScreen = document.querySelector('#clearScreen');

// Add event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove 'on' class from all buttons
        buttons.forEach(btn => btn.classList.remove('on'));

        // Add 'on' class only to the clicked button
        button.classList.add('on');
      if(screen!=Number(button.textContent))
      {
       
        screen=Number(button.textContent);
        updateScreen(screen, data);
        Time.value=screenTime[screen-1];  
        

      }
      
        
    });
});

sendDevice.addEventListener('click', ()=>{

    sendDevice.classList.add('on');
    setTimeout(() => {
        sendDevice.classList.remove('on');
      }, 100);
      //const sum4D = data.flat(Infinity).reduce((acc, val) => acc + val, 0);


   

      
      document.getElementById('sendButton').addEventListener('click', () => {
        if (socket.readyState === WebSocket.OPEN) {
            const payload={
                data: data,
                screenTime:screenTime
              }
            socket.send(JSON.stringify(payload));
        } else {
            console.error('WebSocket is not open. Current state: ' + socket.readyState);
        }
    });



});



fillScreen.addEventListener('click', ()=>{

    const modules = document.querySelectorAll('[class^="module"]');

    fillScreen.classList.add('on');
    // Clear all previous "on" states from cells
    modules.forEach(module => {
        const cells = module.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.add('on'));
    });
 
    for(let i=0;i<4;i++)
        {
            for(let l=0;l<4;l++)
            {
                for(let j=0;j<8;j++)
                    {
                        data[screen-1][i][l][j]=0;
                    }
            }
        }
    setTimeout(() => {
        fillScreen.classList.remove('on');
      }, 100);
});


clearScreen.addEventListener('click', () => {
    const modules = document.querySelectorAll('[class^="module"]');

    clearScreen.classList.add('on');
    // Clear all previous "on" states from cells
    modules.forEach(module => {
        const cells = module.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('on'));
for(let i=0;i<4;i++)
{
    for(let l=0;l<4;l++)
    {
        for(let j=0;j<8;j++)
            {
                data[screen-1][i][l][j]=65535;
            }
    }
}

        setTimeout(() => {
            clearScreen.classList.remove('on');
        }, 100);
    });
});

 

Time.addEventListener('change', ()=>{
screenTime[screen-1]=Time.value;

});
