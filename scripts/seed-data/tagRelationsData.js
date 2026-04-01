// Tag relations for deterministic recommendation expansion.
// These are intentionally conservative. Exact tag matches should remain the strongest signal.
export const TAG_RELATIONS = [
  // AI / data
  {
    sourceTagId: 'domain-artificial-intelligence',
    targetTagId: 'skill-machine-learning',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Machine learning is a core adjacent area of artificial intelligence.'
  },
  {
    sourceTagId: 'skill-machine-learning',
    targetTagId: 'skill-deep-learning',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Deep learning is a strong sub-area and adjacent skill within machine learning work.'
  },
  {
    sourceTagId: 'skill-machine-learning',
    targetTagId: 'skill-computer-vision',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Computer vision projects frequently rely on machine learning.'
  },
  {
    sourceTagId: 'domain-data-science',
    targetTagId: 'domain-statistics',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Statistics is a foundational adjacent area for data science.'
  },
  {
    sourceTagId: 'domain-data-science',
    targetTagId: 'skill-data-analysis',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Data analysis is a close practical adjacent skill to data science.'
  },
  {
    sourceTagId: 'domain-data-science',
    targetTagId: 'skill-machine-learning',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Machine learning is a strong adjacent skill for many data science projects.'
  },
  {
    sourceTagId: 'domain-data-science',
    targetTagId: 'skill-numerical-methods',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Numerical methods are a moderate adjacent skill for quantitative data work.'
  },
  {
    sourceTagId: 'domain-artificial-intelligence',
    targetTagId: 'skill-algorithms',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Algorithms are a meaningful adjacent skill for artificial intelligence projects.'
  },
  {
    sourceTagId: 'domain-bioinformatics',
    targetTagId: 'domain-data-science',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Bioinformatics often overlaps with data science methods.'
  },

  // Broad-domain umbrella expansion
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-molecular-biology',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Biology interest should surface Molecular Biology projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-cell-biology',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Biology interest should surface Cell Biology projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-microbiology',
    edgeWeight: 0.33,
    bidirectional: false,
    note: 'Broad Biology interest should surface Microbiology projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-biochemistry',
    edgeWeight: 0.3,
    bidirectional: false,
    note: 'Broad Biology interest should surface Biochemistry projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-cancer-biology',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Biology interest should surface Cancer Biology projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-genetics',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Biology interest should surface Genetics projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-ecology',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Biology interest should surface Ecology projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-marine-biology',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Biology interest should surface Marine Biology projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-botany',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Biology interest should surface Botany projects.'
  },
  {
    sourceTagId: 'domain-biology',
    targetTagId: 'domain-zoology',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Biology interest should surface Zoology projects.'
  },
  {
    sourceTagId: 'domain-computer-science',
    targetTagId: 'domain-software-engineering',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Computer Science interest should surface Software Engineering projects.'
  },
  {
    sourceTagId: 'domain-computer-science',
    targetTagId: 'domain-artificial-intelligence',
    edgeWeight: 0.33,
    bidirectional: false,
    note: 'Broad Computer Science interest should surface Artificial Intelligence projects.'
  },
  {
    sourceTagId: 'domain-computer-science',
    targetTagId: 'domain-data-science',
    edgeWeight: 0.33,
    bidirectional: false,
    note: 'Broad Computer Science interest should surface Data Science projects.'
  },
  {
    sourceTagId: 'domain-computer-science',
    targetTagId: 'domain-cybersecurity',
    edgeWeight: 0.3,
    bidirectional: false,
    note: 'Broad Computer Science interest should surface Cybersecurity projects.'
  },
  {
    sourceTagId: 'domain-computer-science',
    targetTagId: 'domain-computer-engineering',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Computer Science interest should surface Computer Engineering projects.'
  },
  {
    sourceTagId: 'domain-computer-science',
    targetTagId: 'domain-information-technology',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Computer Science interest should surface Information Technology projects.'
  },
  {
    sourceTagId: 'domain-public-health',
    targetTagId: 'domain-epidemiology',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Public Health interest should surface Epidemiology projects.'
  },
  {
    sourceTagId: 'domain-public-health',
    targetTagId: 'domain-biostatistics',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Public Health interest should surface Biostatistics projects.'
  },
  {
    sourceTagId: 'domain-public-health',
    targetTagId: 'domain-environmental-health',
    edgeWeight: 0.3,
    bidirectional: false,
    note: 'Broad Public Health interest should surface Environmental Health projects.'
  },
  {
    sourceTagId: 'domain-public-health',
    targetTagId: 'domain-health-informatics',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Public Health interest should surface Health Informatics projects.'
  },
  {
    sourceTagId: 'domain-public-health',
    targetTagId: 'domain-mental-health',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Public Health interest should surface Mental Health projects.'
  },
  {
    sourceTagId: 'domain-public-health',
    targetTagId: 'domain-clinical-research',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Public Health interest should surface Clinical Research projects.'
  },
  {
    sourceTagId: 'domain-chemistry',
    targetTagId: 'domain-organic-chemistry',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Chemistry interest should surface Organic Chemistry projects.'
  },
  {
    sourceTagId: 'domain-chemistry',
    targetTagId: 'domain-biochemistry',
    edgeWeight: 0.33,
    bidirectional: false,
    note: 'Broad Chemistry interest should surface Biochemistry projects.'
  },
  {
    sourceTagId: 'domain-chemistry',
    targetTagId: 'domain-medicinal-chemistry',
    edgeWeight: 0.3,
    bidirectional: false,
    note: 'Broad Chemistry interest should surface Medicinal Chemistry projects.'
  },
  {
    sourceTagId: 'domain-chemistry',
    targetTagId: 'skill-analytical-chemistry',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Chemistry interest should surface Analytical Chemistry work.'
  },
  {
    sourceTagId: 'domain-chemistry',
    targetTagId: 'domain-drug-discovery',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Chemistry interest should surface Drug Discovery projects.'
  },
  {
    sourceTagId: 'domain-mechanical-engineering',
    targetTagId: 'domain-robotics',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Mechanical Engineering interest should surface Robotics projects.'
  },
  {
    sourceTagId: 'domain-mechanical-engineering',
    targetTagId: 'domain-automation',
    edgeWeight: 0.33,
    bidirectional: false,
    note: 'Broad Mechanical Engineering interest should surface Automation projects.'
  },
  {
    sourceTagId: 'domain-mechanical-engineering',
    targetTagId: 'domain-thermodynamics',
    edgeWeight: 0.3,
    bidirectional: false,
    note: 'Broad Mechanical Engineering interest should surface Thermodynamics projects.'
  },
  {
    sourceTagId: 'domain-mechanical-engineering',
    targetTagId: 'domain-fluid-dynamics',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Mechanical Engineering interest should surface Fluid Dynamics projects.'
  },
  {
    sourceTagId: 'domain-mechanical-engineering',
    targetTagId: 'domain-engineering-design',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Mechanical Engineering interest should surface Engineering Design projects.'
  },
  {
    sourceTagId: 'domain-electrical-engineering',
    targetTagId: 'domain-electronics',
    edgeWeight: 0.35,
    bidirectional: false,
    note: 'Broad Electrical Engineering interest should surface Electronics projects.'
  },
  {
    sourceTagId: 'domain-electrical-engineering',
    targetTagId: 'domain-signal-processing',
    edgeWeight: 0.33,
    bidirectional: false,
    note: 'Broad Electrical Engineering interest should surface Signal Processing projects.'
  },
  {
    sourceTagId: 'domain-electrical-engineering',
    targetTagId: 'domain-sensors',
    edgeWeight: 0.3,
    bidirectional: false,
    note: 'Broad Electrical Engineering interest should surface Sensors projects.'
  },
  {
    sourceTagId: 'domain-electrical-engineering',
    targetTagId: 'skill-embedded-systems',
    edgeWeight: 0.28,
    bidirectional: false,
    note: 'Broad Electrical Engineering interest should surface Embedded Systems work.'
  },
  {
    sourceTagId: 'domain-electrical-engineering',
    targetTagId: 'domain-radar-systems',
    edgeWeight: 0.25,
    bidirectional: false,
    note: 'Broad Electrical Engineering interest should surface Radar Systems projects.'
  },

  // Cybersecurity
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'skill-network-security',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Network security is a strong adjacent specialization within cybersecurity.'
  },
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'skill-application-security',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Application security is a strong adjacent specialization within cybersecurity.'
  },
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'skill-security-architecture',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Security architecture is a strong adjacent design-oriented area.'
  },
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'skill-security-monitoring',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Security monitoring is a practical adjacent operational skill.'
  },
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'skill-cloud-security',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Cloud security is a common adjacent area in modern cybersecurity work.'
  },
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'skill-container-security',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Container security is a moderate adjacent specialization.'
  },
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'domain-ai-security',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'AI security is a strong adjacent research area for cybersecurity.'
  },
  {
    sourceTagId: 'domain-cybersecurity',
    targetTagId: 'domain-privacy',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Privacy is a strong adjacent area to cybersecurity.'
  },
  {
    sourceTagId: 'domain-ai-security',
    targetTagId: 'domain-artificial-intelligence',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'AI security work often sits next to artificial intelligence projects.'
  },
  {
    sourceTagId: 'domain-ai-security',
    targetTagId: 'skill-machine-learning',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'AI security often intersects with machine learning techniques.'
  },

  // Signal processing / sensing / robotics
  {
    sourceTagId: 'domain-signal-processing',
    targetTagId: 'skill-digital-signal-processing',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Digital signal processing is a direct adjacent skill for signal processing work.'
  },
  {
    sourceTagId: 'domain-signal-processing',
    targetTagId: 'domain-radar-systems',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Radar systems work is strongly adjacent to signal processing.'
  },
  {
    sourceTagId: 'domain-signal-processing',
    targetTagId: 'domain-sensors',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Sensor systems often rely on signal processing.'
  },
  {
    sourceTagId: 'domain-sensors',
    targetTagId: 'skill-sensor-fabrication',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Sensor fabrication is a strong adjacent skill to sensor-focused projects.'
  },
  {
    sourceTagId: 'domain-sensors',
    targetTagId: 'skill-instrumentation',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Instrumentation is a practical adjacent skill for sensor work.'
  },
  {
    sourceTagId: 'domain-sensors',
    targetTagId: 'skill-calibration',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Calibration is a practical adjacent skill for sensors and measurement systems.'
  },
  {
    sourceTagId: 'skill-embedded-systems',
    targetTagId: 'domain-sensors',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Embedded systems projects often integrate sensor hardware.'
  },
  {
    sourceTagId: 'skill-embedded-systems',
    targetTagId: 'domain-electronics',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Embedded systems and electronics are strongly adjacent.'
  },
  {
    sourceTagId: 'domain-robotics',
    targetTagId: 'skill-ros',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'ROS is a strong adjacent skill for robotics projects.'
  },
  {
    sourceTagId: 'domain-robotics',
    targetTagId: 'domain-autonomous-vehicles',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Autonomous vehicles are a strong adjacent application area for robotics.'
  },
  {
    sourceTagId: 'domain-robotics',
    targetTagId: 'skill-machine-learning',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Machine learning is a moderate adjacent skill for robotics projects.'
  },
  {
    sourceTagId: 'domain-autonomous-vehicles',
    targetTagId: 'skill-computer-vision',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Computer vision is a common adjacent skill for autonomous vehicle work.'
  },
  {
    sourceTagId: 'skill-experimental-testing',
    targetTagId: 'skill-hardware-testing',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Experimental testing and hardware testing are closely adjacent lab skills.'
  },

  // Biomedical / clinical
  {
    sourceTagId: 'domain-biomedical-engineering',
    targetTagId: 'domain-medical-devices',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Medical devices are a strong adjacent area to biomedical engineering.'
  },
  {
    sourceTagId: 'domain-biomedical-engineering',
    targetTagId: 'domain-biosensors',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Biosensors are a strong adjacent area to biomedical engineering.'
  },
  {
    sourceTagId: 'domain-medical-devices',
    targetTagId: 'domain-biosensors',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Medical devices and biosensors are closely adjacent application areas.'
  },
  {
    sourceTagId: 'domain-medical-devices',
    targetTagId: 'domain-wearables',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Wearables are a strong adjacent application area for medical devices.'
  },
  {
    sourceTagId: 'domain-biosensors',
    targetTagId: 'skill-sensor-fabrication',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Sensor fabrication is a moderate adjacent skill for biosensor work.'
  },
  {
    sourceTagId: 'domain-biosensors',
    targetTagId: 'domain-electrochemistry',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Electrochemistry is a moderate adjacent area for many biosensor projects.'
  },
  {
    sourceTagId: 'domain-biostatistics',
    targetTagId: 'domain-public-health',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Biostatistics is strongly adjacent to public health research.'
  },
  {
    sourceTagId: 'domain-biostatistics',
    targetTagId: 'domain-bioinformatics',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Bioinformatics often overlaps with biostatistical analysis.'
  },
  {
    sourceTagId: 'domain-biomedical-sciences',
    targetTagId: 'domain-clinical-research',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Biomedical sciences and clinical research are strongly adjacent.'
  },
  {
    sourceTagId: 'domain-health-informatics',
    targetTagId: 'domain-clinical-research',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Health informatics is a moderate adjacent area for clinical research.'
  },
  {
    sourceTagId: 'domain-clinical-research',
    targetTagId: 'domain-translational-research',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Clinical research and translational research are closely adjacent.'
  },

  // Cancer / microbiology / drug discovery
  {
    sourceTagId: 'domain-cancer-biology',
    targetTagId: 'domain-cancer-therapeutics',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Cancer biology and cancer therapeutics are strongly adjacent research areas.'
  },
  {
    sourceTagId: 'domain-cancer-biology',
    targetTagId: 'domain-clinical-research',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Cancer biology often connects to clinical research programs.'
  },
  {
    sourceTagId: 'domain-drug-discovery',
    targetTagId: 'domain-medicinal-chemistry',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Medicinal chemistry is a strong adjacent area for drug discovery.'
  },
  {
    sourceTagId: 'domain-drug-discovery',
    targetTagId: 'domain-translational-research',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Drug discovery often feeds into translational research.'
  },
  {
    sourceTagId: 'domain-medicinal-chemistry',
    targetTagId: 'domain-organic-chemistry',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Organic chemistry is a strong adjacent foundation for medicinal chemistry.'
  },
  {
    sourceTagId: 'domain-medicinal-chemistry',
    targetTagId: 'domain-biochemistry',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Biochemistry is a moderate adjacent area for medicinal chemistry.'
  },
  {
    sourceTagId: 'domain-microbiology',
    targetTagId: 'domain-antibiotic-resistance',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Antibiotic resistance is a strong adjacent topic within microbiology research.'
  },
  {
    sourceTagId: 'domain-microbiology',
    targetTagId: 'domain-microbiome',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Microbiome work is strongly adjacent to microbiology.'
  },
  {
    sourceTagId: 'skill-histology',
    targetTagId: 'skill-lab-research',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Histology is a moderate adjacent wet-lab skill.'
  },

  // Environment / materials
  {
    sourceTagId: 'domain-environmental-science-and-policy',
    targetTagId: 'domain-environmental-monitoring',
    edgeWeight: 0.55,
    bidirectional: true,
    note: 'Environmental monitoring is a strong adjacent area for environmental science projects.'
  },
  {
    sourceTagId: 'domain-environmental-science-and-policy',
    targetTagId: 'domain-environmental-modeling',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Environmental modeling is a strong adjacent area for environmental systems work.'
  },
  {
    sourceTagId: 'domain-environmental-monitoring',
    targetTagId: 'domain-sensors',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Environmental monitoring often depends on sensing technologies.'
  },
  {
    sourceTagId: 'domain-bioremediation',
    targetTagId: 'domain-environmental-monitoring',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Bioremediation work often intersects with environmental monitoring.'
  },
  {
    sourceTagId: 'domain-bioremediation',
    targetTagId: 'domain-microbiology',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Bioremediation often relies on microbiological systems.'
  },
  {
    sourceTagId: 'domain-nanomaterials',
    targetTagId: 'domain-electrochemistry',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Nanomaterials and electrochemistry are moderately adjacent in materials research.'
  },

  // Neuroscience / mental health
  {
    sourceTagId: 'domain-neuroscience',
    targetTagId: 'domain-neurodegeneration',
    edgeWeight: 0.6,
    bidirectional: true,
    note: 'Neurodegeneration is a strong adjacent focus within neuroscience.'
  },
  {
    sourceTagId: 'domain-neurodegeneration',
    targetTagId: 'domain-inflammation',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Inflammation is a strong adjacent biological theme in neurodegeneration work.'
  },
  {
    sourceTagId: 'domain-neuroscience',
    targetTagId: 'domain-inflammation',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Inflammation is a moderate adjacent theme for neuroscience projects.'
  },
  {
    sourceTagId: 'domain-mental-health',
    targetTagId: 'domain-public-health',
    edgeWeight: 0.4,
    bidirectional: true,
    note: 'Mental health and public health are moderately adjacent population-level areas.'
  },

  // Education / student success
  {
    sourceTagId: 'domain-stem-education',
    targetTagId: 'domain-student-success',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Student success is a strong adjacent focus for STEM education projects.'
  },
  {
    sourceTagId: 'domain-stem-education',
    targetTagId: 'skill-program-evaluation',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Program evaluation is a common adjacent method in STEM education work.'
  },
  {
    sourceTagId: 'domain-student-success',
    targetTagId: 'skill-mentorship',
    edgeWeight: 0.45,
    bidirectional: true,
    note: 'Mentorship is a moderate adjacent practice area for student success work.'
  },
  {
    sourceTagId: 'domain-student-success',
    targetTagId: 'skill-survey-research',
    edgeWeight: 0.4,
    bidirectional: true,
    note: 'Survey research is a moderate adjacent method for student success studies.'
  },
  {
    sourceTagId: 'skill-program-evaluation',
    targetTagId: 'skill-survey-research',
    edgeWeight: 0.5,
    bidirectional: true,
    note: 'Survey research is a strong adjacent method for program evaluation.'
  }
];
