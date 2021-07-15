import './style.css'
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


import * as dat from 'dat.gui';

const gui = new dat.GUI();
// global variables
let mixer = null;
let action = null;
let modelAnimations = null;
let modelAnimationID = null;

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Model
 */
const GLTFloader = new GLTFLoader();

const addFoxModel = ( function (x = 0, z = 0){
    GLTFloader.load( '/models/azeria/scene.gltf', function ( model ) {
        model.scene.scale.set(0.01, 0.01, 0.01);
        model.scene.rotation.y = Math.PI * 0.5 * -1
        model.scene.position.x = x
        model.scene.position.z = z

        // console.log('model.castShadow', model.scene.receiveShadow)
        // model.scene.castShadow = true; //default is false
        // model.scene.receiveShadow = false; //default

        model.scene.traverse( function( node ) {
            if ( node.isMesh || node.isLight ) node.castShadow = true;
            if ( node.isMesh || node.isLight ) node.receiveShadow = false;
        } );

        mixer = new THREE.AnimationMixer(model.scene);
        // model.animations.forEach((clip) => {mixer.clipAction(clip).play(); });

        // mixer.update( delta )
        modelAnimations = model.animations
        modelAnimationID = 0
        action = mixer.clipAction( modelAnimations[ modelAnimationID ] );
        action.setEffectiveTimeScale(0.3)
        action.play();

        scene.add(model.scene)
    }, undefined, function ( error ) {
        console.error( error );
    } )
} );
addFoxModel(0.5, 0)
/**
 * Objects
 */
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcacaca })

const planeGeometry = new  THREE.PlaneGeometry(7,7,5)
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.receiveShadow = true;

plane.rotation.x = Math.PI * 0.5 * -1;

scene.add(plane)

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );

directionalLight.castShadow = true; // default false
directionalLight.shadow.mapSize.width = 512 * 3
directionalLight.shadow.mapSize.height = 512 * 3

scene.add(directionalLight);

const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
// scene.add( helper );

gui.add(directionalLight.position,'x').min(-5).max(5).step(0.05).name('directional x')
gui.add(directionalLight.position,'y').min(0).max(5).step(0.05).name('directional y')
gui.add(directionalLight.position,'z').min(-5).max(5).step(0.05).name('directional z')

// const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 5 );
// scene.add( directionalLightHelper );
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.x = -5
camera.position.y = 5

scene.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.gammaOutput = true;

// controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.enableZoom = true

canvas.addEventListener('mousemove', (event) => {
    const xPos = event.clientX;
    const yPos = event.clientY;

    const foxModel = scene.children[scene.children.length-1];

    const scale = 0.008;
    const foxPositionZ = ((xPos * scale) - sizes.width / 2  * scale)
    const foxPositionX =  ((yPos * scale) - sizes.height / 2  * scale) * -1

    const inActivePositionCenter = 0.5
    const inActivePositionBorder = 2.5

    if (
        (
            foxPositionX >= inActivePositionCenter ||
            foxPositionX <= -inActivePositionCenter ||
            foxPositionZ >= inActivePositionCenter ||
            foxPositionZ <= -inActivePositionCenter
        )
            &&
        (
            foxPositionX <= inActivePositionBorder &&
            foxPositionX >= -inActivePositionBorder &&
            foxPositionZ <= inActivePositionBorder &&
            foxPositionZ >= -inActivePositionBorder
        )
    ) {
        foxModel.position.x = foxPositionX
        foxModel.position.z = foxPositionZ

        if (modelAnimationID === 0) {
            action.stop();
            modelAnimationID = 1
            action = mixer.clipAction( modelAnimations[ modelAnimationID ] );
            action.play();
        }
    } else {
        if (modelAnimationID === 1) {
            action.stop();
            modelAnimationID = 0
            action = mixer.clipAction( modelAnimations[ modelAnimationID ] );
            action.play();
        }
    }

    foxModel.lookAt(0,0)
})

const clock = new THREE.Clock()

function animate() {
    const elapsedTime = clock.getElapsedTime()

    requestAnimationFrame( animate );


    // const delta = clock.getDelta();

    if ( mixer ) mixer.update( 0.01 );

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();


    renderer.render( scene, camera );

}

animate()

