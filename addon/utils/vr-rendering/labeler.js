import Ember from 'ember';
import THREE from "npm:three";

export default Ember.Object.extend({

  textLabels: {},

  systemTextCache: [],
  nodegroupTextCache: [],
  nodeTextCache: [],
  appTextCache: [],
  canvasList: {},

  font: null,


  saveTextForLabeling(textToShow, parent, color, boxColor) {

    const emberModelName = parent.userData.model.constructor.modelName;
    const text = textToShow ? textToShow : parent.userData.model.get('name');

    let textCache = 'systemTextCache';

    if(emberModelName === "node"){
      textCache = 'nodeTextCache';
    }
    else if(textToShow){
      textCache = 'nodegroupTextCache';
    }
    else if(emberModelName === "application") {
      textCache = 'appTextCache';
    }

    this.get(textCache).push({text: text, parent: parent, color: color, boxColor: boxColor});
  },


  drawTextLabels(font, configuration) {

    this.set('font', font);
    this.set('configuration', configuration);

    this.drawSystemTextLabels();
    this.drawNodeGroupTextLabels();
    this.drawNodeTextLabels();
    this.drawAppTextLabels();

    // After drawing, reset all caches for next tick
    this.set('systemTextCache', []);
    this.set('nodegroupTextCache', []);
    this.set('nodeTextCache', []);
    this.set('appTextCache', []);

  },

  redrawLabel(entity, textColor, name, color){

    // Create one canvas for each entity
    if(!this.get('canvasList')[entity.id]){
      let canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      this.get('canvasList')[entity.id] = canvas;
    }

    let oldMaterial = new THREE.MeshBasicMaterial({color});

    let canvas = this.get('canvasList')[entity.id];
    
    var ctx = canvas.getContext('2d');

    // Draw old box color
    ctx.fillStyle = color;
    ctx.fillRect(0.4, 0.4, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    // Handle opened and closed systems
    if(entity.userData.model.get('opened')){
      // Draw title for opened systems
      ctx.font = '15px arial';
      ctx.textAlign = "center";
      ctx.fillText(name, canvas.width/2,canvas.height/10,canvas.width-4);
    }
    else{
      // Draw title for closed systems
      ctx.font = '32px arial';
      ctx.textAlign = "center";
      ctx.fillText(name, canvas.width/2,canvas.height/2,canvas.width-4);
    }
 
    // create texture out of canvas
    let texture = new THREE.Texture(canvas);

    // map texture
    let canvasMaterial = new THREE.MeshBasicMaterial({map: texture});

    // Update texture      
    texture.needsUpdate = true;   

    
    // Define each side of the box
    var materials = [oldMaterial, // Right side
      oldMaterial, // Left side
      oldMaterial, // Back   
      oldMaterial, // Front
      canvasMaterial , // Top
      oldMaterial  // Buttom
    ];

    entity.material = materials;

  },

  drawSystemTextLabels() {

    this.get('systemTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if(!this.get('canvasList')[textObj.parent.id]){
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.parent.id] = canvas;
      }

      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;
      
      let size = bbox.getSize();
      
      // calculate aspect ratio
      let valueX = 64 * size.x/size.y;
      let valueY = 32 * size.x/size.y;
      // caluculate power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(valueX)/Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(valueY)/Math.log(2)));

      // Adapt canvas to size of box
      if(valueY-32 < nextPowerOf2Y-valueY){
        nextPowerOf2Y = 64;
      }
      if(valueX-64 < nextPowerOf2X-valueX){
        nextPowerOf2Y = 64;
      }
      this.get('canvasList')[textObj.parent.id].width = nextPowerOf2X;
      this.get('canvasList')[textObj.parent.id].height = nextPowerOf2Y;
      
      // get entity color and material
      let color = textObj.boxColor;

      let canvas = this.get('canvasList')[textObj.parent.id];
    
      var ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0.4, 0.4, canvas.width, canvas.height);

      // Handle opened and closed systems
      if(textObj.parent.userData.model.get('opened')){
        // Draw title for opened systems
        ctx.font = '15px arial';
        ctx.fillStyle = textObj.color;
        ctx.textAlign = "center";
        ctx.fillText(textObj.text, canvas.width/2,canvas.height/10,canvas.width-4);
      }
      else{
        // Draw title for closed systems
        ctx.font = '32px arial';
        ctx.fillStyle = textObj.color;
        ctx.textAlign = "center";
        ctx.fillText(textObj.text, canvas.width/2,canvas.height/2,canvas.width-4);
      }

      // create texture out of canvas
      let texture = new THREE.Texture(canvas);
      // map texture
      let canvasMaterial = new THREE.MeshBasicMaterial({map: texture});

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    
    
      // use old material
      let oldMaterial = textObj.parent.material;

      // Define each side of the box
      var materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial  // Buttom
      ];

      textObj.parent.material = materials;

    });
  },
  drawNodeGroupTextLabels() {

    this.get('nodegroupTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if(!this.get('canvasList')[textObj.parent.id]){
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.parent.id] = canvas;
      }

      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;
      
      let size = bbox.getSize();
      
      // calculate aspect ratio
      let valueX = 64 * size.x/size.y;
      let valueY = 32 * size.x/size.y;
      // caluculate power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(valueX)/Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(valueY)/Math.log(2)));

      // Adapt canvas to size of box
      if(valueY-32 < nextPowerOf2Y-valueY){
        nextPowerOf2Y = 64;
      }
      if(valueX-64 < nextPowerOf2X-valueX){
        nextPowerOf2Y = 64;
      }
      this.get('canvasList')[textObj.parent.id].width = nextPowerOf2X;
      this.get('canvasList')[textObj.parent.id].height = nextPowerOf2Y;

      // get entity color and material
      let color = textObj.boxColor;

      let canvas = this.get('canvasList')[textObj.parent.id];
    
      var ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0.4, 0.4, canvas.width, canvas.height);

      // Handle opened nodegroups
      if(!textObj.parent.userData.model.get('opened')){
        // Draw title for opened nodegroups
        ctx.font = '25px arial';
        ctx.fillStyle = textObj.color;
        ctx.textAlign = "center";
        ctx.fillText(textObj.text, canvas.width/2,canvas.height/2,canvas.width-4);
      }

      // create texture out of canvas
      let texture = new THREE.Texture(canvas);
      // map texture
      let canvasMaterial = new THREE.MeshBasicMaterial({map: texture});

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    
    
      // use old material
      let oldMaterial = new THREE.MeshBasicMaterial({
        color
      });
      
      // Define each side of the box
      var materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial  // Buttom
      ];

      textObj.parent.material = materials;
    });
  },

  drawNodeTextLabels() {

    this.get('nodeTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if(!this.get('canvasList')[textObj.parent.id]){
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.parent.id] = canvas;
      }

      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;
      
      let size = bbox.getSize();
      
      // calculate aspect ratio
      let valueX = 64 * size.x/size.y;
      let valueY = 32 * size.x/size.y;
      // caluculate power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(valueX)/Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(valueY)/Math.log(2)));

      // Adapt canvas to size of box
      if(valueY-32 < nextPowerOf2Y-valueY){
        nextPowerOf2Y = 64;
      }
      if(valueX-64 < nextPowerOf2X-valueX){
        nextPowerOf2Y = 64;
      }
      this.get('canvasList')[textObj.parent.id].width = nextPowerOf2X;
      this.get('canvasList')[textObj.parent.id].height = nextPowerOf2Y;
      
      // get entity color
      let color = textObj.boxColor;
      
      let canvas = this.get('canvasList')[textObj.parent.id];
    
      var ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0.4, 0.4, canvas.width, canvas.height);
    
      // Draw title for nodes
      ctx.font = '20px arial';
      ctx.fillStyle = textObj.color;
      ctx.textAlign = "center";
      ctx.textBaseline="bottom";
      ctx.fillText(textObj.text, canvas.width/2,canvas.height-4,canvas.width-4);
      

      // create texture out of canvas
      let texture = new THREE.Texture(canvas);
      // map texture
      let canvasMaterial = new THREE.MeshBasicMaterial({map: texture});

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    
    
      // use old material
      let oldMaterial = new THREE.MeshBasicMaterial({
        color
      });
      
      // Define each side of the box
      var materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial  // Buttom
      ];

      textObj.parent.material = materials;
    });
  },



  drawAppTextLabels() {
    this.get('appTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if(!this.get('canvasList')[textObj.parent.id]){
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.parent.id] = canvas;
      }
      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;
      
      let size = bbox.getSize();
      
      // calculate aspect ratio
      let valueX = 64 * size.x/size.y;
      let valueY = 32 * size.x/size.y;
      // caluculate power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(valueX)/Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(valueY)/Math.log(2)));

      // Adapt canvas to size of box
      if(valueY-32 < nextPowerOf2Y-valueY){
        nextPowerOf2Y = 64;
      }
      if(valueX-64 < nextPowerOf2X-valueX){
        nextPowerOf2Y = 64;
      }
      this.get('canvasList')[textObj.parent.id].width = nextPowerOf2X;
      this.get('canvasList')[textObj.parent.id].height = nextPowerOf2Y;
      
      // get entity color and material
      let color = textObj.boxColor;

      let canvas = this.get('canvasList')[textObj.parent.id];
    
      var ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0.4, 0.4, canvas.width, canvas.height);
    
      // Draw title for nodes
      ctx.font = '30px arial';
      ctx.fillStyle = textObj.color;
      ctx.textAlign = "center";
      // save some space for images (canvas.width/2-6)
      ctx.fillText(textObj.text, canvas.width/2-6,canvas.height/2,canvas.width-4);
      

      // create texture out of canvas
      let texture = new THREE.Texture(canvas);
      // map texture
      let canvasMaterial = new THREE.MeshBasicMaterial({map: texture});

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    
    
      // use old material
      let oldMaterial = new THREE.MeshBasicMaterial({
        color
      });
      
      // Define each side of the box
      var materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial  // Buttom
      ];

      textObj.parent.material = materials;
    });

  },

});
