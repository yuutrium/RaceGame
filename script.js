import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CreateParts from './module/CreateParts.js';
import { EventArea } from './module/EVArea.js';
import *as Unit from './module/Unit.js';
const settings = {
    fov: 45,
    directionalLight: {
        color: 0xFFFFFF,
    }
}
const Parts={
    fullscreenLoader:(text)=>{
        const innerHTML=new CreateParts.multiple({
            tagName:'div',
            quantity:2,
        })
        innerHTML.section[0].innerText='Loading...';
        innerHTML.section[1].innerText=text;
        const displayloader=new CreateParts.fullscreenLoader({
            child:{
                className:['centering'],
                child:{
                    className:['title','white',]
                }
            },
            className:'bac-black',
            innerHTML:innerHTML.body
        }).body
        return displayloader;
    }
}
class SkyBox extends THREE.Mesh{
    constructor(urls){
        if(!Array.isArray(urls)){return}
        const  cubeTextureLoader = new THREE.CubeTextureLoader();
        const  textureCube = cubeTextureLoader.load(urls);
        const  shader = THREE.ShaderLib['cube'];
        shader.uniforms['tCube'].value = textureCube;
        const material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
          });
          super(new THREE.BoxGeometry(100, 100, 100), material)
    }
}
window.addEventListener('load', () => {
    document.getElementById('windowStatus').style.display = 'none'
})
console.time('load')
// ページの読み込みを待つ
window.addEventListener('DOMContentLoaded', init);
async function init() {
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas'),
        // 物体の輪郭がガクガクするのを抑える
        antialias: true
    });
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x252c32, 0.002 );
    const camera = new THREE.PerspectiveCamera(settings.fov);
    camera.position.set(0, 0, +1000);
    window.addEventListener('resize', resizeWindow);
    resizeWindow();
    const controls = new OrbitControls(camera, document.body);
    // 滑らかにカメラコントローラーを制御する
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    addModel();
    addLight();
    addSkyBox();
    console.timeEnd('load');
    tick();

    function tick() {
        controls.update();
        renderer.render(scene, camera); // レンダリング
        requestAnimationFrame(tick);
    }
    function resizeWindow(e) {
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    async function loadGLTF_withDisplay_Async({src, func,text}) {
        if (!(src.endsWith('gltf')) && !(src.endsWith('glb'))) { return }
        const loderElement=Parts.fullscreenLoader(text)
        document.body.appendChild(loderElement)
        const loader = new GLTFLoader();
        const objects = await loader.loadAsync(src, func);
        document.body.removeChild(loderElement)
        return objects.scene;
    }
    async function addModel(){
        const course = await loadGLTF_withDisplay_Async({src:'./models/course.gltf',text:'©WEBアプリ制作班'});
        course.scale.set(30, 30, 30);
        scene.add(course);
    }
    function addLight(){
    // 平行光源
    const directionalLight = new THREE.DirectionalLight(settings.directionalLight.color);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    }
    function addSkyBox(){
        const path='img/MegaSun'
        const urls=[
            path + 'Left.jpg', //左
            path + 'Right.jpg', //右
            path + 'Top.jpg', //上
            path + 'Bottom.jpg', //下
            path + 'Front.jpg', //前
            path + 'Back.jpg'  //後
        ]
        const sky=new SkyBox(urls)
        sky.scale.set(50, 50, 50);
        scene.add(sky);
    }
}

