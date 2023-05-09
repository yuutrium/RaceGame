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
const createMassage = {
    argumentError: (validValue) => {
        return `TypeError:Argument must be a ${validValue} .`
    }
}
window.addEventListener('load', () => {
    document.getElementById('windowStatus').style.display = 'none'
})
await Ammo().then(async function (Ammo) {
    const GLTFLoader = new THREE.GLTFLoader();
    class fullscreenLoader extends CreateParts.fullscreenLoader {
        constructor(text1, text2) {
            const innerHTML = new CreateParts.multiple({
                tagName: 'div',
                quantity: 2,
            })
            innerHTML.mainInner[0].innerText = text1;
            innerHTML.mainInner[1].innerText = text2;
            super({
                child: {
                    className: ['centering'],
                },
                className: 'bac-black',
                mainInnerHTML: innerHTML.body
            });
            this.mainInner.classList.add('title', 'white')
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
            if (!Array.isArray(urls)) { console.error(createMassage.argumentError('Array')); return false; }
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
    class RigidBody extends Ammo.btRigidBody {
        constructor({ shape, mass, position, quaternion, size, localInertia, friction }) {
            const sMass = typeof mass === 'number' ? mass : 1;
            const sLocalInertia = (localInertia instanceof Ammo.btVector3) ? localInertia : new Ammo.btVector3(0, 0, 0);
            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            if (position instanceof Ammo.btVector3) { startTransform.setOrigin(position); }
            if (quaternion instanceof Ammo.btQuaternion) { startTransform.setRotation(quaternion); }
            shape.calculateLocalInertia(sMass, sLocalInertia);
            const myMotionState = new Ammo.btDefaultMotionState(startTransform);
            const sphereRigidBodyCI = new Ammo.btRigidBodyConstructionInfo(sMass, myMotionState, shape, sLocalInertia);
            super(sphereRigidBodyCI);
            if (size instanceof Ammo.btVector3) { this.getCollisionShape().setLocalScaling(size); }
            if (typeof friction === 'number') { this.setFriction(friction); }
        }
        getSyncFunc(Mesh, TRANSFORM_AUX) {
            if (!Mesh instanceof THREE.Mesh) { console.error(createMassage.argumentError('THREE.Mesh instance')); return false; }
            const _TRANSFORM_AUX = TRANSFORM_AUX instanceof Ammo.btTransform ? TRANSFORM_AUX : new Ammo.btTransform();
            let sync = () => { }
            if (this.getMass() > 0) {
                sync = () => {
                    const ms = this.getMotionState();
                    if (ms) {
                        ms.getWorldTransform(_TRANSFORM_AUX);
                        var p = _TRANSFORM_AUX.getOrigin();
                        var q = _TRANSFORM_AUX.getRotation();
                        Mesh.position.set(p.x(), p.y(), p.z());
                        Mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
                    }
                }
            }
            return sync;
        }
    }
    class AddMeshCollider extends RigidBody {
        constructor({ mesh, position, mass = 1, quaternion, size, friction }) {
            if (!(mesh instanceof THREE.Mesh)) { console.error(createMassage.argumentError('THREE.Mesh instance')); return false; };
            const geometry = mesh.geometry;
            const vertices = geometry.attributes.position.array; // Array of vertices
            const startPosition = typeof position !== 'undefined' ? position : new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z);
            const startQuaternion = typeof quaternion !== 'undefined' ? quaternion : new Ammo.btQuaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);
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
            super({ shape: compoundShape, mass: mass, position: startPosition, quaternion: startQuaternion, size: size, friction: friction })
        }
    }
    class AddConvexMeshCollider extends RigidBody {
        constructor({ mesh, position, mass = 1, quaternion, size, friction }) {
            if (!(mesh instanceof THREE.Mesh)) { console.error(createMassage.argumentError('THREE.Mesh instance')); return false; };
            const startPosition = typeof position !== 'undefined' ? position : new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z);
            const startQuaternion = typeof quaternion !== 'undefined' ? quaternion : new Ammo.btQuaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);
            const geometry = mesh.geometry;
            // Extract the geometry of the mesh object
            const vertices = geometry.attributes.position.array;
            const indices = geometry.index.array;
            const triangles = [];
            for (let i = 0; i < indices.length; i += 3) {
                const i1 = indices[i] * 3;
                const i2 = indices[i + 1] * 3;
                const i3 = indices[i + 2] * 3;
                const v1 = new Ammo.btVector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
                const v2 = new Ammo.btVector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);
                const v3 = new Ammo.btVector3(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);
                triangles.push(v1, v2, v3);
            }
            const triangleMesh = new Ammo.btTriangleMesh();
            for (let i = 0; i < triangles.length; i += 3) {
                const v1 = triangles[i];
                const v2 = triangles[i + 1];
                const v3 = triangles[i + 2];
                triangleMesh.addTriangle(v1, v2, v3);
            }
            const convexShape = new Ammo.btConvexTriangleMeshShape(triangleMesh, true);
            super({ shape: convexShape, mass: mass, position: startPosition, quaternion: startQuaternion, size: size, friction: friction })
        }
    }
    class SphereCollider extends RigidBody {
        constructor({ radius = 4, mass = 1, position, quaternion, localInertia, friction }) {
            const sphereShape = new Ammo.btSphereShape(radius);
            super({ shape: sphereShape, mass: mass, position: position, quaternion: quaternion, localInertia: localInertia, friction: friction });
            console.log(this.getMass())
        }
    }
    class BoxCollider extends RigidBody {
        constructor({ size, mass, position, quaternion, localInertia, friction }) {
            const sSize = size instanceof Ammo.btVector3 ? size : new Ammo.btVector3(5, 1, 5)
            const plane = new Ammo.btBoxShape(sSize);
            super({ shape: plane, mass: mass, position: position, quaternion: quaternion, localInertia: localInertia, friction: friction })
        }
    }
    class addVehicleCollider extends Ammo.btRaycastVehicle {
        constructor({
             physicsWorld, position, quaternion, chassisMesh, wheelMesh ,
             chassisWidth=2.4,
             chassisHeight= 2.6,
             chassisLength=4,
             massVehicle=1000,
             wheelinfo
            }) {
            if (!position instanceof Ammo.btVector3) { console.error(createMassage.argumentError('Ammo.btVector3')); return false }
            if (!quaternion instanceof Ammo.btQuaternion) { console.error(createMassage.argumentError('Ammo.btQuaternion')); return false }
            const VehicleSettings = {
                chassisWidth: 2.4,
                chassisHeight: 2.6,
                chassisLength: 4,
                massVehicle: 1000,
                wheelRadius: 2.2,
                wheelAxisPositionBack: -1.8,
                wheelHalfTrackBack: 1.2,
                wheelAxisHeightBack: 0.3,
                wheelAxisFrontPosition: 2.1,
                wheelHalfTrackFront: 1.2,
                wheelAxisHeightFront: 0.3,
                friction: 1000,
                suspensionStiffness: 30.0,
                suspensionDamping: 4.6,
                suspensionCompression: 1.0,
                suspensionRestLength: 1.2,
                rollInfluence: 0.2,
                steeringIncrement: 0.2,
                steeringClamp: 0.8,
                maxEngineForce: 1000,
                maxBreakingForce: 1000,
            }

            // Raycast Vehicle
            const DISABLE_DEACTIVATION = 4;
            const body = new BoxCollider({
                size: new Ammo.btVector3(VehicleSettings.chassisWidth, VehicleSettings.chassisHeight, VehicleSettings.chassisLength),
                position: position,
                quaternion: quaternion,
                mass: VehicleSettings.massVehicle,
            })
            body.setActivationState(DISABLE_DEACTIVATION);
            physicsWorld.addRigidBody(body);
            const tuning = new Ammo.btVehicleTuning();
            const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
            super(tuning, body, rayCaster)
            const thisVehicle = this;
            this.wheelindex={
                FRONT_LEFT :0,
                FRONT_RIGHT :1,
                BACK_LEFT :2,
                BACK_RIGHT :3
            }
            thisVehicle.engineForce = 0;
            thisVehicle.vehicleSteering = 0;
            thisVehicle.breakingForce = 0;
            thisVehicle.speed = 0;
            thisVehicle.physicsWorld = physicsWorld;
            thisVehicle.chassisMesh = chassisMesh;
            thisVehicle.VehicleSettings = VehicleSettings;
            thisVehicle.setCoordinateSystem(0, 1, 2);
            physicsWorld.addAction(thisVehicle);
            this.FRONT_LEFT = 0;
            this.FRONT_RIGHT = 1;
            this.BACK_LEFT = 2;
            this.BACK_RIGHT = 3;
            thisVehicle.wheelMeshArray = [];
            const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
            const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
            thisVehicle.actions = {};
            function createWheelMesh(radius) {
                const newMesh = wheelMesh.clone()
                scene.attach(newMesh);
                return newMesh;
            }
            function addWheel(isFront, position, radius, index) {
                console.log(index + ':' + position.x(), position.y(), position.z())
                const wheelInfo = thisVehicle.addWheel(
                    position,
                    wheelDirectionCS0,
                    wheelAxleCS,
                    VehicleSettings.suspensionRestLength,
                    radius,
                    tuning,
                    isFront);
                wheelInfo.set_m_suspensionStiffness(VehicleSettings.suspensionStiffness);
                wheelInfo.set_m_wheelsDampingRelaxation(VehicleSettings.suspensionDamping);
                wheelInfo.set_m_wheelsDampingCompression(VehicleSettings.suspensionCompression);
                wheelInfo.set_m_frictionSlip(VehicleSettings.friction);
                wheelInfo.set_m_rollInfluence(VehicleSettings.rollInfluence);
                thisVehicle.wheelMeshArray[index] = createWheelMesh(radius);
            }
            addWheel(true, new Ammo.btVector3(VehicleSettings.wheelHalfTrackFront, VehicleSettings.wheelAxisHeightFront, VehicleSettings.wheelAxisFrontPosition), VehicleSettings.wheelRadius, this.wheelindex.FRONT_LEFT);
            addWheel(true, new Ammo.btVector3(-VehicleSettings.wheelHalfTrackFront, VehicleSettings.wheelAxisHeightFront, VehicleSettings.wheelAxisFrontPosition), VehicleSettings.wheelRadius, this.wheelindex.FRONT_RIGHT);
            addWheel(false, new Ammo.btVector3(VehicleSettings.wheelHalfTrackBack, VehicleSettings.wheelAxisHeightBack, VehicleSettings.wheelAxisPositionBack), VehicleSettings.wheelRadius, this.wheelindex.BACK_LEFT);
            addWheel(false, new Ammo.btVector3(-VehicleSettings.wheelHalfTrackBack, VehicleSettings.wheelAxisHeightBack, VehicleSettings.wheelAxisPositionBack), VehicleSettings.wheelRadius, this.wheelindex.BACK_RIGHT);

            console.log(thisVehicle.wheelMeshArray)
        }
        getSyncFunc() {
            const thisVehicle = this;
            const FRONT_LEFT = 0;
            const FRONT_RIGHT = 1;
            const BACK_LEFT = 2;
            const BACK_RIGHT = 3;
            const sync = () => {
                thisVehicle.speed = thisVehicle.getCurrentSpeedKmHour();
                let breakingForce = thisVehicle.breakingForce;
                let engineForce = thisVehicle.engineForce;
                let vehicleSteering = thisVehicle.vehicleSteering;
                const VehicleSettings = thisVehicle.VehicleSettings;
                breakingForce = 0;
                engineForce = 0;
                if (thisVehicle.actions.acceleration) {
                    if (thisVehicle.speed < -1)
                        breakingForce = VehicleSettings.maxBreakingForce;
                    else engineForce = VehicleSettings.maxEngineForce;
                }
                if (thisVehicle.actions.braking) {
                    if (thisVehicle.speed > 1)
                        breakingForce = VehicleSettings.maxBreakingForce;
                    else engineForce = -VehicleSettings.maxEngineForce / 2;
                }
                if (thisVehicle.actions.left) {
                    if (vehicleSteering < VehicleSettings.steeringClamp) {
                        vehicleSteering += VehicleSettings.steeringIncrement;
                    }

                }
                else {
                    if (thisVehicle.actions.right) {
                        if (vehicleSteering > -VehicleSettings.steeringClamp)
                            vehicleSteering -= VehicleSettings.steeringIncrement;
                    }
                    else {
                        if (vehicleSteering < -VehicleSettings.steeringIncrement)
                            vehicleSteering += VehicleSettings.steeringIncrement;
                        else {
                            if (vehicleSteering > VehicleSettings.steeringIncrement)
                                vehicleSteering -= VehicleSettings.steeringIncrement;
                            else {
                                vehicleSteering = 0;
                            }
                        }
                    }
                }
                thisVehicle.applyEngineForce(engineForce, BACK_LEFT);
                thisVehicle.applyEngineForce(engineForce, BACK_RIGHT);
                thisVehicle.setBrake(breakingForce / 2, FRONT_LEFT);
                thisVehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
                thisVehicle.setBrake(breakingForce, BACK_LEFT);
                thisVehicle.setBrake(breakingForce, BACK_RIGHT);
                thisVehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
                thisVehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);
                let tm, p, q, i;
                const n = thisVehicle.getNumWheels();
                for (i = 0; i < n; i++) {
                    thisVehicle.updateWheelTransform(i, true);
                    tm = thisVehicle.getWheelTransformWS(i);
                    p = tm.getOrigin();
                    q = tm.getRotation();
                    thisVehicle.wheelMeshArray[i].position.set(p.x(), p.y(), p.z());
                    thisVehicle.wheelMeshArray[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
                }
                tm = thisVehicle.getChassisWorldTransform();
                p = tm.getOrigin();
                q = tm.getRotation();
                thisVehicle.chassisMesh.position.set(p.x(), p.y(), p.z());
                thisVehicle.chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
            return sync;

        }
    }

    const displayLoader = new fullscreenLoader('コースを組み立てています...', '©WEBアプリ制作班')
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
        //['./models/DB/tire.glb', [5, 5, 5], [-207, 4, -23]],
        //['./models/DB/buggyNT.glb', [5, 5, 5], [-200, 7, -19]],
    ]
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
    initWindow()
    initCamera()
    addLight();
    addSkyBox();
    await addModelFromArray(modelArrray, true);
    await initAmmo();
    displayLoader.remove();

    function tick() {
        cameraControls.update();
        renderer.render(scene, camera); // レンダリング
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
        if (!Array.isArray(array)) { console.error(createMassage.argumentError('Array')); return false; }
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
        let syncList = [];
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

        async function AddColliderFromAllMeshes(objects, size, position) {
            for (const param of objects.scene.children) {
                const collider = new AddMeshCollider({ mesh: param, mass: 0, size: size, position: position });
                collider.setRestitution(1);
                physicsWorld.addRigidBody(collider);
            }
        }
        async function AddConvexColliderFromAllMeshes(objects, size, position) {
            for (const param of objects.scene.children) {
                const collider = new AddConvexMeshCollider({ mesh: param, mass: 0, size: size, position: position });
                collider.setRestitution(1);
                physicsWorld.addRigidBody(collider);
            }
        }

        async function addCollider() {
            async function addcourseCollider() {
                const RBP1 = await GLTFLoader.loadAsync('./models/RB/RBP1.glb');
                AddConvexColliderFromAllMeshes(RBP1, new Ammo.btVector3(30, 30, 30), new Ammo.btVector3(0, -3, 0));
                const RBP2 = await GLTFLoader.loadAsync('./models/RB/RBP2.glb');
                AddColliderFromAllMeshes(RBP2, new Ammo.btVector3(30, 30, 30), new Ammo.btVector3(0, -3, 0));
                const RBPW1 = await GLTFLoader.loadAsync('./models/RB/RBPW1.glb');
                AddColliderFromAllMeshes(RBPW1, new Ammo.btVector3(30, 30, 30));
                const RBPW2 = await GLTFLoader.loadAsync('./models/RB/RBPW2.glb');
                AddColliderFromAllMeshes(RBPW2, new Ammo.btVector3(30, 30, 30));
                const carMesh = await GLTFLoader.loadAsync('./models/DB/buggyY90.glb');
                scene.add(carMesh.scene)
                carMesh.scene.scale.set(1.5, 1.5, 1.5)
                const tireMesh = await GLTFLoader.loadAsync('./models/DB/tire5Y90.glb');
                tireMesh.scene.scale.set(1.5, 1.5, 1.5);
                const car = new addVehicleCollider({ position: new Ammo.btVector3(-200, 6, -19), quaternion: new Ammo.btQuaternion(0, 0, 0, 1), chassisMesh: carMesh.scene, physicsWorld: physicsWorld, wheelMesh: tireMesh.scene })
                const keysActions = new Map([
                    ["KeyW", 'acceleration'],
                    ["KeyS", 'braking'],
                    ["KeyA", 'left'],
                    ["KeyD", 'right'],
                ])
                window.addEventListener('keydown', keydown);
                window.addEventListener('keyup', keyup);
                function keyup(e) {
                    if (keysActions.get(e.code)) {
                        car.actions[keysActions.get(e.code)] = false;
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
                function keydown(e) {
                    if (keysActions.get(e.code)) {
                        car.actions[keysActions.get(e.code)] = true;
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
                syncList.push(car.getSyncFunc())
            }
            await addcourseCollider();
            const planebody = new BoxCollider({ size: new Ammo.btVector3(1000, 0, 1000), position: new Ammo.btVector3(0, 0, 0), mass: 0 })
            physicsWorld.addRigidBody(planebody);
            const sphereBody = new SphereCollider({ radius: 1, mass: 1, position: new Ammo.btVector3(250, 200, 200) })
            sphereBody.setRestitution(0.2);
            physicsWorld.addRigidBody(sphereBody);
            const sphere = new SphereMesh(4);
            scene.add(sphere);
            const sphereSync = sphereBody.getSyncFunc(sphere);
            syncList.push(sphereSync);

        }
        await addCollider();
        function updatePhysicsWorld() {
            const deltaTime = 1 / 60; // タイムステップを設定
            for (var i = 0; i < 5; i++) {
                physicsWorld.stepSimulation(deltaTime);
                syncList.forEach(x => {
                    if (typeof x !== 'function') { console.error(createMassage.argumentError('function')); return };
                    x();
                })
            }

            tick();
            requestAnimationFrame(updatePhysicsWorld);
        }
        updatePhysicsWorld();
    }
})



