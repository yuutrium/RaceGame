const Converter = {
    Radian:
        /** @param {number} degree ラジアン */
        class {
            constructor(degree) {
                if (typeof (degree) === 'number') {
                    this.degree = degree;
                }
                else {
                    console.error('引数のエラー');
                    this.degree = number
                }
            }
            /** @returns {number} 角度*/
            toAngle() {
                return this.degree * (180 / Math.PI);
            }
        },
    Angle:
        /** @param {number} degree 角度*/
        class {
            constructor(degree) {
                if (typeof (degree) === 'number') {
                    this.degree = degree;
                }
                else {
                    console.error('引数のエラー');
                    this.degree = NaN;
                }
            }
            /** @returns {number} ラジアン*/
            toRadian() {
                return this.degree * Math.PI / 180;
            }
        }
}
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {EventArea} from './module/EVArea.js';
const setings = {
    fov: 45,
    AmbientLight: {
        color: 0xFFFFFF,
        float: 1
    }

}
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
    const loadericon=document.getElementById('loader');
    loadericon.style.display='block';

    const course = await loadGLTF_Async('./models/course.gltf');
    //確認用
    await new Promise(resolve => setTimeout(resolve, 1000))
    loadericon.style.display='none';
    scene.add(course);
    course.scale.set(30, 30, 30);
    // 平行光源
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(1, 1, 1);
    // シーンに追加
    scene.add(directionalLight);

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
        const loader = new GLTFLoader();
        const objects = await loader.loadAsync(src, func);
        return objects.scene;
    }
}
