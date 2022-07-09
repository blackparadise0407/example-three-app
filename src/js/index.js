import {
  AmbientLight,
  AnimationMixer,
  AxesHelper,
  BoxGeometry,
  Clock,
  Color,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  SpotLight,
  SpotLightHelper,
  sRGBEncoding,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import truck from "../models/truck.fbx";
import ground from "../textures/ground.jpg";
import "../css/index.css";

const isDev = process.env.NODE_ENV === "development";

const scene = new Scene();
scene.background = new Color(0xaeaeae);
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
  scene.add(new AxesHelper(5), new GridHelper(10, 50));
}

// Add ground plane
function addGround() {
  const texture = new TextureLoader().load(ground);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 10);
  texture.anisotropy = 16;
  texture.encoding = sRGBEncoding;
  const material = new MeshStandardMaterial({ map: texture });
  const mesh = new Mesh(new BoxGeometry(10, 0.1, 10), material);
  mesh.receiveShadow = true;
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
  const distance = 20.0;
  const angle = Math.PI / 6.0;
  const penumbra = 0.5;
  const decay = 1;
  const light = new SpotLight(0xffffff, 2, distance, angle, penumbra, decay);
  light.target.position.set(-1, 0, 0);
  light.position.set(5, 10, -5);

  light.castShadow = true;

  const helper = new SpotLightHelper(light);

  scene.add(light);
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
