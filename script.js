const Unit = {
    Radian:
        class {
            constructor(degree) {
                (typeof (degree) === 'number') ? this.degree = degree : this.degree = NaN;
            }
            toAngle() {
                return new Unit.Angle(this.degree * (180 / Math.PI));
            }
        },
    Angle:
        class {
            constructor(degree) {
                (typeof (degree) === 'number') ? this.degree = degree : this.degree = NaN;
            }
            toRadian() {
                return new Unit.Radian(this.degree * Math.PI / 180)
            }
        }
}
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CreateParts from './module/CreateParts2.js';
import { EventArea } from './module/EVArea.js';
const setings = {
    fov: 45,
    AmbientLight: {
        color: 0xFFFFFF,
        float: 1.0
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
    const camera = new THREE.PerspectiveCamera(setings.fov);
    camera.position.set(0, 0, +1000);

    window.addEventListener('resize', resizeWindow);
    resizeWindow();

    // カメラコントローラーを作成
    const controls = new OrbitControls(camera, document.body);
    // 滑らかにカメラコントローラーを制御する
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    const course = await loadGLTF_Async('./models/course.gltf');

    scene.add(course);
    course.scale.set(30, 30, 30);
    // 平行光源
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(1, 1, 1);
    // シーンに追加
    scene.add(directionalLight);
    console.timeEnd('load');
    tick();

    // 毎フレーム時に実行されるループイベント
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
    async function loadGLTF_Async(src, func) {
        if (!(src.endsWith('gltf')) && !(src.endsWith('glb'))) { return }
        const innerHTML=new CreateParts.multiple({
            tagName:'div',
            quantity:2,
        })
        innerHTML.section[0].innerText='Loading...';
        innerHTML.section[1].innerText='©WEBアプリ制作班';
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

        document.body.appendChild(displayloader)
        const loader = new GLTFLoader();
        const objects = await loader.loadAsync(src, func);
        document.body.removeChild(displayloader)
        return objects.scene;
    }


}
