// Case-based tumor mapping system
export const tumorFiles = [
  '/models/tumor1.obj',
  '/models/tumor_4fd971af.obj',
  '/models/tumor_5a98785c.obj',
  '/models/tumor_9f9d1332.obj',
  '/models/tumor_a44c98ca.obj',
  '/models/tumor_d592a63c.obj',
  '/models/tumor_eefcd0d1.obj'
];

export const cases = [
  {
    id: 0,
    region: 'left temporal',
    description: 'left temporal region',
    criticalArea: 'speech and language processing',
    size: '2.3 cm',
    scale: 0.25,
    risk: 'Moderate',
    riskColor: 'text-amber-400',
    position: { x: -3.5, y: 1.5, z: 2.0 }
  },
  {
    id: 1,
    region: 'right frontal',
    description: 'right frontal lobe',
    criticalArea: 'motor control and decision-making',
    size: '1.8 cm',
    scale: 0.2,
    risk: 'Low',
    riskColor: 'text-green-400',
    position: { x: 2.8, y: 2.5, z: 3.0 }
  },
  {
    id: 2,
    region: 'parietal',
    description: 'parietal region',
    criticalArea: 'sensory processing and spatial awareness',
    size: '1.5 cm',
    scale: 0.18,
    risk: 'Low',
    riskColor: 'text-green-400',
    position: { x: 1.0, y: 3.5, z: -1.5 }
  },
  {
    id: 3,
    region: 'left frontal',
    description: 'left frontal lobe',
    criticalArea: 'executive function and planning',
    size: '3.1 cm',
    scale: 0.32,
    risk: 'High',
    riskColor: 'text-red-400',
    position: { x: -2.5, y: 2.0, z: 3.5 }
  },
  {
    id: 4,
    region: 'occipital',
    description: 'occipital region',
    criticalArea: 'visual processing',
    size: '2.0 cm',
    scale: 0.22,
    risk: 'Moderate',
    riskColor: 'text-amber-400',
    position: { x: 0.5, y: 1.0, z: -4.0 }
  },
  {
    id: 5,
    region: 'right temporal',
    description: 'right temporal region',
    criticalArea: 'memory and auditory processing',
    size: '2.5 cm',
    scale: 0.26,
    risk: 'Moderate',
    riskColor: 'text-amber-400',
    position: { x: 3.2, y: 0.5, z: 1.5 }
  },
  {
    id: 6,
    region: 'cerebellum',
    description: 'cerebellar region',
    criticalArea: 'motor coordination and balance',
    size: '1.9 cm',
    scale: 0.21,
    risk: 'Low',
    riskColor: 'text-green-400',
    position: { x: 0.0, y: -2.5, z: -2.0 }
  }
];

export function getCaseId(file, totalCases) {
  const hash = file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % totalCases;
}

export function getCaseData(file) {
  const caseId = getCaseId(file, cases.length);
  const selectedCase = cases[caseId];
  const selectedTumor = tumorFiles[caseId];
  
  return {
    caseId,
    tumorFile: selectedTumor,
    location: {
      name: selectedCase.region,
      description: selectedCase.description,
      criticalArea: selectedCase.criticalArea,
      position: selectedCase.position
    },
    size: {
      diameter: selectedCase.size,
      scale: selectedCase.scale,
      risk: selectedCase.risk
    },
    riskColor: selectedCase.riskColor,
    timestamp: Date.now()
  };
}
