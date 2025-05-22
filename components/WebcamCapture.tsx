
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CameraIcon } from '../constants';

interface WebcamCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCameraError: (error: string) => void;
  instructions: string;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onCameraError, instructions }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{width: number, height: number} | null>(null);


  const startCamera = useCallback(async () => {
    setIsCameraInitializing(true);
    onCameraError(""); // Clear previous errors
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const streamAttempt = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .catch(async (envError) => {
            console.warn("Environment camera failed, trying user camera:", envError);
            // Only try user camera if it's not a permission error or a specific overconstrained error
            if (envError.name !== "NotAllowedError" && envError.name !== "NotFoundErrorOverconstrained") {
                 return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            }
            throw envError; 
          });
        
        if (videoRef.current) {
          videoRef.current.srcObject = streamAttempt;
          setStream(streamAttempt);
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              setVideoDimensions({width: videoRef.current.videoWidth, height: videoRef.current.videoHeight});
            }
            setIsCameraInitializing(false);
          };
        }
      } else {
        throw new Error('getUserMedia no está soportado en este navegador.');
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      let message = 'Error al acceder a la cámara.';
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          message = "Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en los ajustes de tu navegador.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "No se encontró ninguna cámara. Asegúrate de que una cámara esté conectada y habilitada.";
        } else {
          message = `Error de cámara: ${err.message}`;
        }
      }
      onCameraError(message);
      setIsCameraInitializing(false);
    }
  }, [onCameraError]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoHeight; // Canvas width is video's original height (for portrait capture)
      canvas.height = video.videoWidth;  // Canvas height is video's original width
      
      const context = canvas.getContext('2d');
      if (context) {
        context.translate(canvas.width, 0); 
        context.rotate(Math.PI / 2); // 90 degrees clockwise
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg'); 
        onCapture(dataUrl.split(',')[1]); 
      }
    }
  };
  
  // Container aspect ratio should be landscape (original video aspect ratio)
  const containerAspectRatio = videoDimensions 
    ? videoDimensions.width / videoDimensions.height 
    : 4/3; // Default to 4:3 (landscape) if dimensions not yet known

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-lg mx-auto">
      <div 
        className="w-full bg-slate-800 rounded-lg overflow-hidden shadow-lg relative"
        // Use landscape aspect ratio for the container
        style={{ aspectRatio: `${videoDimensions ? videoDimensions.width : 4}/${videoDimensions ? videoDimensions.height : 3}` }}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          // Use object-contain to fit the rotated video within the landscape element bounds
          className="w-full h-full object-contain origin-center" 
          style={{ transform: 'rotate(90deg)'}} // Rotate video content
        />
        {isCameraInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-white text-lg">Iniciando cámara...</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <p className="text-sm text-slate-400 text-center px-4">{instructions}</p>
      <button
        onClick={handleCapture}
        disabled={isCameraInitializing || !stream}
        className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CameraIcon className="mr-2" />
        Tomar Foto del Producto
      </button>
    </div>
  );
};

export default WebcamCapture;
