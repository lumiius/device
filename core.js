const PIXEL=require("neopixel"),
      WIFI = require("Wifi"),
      BUZZER=require('http://192.168.1.100/assets/device/buzzer.js');
      BUZZER.port=A0;

var CONATMP=0;

var ws=null;

/************************************************
  CONNECT - To lumiius Servers
************************************************/
function connect(p, cb){
  connectToWifi(p,(connected)=>{
    LED2.write(true);
    LED1.write(!connected);
    if(cb){ cb(connected); }
  });

}

/*******************************************
  * WIFI related logic
*******************************************/
  function connectToWifi(p, cb){
    WIFI.connect(((p && p[0]) ? p[0] : SSID), { password : ((p && p[1]) ? p[1] : WPWD) }, function(err) {
      if (err) {
        console.log("WIFI ERR",err);
        cb(false);
        return;
      }
      console.log("Connected to wifi", process.memory().free);
      connectToWebsocket(cb);
    });
  }
    
  WIFI.on('disconnected', function(details) {
    setTimeout( ()=>{ 
      console.log("Reconnecting to wifi");
      connectToWifi(p, cb);
    } ,5000 );
  });


/*******************************************
  * WEBSOCKET STUFF
*******************************************/
function connectToWebsocket(cb){
  CONATMP++;
  
  if(CONATMP>10){ E.reboot(); }
  
  ws = new require("ws")("192.168.1.100",{
      path: '/',
      origin: 'Espruino',
      port:8888,
      headers:{ "device":getSerial() }
  });

  ws.on('open', function() {
    CONATMP=0;
    console.log("Connected to lumiius", process.memory().free);
    cb(true);
  });

  ws.on('error', function(d) {
    console.log("WS ERR",d);
    setTimeout( ()=>{ connectToWebsocket(cb); }, 5000 );
    cb(false);
  });
  
  ws.on('close', function() {
    console.log("WS closed");
    setTimeout( ()=>{ connectToWebsocket(cb); }, 5000 );
    cb(false);   
  });

  ws.on('message', function(msg) {                
    let m=JSON.parse(msg);
    switch(m[0]){
      case "#": //Just update the screen
        PIXEL.write(B15,Uint8ClampedArray(m[1]));
      break;
      case "!#": // Stop app and show new screen
        if(typeof STOPAPP!=="undefined"){ STOPAPP(); }
        PIXEL.write(B15,Uint8ClampedArray(m[1]));
      break;
      case "!": // New Program
        getNewApp(m[1]);
      break;
      case ">": //Just execute
        try{
          eval(m[1]);
          ws.send(JSON.stringify([ ">", true, null ]));
        }catch(e){
          ws.send(JSON.stringify([ ">", null, e.toString() ]));
        }
      break;
      case "_":
        require("Storage").erase(".boot1");
        BUZZER.play(["E5","A5"]);
        ws.send(JSON.stringify([ "_", true, null ]));
        E.reboot();
      break;
      default:
        if(typeof APPMSG!=="undefined"){ APPMSG(m[1]); }
      break;
    }

  });
}

function getNewApp(deviceAppId){
  if(typeof STOPAPP!=="undefined"){ STOPAPP(); }
  console.log(`http://192.168.1.100:8888/espruino/${deviceAppId}`);
  require("http").get(`http://192.168.1.100:8888/espruino/${deviceAppId}`, function(res) {
    let newProgram="";
    
      res.on('data', function(data) {  newProgram+=data;  });
          
      res.on('close', function(data) {                                              
        if(Number(res.statusCode)===200){
          console.log("GOT DATA", res.statusCode);  
          
            try{
              if(newProgram.length>0){
                require("Storage").write(".boot1", newProgram); //Store the new one to disk
                ws.send(JSON.stringify([ "!", deviceAppId, true])); //Let the server know success
                BUZZER.play(["E5","A5"]);
                setTimeout(()=>{ E.reboot(); }, 1000);
              }
            }catch(e){
              console.log("Could not store program",e);
              ws.send(JSON.stringify([ "!", deviceAppId, e.toString() ]));
              if(typeof STARTAPP!=="undefined"){STARTAPP();}
            }
          }else{
            console.log("Bad HTTP responses",res.statusCode);
            if(typeof STARTAPP!=="undefined"){STARTAPP();}
          }
        });


      }).on('error', function(e) {
        ws.send(JSON.stringify([ "!", deviceAppId, e.toString() ]));
        STARTAPP();
      });
}


process.on('uncaughtException', function(exception) { 
  console.log(exception);
});


setWatch(function() {
  require("Storage").erase(".boot1");
  E.reboot();
}, BTN1);

/************************************************
  ON BOOT 
   - Check if we have WFC stored
     - YES - then connect to wifi
     - NO  - open AP so we can collect them
************************************************/
E.on('init', function(){
  let firstRun=true;
  console.log(process.memory().free);
  if(typeof SSID==="undefined"){
    LED2.write(false);
    LED1.write(true);
  }else{
    connect(false,(connected)=>{
      if(connected){
        if(firstRun){

          firstRun=false;

          try{
            if(typeof STARTAPP!=="undefined"){ STARTAPP(function(){
              BUZZER.play(["A5", "B5", "C5", "D5","E5", "F5", "G5"]); 
            }); }
          }catch(e){
            console.log(e.toString());
          }
          
        }
      }          
    });
  }
});