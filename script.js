import * as CreateParts from './module/CreateParts.js';
import { EventArea } from './module/EVArea.js';
import *as Unit from './module/Unit.js';
const settings = {
    fov: 45,
    directionalLight: {
        color: 0xd1d1d1,
    }
}
const Parts = {
    fullscreenLoader: (text) => {
        const innerHTML = new CreateParts.multiple({
            tagName: 'div',
            quantity: 2,
        })
        innerHTML.section[0].innerText = 'Loading...';
        innerHTML.section[1].innerText = text;
        const displayloader = new CreateParts.fullscreenLoader({
            child: {
                className: ['centering'],
                child: {
                    className: ['title', 'white',]
                }
            },
            className: 'bac-black',
            innerHTML: innerHTML.body
        }).body
        return displayloader;
    }
}
class SkyBox extends THREE.Mesh {
    constructor(urls) {
        if (!Array.isArray(urls)) { return }
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const textureCube = cubeTextureLoader.load(urls);
        const shader = THREE.ShaderLib['cube'];
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
    scene.fog = new THREE.FogExp2(0xFFFFFF, 0.001);
    const camera = new THREE.PerspectiveCamera(settings.fov);
    camera.position.set(0, 0, +1000);
    window.addEventListener('resize', resizeWindow);
    resizeWindow();
    const controls = new THREE.OrbitControls(camera, document.body);
    // 滑らかにカメラコントローラーを制御する
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    addModel();
    //addPlane()
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
    async function loadGLTF_withDisplay_Async({ src, func, text }) {
        if (!(src.endsWith('gltf')) && !(src.endsWith('glb'))) { return }
        const loderElement = Parts.fullscreenLoader(text)
        document.body.appendChild(loderElement)
        const loader = new THREE.GLTFLoader();
        const objects = await loader.loadAsync(src, func);
        document.body.removeChild(loderElement)
        return objects.scene;
    }
    async function addModel() {
        const course = await loadGLTF_withDisplay_Async({ src: './models/course_b.glb', text: '©WEBアプリ制作班' });
        course.scale.set(30, 30, 30);
        scene.add(course);
        const buggy = await loadGLTF_withDisplay_Async({ src: './models/buggy.glb', text: '©WEBアプリ制作班' });
        buggy.position.set(-200, 7, -20);
        buggy.scale.set(5, 5, 5);
        scene.add(buggy);


    }
    function addLight() {
        // 平行光源
        const directionalLight = new THREE.DirectionalLight(settings.directionalLight.color, 2.0);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        const AmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        scene.add(AmbientLight);
    }
    function addSkyBox() {
        const path = 'img/FluffballDay2/FluffballDay'
        const urls = [
            path + 'Left.jpg', //左
            path + 'Right.jpg', //右
            path + 'Top.jpg', //上
            path + 'Bottom.jpg', //下
            path + 'Front.jpg', //前
            path + 'Back.jpg'  //後
        ]
        const sky = new SkyBox(urls)
        sky.scale.set(50, 50, 50);
        scene.add(sky);
    }
    function addPlane() {
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(3000, 3000, 1, 1),
            new THREE.MeshLambertMaterial({
                color: 0xFFDE9E
            }));

        //シーンオブジェクトに追加
        plane.rotation.x = (new Unit.Angle(270).toRadian().degree);
        plane.position.set(0, -5, 0);
        scene.add(plane);

    }
}

