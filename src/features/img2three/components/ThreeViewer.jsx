import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildGroupFromSceneSpec, readCameraFromSceneSpec } from './SceneSpecBuilder';

const TEXTURE_KEYS = [
  'map',
  'alphaMap',
  'aoMap',
  'bumpMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'lightMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
];

const disposeMaterial = (material, disposedMaterials, disposedTextures) => {
  if (!material || disposedMaterials.has(material)) return;
  disposedMaterials.add(material);
  TEXTURE_KEYS.forEach((key) => {
    const texture = material[key];
    if (texture?.isTexture && !disposedTextures.has(texture)) {
      disposedTextures.add(texture);
      texture.dispose();
    }
  });
  material.dispose();
};

const disposeObject3D = (object) => {
  if (!object) return;
  const disposedGeometries = new Set();
  const disposedMaterials = new Set();
  const disposedTextures = new Set();
  object.traverse((child) => {
    if (child.geometry && !disposedGeometries.has(child.geometry)) {
      disposedGeometries.add(child.geometry);
      child.geometry.dispose();
    }
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => disposeMaterial(material, disposedMaterials, disposedTextures));
    } else {
      disposeMaterial(child.material, disposedMaterials, disposedTextures);
    }
  });
};

const isAbortError = (error) => error?.name === 'AbortError' || error?.code === 'ERR_CANCELED';

const exportModelAsGlb = (root) => new Promise((resolve, reject) => {
  const exporter = new GLTFExporter();
  exporter.parse(
    root,
    (result) => {
      const blob = result instanceof ArrayBuffer
        ? new Blob([result], { type: 'model/gltf-binary' })
        : new Blob([JSON.stringify(result)], { type: 'model/gltf+json' });
      resolve(blob);
    },
    reject,
    { binary: true, onlyVisible: true },
  );
});

const ThreeViewer = ({ sceneSpec, className, onReady, onError }) => {
  const containerRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const exportRootRef = useRef(null);

  useEffect(() => {
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  }, [onError, onReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sceneSpec) return undefined;

    const controller = new AbortController();
    let disposed = false;
    let frameId = 0;
    let resizeObserver = null;
    let controls = null;
    let pmremGenerator = null;
    let environmentTarget = null;
    let model = null;

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
    const camera = new THREE.PerspectiveCamera(cameraSpec.fov, width / height, 0.01, 1_000);
    camera.position.set(...cameraSpec.position);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(...cameraSpec.target);
    controls.update();

    pmremGenerator = new THREE.PMREMGenerator(renderer);
    environmentTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9199, 0.55));
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

    const renderFrame = () => {
      if (disposed) return;
      frameId = window.requestAnimationFrame(renderFrame);
      controls.update();
      renderer.render(scene, camera);
    };
    renderFrame();

    const handleResize = () => {
      if (disposed) return;
      const nextWidth = container.clientWidth || width;
      const nextHeight = container.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleResize)
      : null;
    if (resizeObserver) resizeObserver.observe(container);
    else window.addEventListener('resize', handleResize);

    const initializeModel = async () => {
      try {
        const builtModel = await buildGroupFromSceneSpec(sceneSpec, { signal: controller.signal });
        if (disposed || controller.signal.aborted) {
          disposeObject3D(builtModel);
          return;
        }
        model = builtModel;
        exportRootRef.current = model;
        scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        if (!box.isEmpty()) {
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z, 0.001);
          model.position.sub(center);
          model.position.y += size.y / 2;

          const fitDistance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360));
          camera.near = Math.max(0.001, fitDistance / 1_000);
          camera.far = Math.max(100, fitDistance * 100);
          camera.updateProjectionMatrix();
          camera.position.set(fitDistance * 0.9, fitDistance * 0.55, fitDistance * 1.1);
          controls.target.set(0, size.y * 0.35, 0);
          controls.update();
        }

        onReadyRef.current?.({
          exportGlb: () => {
            const exportRoot = exportRootRef.current;
            return exportRoot
              ? exportModelAsGlb(exportRoot)
              : Promise.reject(new Error('Model not ready'));
          },
        });
      } catch (error) {
        if (!disposed && !isAbortError(error)) onErrorRef.current?.(error);
      }
    };
    initializeModel();

    return () => {
      disposed = true;
      controller.abort();
      window.cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', handleResize);
      controls?.dispose();
      scene.environment = null;
      environmentTarget?.dispose();
      pmremGenerator?.dispose();
      disposeObject3D(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      if (exportRootRef.current === model) exportRootRef.current = null;
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
