import {
  AmbientLight,
  AnimationMixer,
  AxesHelper,
  Clock,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  WebGLRenderer,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import truck from "../models/truck.fbx";
import "../css/index.css";

const isDev = process.env.NODE_ENV === "development";

const scene = new Scene();
scene.background = new Color(0xfad6a5);
scene.receiveShadow = true;
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const loader = new FBXLoader();

const renderer = new WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = -10;
camera.position.y = 5;

if (process.env.NODE_ENV === "development") {
  scene.add(new AxesHelper(5), new GridHelper(100, 100));
}

function addGround() {
  const geo = new PlaneBufferGeometry(1000, 1000);
  const mat = new MeshStandardMaterial({
    color: 0xfaf2e7,
  });
  const mesh = new Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.position.set(0, 0, 0);
  mesh.rotation.set(Math.PI / -2, 0, 0);
  scene.add(mesh);
}
addGround();

let mixer;
let modelReady = false;
// Load 3d model
loader.load(
  truck,
  function (fbx) {
    fbx.scale.setScalar(0.01);
    fbx.traverse((c) => {
      c.castShadow = true;
    });
    fbx.position.y += 0.4;
    mixer = new AnimationMixer(fbx);
    mixer.clipAction(fbx.animations[0]).play();
    scene.add(fbx);
    modelReady = true;
  },
  function (event) {
    console.log((event.loaded / event.total) * 100 + "% loaded");
  },
  function (error) {
    console.error(error);
  }
);

function addLight() {
  const sun = new DirectionalLight(0xffffcc);
  sun.position.set(4, 5, 4);
  sun.castShadow = true;
  scene.add(sun);

  const helper = new DirectionalLightHelper(sun);

  isDev && scene.add(helper);
}
addLight();

function addAmbientLight() {
  const light = new AmbientLight(0xebcb8b, 0.3);
  scene.add(light);
}
addAmbientLight();

// Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.autoRotate = true;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2;

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const clock = new Clock();

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (modelReady) mixer.update(clock.getDelta());

  render();
}
animate();

function render() {
  renderer.render(scene, camera);
}
