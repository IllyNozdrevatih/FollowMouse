import './style.css'
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


import * as dat from 'dat.gui';

const gui = new dat.GUI();

class BaseModel {
    constructor( name ) {
        this.name = name
        this.scene = null
        this.mixer = null
        this.action = null
        this.modelAnimations = null
        this.modelAnimationID = null
    }
}
// global variables
const foxModel = new BaseModel('Fox_Scene');
const chickenModel = new BaseModel('Chicken_Scene');
// keys
const keyNumberLeft = 37
const keyNumberTop = 38
const keyNumberRight = 39
const keyNumberDown = 40
// rotationValues
const rotation = {
    top: Math.PI * 0.5,
    right: Math.PI * 2,
    bottom: Math.PI * 1.5,
    left: Math.PI,
}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
const GLTFloader = new GLTFLoader();

/**
 * Fox Model
 */
const addFoxModel = ( function (x = 0, z = 0){
    GLTFloader.load( '/models/azeria/scene.gltf', function ( model ) {
        model.scene.scale.set(0.01, 0.01, 0.01);
        model.scene.rotation.y = Math.PI
        model.scene.position.x = x
        model.scene.position.z = z


        model.scene.traverse( function( node ) {
            if ( node.isMesh || node.isLight ) node.castShadow = true;
            if ( node.isMesh || node.isLight ) node.receiveShadow = false;
        } );

        foxModel.mixer = new THREE.AnimationMixer(model.scene);
        foxModel.modelAnimations = model.animations
        foxModel.modelAnimationID = 0

        foxModel.action = foxModel.mixer.clipAction( foxModel.modelAnimations[ foxModel.modelAnimationID ] );
        foxModel.action.setEffectiveTimeScale(0.3)
        foxModel.action.play();

        scene.add(model.scene)
    }, undefined, function ( error ) {
        console.error( error );
    } )
} );
addFoxModel(0.5, 0)


/**
 * Chicken Model
 */
const addChickenModel = ( function (x = 0, z = 0){
    GLTFloader.load( '/models/chicken/scene.gltf', function ( model ) {
        model.scene.scale.set(0.0008, 0.0008, 0.0008);
        model.scene.position.x = x
        model.scene.position.z = z

        model.scene.traverse( function( node ) {
            if ( node.isMesh || node.isLight ) node.castShadow = true;
            if ( node.isMesh || node.isLight ) node.receiveShadow = false;
        } );

        chickenModel.mixer = new THREE.AnimationMixer(model.scene);
        chickenModel.modelAnimationID = 6
        chickenModel.modelAnimations = model.animations
        chickenModel.action = chickenModel.mixer.clipAction( chickenModel.modelAnimations[ 6 ] );
        chickenModel.action.setEffectiveTimeScale(0.3)
        console.log('model.scene', model.scene)
        // action = mixer.clipAction( modelAnimations[ modelAnimationID ] );
        chickenModel.action.play();
        model.scene.rotation.y = Math.PI * 0.5

        scene.add(model.scene)
    }, undefined, function ( error ) {
        console.error( error );
    } )
} );
addChickenModel(0,-1)
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
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.gammaOutput = true;

// controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.enableZoom = true

// canvas.addEventListener('mousemove', (event) => {
//     const xPos = event.clientX;
//     const yPos = event.clientY;
//
//     const foxModel = scene.children[scene.children.length-1];
//
//     const scale = 0.008;
//     const foxPositionZ = ((xPos * scale) - sizes.width / 2  * scale)
//     const foxPositionX =  ((yPos * scale) - sizes.height / 2  * scale) * -1
//
//     const inActivePositionCenter = 0.5
//     const inActivePositionBorder = 2.5
//
//     if (
//         (
//             foxPositionX >= inActivePositionCenter ||
//             foxPositionX <= -inActivePositionCenter ||
//             foxPositionZ >= inActivePositionCenter ||
//             foxPositionZ <= -inActivePositionCenter
//         )
//             &&
//         (
//             foxPositionX <= inActivePositionBorder &&
//             foxPositionX >= -inActivePositionBorder &&
//             foxPositionZ <= inActivePositionBorder &&
//             foxPositionZ >= -inActivePositionBorder
//         )
//     ) {
//         foxModel.position.x = foxPositionX
//         foxModel.position.z = foxPositionZ
//
//         if (modelAnimationID === 0) {
//             action.stop();
//             modelAnimationID = 1
//             action = mixer.clipAction( modelAnimations[ modelAnimationID ] );
//             action.play();
//         }
//     } else {
//         if (modelAnimationID === 1) {
//             action.stop();
//             modelAnimationID = 0
//             action = mixer.clipAction( modelAnimations[ modelAnimationID ] );
//             action.play();
//         }
//     }
//
//     foxModel.lookAt(0,0)
// })


window.addEventListener('keydown', (event) => {
    const scalePosition = 0.05
    const keyCode = event.keyCode

    const inActivePositionBorder = 2.8

    const foxModelID = scene.children.findIndex(element => element.name === foxModel.name)
    foxModel.scene = scene.children[foxModelID];

    if (keyCode === keyNumberTop) {
        foxModel.scene.rotation.y = rotation.top
        if(inActivePositionBorder > foxModel.scene.position.x + scalePosition) {
            foxModel.scene.position.x += scalePosition
        }
    }
    if (keyCode === keyNumberDown) {
        foxModel.scene.rotation.y = rotation.bottom
        if(-inActivePositionBorder > foxModel.scene.position.x - scalePosition) {
            foxModel.scene.position.x += scalePosition
        }
        foxModel.scene.position.x -= scalePosition
    }
    if (keyCode === keyNumberLeft) {
        foxModel.scene.rotation.y = rotation.left
        if(-inActivePositionBorder < foxModel.scene.position.z - scalePosition) {
            foxModel.scene.position.z -= scalePosition
        }
    }
    if (keyCode === keyNumberRight) {
        foxModel.scene.rotation.y = rotation.right
        if(inActivePositionBorder > foxModel.scene.position.z + scalePosition) {
            foxModel.scene.position.z += scalePosition
        }
    }

    if (foxModel.modelAnimationID === 0){
        foxModel.action.stop();
        foxModel.modelAnimationID = 1
        foxModel.action = foxModel.mixer.clipAction( foxModel.modelAnimations[ foxModel.modelAnimationID ] );
        foxModel.action.play();
    }
})
window.addEventListener('keyup', (event) => {
    if (foxModel.modelAnimationID === 1){
        foxModel.action.stop();
        foxModel.modelAnimationID = 0
        foxModel.action = foxModel.mixer.clipAction( foxModel.modelAnimations[ foxModel.modelAnimationID ] );
        foxModel.action.play();
    }
})


const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame( animate );

    // const delta = clock.getDelta();

    if ( foxModel.mixer ) foxModel.mixer.update( 0.01 );

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
}

animate()

function moveChicken(){
    const elapsedTime = clock.getElapsedTime()
    const scalePosition = 0.001

    const chickenModelID = scene.children.findIndex(element => element.name === chickenModel.name)

    if (chickenModelID === -1) {
        renderer.render( scene, camera );
        requestAnimationFrame( moveChicken );
        return;
    }

    chickenModel.scene = scene.children[chickenModelID];

    const newPosition = Math.sin(elapsedTime)
    const polar = chickenModel.scene.position.x > newPosition

    chickenModel.action.play()

    if (polar === true) {
        // rotation top
        chickenModel.scene.rotation.y = Math.PI * 2
    } else {
        // rotation bottom
        chickenModel.scene.rotation.y = Math.PI
    }

    chickenModel.scene.position.x = Math.sin(elapsedTime)

    if ( chickenModel.mixer ) chickenModel.mixer.update( 0.015 );

    if ( !!foxModel.scene === false ) {
        renderer.render( scene, camera );
        requestAnimationFrame( moveChicken );
        return;
    }

    if (foxModel.scene.position.x - chickenModel.scene.position.x < 1) {
        // console.log('die')
    }

    renderer.render( scene, camera );
    requestAnimationFrame( moveChicken );
}

moveChicken()

// const modal = document.getElementById('modal')
// function hideModal() {
//     modal.style.opacity = 0;
// }
// hideModal()
// window.addEventListener('keydown', hideModal)