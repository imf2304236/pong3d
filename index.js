'use strict';

const singlePlayerMode = false;

// Initialize webGL Renderer
const canvas = document.getElementById('mycanvas');
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setClearColor('rgb(255, 255, 255)');

// Create scene & camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 20;
camera.position.z = 50;
camera.lookAt(scene.position);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x909090);
scene.add(ambientLight);
const light = new THREE.DirectionalLight(0x444444);
light.position.set(1.5, 1, 1);
scene.add(light);

// Create field
const fieldWidth = 30;
const fieldLength = 60;
const fieldColor = 'rgb(0, 255, 0)';
const fieldGeometry = new THREE.PlaneBufferGeometry(fieldWidth, fieldLength);
const fieldMaterial = new THREE.MeshPhongMaterial({
  color: fieldColor,
  side: THREE.DoubleSide,
});
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.rotateX(-Math.PI / 2);
scene.add(field);

// Add white line
const lineWidth = fieldWidth;
const lineLength = 1;
const lineColor = 'white';
const lineGeometry = new THREE.PlaneBufferGeometry(lineWidth, lineLength);
const lineMaterial = new THREE.MeshBasicMaterial({color: lineColor});
lineMaterial.depthTest = false; // removes artifacts
const line = new THREE.Mesh(lineGeometry, lineMaterial);
line.rotateX(-Math.PI / 2);
scene.add(line);

// Create cushions
const cushionWidth = 1;
const cushionHeight = 2;
const cushionLength = fieldLength;
const cushionColor = 'rgb(55, 255, 55)';
const cushionGeometry = new THREE.BoxBufferGeometry(
    cushionWidth, cushionHeight, cushionLength);
const cushionMaterial = new THREE.MeshPhongMaterial({color: cushionColor});
const cushions = [
  new THREE.Mesh(cushionGeometry, cushionMaterial),
  new THREE.Mesh(cushionGeometry, cushionMaterial),
];
cushions[0].position.x = -(fieldWidth / 2 + cushionWidth / 2);
cushions[1].position.x = fieldWidth / 2 + cushionWidth / 2;
cushions[0].position.y = cushionHeight / 2;
cushions[1].position.y = cushionHeight / 2;
scene.add(cushions[0]);
scene.add(cushions[1]);

// Create 1st player racket
const racketWidth = cushionWidth;
const racketLength = fieldWidth / 5;
const racketHeight = cushionHeight;
const racketColor1 = 'red';
const racketGeometry = new THREE.BoxBufferGeometry(
    racketWidth, racketHeight, racketLength);
const racketMaterial1 = new THREE.MeshPhongMaterial({color: racketColor1});
const racket1 = new THREE.Mesh(racketGeometry, racketMaterial1);
racket1.position.y = cushionHeight / 2;
racket1.position.z = fieldLength / 2 + racketWidth / 2;
racket1.rotateY(Math.PI / 2);
scene.add(racket1);

// Create back cushion (single player mode ONLY)
if (singlePlayerMode) {
  const backCushionGeometry = new THREE.BoxBufferGeometry(
      fieldWidth + 2 * cushionWidth, cushionHeight, cushionWidth,
  );
  const backCushionMaterial = new THREE.MeshPhongMaterial({
    color: cushionColor});
  const backCushion = new THREE.Mesh(backCushionGeometry, backCushionMaterial);
  backCushion.position.y = cushionHeight / 2;
  backCushion.position.z = -fieldLength / 2;
  scene.add(backCushion);
} else {
// Create 2nd player racket (double player mode ONLY)
  const racketColor2 = 'blue';
  const racketMaterial2 = new THREE.MeshPhongMaterial({color: racketColor2});
  const racket2 = new THREE.Mesh(racketGeometry, racketMaterial2);
  racket2.name = 'racket2';
  racket2.position.y = cushionHeight / 2;
  racket2.position.z = - (fieldLength / 2 + racketWidth / 2);
  racket2.rotateY(Math.PI / 2);
  scene.add(racket2);
}
const racket2 = scene.getObjectByName('racket2');

// Racket control
const racketEventHandler = function(event, racket, keyCodeLeft, keyCodeRight) {
  event.preventDefault();

  if (event.keyCode === keyCodeLeft &&
      racket.position.x - racketLength / 2 - 1 >= -fieldWidth / 2) {
    racket.position.x -= 2;
  }
  if (event.keyCode === keyCodeRight &&
      racket.position.x + racketLength / 2 + 1 <= fieldWidth / 2) {
    racket.position.x += 2;
  }
};
document.addEventListener('keydown',
    (event) => racketEventHandler(event, racket1, 37, 39));
if (!singlePlayerMode) {
  document.addEventListener('keydown',
      (event) => racketEventHandler(event, racket2, 65, 83));
}

// Create ball
const ballRadius = 1;
const ballWidthSegments = 32;
const ballHeightSegments = 32;
const ballColor = 'white';
const ballGeometry = new THREE.SphereBufferGeometry(
    ballRadius, ballWidthSegments, ballHeightSegments);
const ballMaterial = new THREE.MeshPhongMaterial({color: ballColor});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.y = ballRadius;
ball.position.x = Math.random() * (fieldWidth - ballRadius) - fieldWidth / 2;
scene.add(ball);

// Initialize ball velocity
const ballVelocity = new THREE.Vector3(
    Math.random() - 0.5, 0, Math.random() - 0.5);

// Render loop
const controls = new THREE.TrackballControls(camera, canvas);

/**
 * Renders frame
 */
function render() {
  requestAnimationFrame(render);

  // Specular cushion reflection
  if (Math.abs(ball.position.z) <= cushionLength/2) {
    if (ball.position.x + ballRadius > fieldWidth/2) {
      ballVelocity.x = -Math.abs(ballVelocity.x);
    }
    if (ball.position.x - ballRadius < -fieldWidth/2) {
      ballVelocity.x = Math.abs(ballVelocity.x);
    }
  }

  // Specular racket reflection
  if (ball.position.z + ballRadius > fieldLength/2) {
    if ((ball.position.x >= racket1.position.x - racketLength/2) &&
        (ball.position.x <= racket1.position.x + racketLength/2)) {
      ballVelocity.z = -Math.abs(ballVelocity.z);
    } else {
      ballVelocity.add(-ballVelocity);
    }
  }
  if (ball.position.z - ballRadius < -fieldLength/2) {
    if (singlePlayerMode) {
      ballVelocity.z = Math.abs(ballVelocity.z);
    } else {
      if ((ball.position.x >= racket2.position.x - racketLength/2) &&
          (ball.position.x <= racket2.position.x + racketLength/2)) {
        ballVelocity.z = Math.abs(ballVelocity.z);
      } else {
        ballVelocity.add(-ballVelocity);
      }
    }
  }

  ball.position.add(ballVelocity);
  controls.update();
  renderer.render(scene, camera);
}

render();
