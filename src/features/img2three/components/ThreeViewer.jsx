import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildGroupFromSceneSpec, readCameraFromSceneSpec } from './SceneSpecBuilder';

const ThreeViewer = ({ sceneSpec, className, onReady }) => {
  const containerRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const exportRootRef = useRef(null);

  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sceneSpec) return undefined;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f6f8);

    const cameraSpec = readCameraFromSceneSpec(sceneSpec);
    const camera = new THREE.PerspectiveCamera(cameraSpec.fov, width / height, 0.1, 100);
    camera.position.set(cameraSpec.position[0], cameraSpec.position[1], cameraSpec.position[2]);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(cameraSpec.target[0], cameraSpec.target[1], cameraSpec.target[2]);
    controls.update();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a9199, 0.55);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdce6f2, 0.35);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(8, 64),
      new THREE.MeshStandardMaterial({ color: 0xe8edf2, roughness: 0.95, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    const model = buildGroupFromSceneSpec(sceneSpec);
    exportRootRef.current = model;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    model.position.sub(center);
    model.position.y += size.y / 2;

    const fitDistance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360));
    camera.position.set(fitDistance * 0.9, fitDistance * 0.55, fitDistance * 1.1);
    controls.target.set(0, size.y * 0.35, 0);
    controls.update();

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nextWidth = container.clientWidth || width;
      const nextHeight = container.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleResize)
      : null;
    if (resizeObserver) {
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    onReadyRef.current?.({
      exportGlb: () => new Promise((resolve, reject) => {
        const root = exportRootRef.current;
        if (!root) {
          reject(new Error('Model not ready'));
          return;
        }
        const exporter = new GLTFExporter();
        exporter.parse(
          root,
          (result) => {
            const blob = result instanceof ArrayBuffer
              ? new Blob([result], { type: 'model/gltf-binary' })
              : new Blob([JSON.stringify(result)], { type: 'model/gltf+json' });
            resolve(blob);
          },
          (error) => reject(error),
          { binary: true },
        );
      }),
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      controls.dispose();
      pmremGenerator.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      exportRootRef.current = null;
    };
  }, [sceneSpec]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="3D preview"
    />
  );
};

export default ThreeViewer;
