import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { APP_TITLE } from '../constants';
import { IdentifiedProduct } from '../types';

interface ProductCaptureScreenProps {
  onProductIdentified: (image: string, product: IdentifiedProduct) => void;
  onManualSearch: () => void;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
  identifyProductApi: (imageBase64: string) => Promise<IdentifiedProduct>;
}

const ProductCaptureScreen: React.FC<ProductCaptureScreenProps> = ({ 
  onProductIdentified, 
  onManualSearch,
  setLoading,
  setError,
  clearError,
  identifyProductApi
}) => {
  const [cameraError, setCameraError] = useState<string>("");

  const handleCapture = async (imageBase64: string) => {
    clearError();
    setLoading(true, "Identificando producto...");
    setCameraError("");
    try {
      const product = await identifyProductApi(imageBase64);
      onProductIdentified(imageBase64, product);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error desconocido al identificar producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraError = (errorMsg: string) => {
    setCameraError(errorMsg);
    setError(errorMsg); // Also set global error if needed
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-10 md:pt-16">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 mb-8">
        {APP_TITLE}
      </h1>
      
      {cameraError && (
         <div className="mb-4 p-4 bg-red-700 border border-red-500 text-white rounded-md w-full max-w-lg text-center">
           <p className="font-semibold">Error de Cámara</p>
           <p>{cameraError}</p>
           {cameraError.includes("Permiso") && <p className="mt-2 text-sm">Por favor, revisa los permisos de la cámara en tu navegador y recarga la página.</p>}
         </div>
      )}

      {!cameraError.includes("Permiso denegado") && !cameraError.includes("No se encontró") && (
        <WebcamCapture
          onCapture={handleCapture}
          onCameraError={handleCameraError}
          instructions="Encuadra bien tu producto y asegúrate de que haya buena iluminación."
        />
      )}
      
      <div className="mt-6 w-full max-w-lg">
        <button
          onClick={onManualSearch}
          className="w-full text-center py-2 px-4 text-indigo-400 hover:text-indigo-300 hover:underline transition duration-150"
        >
          O buscar producto manualmente
        </button>
      </div>
    </div>
  );
};

export default ProductCaptureScreen;