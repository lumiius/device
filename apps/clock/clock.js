let arr = null,
    lastDraw="";

setTime(1604402323);



let digits={
  "0":[
    [1,1,1],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,1,1]
  ],
  "1":[
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0]
  ],
  "2":[
    [1,1,1],
    [0,0,1],
    [0,0,1],
    [1,1,1],
    [1,0,0],
    [1,0,0],
    [1,0,0],
    [1,1,1]
  ],
  "3":[
    [1,1,1],
    [0,0,1],
    [0,0,1],
    [1,1,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [1,1,1]
  ],
  "4":[
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,1,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1]
  ],
  "5":[
    [1,1,1],
    [1,0,0],
    [1,0,0],
    [1,1,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [1,1,1]
  ],
  "6":[
    [1,1,1],
    [1,0,0],
    [1,0,0],
    [1,1,1],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,1,1]
  ],
  "7":[
    [1,1,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1]
  ],
  "8":[
    [1,1,1],
    [1,0,1],
    [1,0,1],
    [0,1,0],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,1,1]
  ],
  "9":[
    [1,1,1],
    [1,0,1],
    [1,0,1],
    [1,1,1],
    [0,0,1],
    [0,0,1],
    [0,0,1],
    [0,0,1]
  ]
};


function paintBackground(){
  //Blank the screen on startup
  for(var i=0;i<256;i++) {
    arr[i*3] = 0;
    arr[(i*3)+1] = 0;
    arr[i*3+2] = 0;
  }
}


function xym(x,y){ return (((x%2===0) ? (16*(x))+(y) : (16*(x+1))-(y+1)))*3; }

function drawDigit(d, p, color){
  //console.log(d);
  digits[d].forEach((row,y)=>{
    row.forEach((col,x)=>{
      arr[xym(x+(4*p),y+4)]=(col==1) ? color[0] : 0;
      arr[xym(x+(4*p),y+4)+1]=(col==1) ? color[1] : 0
      arr[xym(x+(4*p),y+4)+2]=(col==1) ? color[2] : 0;
    });
  });
  
}

let unZoom=()=>{
  let zoomX=0;
  let zI=setInterval(function(){
    arr[xym(zoomX,15)]=0;
    arr[xym(zoomX,15)+1]=0;
    arr[xym(zoomX,15)+2]=0;
    PIXEL.write(B15, arr);
    zoomX++;
    if(zoomX>15){
      clearInterval(zI);      
    }
  },30);
};

let zoom=()=>{
  let zoomX=0;
  let zI=setInterval(function(){
    arr[xym(zoomX,15)]=0;
    arr[xym(zoomX,15)+1]=5;
    arr[xym(zoomX,15)+2]=1;
    PIXEL.write(B15, arr);
    zoomX++;
    if(zoomX>15){
      clearInterval(zI);
      unZoom();
    }
  },30);
};

function drawTime(){
  let h=(Date().getHours()%12) || 12;    
  if(h<10){h="0"+h.toString();}
  
  let m=Date().getMinutes();
  if(m<10){m="0"+m.toString();}
  
  let dateString=h.toString()+m.toString();
  if(Date().getSeconds()===59){
    zoom();
  }
  if(lastDraw!=dateString){
    lastDraw=dateString;
    paintBackground();
    
    for(let i=0; i<dateString.length; i++){ 
      if(i>0 || (i===0 && dateString[i]!=="0")){
        if(i===1 && dateString[0]==="0"){
          drawDigit(dateString[i],0.5,"050");
        }else{        
          drawDigit(dateString[i],i,"050");
        }
      }
    }
    
    PIXEL.write(B15, arr);
    
  }
  
  
}

let clock=null;
function STARTAPP(){
    arr=new Uint8ClampedArray(256*3);
    
    require("http").get(`http://192.168.1.100:8888/service/unixtime/America%2FNew_York`, function(res) {
        let body="";
        res.on('data', function(data) {  body+=data;  });
            
        res.on('close', function(data) {                                              
          if(Number(res.statusCode)===200){
            console.log(JSON.parse(body).value);
            setTime(JSON.parse(body).value);
          }else{
            setTime(1604334480);
          }
    
          clock=setInterval(function(){ drawTime(); },1000);
            drawTime();
          BUZZER.play(["C5", "C5", "G5", "G5","C5", "C5", "G5", "G5"]); 
        });
      });
  
    
    BUZZER.play(["C5", "G5", "D5", "A5"]);    
}

function STOPAPP(){
    clearInterval(clock);
    arr=null;
}
