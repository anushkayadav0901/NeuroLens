import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Loader2 } from 'lucide-react';

function ViewerPanel({ showWireframe, analysisData, highlightTumor, analysisState }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const brainMeshRef = useRef(null);
  const tumorMeshRef = useRef(null);
  const tumorScaleRef = useRef(0);
  const cameraRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentTumorFile, setCurrentTumorFile] = useState(null);

  const loadBrainModel = (scene) => {
    const loader = new OBJLoader();
    
    loader.load(
      '/models/brain1.obj',
      (brainObj) => {
        console.log('✓ Brain model loaded');
        
        brainObj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xa0b0c0,
              transparent: true,
              opacity: 0.3,
              side: THREE.DoubleSide,
              wireframe: showWireframe,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        brainObj.scale.set(0.15, 0.15, 0.15);
        brainObj.position.set(0, 0, 0);
        
        scene.add(brainObj);
        brainMeshRef.current = brainObj;
        setModelsLoaded(true);
      },
      undefined,
      (error) => console.error('Error loading brain:', error)
    );
  };

  const loadTumorModel = (scene, tumorFile, position) => {
    if (!tumorFile) return;
    
    if (tumorMeshRef.current) {
      scene.remove(tumorMeshRef.current);
      tumorMeshRef.current = null;
    }
    
    const loader = new OBJLoader();
    
    loader.load(
      tumorFile,
      (tumorObj) => {
        console.log(`✓ Tumor loaded: ${tumorFile}`);
        
        tumorObj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xff6b4a,
              emissive: 0xff4500,
              emissiveIntensity: 0.3,
              roughness: 0.3,
              metalness: 0.2,
            });
            child.castShadow = true;
            child.userData = { isTumor: true };
          }
        });
        
        tumorObj.scale.set(0, 0, 0);
        
        if (position) {
          tumorObj.position.set(position.x, position.y, position.z);
        } else {
          tumorObj.position.set(0, 0, 0);
        }
        
        scene.add(tumorObj);
        tumorMeshRef.current = tumorObj;
        tumorScaleRef.current = 0;
      },
      undefined,
      (error) => console.error('Error loading tumor:', error)
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x38bdf8, 0.4);
    pointLight1.position.set(-10, 5, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x38bdf8, 0.3);
    pointLight2.position.set(10, -5, -10);
    scene.add(pointLight2);

    loadBrainModel(scene);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controlsRef.current = controls;

    // Mouse move handler for raycasting
    const handleMouseMove = (event) => {
      if (!tumorMeshRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      const intersects = [];
      tumorMeshRef.current.traverse((child) => {
        if (child.isMesh) {
          const childIntersects = raycasterRef.current.intersectObject(child);
          intersects.push(...childIntersects);
        }
      });
      
      if (intersects.length > 0 && tumorScaleRef.current > 0.5 && analysisData) {
        setTooltipData({
          location: analysisData.location.description,
          size: analysisData.size.diameter,
          risk: analysisData.size.risk,
        });
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        
        // Highlight tumor on hover
        tumorMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.emissiveIntensity = 0.5;
          }
        });
      } else {
        setTooltipData(null);
        if (tumorMeshRef.current) {
          tumorMeshRef.current.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material.emissiveIntensity = 0.3;
            }
          });
        }
      }
    };

    const handleMouseLeave = () => {
      setTooltipData(null);
      if (tumorMeshRef.current) {
        tumorMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.emissiveIntensity = 0.3;
          }
        });
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Slow auto-rotation for brain
      if (brainMeshRef.current) {
        brainMeshRef.current.rotation.y += 0.001;
      }
      
      // Animate tumor appearance/disappearance
      if (tumorMeshRef.current) {
        const targetScale = analysisData && highlightTumor ? 0.15 : 0;
        const scaleSpeed = 0.005;
        
        if (tumorScaleRef.current < targetScale) {
          tumorScaleRef.current = Math.min(tumorScaleRef.current + scaleSpeed, targetScale);
        } else if (tumorScaleRef.current > targetScale) {
          tumorScaleRef.current = Math.max(tumorScaleRef.current - scaleSpeed, targetScale);
        }
        
        tumorMeshRef.current.scale.set(
          tumorScaleRef.current,
          tumorScaleRef.current,
          tumorScaleRef.current
        );
        
        // Subtle pulsing effect when visible
        if (tumorScaleRef.current > 0) {
          const pulse = Math.sin(Date.now() * 0.003) * 0.02 + 1;
          tumorMeshRef.current.scale.multiplyScalar(pulse);
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [showWireframe]);

  useEffect(() => {
    if (!sceneRef.current || !analysisData) return;
    
    const tumorFile = analysisData.tumorFile;
    const position = analysisData.location?.position;
    
    if (tumorFile && tumorFile !== currentTumorFile) {
      setCurrentTumorFile(tumorFile);
      loadTumorModel(sceneRef.current, tumorFile, position);
    }
  }, [analysisData, currentTumorFile]);

  useEffect(() => {
    if (brainMeshRef.current) {
      brainMeshRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = showWireframe;
        }
      });
    }
  }, [showWireframe]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-panel p-6">
      <h2 className="mb-6 text-lg font-semibold text-white">3D Brain Viewer</h2>

      {/* 3D Viewer Container */}
      <div 
        ref={containerRef}
        className="relative flex-1 rounded-lg border border-border bg-surface shadow-inner overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_20px_rgba(56,189,248,0.05)] pointer-events-none z-10" />
        
        {/* Loading Overlay */}
        {analysisState === 'analyzing' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm">
            <Loader2 size={48} className="animate-spin text-accent" />
            <p className="mt-4 text-sm font-medium text-slate-300">Analyzing MRI...</p>
            <p className="mt-2 text-xs text-slate-400">Processing neural patterns</p>
            
            {/* Progress bar */}
            <div className="mt-6 w-64 overflow-hidden rounded-full bg-border">
              <div className="h-1 w-full animate-pulse bg-accent" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        )}
        
        {/* Model Loading Indicator */}
        {!modelsLoaded && analysisState !== 'analyzing' && (
          <div className="absolute inset-0 z-15 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-accent mx-auto" />
              <p className="mt-2 text-xs text-slate-400">Loading 3D models...</p>
            </div>
          </div>
        )}
        
        {/* Tumor Tooltip */}
        {tooltipData && (
          <div
            className="pointer-events-none absolute z-30 rounded-lg border border-accent/50 bg-panel/95 px-4 py-3 shadow-lg backdrop-blur-sm"
            style={{
              left: `${tooltipPosition.x + 15}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                Tumor Region
              </p>
              <p className="text-sm font-semibold text-white capitalize">
                {tooltipData.location}
              </p>
              <div className="mt-2 flex items-center gap-4 border-t border-border pt-2">
                <div>
                  <p className="text-xs text-slate-400">Size</p>
                  <p className="text-sm font-medium text-white">{tooltipData.size}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Risk</p>
                  <p className={`text-sm font-medium ${
                    tooltipData.risk === 'High' ? 'text-red-400' :
                    tooltipData.risk === 'Low' ? 'text-green-400' :
                    'text-amber-400'
                  }`}>
                    {tooltipData.risk}
                  </p>
                </div>
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute bottom-0 left-4 h-2 w-2 translate-y-1/2 rotate-45 border-b border-r border-accent/50 bg-panel/95" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewerPanel;
