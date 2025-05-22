import React, { useState, useCallback } from 'react';
import { AppStep, ProductInfo, PriceInfo, Checklist, IdentifiedProduct, ProductCondition } from './types';
import ProductCaptureScreen from './screens/ProductCaptureScreen';
import ConfirmationConditionScreen from './screens/ConfirmationConditionScreen';
import ValuationResultsScreen from './screens/ValuationResultsScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import Footer from './components/Footer';
import LoadingIndicator from './components/LoadingIndicator';
import { identifyProduct as identifyProductApi, searchPrices as searchPricesApi, generateChecklist as generateChecklistApi } from './services/geminiService';
import { InfoIcon } from './constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.CAPTURE);
  const [productInfo, setProductInfo] = useState<ProductInfo>({});
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Cargando...");
  const [error, setError] = useState<string>("");

  const handleSetLoading = (loading: boolean, message?: string) => {
    setIsLoading(loading);
    if (message) setLoadingMessage(message);
  };

  const handleSetError = (errorMessage: string) => {
    setError(errorMessage);
  };
  
  const clearError = () => setError("");

  const resetState = useCallback(() => {
    setProductInfo({});
    setPriceInfo(null);
    setChecklist(null);
    setCurrentStep(AppStep.CAPTURE);
    setIsLoading(false);
    setError("");
  }, []);

  const handleProductIdentified = (image: string, identifiedProd: IdentifiedProduct) => {
    setProductInfo({ 
      userImage: image, 
      identifiedProduct: identifiedProd, 
      manualName: undefined, 
      condition: undefined,
      stockQuantity: 0 // Initialize stockQuantity to 0
    });
    setCurrentStep(AppStep.CONFIRM_CONDITION);
  };

  const handleManualSearch = () => {
    setProductInfo({ 
      userImage: undefined, 
      identifiedProduct: undefined, 
      manualName: "", 
      condition: undefined,
      stockQuantity: 0 // Initialize stockQuantity to 0
    }); 
    setCurrentStep(AppStep.CONFIRM_CONDITION);
  };

  const handleConfirmAndPriceSearch = async (finalProductName: string, condition: ProductCondition, stockQty?: number) => {
    setProductInfo(prev => ({ ...prev, manualName: finalProductName, condition, stockQuantity: stockQty === undefined ? 0 : stockQty }));
    setIsLoading(true);
    setLoadingMessage("Buscando precios...");
    setError("");
    try {
      const prices = await searchPricesApi(finalProductName, condition);
      setPriceInfo(prices);
      setCurrentStep(AppStep.RESULTS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error desconocido al buscar precios.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateChecklist = async () => {
    const productName = productInfo.manualName || productInfo.identifiedProduct?.name;
    if (!productName) {
      setError("Nombre de producto no disponible para generar checklist.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage("Generando checklist...");
    setError("");
    try {
      const cl = await generateChecklistApi(productName);
      setChecklist(cl);
      setCurrentStep(AppStep.CHECKLIST);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error desconocido al generar checklist.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case AppStep.CAPTURE:
        return (
          <ProductCaptureScreen
            onProductIdentified={handleProductIdentified}
            onManualSearch={handleManualSearch}
            setLoading={handleSetLoading}
            setError={handleSetError}
            clearError={clearError}
            identifyProductApi={identifyProductApi}
          />
        );
      case AppStep.CONFIRM_CONDITION:
        return (
          <ConfirmationConditionScreen
            productInfo={productInfo}
            onConfirmAndPriceSearch={handleConfirmAndPriceSearch}
            onBackToCapture={resetState}
          />
        );
      case AppStep.RESULTS:
        if (!priceInfo) {
          setError("Datos de precios no disponibles. Por favor, intenta de nuevo.");
          setCurrentStep(AppStep.CONFIRM_CONDITION); 
          return null;
        }
        return (
          <ValuationResultsScreen
            productInfo={productInfo} // Pass full productInfo
            priceInfo={priceInfo}
            onGenerateChecklist={handleGenerateChecklist}
            onNewSearch={resetState}
          />
        );
      case AppStep.CHECKLIST:
        if (!checklist) {
          setError("Checklist no disponible. Por favor, intenta de nuevo.");
          setCurrentStep(AppStep.RESULTS); 
          return null;
        }
        return (
          <ChecklistScreen
            productInfo={productInfo}
            checklist={checklist}
            onNewSearch={resetState}
          />
        );
      default:
        return <p>Estado desconocido</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {isLoading && <LoadingIndicator message={loadingMessage} fullScreen />}
      {error && (
        <div className="fixed top-4 right-4 z-[100] bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-md flex items-start">
          <InfoIcon className="w-5 h-5 mr-3 mt-1 shrink-0" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={clearError} className="ml-4 text-xl font-bold">&times;</button>
        </div>
      )}
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
        {renderStep()}
      </main>
      {currentStep === AppStep.CAPTURE && <Footer />}
    </div>
  );
};

export default App;