// TF.js MoveNet Integration for COACHYAT

let detector;
let videoElement;
let canvasElement;
let ctx;
let animationId;
let repCount = 0;
let isSquatDown = false;

// Initialize camera and model
async function initAiCamera() {
  const statusEl = document.getElementById('ai-status');
  videoElement = document.getElementById('ai-video');
  canvasElement = document.getElementById('ai-canvas');
  ctx = canvasElement.getContext('2d');
  repCount = 0;
  isSquatDown = false;
  document.getElementById('ai-rep-counter').innerText = '0';

  try {
    statusEl.innerText = "Accès à la caméra...";
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 }
    });
    videoElement.srcObject = stream;
    
    // Wait for video to load
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });

    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    statusEl.innerText = "Chargement de l'IA (MoveNet)...";
    
    // Load MoveNet model
    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    statusEl.innerText = "Prêt. Place-toi face à la caméra !";
    setTimeout(() => { statusEl.style.display = 'none'; }, 2000);

    // Start detection loop
    detectPose();
  } catch (err) {
    console.error(err);
    statusEl.innerText = "Erreur caméra ou modèle.";
    statusEl.style.borderColor = "var(--red)";
  }
}

async function detectPose() {
  if (!detector || !videoElement || videoElement.paused) return;

  const poses = await detector.estimatePoses(videoElement);
  
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  if (poses.length > 0) {
    const keypoints = poses[0].keypoints;
    drawKeypoints(keypoints);
    drawSkeleton(keypoints);
    analyzeSquat(keypoints);
  }

  animationId = requestAnimationFrame(detectPose);
}

function drawKeypoints(keypoints) {
  for (let i = 0; i < keypoints.length; i++) {
    const kp = keypoints[i];
    if (kp.score > 0.3) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#B6FF3B'; // Neon Green
      ctx.fill();
    }
  }
}

function drawSkeleton(keypoints) {
  const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(182, 255, 59, 0.7)'; // Neon green lines
  
  adjacentKeyPoints.forEach((pair) => {
    const kp1 = keypoints[pair[0]];
    const kp2 = keypoints[pair[1]];
    
    if (kp1.score > 0.3 && kp2.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
}

function analyzeSquat(keypoints) {
  // Simple heuristic for Squat using hips and knees y-coordinates
  const leftHip = keypoints.find(k => k.name === 'left_hip');
  const leftKnee = keypoints.find(k => k.name === 'left_knee');
  
  if (leftHip && leftKnee && leftHip.score > 0.3 && leftKnee.score > 0.3) {
    // If hip is lower than knee (or very close), we are down
    if (leftHip.y > leftKnee.y - 20) {
      if (!isSquatDown) {
        isSquatDown = true;
      }
    } else {
      // We stand up
      if (isSquatDown) {
        isSquatDown = false;
        repCount++;
        document.getElementById('ai-rep-counter').innerText = repCount;
        
        // Haptic feedback & Voice
        if (navigator.vibrate) navigator.vibrate(50);
        speakRep(repCount);
      }
    }
  }
}

function speakRep(num) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(num.toString());
    utter.rate = 1.2;
    window.speechSynthesis.speak(utter);
  }
}

function startAiCamera() {
  document.getElementById('overlay-camera').classList.remove('hidden');
  document.getElementById('ai-status').style.display = 'inline-block';
  document.getElementById('ai-status').innerText = 'Démarrage...';
  initAiCamera();
}

function stopAiCamera() {
  document.getElementById('overlay-camera').classList.add('hidden');
  if (animationId) cancelAnimationFrame(animationId);
  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(t => t.stop());
  }
}
