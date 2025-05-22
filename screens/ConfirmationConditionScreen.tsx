import React, { useState, useEffect } from 'react';
import { ProductInfo, ProductCondition, ProductConditionDescriptions } from '../types';
import { CheckIcon, PencilIcon, SearchIcon, InfoIcon } from '../constants';

interface ConfirmationConditionScreenProps {
  productInfo: ProductInfo;
  onConfirmAndPriceSearch: (finalProductName: string, condition: ProductCondition, stockQuantity?: number) => void;
  onBackToCapture: () => void;
}

const ConfirmationConditionScreen: React.FC<ConfirmationConditionScreenProps> = ({ 
  productInfo, 
  onConfirmAndPriceSearch,
  onBackToCapture 
}) => {
  const [currentProductName, setCurrentProductName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | undefined>(productInfo.condition);
  const [stockQuantity, setStockQuantity] = useState<number | string>(0); // Default stock quantity to 0

  useEffect(() => {
    const initialName = productInfo.manualName || productInfo.identifiedProduct?.name || "";
    setCurrentProductName(initialName);
    
    if (productInfo.manualName === "" && !productInfo.userImage && !productInfo.identifiedProduct?.name) {
      setIsEditingName(true);
    } else if (!initialName && (productInfo.userImage || productInfo.identifiedProduct)) {
      setIsEditingName(true); 
    }
    else {
      setIsEditingName(false); 
    }

    if (productInfo.stockQuantity !== undefined) {
      setStockQuantity(productInfo.stockQuantity);
    } else {
      setStockQuantity(0); // Ensure it's 0 if not provided
    }
  }, [productInfo]);

  const handleConfirmProduct = () => {
    setIsEditingName(false);
  };
  
  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProductName(e.target.value);
  };

  const handleSubmit = () => {
    if (currentProductName && selectedCondition) {
      const finalStockQuantity = stockQuantity === "" || isNaN(parseInt(String(stockQuantity))) ? 0 : parseInt(String(stockQuantity), 10);
      onConfirmAndPriceSearch(currentProductName, selectedCondition, finalStockQuantity);
    }
  };
  
  let productPromptText = "Por favor, ingresa el nombre del producto:";
  if (currentProductName) {
    if (productInfo.userImage || productInfo.identifiedProduct?.name) { 
      productPromptText = "Hemos reconocido este producto como:";
    } else { 
      productPromptText = "El producto ingresado/corregido es:";
    }
  }

  const stockImageUrlToShow = productInfo.identifiedProduct?.stockImageUrl && productInfo.identifiedProduct?.name === currentProductName 
    ? productInfo.identifiedProduct.stockImageUrl 
    : undefined;

  const canProceedToPriceSearch = currentProductName && selectedCondition && !isEditingName;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <button onClick={onBackToCapture} className="mb-6 text-indigo-400 hover:text-indigo-300">&larr; Volver a capturar</button>
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">Confirmación y Estado del Producto</h2>

      <div className="bg-slate-800 p-6 rounded-lg shadow-xl mb-8">
        <h3 className="text-xl font-semibold mb-4 text-slate-200">Producto Detectado</h3>
        {productInfo.userImage && (
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-1">Foto tomada:</p>
            <img src={`data:image/jpeg;base64,${productInfo.userImage}`} alt="Producto capturado" className="rounded-md max-h-60 w-auto mx-auto shadow-md" />
          </div>
        )}

        {!isEditingName ? (
          <div className="mb-4 p-3 bg-slate-700 rounded">
            <p className="text-slate-300">
              {productPromptText}
            </p>
            <p className="text-lg font-semibold text-indigo-300 my-1">
              {currentProductName || "Producto no identificado"}
            </p>
            {stockImageUrlToShow && (
              <img src={stockImageUrlToShow} alt="Stock del producto" className="mt-2 rounded max-h-40 w-auto mx-auto" />
            )}
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="productName" className="block text-sm font-medium text-slate-300 mb-1">
              Nombre del producto:
            </label>
            <input
              type="text"
              id="productName"
              value={currentProductName}
              onChange={handleNameChange}
              placeholder="Ej: iPhone 13 Pro, Taladro Bosch XYZ"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
              aria-describedby="productNameHelp"
            />
            {!currentProductName && (
                 <p id="productNameHelp" className="mt-2 text-xs text-yellow-400">
                    Por favor, ingresa un nombre para el producto.
                 </p>
            )}
          </div>
        )}
        
        <div className="flex space-x-3">
          {!isEditingName && productInfo.identifiedProduct?.name && productInfo.identifiedProduct.name === currentProductName && (
             <button 
                onClick={handleConfirmProduct} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition duration-150"
              >
                <CheckIcon className="mr-2" /> Sí, es correcto
              </button>
          )}
          <button 
            onClick={isEditingName ? handleConfirmProduct : handleEditName}
            disabled={isEditingName && !currentProductName} 
            className={`flex-1 ${isEditingName ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <PencilIcon className="mr-2" /> {isEditingName ? "Confirmar Nombre" : (productInfo.identifiedProduct?.name ? "Corregir Nombre" : "Ingresar Manualmente")}
          </button>
        </div>
      </div>

      {!isEditingName && currentProductName && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold mb-1 text-slate-200">Estado del Producto</h3>
          <p className="text-sm text-slate-400 mb-4">Indica el estado en el que se encuentra:</p>
          <div className="space-y-3">
            {(Object.keys(ProductConditionDescriptions) as ProductCondition[]).map((conditionKey) => (
              <button
                key={conditionKey}
                onClick={() => setSelectedCondition(conditionKey)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-150
                  ${selectedCondition === conditionKey ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-700 border-slate-600 hover:border-indigo-500 hover:bg-slate-600 text-slate-300'}`}
              >
                <p className="font-semibold">{conditionKey}</p>
                <p className="text-xs opacity-90">{ProductConditionDescriptions[conditionKey]}</p>
              </button>
            ))}
          </div>
          
          {/* Stock Quantity Input - Appears after condition is selected */}
          {selectedCondition && (
            <div className="mt-6">
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-slate-300 mb-1">
                Cantidad en stock:
              </label>
              <input
                type="number"
                id="stockQuantity"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      )}

      {canProceedToPriceSearch && (
        <button
          onClick={handleSubmit}
          className="mt-8 w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition duration-150 ease-in-out"
        >
          <SearchIcon className="mr-2" /> Buscar Precios y Generar Estimación
        </button>
      )}
       {isEditingName && !currentProductName && ( 
         <div className="mt-4 p-3 bg-yellow-800 border border-yellow-600 text-yellow-100 rounded-md flex items-center">
            <InfoIcon className="w-5 h-5 mr-2 shrink-0" />
            <span>Por favor, ingresa un nombre para el producto para continuar.</span>
          </div>
       )}
    </div>
  );
};

export default ConfirmationConditionScreen;