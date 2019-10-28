"use strict";

// Initialize webGL Renderer
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setClearColor('rgb(255, 255, 255)');

// Create scene & camera
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper());
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 10;
camera.position.z = 30;
camera.lookAt(scene.position);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x909090);
scene.add(ambientLight);
const light = new THREE.DirectionalLight(0x444444);
light.position.set( 1.5,1,1 );
scene.add(light);

// Create field
const fieldWidth = 20;
const fieldHeight = 40;
const fieldColor = 'rgb(0, 255, 0)';
const fieldGeometry = new THREE.PlaneBufferGeometry(fieldWidth, fieldHeight);
const fieldMaterial = new THREE.MeshPhongMaterial({color: fieldColor, side: THREE.DoubleSide});
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.rotateX(Math.PI / 2);
    // TODO: Add white line
scene.add(field);

// TODO: Create cushions
    // TODO: Position cushions

// TODO: Create ball
    // TODO: Position ball
    // TODO: Initilize ball velocity

// TODO: Add player mode flag

// Render loop
const controls = new THREE.TrackballControls(camera, canvas);
function render(){
    requestAnimationFrame(render);

    controls.update();
    renderer.render(scene, camera);
}

render();
