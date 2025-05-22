import React from 'react';
import { ProductInfo, Checklist } from '../types';
import { RefreshIcon } from '../constants';

interface ChecklistScreenProps {
  productInfo: ProductInfo;
  checklist: Checklist;
  onNewSearch: () => void;
}

const ChecklistScreen: React.FC<ChecklistScreenProps> = ({ productInfo, checklist, onNewSearch }) => {
  const productName = productInfo.manualName || productInfo.identifiedProduct?.name || "Producto Desconocido";

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h2 className="text-3xl font-bold mb-2 text-center text-indigo-400">Checklist de Funcionamiento</h2>
      <p className="text-xl text-slate-300 mb-6 text-center">para: <span className="font-semibold text-white">{productName}</span></p>

      <div className="bg-slate-800 p-6 rounded-lg shadow-xl mb-8">
        {Object.keys(checklist).length > 0 ? (
          Object.entries(checklist).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xl font-semibold text-indigo-300 mb-3 border-b-2 border-slate-700 pb-2">{category}</h3>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="flex items-center p-3 bg-slate-700 rounded-md">
                    <input 
                      id={`checklist-${category}-${index}`} 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-slate-600 mr-3 shrink-0" 
                    />
                    <label htmlFor={`checklist-${category}-${index}`} className="text-slate-200 text-sm">{item}</label>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center py-8">No se pudo generar un checklist para este producto.</p>
        )}
      </div>

      <button
        onClick={onNewSearch}
        className="w-full flex items-center justify-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
      >
        <RefreshIcon className="mr-2" /> Realizar Nueva Búsqueda
      </button>
    </div>
  );
};

export default ChecklistScreen;