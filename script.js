import * as CreateParts from './module/CreateParts.js';
import { EventArea } from './module/EVArea.js';
import *as Unit from './module/Unit.js';
const settings = {
    fov: 45,
    directionalLight: {
        color: 0xd1d1d1,
        intensity: 2.0
    },
    AmbientLight: {
        color: 0xFFFFFF,
        intensity: 0.5
    }
}
const GLTFLoader = new THREE.GLTFLoader();
class fullscreenLoader extends CreateParts.fullscreenLoader {
    constructor(text1,text2) {
        const innerHTML = new CreateParts.multiple({
            tagName: 'div',
            quantity: 2,
        })
        innerHTML.section[0].innerText = text1;
        innerHTML.section[1].innerText = text2;
        super({
            child: {
                className: ['centering'],
                child: {
                    className: ['title', 'white',]
                }
            },
            className: 'bac-black',
            innerHTML: innerHTML.body
        });

    }
    add() {
        document.body.appendChild(this.body);
    }
    remove() {
        document.body.removeChild(this.body);
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
class SphereMesh extends THREE.Mesh {
    constructor(radius = 4) {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshNormalMaterial();
        super(geometry, material);
    }
}
window.addEventListener('load', () => {
    document.getElementById('windowStatus').style.display = 'none'
})
console.time('load')
window.addEventListener('DOMContentLoaded', init);
async function init() {
    await Ammo().then(async function (Ammo) {
        //THREE
        const displayLoader=new fullscreenLoader('コースを組み立てています...','©WEBアプリ制作班')
        displayLoader.add();
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xFFFFFF, 0.001);
        const camera = new THREE.PerspectiveCamera(settings.fov);
        const cameraControls = new THREE.OrbitControls(camera, document.body);
        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#myCanvas'),
            // 物体の輪郭がガクガクするのを抑える
            antialias: true
        });
        const modelArrray = [
            ['./models/DB/courseD.glb', [30, 30, 30]],
            ['./models/DB/tire.glb', [5, 5, 5], [-207, 4, -23]],
            ['./models/DB/buggyNT.glb', [5, 5, 5], [-200, 7, -19]],
        ]
        initWindow()
        initCamera()
        await addModelFromArray(modelArrray, true);
        addLight();
        addSkyBox();
        await initAmmo();
        displayLoader.remove();
        tick();
        function tick() {
            cameraControls.update();
            renderer.render(scene, camera); // レンダリング
            requestAnimationFrame(tick);
        }
        function initWindow() {
            window.addEventListener('resize', resizeWindow);
            resizeWindow();
            function resizeWindow(e) {
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }
        }
        function initCamera() {
            camera.position.set(0, 0, +1000);
            // 滑らかにカメラコントローラーを制御する
            cameraControls.enableDamping = true;
            cameraControls.dampingFactor = 0.2;
        }
        async function addModelFromArray(array, add = true, func) {
            if (!Array.isArray(array)) { return }
            for (const param of array) {
                const object = await GLTFLoader.loadAsync(param[0]);
                if (Array.isArray(param[1])) { object.scene.scale.set(param[1][0], param[1][1], param[1][2]); }
                if (Array.isArray(param[2])) { object.scene.position.set(param[2][0], param[2][1], param[2][2]); }
                if (add) { scene.add(object.scene); }
                if (typeof func === 'function') { func(object) }
            }
        }
        function addLight() {
            // 平行光源
            const directionalLight = new THREE.DirectionalLight(settings.directionalLight.color, settings.directionalLight.intensity);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            const AmbientLight = new THREE.AmbientLight(settings.AmbientLight.color, settings.AmbientLight.intensity);
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
        
        async function initAmmo() {
            class RigidBody extends Ammo.btRigidBody {
                constructor({ shape, mass, position, quaternion, size, localInertia }) {
                    typeof mass === 'number' ? mass = mass : mass = 1;
                    const startTransform = new Ammo.btTransform();
                    startTransform.setIdentity();
                    if (position instanceof Ammo.btVector3) { startTransform.setOrigin(position); }
                    if (quaternion instanceof Ammo.btQuaternion) { startTransform.setRotation(quaternion); }
                    (localInertia instanceof Ammo.btVector3) ? localInertia = localInertia : localInertia = new Ammo.btVector3(0, 0, 0);
                    shape.calculateLocalInertia(mass, localInertia);
                    const myMotionState = new Ammo.btDefaultMotionState(startTransform);
                    const sphereRigidBodyCI = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
                    super(sphereRigidBodyCI);
                    if (size instanceof Ammo.btVector3) { this.getCollisionShape().setLocalScaling(size); }
                }
            }
            class AddMeshCollider extends RigidBody {
                constructor({ mesh, position, mass = 1, quaternion, size }) {
                    if (!(mesh instanceof THREE.Mesh)) { console.error('引数無効'); return false; };
                    const geometry = mesh.geometry;
                    const vertices = geometry.attributes.position.array; // Array of vertices
                    typeof pos !== 'undefined' ? position = position : position = new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z);
                    typeof quaternion !== 'undefined' ? quaternion = quaternion : quaternion = new Ammo.btQuaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);
                    // Ammo.js の頂点を保持する配列を作成する
                    const ammoVertices = [];
                    // 頂点をループして Ammo.js 頂点を作成する
                    for (let i = 0; i < vertices.length; i += 3) {
                        const vertex = new Ammo.btVector3(vertices[i], vertices[i + 1], vertices[i + 2]);
                        ammoVertices.push(vertex);
                    }
                    // Ammo.js の頂点から btConvexHullShape を作成する
                    const convexShape = new Ammo.btConvexHullShape();
                    for (let i = 0; i < ammoVertices.length; i++) {
                        convexShape.addPoint(ammoVertices[i]);
                    }
                    // btConvexHullShape を保持する btCompoundShape を作成
                    const compoundShape = new Ammo.btCompoundShape();
                    const localTransform = new Ammo.btTransform();
                    localTransform.setIdentity();
                    compoundShape.addChildShape(localTransform, convexShape);
                    super({ shape: compoundShape, mass: mass, position: position, quaternion: quaternion, size: size })
                }
            }
            class SphereCollider extends RigidBody {
                constructor({ radius = 4, mass = 1, position, quaternion, localInertia }) {
                    const sphereShape = new Ammo.btSphereShape(radius);
                    super({ shape: sphereShape, mass: mass, position: position, quaternion: quaternion, localInertia });
                }
            }
            class PlaneCollider extends RigidBody {
                constructor({ size, mass, position, quaternion, localInertia }) {
                    if (!size instanceof Ammo.btVector3) { size = new Ammo.btVector3(5, 1, 5) }
                    const plane = new Ammo.btBoxShape(size);
                    super({ shape: plane, mass: mass, position: position, quaternion: quaternion, localInertia })
                }
            }
            const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            const overlappingPairCache = new Ammo.btDbvtBroadphase();
            const solver = new Ammo.btSequentialImpulseConstraintSolver();
            const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
                dispatcher,
                overlappingPairCache,
                solver,
                collisionConfiguration);
            physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0)); // 重力を設定

            async function AddColliderFromAllMeshes(objects, size,position) {
                for (const param of objects.scene.children) {
                    const collider = new AddMeshCollider({ mesh: param, mass: 0, size: size, position:position });
                    physicsWorld.addRigidBody(collider);
                }
            }
            async function addcourseCollider() {
                const RBP1 = await GLTFLoader.loadAsync('./models/RB/RBP1.glb');
                AddColliderFromAllMeshes(RBP1, new Ammo.btVector3(30, 30, 30), new Ammo.btVector3(0, 5, 0));
                const RBP2 = await GLTFLoader.loadAsync('./models/RB/RBP2.glb');
                AddColliderFromAllMeshes(RBP2, new Ammo.btVector3(30, 30, 30));
                const RBPW1 = await GLTFLoader.loadAsync('./models/RB/RBPW1.glb');
                AddColliderFromAllMeshes(RBPW1, new Ammo.btVector3(30, 30, 30));
                const RBPW2 = await GLTFLoader.loadAsync('./models/RB/RBPW2.glb');
                AddColliderFromAllMeshes(RBPW2, new Ammo.btVector3(30, 30, 30));
            }
            async function addCollider() {
                const plane = new PlaneCollider({ size: new Ammo.btVector3(1000, 0, 1000), position: new Ammo.btVector3(0, 5, 0), mass: 0 })
                physicsWorld.addRigidBody(plane);
                await addcourseCollider();
            }
            await addCollider();
            const sphereBody = new SphereCollider({ radius: 1, mass: 1, position: new Ammo.btVector3(200, 200, 170) })
            physicsWorld.addRigidBody(sphereBody);
            const sphere = new SphereMesh(4);
            scene.add(sphere);
            const trans = new Ammo.btTransform();
            function updatePhysicsWorld() {
                const deltaTime = 1 / 60; // タイムステップを設定
                for (var i = 0; i < 5; i++) {
                    physicsWorld.stepSimulation(deltaTime);
                }
                sphereBody.getMotionState().getWorldTransform(trans);
                /**
                console.log("sphere pos = " +
                    [trans.getOrigin().x().toFixed(2),
                    trans.getOrigin().y().toFixed(2),
                    trans.getOrigin().z().toFixed(2)]
                );
                 */
                sphere.position.set(
                    trans.getOrigin().x().toFixed(2),
                    trans.getOrigin().y().toFixed(2),
                    trans.getOrigin().z().toFixed(2))
                sphere.quaternion.set(
                    trans.getRotation().x(),
                    trans.getRotation().y(),
                    trans.getRotation().z(),
                    trans.getRotation().w()
                )
                requestAnimationFrame(updatePhysicsWorld);
            }
            updatePhysicsWorld();
        }
    })

}

