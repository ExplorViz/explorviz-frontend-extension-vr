import EmberObject from '@ember/object';
import THREE from "three";


/*
 * This util is used to draw the labels of the
 * landscape and application3D
 *
 */
export default EmberObject.extend({

  systemTextCache: [],
  nodegroupTextCache: [],
  nodeTextCache: [],
  appTextCache: [],
  canvasList: {},
  textures: {},

  /*
   * This method stores the text and all additional information
   * into an array for each type of entity
   *
   */
  saveTextForLabeling(textToShow, parent, color, boxColor) {

    const emberModelName = parent.userData.model.constructor.modelName;
    const text = textToShow ? textToShow : parent.userData.model.get('name');

    let textCache = 'systemTextCache';
    // Identify entity type 
    if (emberModelName === "node") {
      textCache = 'nodeTextCache';
    }
    else if (textToShow) {
      textCache = 'nodegroupTextCache';
    }
    else if (emberModelName === "application") {
      textCache = 'appTextCache';
    }

    this.get(textCache).push({ text: text, parent: parent, color: color, boxColor: boxColor });
  },

  /*
   * This method is used to draw the labels 
   */
  drawTextLabels() {
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

  /*
  * This method is used to redraw given entities.
  * Therefore the mapped material gets apated to the passed color.  
  * This method is called for changig the box color.
  *
  */
  redrawLabel(entity, textColor, name, color) {
    // Create one canvas for each entity if not already exists
    if (!this.get('canvasList')[name]) {
      let canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;

      this.get('canvasList')[name] = canvas;

      entity.geometry.computeBoundingBox();
      let bbox = entity.geometry.boundingBox;

      let size = new THREE.Vector3();
      bbox.getSize(size);

      // Calculate aspect ratio and next power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(size.x * 40) / Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(size.y * 40) / Math.log(2)));

      // Adapt canvas to size of box
      this.get('canvasList')[name].width = nextPowerOf2X;
      this.get('canvasList')[name].height = nextPowerOf2Y;
    }

    let oldMaterial = new THREE.MeshLambertMaterial({ color });
    let canvas = this.get('canvasList')[name];
    let ctx = canvas.getContext('2d');
    let x, y, max;

    // Define the size and position of the label depending on the entity type
    if (entity.type === 'system') {
      if (entity.userData.model.get('opened')) {
        ctx.font = '20px arial';
        y = 20;
      }
      else {
        ctx.font = '32px arial';
        y = canvas.height / 2;
      }
      x = canvas.width / 2;
      max = canvas.width * 0.9;

    } else if (entity.type === 'nodegroup') {
      if (!entity.userData.model.get('opened')) {
        ctx.font = '30px arial';
        x = canvas.width / 2;
        y = canvas.height / 2;
        max = canvas.width * 0.95;
      }

    } else {
      ctx.font = '30px arial';
      x = canvas.width / 2 * 0.8;
      y = canvas.height / 2;
      max = canvas.width * 0.5;

    }

    // Draw new box color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(name, x, y, max);


    // Create texture 
    let texture = new THREE.CanvasTexture(canvas);

    // Map texture
    let canvasMaterial = new THREE.MeshLambertMaterial({ map: texture });

    // Update texture      
    texture.needsUpdate = true;

    // Define each side of the box
    let materials = [oldMaterial, // Right side
      oldMaterial, // Left side
      oldMaterial, // Back   
      oldMaterial, // Front
      canvasMaterial, // Top
      oldMaterial  // Buttom
    ];

    // Delete old Material
    this.deleteMaterial(entity);

    // Set new material
    entity.material = materials;
  },

  deleteMaterial(entity) {
    entity.geometry.dispose();
    // Dispose array of material
    if (entity.material.length) {
      for (let i = 0; i < entity.material.length; i++) {
        let tempMaterial = entity.material[i];
        if (tempMaterial.map) {
          tempMaterial.map.dispose();
        }
        tempMaterial.dispose();
      }
    }
    // Dispose material 
    else {
      if (entity.material.map) {
        entity.material.map.dispose();
      }
      entity.material.dispose();
    }
  },

  /*
   * This method is used to label the box of a system and is
   * directly called after creating the box. 
   */
  drawSystemTextLabels() {
    this.get('systemTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if (!this.get('canvasList')[textObj.text]) {
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.text] = canvas;
      }

      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;

      let size = new THREE.Vector3();
      bbox.getSize(size);

      // Calculate aspect ratio and next power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(size.x * 40) / Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(size.y * 40) / Math.log(2)));

      // Adapt canvas to size of box
      this.get('canvasList')[textObj.text].width = nextPowerOf2X;
      this.get('canvasList')[textObj.text].height = nextPowerOf2Y;

      // Get entity color and material
      let color = textObj.boxColor;

      let canvas = this.get('canvasList')[textObj.text];
      let ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = textObj.color;
      ctx.textAlign = "center";

      // Handle opened and closed systems
      if (textObj.parent.userData.model.get('opened')) {
        // Draw title for opened systems
        ctx.font = '20px arial';
        ctx.fillText(textObj.text, canvas.width / 2, 20, canvas.width * 0.95);
      }
      else {
        // Draw title for closed systems
        ctx.font = '32px arial';
        ctx.fillText(textObj.text, canvas.width / 2, canvas.height / 2, canvas.width * 0.95);
      }

      // Create texture out of canvas
      let texture = new THREE.CanvasTexture(canvas);
      // Map texture
      let canvasMaterial = new THREE.MeshLambertMaterial({ map: texture });

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    

      // Use old material
      let oldMaterial = textObj.parent.material;

      // Define each side of the box
      let materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial // Buttom
      ];

      // Delete old material and texture
      this.deleteMaterial(textObj.parent);

      // Set new material
      textObj.parent.material = materials;
    });
  },


  /*
   * This method is used to label the box of a nodegroup and is
   * directly called after creating the box. 
   */
  drawNodeGroupTextLabels() {
    this.get('nodegroupTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if (!this.get('canvasList')[textObj.text]) {
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.text] = canvas;
      }

      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;

      let size = new THREE.Vector3();
      bbox.getSize(size);

      // calculate aspect ratio and next power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(size.x * 30) / Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(size.y * 40) / Math.log(2)));

      // Adapt canvas to size of box
      this.get('canvasList')[textObj.text].width = nextPowerOf2X;
      this.get('canvasList')[textObj.text].height = nextPowerOf2Y;

      // Get entity color and material
      let color = textObj.boxColor;
      let canvas = this.get('canvasList')[textObj.text];
      let ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Handle opened nodegroups
      if (!textObj.parent.userData.model.get('opened')) {
        // Draw title for opened nodegroups
        ctx.font = '30px arial';
        ctx.fillStyle = textObj.color;
        ctx.textAlign = "center";
        ctx.fillText(textObj.text, canvas.width / 2, canvas.height / 2, canvas.width * 0.95);
      }

      // Create texture out of canvas
      let texture = new THREE.CanvasTexture(canvas);
      // Map texture
      let canvasMaterial = new THREE.MeshLambertMaterial({ map: texture });

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    

      // Use old material
      let oldMaterial = new THREE.MeshLambertMaterial({
        color
      });

      // Define each side of the box
      let materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial  // Buttom
      ];

      // Delete old material and texture
      this.deleteMaterial(textObj.parent);

      // Set new material
      textObj.parent.material = materials;
    });
  },

  /*
   * This method is used to label the box of a node and is
   * directly called after creating the box. 
   */
  drawNodeTextLabels() {
    this.get('nodeTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if (!this.get('canvasList')[textObj.text]) {
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.text] = canvas;
      }

      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;

      let size = new THREE.Vector3();
      bbox.getSize(size);

      // Calculate aspect ratio and next power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(size.x * 40) / Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(size.y * 80) / Math.log(2)));

      // Adapt canvas to size of box
      this.get('canvasList')[textObj.text].width = nextPowerOf2X;
      this.get('canvasList')[textObj.text].height = nextPowerOf2Y;

      // Get entity color
      let color = textObj.boxColor;
      let canvas = this.get('canvasList')[textObj.text];
      let ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title for nodes
      ctx.font = '25px arial';
      ctx.fillStyle = textObj.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(textObj.text, canvas.width / 2, canvas.height * 0.9, canvas.width * 0.9);


      // Create texture out of canvas
      let texture = new THREE.CanvasTexture(canvas);
      // Map texture
      let canvasMaterial = new THREE.MeshLambertMaterial({ map: texture });

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    

      // Use old material
      let oldMaterial = new THREE.MeshLambertMaterial({
        color
      });

      // Define each side of the box
      let materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial  // Buttom
      ];

      // Delete old material and texture
      this.deleteMaterial(textObj.parent);

      // Set new material
      textObj.parent.material = materials;
    });
  },

  /*
   * This method is used to label the box of an application and is
   * directly called after creating the box. 
   */
  drawAppTextLabels() {
    this.get('appTextCache').forEach((textObj) => {

      // Create one canvas for each entity
      if (!this.get('canvasList')[textObj.text]) {
        let canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 32;
        this.get('canvasList')[textObj.text] = canvas;
      }
      textObj.parent.geometry.computeBoundingBox();
      let bbox = textObj.parent.geometry.boundingBox;

      let size = new THREE.Vector3();
      bbox.getSize(size);

      // Calculate aspect ratio and next power of 2 
      let nextPowerOf2X = Math.pow(2, Math.ceil(Math.log(size.x * 75) / Math.log(2)));
      let nextPowerOf2Y = Math.pow(2, Math.ceil(Math.log(size.y * 90) / Math.log(2)));

      // Adapt canvas to size of box
      this.get('canvasList')[textObj.text].width = nextPowerOf2X;
      this.get('canvasList')[textObj.text].height = nextPowerOf2Y;

      // Get entity color and material
      let color = textObj.boxColor;
      let canvas = this.get('canvasList')[textObj.text];
      let ctx = canvas.getContext('2d');

      // Draw old box color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title for nodes
      ctx.font = '30px arial';
      ctx.fillStyle = textObj.color;
      ctx.textAlign = "center";
      // save some space for images (canvas.width/2-6)
      ctx.fillText(textObj.text, canvas.width / 2 * 0.8, canvas.height / 2, canvas.width * 0.5);


      // Create texture out of canvas
      let texture = new THREE.CanvasTexture(canvas);
      // Map texture
      let canvasMaterial = new THREE.MeshLambertMaterial({ map: texture });

      // Update texture      
      texture.needsUpdate = true;
      // Update mesh material    

      // Use old material
      let oldMaterial = new THREE.MeshLambertMaterial({
        color
      });

      // Define each side of the box
      let materials = [oldMaterial, // Right side
        oldMaterial, // Left side
        oldMaterial, // Back   
        oldMaterial, // Front
        canvasMaterial, // Top
        oldMaterial  // Buttom
      ];

      // Delete old material and texture
      this.deleteMaterial(textObj.parent);

      // Set new material
      textObj.parent.material = materials;
    });
  },

});
