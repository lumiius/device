exports={
    port:A0,
    play:function(tune){
        let that=this;

        let pos=0, pitches = {
          'A3':220.00,
          'A#3':233.08,
          'B3':246.94,
          'C4':261.63,
          'C#4':277.18,
          'D4':293.66,
          'D#4':311.13,
          'E4':329.63,
          'F4':349.23,
          'F#4':369.99,
          'G4':392.00,
          'G#4':415.30,
          'A4':440.00,
          'A#4':466.16,
          'B4':493.88,
          'C5':523.25,
          'C#5':554.37,
          'D5':587.33,
          'D#5':622.25,
          'E5':659.26,
          'F5':698.46,
          'F#5':739.99,
          'G5':783.99,
          "G#5":830.61,
          'A5':880.00,
          'A#5':932.33,
          'B5':987.77,
          'C6':1046.50,
          'C#6':1108.73,
          'D6':1174.66,
          'D#6':1244.51,
          'E6':1318.51,
          'F6':1396.91,
          'F#6':1479.98,
          'G6':1567.98,
          'G#6':1661.22,
          'A6':1760.00,
          'A#6':1864.66,
          'B6':1975.53,
          'C7':2093.00
        };
        
        let freq=(f)=>{ 
          if(f===0){
            digitalWrite(that.port,0);
          }else{
            analogWrite(that.port, 0.5, { freq: f } );
          }
        };
        
        let step=()=>{
          let note = tune[pos];
          if(note !== undefined){ pos++; }
          
          if(note in pitches){ 
            freq(pitches[note]); 
          }else{
            freq(0);
          }
          
          if(tune.length>pos){
            setTimeout(step,100);
          }else{
            setTimeout(function(){
              freq(0);
            },100);      
          }
        };
        
        step();
      }
};
