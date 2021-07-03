import './style.css'
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const GLTFloader = new GLTFLoader();

const addFoxModel = ( function (x = 0, z = 0){
    GLTFloader.load( '/models/azeria/scene.gltf', function ( model ) {
        model.scene.scale.set(0.01, 0.01, 0.01);
        model.scene.rotation.y = Math.PI * 0.5 * -1
        model.scene.position.x = x
        model.scene.position.z = z

        model.castShadow = true; //default is false
        model.receiveShadow = false; //default

        scene.add(model.scene)
    }, undefined, function ( error ) {
        console.error( error );
    } )
} );
addFoxModel(0, 0)
/**
 * Objects
 */
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcacaca })

const planeGeometry = new  THREE.PlaneGeometry(7,7,5)
const plane = new THREE.Mesh(planeGeometry, planeMaterial)


plane.rotation.x = Math.PI * 0.5 * -1;

scene.add(plane)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight)
/**
 * Sizes
 */
const sizes = {
    width: 1920,
    height: 937
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


// controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.enableZoom = true

canvas.addEventListener('mousemove', (event) => {
    const xPos = event.clientX;
    const yPos = event.clientY;

    const foxModel = scene.children[3];
    foxModel.position.x =  -xPos
    // console.log('xPos', xPos, 'yPos', yPos)
})


function animate() {

    requestAnimationFrame( animate );

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render( scene, camera );

}

animate()