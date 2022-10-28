import './style.css'

import * as THREE from 'three';
// import * as dat from './libs/dat.gui.min.js';
import OrbitControls from './libs/orbitcontrols';

//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import Engine from './libs/engine';
import audio from './libs/audio';
import { Texture } from '../gobelins-threejs-master-perso/__common/libs/three.module';

import fragmentShader from './basic.frag';
import vertexShader from './basic.vert';



let scene = null
let camera = null

let gui = null
let fSettings = null

let time = 0

let material = null
let mesh = null

const engine = new Engine()


// SETUP
function setup() {
	// setup la scene
	scene = new THREE.Scene()
	
	// setup la camera
	camera = new THREE.PerspectiveCamera( 50, engine.width / engine.height, .1, 5000 )
	camera.position.x = 0
    camera.position.y = 3
	camera.position.z = 20
	camera.zoom 
	camera.lookAt(0, 0, 0)

	new OrbitControls( camera, engine.renderer.domElement )
}




// GUI
function createGUI () {
	gui = new dat.GUI()
	
	fSettings = gui.addFolder( 'Settings' )
	//fSettings.open()

	const animationsFolder = gui.addFolder('Animations')
	animationsFolder.open()
}


let lightLeft = null
let lightRight = null
let strobGroup = null

let lightFront = null
let lightDown = null


function setupScene() {
    // AMBIANT LIGHT
	const ambient = new THREE.AmbientLight( 0x202020, 2 )
	scene.add( ambient )

    // // LIGHT BEHIND
	// const lightBehind = new THREE.PointLight( 0x0000ff, .2 )
	// lightBehind.position.x = 5
	// lightBehind.position.y = 5
	// lightBehind.position.z = -5
	// scene.add( lightBehind )
	// scene.add( new THREE.PointLightHelper( lightBehind, .2 ) )

    // LIGHT_FRONT
	lightFront = new THREE.PointLight( 0xa7bec7, 0.2 )
	lightFront.position.x = 0
	lightFront.position.y = 40
	lightFront.position.z = 15
	scene.add( lightFront )
	// scene.add( new THREE.PointLightHelper( lightFront, 2 ) )


	// light down
	lightDown = new THREE.PointLight( 0xa7bec7, 0. )
	lightDown.position.x = 0
	lightDown.position.y = -20
	lightDown.position.z = 0
	scene.add( lightDown )
	// scene.add( new THREE.PointLightHelper( lightDown, 2 ) )
	lightDown.lookAt(0,0,0)


	strobGroup = new THREE.Group()
	scene.add(strobGroup)

	// LIGHT_LEFT
	lightLeft = new THREE.SpotLight( 0x500505, 0.2 )
	lightLeft.position.x = -10
	lightLeft.position.y = 10
	lightLeft.position.z = 20
	lightLeft.angle = Math.PI/4
	lightLeft.distance = 50
	strobGroup.add( lightLeft )
	// scene.add( new THREE.SpotLightHelper( lightLeft, 5 ) )

	// LIGHT_RIGHT
	lightRight = new THREE.SpotLight( 0x175a75, 0.2 )
	lightRight.position.x = 10
	lightRight.position.y = 10
	lightRight.position.z = 20
	lightRight.angle = Math.PI/4
	lightRight.distance = 50
	strobGroup.add( lightRight )
	// scene.add( new THREE.SpotLightHelper( lightRight, 5 ) )


	// const axesHelper = new THREE.AxesHelper( 5 );
	// scene.add( axesHelper );

}




function onBeat() {
	//console.log('beat');
	danceToMusic()
	alternateStrob()
	//setRandomCam()
}

audio.start({
	live : false,
	analyse : true,
 	shutup : false,
	src : './public/epilogue.mp3',
	onBeat : onBeat
})





// STROB

let lastStrobR = true;

function strobL() {

	lightLeft.intensity = 3.;
	//console.log('left strob')

	const fadeStrob = setInterval(decStrob, 10);

	function decStrob() {
 	 if (lightLeft.intensity > 0) {
		lightLeft.intensity -= 0.1;
	 }
	}

	function stopFunction() {
  	clearInterval(fadeStrob);
	}
}


function strobR() {

	lightRight.intensity = 3.;
	//console.log('right strob')

	const fadeStrob = setInterval(decStrob, 10);

	function decStrob() {
 	 if (lightRight.intensity > 0) {
		lightRight.intensity -= 0.1;
	 }
	}

	function stopFunction() {
  	clearInterval(fadeStrob);
	}
}


function alternateStrob() {
	if (lastStrobR === false) { strobR() } else { strobL() }
	lastStrobR = !lastStrobR;
}




function strobFront() {

		lightFront.intensity = 1.2;
		//console.log('front strob')
	
		const fadeStrob = setInterval(decStrob, 10);
	
		function decStrob() {
		  if (lightFront.intensity > 0.) {
			lightFront.intensity -= 0.1;
		 }
		}
	
		function stopFunction() {
		  clearInterval(fadeStrob);
		}
}


function strobDown() {

	lightDown.intensity = 0.8;
	//console.log('front strob')

	const fadeStrob = setInterval(decStrob, 10);

	function decStrob() {
	  if (lightDown.intensity > 0.) {
		lightDown.intensity -= 0.1;
	 }
	}

	function stopFunction() {
	  clearInterval(fadeStrob);
	}
}


function checkStrob() {
if (audio.values[6] >= 0.4) {
	strobFront()
	}
}

function checkStrobDown() {
	if (audio.values[4] >= 0.6) {
		strobDown()
	}
	}




// // LOADER FBX BASIQUE
// const discoBoy = new FBXLoader()
// discoBoy.load(
//     './public/fighter.fbx',
//     (object) => {
// 		object.scale.set(.05, .05, .05)
// 		object.position.set(0, -5, 0)
//         scene.add(object)
//     },
//     (xhr) => {
//         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//     },
//     (error) => {
//         console.log(error)
//     }
// )





// LOADER FBX + ANIMATION
let mixer = THREE.AnimationMixer
   // let modelReady = false
    const animationActions = THREE.AnimationAction
    let activeAction = THREE.AnimationAction
    let lastAction = THREE.AnimationAction
    const fbxLoader = new FBXLoader()


let allActions = {}
//window.__allActions = allActions


let loadcount = 0


fbxLoader.load(
		'./public/dummy-tpose.fbx',
        (object) => {
            object.scale.set(0.05, 0.05, 0.05)
			object.position.set(0, -5, 0)
            mixer = new THREE.AnimationMixer(object)

            scene.add(object) 

			const animations = object.animations;
			mixer = new THREE.AnimationMixer( object );
			let actionDefault = mixer.clipAction( animations[0] )
			//actionDefault.play()

			allActions.default = actionDefault
			//allActions.default.play()

    
            // ajouter animations
            fbxLoader.load(
                './public/dummy-idle-neutral-noskin.fbx',
                (object) => {
					const actionIdle = mixer.clipAction( object.animations[0] )
					allActions.idle = actionIdle
					allActions.idle.play()
					loadcount = loadcount +1
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            )

			fbxLoader.load(
                './public/dummy-hiphop-noskin.fbx',
                (object) => {
					const actionHiphop = mixer.clipAction( object.animations[0] )
					allActions.hiphop = actionHiphop
					loadcount = loadcount +1

                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            )

			fbxLoader.load(
                './public/dummy-dance-noskin.fbx',
                (object) => {
					const actionDance = mixer.clipAction( object.animations[0] )
					allActions.dance = actionDance
					loadcount = loadcount +1
					// if (loadcount >= 3) {
					// 	console.log('loading choregraphy')
					// 	choregraphy()
					//  }
					
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            )


        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        }

    )


// function letsChill() {
// 	allActions.default.stop()
// 	allActions.idle.play()
// }

// function letsDance() {
// 	allActions.idle.stop()
// 	allActions.hiphop.play()
// 	allActions.idle.crossFadeTo(allActions.dance, 5)
// }


// function letsBreak() {
// 	allActions.idle.play()
// 	allActions.idle.stop()
// }

// function letsBuildup() {
// 	allActions.dance.play()
// }

// function letsDrop() {
// 	allActions.idle.stop()
// }



// function choregraphy() {
// 	setTimeout(letsChill, 3.3*1000)
// 	setTimeout(letsDance, 30*1000)
// 	setTimeout(letsBreak, 60*1000)
// 	setTimeout(letsBuildup, 67*1000)
// 	setTimeout(letsDrop, 74*1000)
// }



	// // PLAY ANIMATIONS :
	// allActions.idle.play()
	// allActions.hiphop.play()
	//  allActions.dance.play()





const animations = {
    default: function () {
        setAction(animationActions[0])
    },
    idle: function () {
        setAction(animationActions[1])
    },
	hiphop: function () {
        setAction(animationActions[3])
    },
    dance: function () {
        setAction(animationActions[4])
    },
}




const setAction = () => {

	let toAction = new THREE.AnimationAction

    if (toAction != activeAction) {
        lastAction = activeAction
        activeAction = toAction
        //lastAction.stop()
        lastAction.fadeOut(3)
        activeAction.reset()
        activeAction.fadeIn(3)
        activeAction.play()
    }
}





let newVol = 0

function updateVol() {
	let integerVolume = Math.trunc(audio.volume)
		if (newVol != integerVolume) {
			newVol = integerVolume
		} 
}


// function danceToMusic() {
// 	let currentAnim = 0
// 	if (newVol < 3 && currentAnim != 1) {
// 		allActions.idle.play()
// 		currentAnim = 1
// 		console.log('idle');
// 	}
// 	else if (newVol < 4 && currentAnim != 2) {
// 		allActions.hiphop.play()
// 		currentAnim = 2
// 		console.log('hiphop');
// 	}
// 	else if (newVol > 1 && currentAnim != 3) {
// 		allActions.dance.play()
// 		currentAnim = 3
// 		console.log('dancing');
// 	}
// }


function danceToMusic() {
	let currentAnim = 0
	if (audio.values[5] >= 0.7 && currentAnim != 3) {
		allActions.dance.play()
		allActions.idle.stop()
		// camera.position.x = -3 + audio.values[3] * 2
		// camera.position.z = 20 + audio.values[3] * 2
		// allActions.dance.play()
		//allActions.default.crossFadeTo(allActions.idle, 5)
		currentAnim = 3
		//console.log('dance');
	}
	else if (audio.values[5] >= 0.3 && currentAnim != 2) {
		//allActions.idle.crossFadeTo(allActions.hiphop, 5)
		allActions.hiphop.play()
		allActions.idle.play()
		// camera.position.x = -3
		// camera.position.z = 20 - audio.values[4] * 2
		currentAnim = 2
		//console.log('hiphop');
	}
	else if (audio.values[5] >= 0.1 && currentAnim != 1) {
		//allActions.hiphop.crossFadeTo(allActions.dance, 3)
		allActions.idle.play()
		allActions.dance.stop()
		allActions.hiphop.stop()
		camera.position.x = 0
		camera.position.z = 20

		currentAnim = 1
		//console.log('idle');

	}
}



function movingCam() {
	if (audio.volume > 3) {
		var x = camera.position.x;
		var z = camera.position.z;
	
		camera.position.x = x * Math.cos(-0.001) + z * Math.sin(-0.001);
		camera.position.z = z * Math.cos(-0.001) - x * Math.sin(-0.001);
		camera.lookAt(0,0,0)
	}
}



let floorDepth = null
let customMaterial = null

function danceFloor() {
	let long = 30
	let larg = 80
	let largRes = 200
	let longRes = 200
	const geometry = new THREE.PlaneGeometry(larg, long, largRes, longRes)
	customMaterial = new THREE.RawShaderMaterial ({
		uniforms :{
			uTime : {value:time},
			uStrength : {value:5},
			uScale : {value:10},
			depthNoise : {value: 1},
		},
	vertexShader: vertexShader, 
	fragmentShader : fragmentShader,
	transparent : true,
	depthWrite : false,
	})

	mesh = new THREE.Mesh( geometry, customMaterial )
	mesh.rotation.x = -Math.PI / 2
	mesh.position.y = -5
	scene.add( mesh )
}



function backgroundwall() {
	let larg = 80
	let hauteur = 30
	const geometry = new THREE.PlaneGeometry( larg, hauteur )
	const material = new THREE.MeshPhongMaterial( {
	color: 0x000000,
	shininess: 100,
	specular: 0x7f8082,
} )

const wall = new THREE.Mesh( geometry, material )
scene.add( wall )

wall.position.x = 0
wall.position.y = 5
wall.position.z = -15

}



function bouleDisco() {
	let res = 18
	const geometry = new THREE.SphereGeometry(1.7, res, res)
	const texture = new THREE.TextureLoader().load( './public/disco.jpeg' );
	const material = new THREE.MeshPhongMaterial({
		shininess: 100,
		color: 0xffffff,
		specular: 0x7f8082,
		map : texture,
		flatShading : true,
	  })

	mesh = new THREE.Mesh( geometry, material )
	mesh.position.x = 0
	mesh.position.y = 8
	mesh.position.z = 0
	scene.add( mesh )

}



const clock = new THREE.Clock()


function render() {
	audio.update()
	audio.volume
	audio.values

	time += 0.01

	strobGroup.rotation.y += 0.01 * audio.volume

	mesh.rotation.y += audio.volume / 500

	checkStrob()
	checkStrobDown()

	
	movingCam()


	//danceToMusic()

	updateVol()

	floorDepth = audio.values[6] * 6

	customMaterial.uniforms.uTime.value = time * 2.
	customMaterial.uniforms.depthNoise.value = floorDepth


	if( mixer && mixer.update )
		mixer.update(clock.getDelta())

	// Render la scene
	engine.renderer.render( scene, camera )
}



// FRAME LOOP
function onFrame() {
	requestAnimationFrame( onFrame )
	render()
}




setup()
//createGUI()
setupScene()
danceFloor()
bouleDisco()
//backgroundwall()
onFrame()