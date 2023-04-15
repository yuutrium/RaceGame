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
class DOMParts {
    constructor(type, options = { size: 48, position: undefined }) {
        const InfoMap = new Map([
            ['loader',
                () => {
                    const loader = document.createElement('span');
                    loader.classList.add('loader');
                    loader.style.width = options.size;
                    loader.style.height = options.size;
                    addPosOP(loader, options.position, 'rerative')
                    return loader;
                }],
            ['fullscreen',
                () => {
                    const div = document.createElement('div')
                    div.classList.add('fullscreen', 'absolute');
                    addPosOP(div, options.position, 'absolute')
                    return div;
                }
            ],
            ['fullscreenLoader',
            ()=>{
                const pearent = new DOMParts('fullscreen');
                pearent.element.classList.add('centering');
                const loadericon = new DOMParts('loader');
                loadericon.added(pearent.element);
                return pearent.element;
            }
        ]
        ])
        function addPosOP(element, type, defaultValue = 'rerative') {
            switch (type) {
                case undefined:
                    element.classList.add(defaultValue);
                    break;
                case 'relative':
                    element.classList.add('rerative');
                    break;
                case 'absolute':
                    element.classList.add('absolute');

            }
        }
        this.element = InfoMap.get(type)();
    }
    added(element, options = {}) {
        element.appendChild(this.element);
    }
    removed(element) {
        element.removeChild(this.element);
    }
}
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CreateParts } from './module/CreateParts.js';
import { EventArea } from './module/EVArea.js';
console.log(THREE);

const setings = {
    fov: 45,
    AmbientLight: {
        color: 0xFFFFFF,
        float: 1
    }

}
window.addEventListener('load',()=>{
    document.getElementById('windowStatus').style.display='none'
})
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
        const loaderDisplay=new CreateParts.fullscreenLoader('absolute',{textArea:'Loading'});
        document.body.appendChild(loaderDisplay.bodyNode);
        loaderDisplay.textArea.style.color='white'
        const loader = new GLTFLoader();
        const objects = await loader.loadAsync(src, func);
        document.body.removeChild(loaderDisplay.bodyNode);
        return objects.scene;
    }


}
