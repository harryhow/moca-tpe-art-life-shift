// scale 
//let myScaledCanvas;
let outputScale = 5;
let currentScale;
// socket
let socket;
let isNewComing;
var figure = [];
var imgTexture = [];
// for ripple
let r = 0;
let angle=0;
let art;
var figureCount = 0;
var colorPalette;
let overAllTexture;
let numOfGroup = 3*2; // amounts per showing group
let groupCount = 1;
let csvTable;
var newCardID;
var foundIndex;
var isShowingDuplicate;
var originXPos = 0;
var originYPos = 0;
var originZPos = 0;
let timer = 1;
let _text;
let _textShow;
let totalGroupCount = 0;
let showingGroupNum = 1;
let interval;
let isRotation;
//var outerDiam = 0;
//const TWEEN = require('@tweenjs/tween.js')
const csv2array = (csv, dlm = ',') => {
  const [heads, ...lines] = csv.split('\n'), th = heads.split(dlm);
  return lines.map(l => l.split(dlm).reduce((o, c, i) => (o[th[i]] = c.trim(), o), {}));
}

const findInCSV = (csv, p, v) => csv2array(csv).find(k => k[p] === v);

function preload() 
{
  imgTexture.push(loadImage('jelly_blue.jpeg'));
  imgTexture.push(loadImage('jelly_pink.jpeg'));
  imgTexture.push(loadImage('jelly_white.jpeg'));
  imgTexture.push(loadImage('jelly_yellow.jpeg'));

  //NFC/nfc-pcsc/scan-record.csv
  // app/sketch.js
  // NFC/nfc-pcsc/scan-record.csv

  csvTable = loadTable('scan-record.csv', 'csv', 'header');
}


function setup () 
{
  createCanvas(windowWidth, windowHeight, WEBGL);
  //drawGrid();
  //myScaledCanvas = createGraphics(windowWidth, windowHeight);
  currentScale = 1; 
  background(0);
  //angleMode(DEGREES);
  noStroke();
  //ambientMaterial(255, 0, 0);
  specularMaterial(139, 116, 87);
  //rectMode(CENTER);
  colorPalette = ('ac9070-bac55e').split("-").map(a => "#" + a);
  //colorPalette = ('ac9070C8-1b065eC8-ff47daC8-ff87abC8-bac55eC8').split("-").map(a => "#" + a);

  particle = new particles();

  socket = io.connect('http://localhost:3000');
  socket.on('card_id', handleCardId);
  count = 0;
  isRotation = false;

  translate(-windowWidth/2,-windowHeight/2,0);

  // _text = createGraphics(window.innerWidth - 4, window.innerHeight - 4);
  // _text.textFont('Source Code Pro');
  // //_text.textAlign(TOP);
  // _text.textSize(100);
  // // _text.fill(37,40,33,128);
  // _text.fill(255,0,0,128);
  // _text.noStroke();
  // _textShow = millis();
  // _text.text(_textShow, 500, 100);
  //pixelDensity(9); 
  //////////////////////
  // Add some texture
  /////////////////////
  // pixelDensity(2)
  // overAllTexture = createGraphics(width,height);
  // overAllTexture.loadPixels();
  // for (var i=0 ; i<width+50 ; i++){
  //   for (var o=0;o<height+50;o++){
  //     overAllTexture.set(i,o,color(100,noise(i/3,o/3,i*o/50)*random([0,50,100])));
  //   }
  // }
  // overAllTexture.updatePixels();
  ////////////////////////

  //art=createGraphics(300,300);
  //RGG(139, 116, 87) for hotel royal

  // let newRow = csvTable.addRow();
  // newRow.setString('time', "55555555");
  // newRow.setString('id', "6666666");// card id
  // newRow.setString('x', "7777777");
  // newRow.setString('y', "8888888");
  // newRow.setString('z', "9999999");  
  
  //save(csvTable, 'scan-record.csv');

    //print the results
    // for (let r = 0; r < csvTable.getRowCount(); r++)
    // for (let c = 0; c < csvTable.getColumnCount(); c++)
    //   //print(csvTable.getString(r, c));
    //   console.log(csvTable.getString(r, c));
}

function isCardDuplicated(item){
  //console.log("+ isCardDuplicated");
  return newCardID === item.id;
}


function windowResized () 
{
  resizeCanvas(windowWidth, windowHeight);
}

function handleCardId(data) 
{
  console.log("Got a card: " + data);
  if (isShowingDuplicate)
    return;
  
  newCardID = data;
  // doing some compare

  // let row = csvTable.findRow(data, 'id'); // buggy...failed when prefix space in the header!! 
  // if (row.getString('id').length > 0)
  // {
  //   //find the corresponding species
  //   //print(row.length + ' found');
  //   //if (row.length > 0){
  //   console.log("++found duplicate card!");
  //   if (figure.length >= 1){
  //     console.log("X: " + figure[figure.length-1].GetXpos());
  //     console.log("Y: " + figure[figure.length-1].GetYpos());
  //     console.log("Z: " + figure[figure.length-1].GetZpos());  
  //   }
  //   console.log("-- found duplicate card!");
  //   // read x, y, z pos
  // }

  // lookup figure array
  foundIndex =  figure.findIndex(isCardDuplicated);
  
  if (foundIndex > -1){
    console.log("found duplicate index: " + foundIndex);
    // cancel rotation event and status
    clearInterval(interval);
    isRotation = false;
    

    isShowingDuplicate = true;
    originXPos = figure[foundIndex].GetXpos();
    originYPos = figure[foundIndex].GetYpos();
    originZPos = figure[foundIndex].GetZpos();
    var timeoutID = setTimeout(myAlert, 5000);
    ////////////////////////////////////////
    ///////////////////////////////////////

    function myAlert() {
      // doing some animation?
      //alert('move back! x: ' + originXPos + 'y: ' + originYPos);
      
      figure[foundIndex].SetXpos(originXPos);
      figure[foundIndex].SetYpos(originYPos);
      figure[foundIndex].SetZpos(originZPos);
      isShowingDuplicate = false;
      //isRotation = true;
      interval = setInterval(rotateGroup, 30000); 
    }
   
  }
  else{
    console.log("Create a new figure...");
    figure.push(new avatar(data));
    figureCount++;
    if (isRotation)
      groupCount = totalGroupCount; // move to current group if rotation is activating
     // Scan figure array
    console.log("Update avatar size: " + figure.length);
    if (figure.length > numOfGroup*totalGroupCount){
      totalGroupCount++; // current total
      groupCount = totalGroupCount; // copy current group count
      console.log("Move to another group: " + groupCount);
    }

    if (totalGroupCount > 1){ // if there's more than one group
      console.log("Need to rotate pages");
      // Set showing interval timer
      if (!isRotation){
        console.log("Start rotation event!");
        clearInterval(interval); // just in case
        interval = setInterval(rotateGroup, 30000); 
      }
      //groupCount = showingGroupNum; // give rotation group index from beginning
    }
  }
}


/* Show different groups one by one*/
function rotateGroup(){
  isRotation = true;
  if (showingGroupNum<=totalGroupCount){
    console.log("Showing group: " + showingGroupNum + "/" + totalGroupCount);
    groupCount = showingGroupNum;
    showingGroupNum++;
  }
  else 
    showingGroupNum = 1;
}



function draw () 
{
  
  background(0);
  lights();
  shininess(70);

  const dirX = (mouseX / width - 0.5) * 2;
  const dirY = (mouseY / height - 0.5) * 2;
  directionalLight(255, 0, 255, -dirX, -dirY, -1);
 


  particle.update();




  for (let i=numOfGroup*(groupCount-1);  i<numOfGroup*groupCount; i++)
  {
    if (isShowingDuplicate){
   
      console.log("o xpos: " + originXPos);
      console.log("o ypos: " + originYPos);

      ////////////////// TWEEN function
      const coords = {x: originXPos, y: originYPos, z: originZPos} // Start at (0, 0)
      const tween = new TWEEN.Tween(coords) // Create a new tween that modifies 'coords'.
        .to({x: windowWidth/2, y: windowHeight/2}, 500) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
          //console.log("Tween moving done");
          figure[foundIndex].xPos = coords.x;
          figure[foundIndex].yPos = coords.y;
          figure[foundIndex].zPos = coords.z;
          // Called after tween.js updates 'coords'.
          // Move 'box' to the position described by 'coords' with a CSS translation.
        })
        .start() // Start the tween immediately.

        // console.log("tween x: " + coords.x);
        // console.log("tween y: " + coords.y);
        
        
        TWEEN.update();
       
      ///////////////////////

      push();
      figure[foundIndex].draw();
      pop();

    }else{
      if (figure[i]){
        figure[i].draw();
      }  
    }
  }  
 

 


  //translate(240, 0, 0);

 

  // figure ++
  // translate(-500, 0, 0);
  // push();
  // //rotateZ(frameCount * 0.01);
  // //rotateX(frameCount * 0.01);
  // rotateY(frameCount * 0.002);
  // torus(70, 20);
  // cone(150, 150);
  // push();
  // translate(-40, 100, 0);
  // box(50, 100, 10);
  // pop();
  // push();

  // pop();
  // push();
  // translate(30, 100, 0);
  // box(50, 200, 10);
  // pop();
  // pop();
  
  // figure --

  // copy test figure
  // translate(-300, 100, 0);
  // push();
  // //rotateZ(frameCount * 0.01);
  // //rotateX(frameCount * 0.01);
  // rotateY(frameCount * 0.05);
  // torus(70, 20);
  // cone(100, 100);
  // push();
  // translate(-40, 200, 0);
  // box(10, 500, 10);
  // pop();
  // push();
  // translate(30, 200, 0);
  // box(10, 500, 10);
  // pop();
  // pop();


  // copy test figure
  // translate(-300, 10, -900);
  // push();
  // //rotateZ(frameCount * 0.01);
  // //rotateX(frameCount * 0.01);
  // rotateY(-frameCount * 0.005);
  // torus(170, 20);
  // cone(-100, -100);
  // push();
  // translate(-40, 200, 0);
  // box(10, 100, 10);
  // pop();
  // push();
  // translate(30, 200, 0);
  // box(10, 100, 10);
  // pop();
  // pop();
}

///////////////////////
// Utility function
//////////////////////
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


///////////////////////
// Avatar class
///////////////////////
class avatar 
{
  constructor(data) 
  {
    this.id = data;
    this.time = data;   
    this.xPos = getRandomFloat(0+150, windowWidth-200);
    this.yPos = getRandomFloat(0+100+20, windowHeight-200);
    this.zPos = getRandomFloat(300, -300);;
    this.numTexture = getRandomInt(0, imgTexture.length);
    this.day = day();
    this.minute = minute();
    this.hour = hour();
    this.second = second();
    this.rotation = random(1, -1);
    this.color = colorPalette[getRandomInt(0,colorPalette.length)];

  }


  draw()
  {
    
      //console.log("Convert data to avatar");

      // //3d ripple effect can apply as material
      // background(255);
      // for (let i = 50; i < width - 50; i += 50) {
      //     r = r + 1
      //     art.noFill()
      //     art.stroke(r, i, i)
      //     art.strokeWeight(2)
      //     translate(0,0)
      //     art.ellipse(100+i,100+i, r+i, r+i)
      // }
      // if (r > width-50 || r < 0 || r > height-50 || r < 0) {
      //   r -= r
      // }
      // pop()
    
      // push();
      // blendMode(MULTIPLY);
      //image(overAllTexture,0,0);
      // pop();
    
      rotateX(frameCount * 0.00001 * 15); // rotate globally

      push();

      //lightFalloff(0.5, 0, 0);
      translate(-windowWidth/2,-windowHeight/2,0); // move original x,y to up, left corner 
      fill(this.color); // fill color from color palette
      translate(this.xPos, this.yPos, this.zPos);
      rotateY(frameCount * 0.002* 8 * 1* this.rotation); // rotation reverse, speed: day
      // head..and neck
      //let head1 =  (7*this.hour+1)+90; // 10h-22h -> 70-155
      //let head2 = 10;
      let head1 = 6; // at lea)t 90
      //let sec = this.second;
     

      if (frameCount % 60 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
        timer --;
      }
      if (timer == 0) {
        
        this.second = this.second -1;
        if (this.second < 0)
        this.second = 60;

        timer = 1;
      }
      //console.log("sec: " + this.second);
      let head2 = (3*((this.second+1))); //0m-60m -> 0-12
      
      // head
      push();
      // console.log("head2: " + head2);
      torus(head2, head1/*+second()/2*/, 24, 16); // the later the thick
      //.disk
      //fill(37,40,33,128);
      //sphere(head2,2, 24);
      pop();
      
  
      // face
      let face = (this.minute+1)*15+this.hour; //20 -620
    
      //console.log("face: " + face);
      push();
      texture(imgTexture[this.numTexture]);
      cone((this.rotation)*face>>2, (this.rotation)*face >>2 , 24, 16);
      pop();

      // left feet
      push();
      translate(-20, 100-40, 0);
      rotate(0.5 + sin(frameCount/30)/5)
      box(50/2, 100/2+this.second, 10/2, 4, 4);
      pop();

      // right feet
      push();
      translate(20, 100-40, 0);
      rotate(-0.25 + sin(frameCount/50)/5)
      box(50/2, 50/2 /*2.2*(second()*2+1)*/, 10/2, 4, 4);
      pop();

      pop();
      
  }

  update(){
    
  }


  SetXpos(newXPos){
    this.xPos = newXPos;
  }

  SetYpos(newYPos){
    this.yPos = newYPos;
  }

  SetZpos(newZPos){
    this.zPos = newZPos;
  }
  
  GetXpos(){
    return this.xPos;
  }

  GetYpos(){
    return this.yPos;
  }

  GetZpos(){
    return this.zPos;
  }

}




//////////////////////////////////
// Particle with moving geometries
//////////////////////////////////
function particles() {
  
  /// Declare and assign
  /// the first-time variables'
  /// values for use in the update
  /// method.
  this.incremx = width / 2;
  this.incremy = height / 2;
  this.incremz = height;
  
  /// Declare a variable to
  /// track the elements in
  /// our arrays of values.
  this.index = 0;
  
  /// Declare empty arrays
  /// to hold each geometry's
  /// attributes (location,
  /// velocity, moving geometry 
  /// appearance, and node appearance.)
  this.z = [];
  this.speed = [];
  this.shape = [];
  this.gshape = [];
  
  /// Declare and assign local variables
  /// to limit a geometry's velocity.
  let max = -8;
  let min = -5;
  
  /// Loop through the y locations, within a
  /// loop for the x locations, within a loop
  /// for the z locations.
  for (let deep = -height; deep <= height; deep += this.incremz) {
    for (let col = -width / 2; col <= width / 2; col += this.incremx) {
      for (let row = -height / 2; row <= height / 2; row += this.incremy) {
  
        /// Assign into the arrays
        /// their initial values.
        this.z.push(height);
        
        /// Use the local variable to
        /// limit the random velocity.
        this.speed.push(random(max,min));
        
        /// Randomly pick 0,1, or 2 to
        /// determine which type of geometry
        /// to output for the moving shape.
        this.shape.push(floor(random(3)));
        /// Do the same for the node
        /// geometries.
        this.gshape.push(floor(random(3)));
      }
    }
  }
  /// Make a method that calculates new values
  /// and generates fresh output.
  this.update = function () {
    
    /// Reset the element counter 
    /// to the beginning of the arrays.
    this.index = -1;

    /// Loop through each dimension to
    /// get the positions for the nodes
    /// and moving geometries.
    for (let deep = -height; deep <= height; deep += this.incremz) {

      /// Set the current 0,0,0 location to
      /// the center of the x,y in the 
      /// deep distance of the depth plane.
      translate(0, 0, deep);
      
      /// Get the x locations from the column loop.
      for (let col = -width / 2; col <= width / 2; col += this.incremx) {
        
        /// Output a vertical line along
        /// the x (column) coordinates.
        //line(col, -height / 2, col, height / 2);
        
        /// Get the y location from  the row loop.
        for (let row = -height / 2; row <= height / 2; row += this.incremy) {

          /// Advance the index counter to the next 
          /// element in the array.
          this.index += 1;
          
          /// Advance the moving geometry's 
          /// location in the depth plane.
          this.z[this.index] += this.speed[this.index];
          
          /// Check the z location for out-of-bounds.
          if (this.z[this.index] < -height + deep) {
            
            /// Make changes when out-of-bounds.
            /// Reset the z location to nearest.
            this.z[this.index] = height;
            /// Reset velocity to random amount
            /// limited by the local variables.
            this.speed[this.index] = random(min, max);
            /// Reset shape type to a random kind.
            this.shape[this.index] = floor(random(3));
            /// Set node shape type to this moving
            /// geometry's shape.
            this.gshape[this.index] = this.shape[this.index];
          }
          
          /// Assign a local variable to
          /// hold the return of the z location
          /// interpolated to an r,g,b color range.
          let cr = map(this.z[this.index], height, -height, 5, 255);

          /// Output a horizontal line
          /// along the y (row) coordinates. 
          line(-width / 2, row, width / 2, row);

          /// Isolate a volume to make
          /// a change to translation
          /// and/or rotations.
          push();
          
          /// Set the origin to the position
          /// of the node for this geometry. 
          translate(col, row, 0);
          
          /// Rotate the isolated volume
          /// into the depth of the z-plane.
          rotateX(-PI * 0.5);
          
          /// Set the isolated stroke thickness
          /// and color to a unique value.
          strokeWeight(2);
          stroke(100, 128);
          
          /// Output a vertical line into the
          /// rotated volume to connect nodes
          /// between depth planes.
          line(0, -this.incremy, 0, this.incremy);
          pop(); /// Close this volume change.

          /// Isolate a volume to output
          /// the node geometries.
          // push();
          
          // /// Set the origin of this volume
          // /// to the position of the node
          // /// at this col, row, deep location.
          // translate(col, row, 0);
          
          // /// Optionally rotate node geometries.
          // // rotateX(frameCount*0.05+(this.index*0.5));
          // // rotateY(frameCount*0.05+(this.index*0.5));
          // // rotateZ(frameCount*0.05+(this.index*0.5));

          // /// Check the node geometry array value
          // /// to determine which shape to output.
          // if (this.gshape[this.index] === 0) {
          //   //circle(0, 0, 100);
          // } else if (this.gshape[this.index] === 1) {
          //   //triangle(0, -50, -50, 50, 50, 50);
          //   //circle(0, 0, 100);
          // } else if (this.gshape[this.index] === 2) {
          //   //rect(0, 0, 100);
          //   //circle(0, 0, 100/2);
          // }
          // pop(); /// Close this volume.

          /// Isolate a volume to output
          /// the moving geometries.
          push();
          //stroke(255 - cr);
          fill(cr, 128);

          translate(col, row, this.z[this.index]);
          
          /// Optionally rotate the moving
          /// geometries.
          rotateX(frameCount*0.05+(this.index*0.5));
          rotateY(frameCount*0.05+(this.index*0.5));
          rotateZ(frameCount*0.05+(this.index*0.5));
          
          if (this.shape[this.index] === 0) {
            circle(0, 0, 100/2);
          } else if (this.shape[this.index] === 1) {
            triangle(0, -50/2, -50/2, 50/2, 50/2, 50/2);
            //circle(0, 0, 10);
          } else if (this.shape[this.index] === 2) {
            //rect(0, 0, 100);
            circle(0, 0, 1);
          }
          pop(); /// Close this volume.
        }
      }
    }
  }
}

function exportHighResolution() {
  let scale = 5;
  myScaledCanvas = createGraphics(scale * windowWidth, scale * windowHeight);
  draw();
  save(myScaledCanvas, "highResImage", 'png');

  myScaledCanvas = createGraphics(windowWidth, windowHeight);
  draw();
}


function keyReleased() { 
  //if (key == 'e') exportHighResolution(); 
  if (key == 'e') saveForPrint("sketch.jpg", "A3", 300, 10);
  if (key == 'f') {
    let fs = fullscreen(); fullscreen(!fs);
    socket.emit('fullscreen', fs);
  }
  if (key == 'c'){
    handleCardId(millis());
  }

}