
const Converter = {
    Radian:
        /** @param {number} degree ラジアン */
        class {
            constructor(degree) {
                if (typeof (degree) === 'number') {
                    this.degree = degree;
                }
                else {
                    console.error('引数のエラー')
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
        },
    LongitudeLatitude:
        /**
        * 緯度経度から位置を算出
        * @param {number} latitude 緯度(単位は度数法)
        * @param {number} longitude 経度(単位は度数法)
        * @param {number} radius 半径
        */
        class {
            constructor(latitude, longitude, radius) {
                if (typeof (latitude) === 'number' && typeof (longitude) === 'number' && radius >= 0) {
                    this.latitude = latitude;
                    this.longitude = longitude;
                    this.radius = radius;
                }
                else {
                    console.error('引数のエラー');
                    this.latitude = NaN;
                    this.longitude = NaN;
                    this.radius = NaN;
                }
            }
            /** @returns {object} 3Dの座標 */
            toCoord() {
                // 仰角
                const phi = new Converter.Angle(this.latitude).toRadian();
                // 方位角
                const theta = new Converter.Angle(this.longitude - 180).toRadian();
                const x = -1 * this.radius * Math.cos(phi) * Math.cos(theta);
                const y = this.radius * Math.sin(phi);
                const z = this.radius * Math.cos(phi) * Math.sin(theta);
                return { x: x, y: y, z: z }
            }
        }
}
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// ページの読み込みを待つ
window.addEventListener('DOMContentLoaded', init);
async function init() {
    
    // サイズを指定
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas'),
        // 物体の輪郭がガクガクするのを抑える
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(0, 0, +1000);
    // カメラコントローラーを作成
    const controls = new OrbitControls(camera, document.body);

    // GLTF形式のモデルデータを読み込む
    const loader = new GLTFLoader();
    // GLTFファイルのパスを指定
    const objects = await loader.loadAsync('./models/course.gltf');
    // 読み込み後に3D空間に追加
    const model = objects.scene;
    scene.add(model);
    model.scale.set(30, 30, 30);
    // 平行光源
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(1, 1, 1);
    // シーンに追加
    scene.add(directionalLight);
    // 滑らかにカメラコントローラーを制御する
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    tick();

    // 毎フレーム時に実行されるループイベントです
    function tick() {
        //sphere.rotation.y += 0.01;
        //sphere.rotation.x += 0.01;
        controls.update();
        renderer.render(scene, camera); // レンダリング
        requestAnimationFrame(tick);
    }
}
