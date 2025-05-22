
import React, { useMemo, useState } from 'react';
import { ProductInfo, PriceInfo, ProductCondition, ProductConditionDescriptions, PriceDetail } from '../types';
import { ChecklistIcon, RefreshIcon, SearchIcon, ChevronDownIcon } from '../constants';

// FIX: Define the missing ValuationResultsScreenProps interface
interface ValuationResultsScreenProps {
  productInfo: ProductInfo;
  priceInfo: PriceInfo;
  onGenerateChecklist: () => void;
  onNewSearch: () => void;
}

interface ProductCategory {
  isTech: boolean;
  isApple?: boolean;
  isConsole?: boolean;
  isVideogame?: boolean;
  isPhotography?: boolean;
  isHighEnd?: boolean;
  description: string; // For explanation
}

const APPLE_KEYWORDS = ['iphone', 'ipad', 'macbook', 'imac', 'apple watch', 'airpods', 'mac mini', 'mac studio', 'homepod', 'ipod'];
const CONSOLE_KEYWORDS = ['playstation', 'ps3', 'ps4', 'ps5', 'xbox', 'nintendo switch', 'steam deck', 'consola'];
const VIDEOGAME_KEYWORDS = ['videojuego', 'juego para', 'edition', 'collector']; // Also check context with console
const PHOTOGRAPHY_KEYWORDS = ['cámara', 'camara', 'objetivo', 'lente', 'reflex', 'mirrorless', 'dslr', 'evil', 'sony alpha', 'canon eos', 'nikon d', 'fujifilm x', 'leica m', 'gopro'];
const HIGH_END_KEYWORDS = ['pro', 'max', 'ultra', 'elite', 'signature', 'hasselblad', 'bang & olufsen', 'devialet', 'sennheiser hd 8', 'astell&kern', 'leica s', 'leica sl'];
const GENERAL_TECH_KEYWORDS = [
  ...APPLE_KEYWORDS, ...CONSOLE_KEYWORDS, ...VIDEOGAME_KEYWORDS, ...PHOTOGRAPHY_KEYWORDS,
  'phone', 'móvil', 'celular', 'smartphone', 'galaxy', 'pixel', 'xiaomi', 'oppo', 'realme', 'vivo', 'oneplus',
  'portátil', 'laptop', 'notebook', 'chromebook', 'ultrabook', 'pc',
  'tablet', 'surface',
  'tv', 'televisor', 'smart tv', 'qled', 'oled',
  'auriculares', 'headphones', 'earbuds', 'cascos',
  'smartwatch', 'reloj inteligente', 'watch', 'wearable',
  'ordenador', 'computer', 'desktop', 'servidor', 'server',
  'monitor', 'pantalla',
  'altavoz inteligente', 'echo', 'google home', 'barra de sonido',
  'router', 'modem', 'wifi', 'access point',
  'drone', 'dron',
  'impresora', 'printer', 'escaner', 'scanner',
  'ebook', 'kindle', 'lector electrónico',
  'proyector',
  'tarjeta gráfica', 'gpu', 'cpu', 'procesador', 'ram', 'memoria', 'disco duro', 'ssd', 'placa base', 'motherboard',
  'teclado', 'ratón', 'mouse',
  'micrófono', 'webcam',
  'robot aspirador', 'robot de cocina'
];


const getProductCategory = (productName: string): ProductCategory => {
  if (!productName) return { isTech: false, description: "No Tecnológico" };
  const lowerProductName = productName.toLowerCase();

  let category: ProductCategory = { isTech: false, description: "No Tecnológico" };

  if (GENERAL_TECH_KEYWORDS.some(keyword => lowerProductName.includes(keyword))) {
    category.isTech = true;
    category.description = "Tecnológico (General)";

    if (APPLE_KEYWORDS.some(keyword => lowerProductName.includes(keyword))) {
      category.isApple = true;
      category.description = "Producto Apple";
    }
    // Check for high-end after Apple, as Apple can also be high-end
    if (HIGH_END_KEYWORDS.some(keyword => lowerProductName.includes(keyword))) {
      category.isHighEnd = true;
      category.description = category.isApple ? "Producto Apple (Alta Gama)" : "Tecnológico (Alta Gama)";
    }
    if (CONSOLE_KEYWORDS.some(keyword => lowerProductName.includes(keyword))) {
      // If it also contains videogame keywords, it might be a game bundle, but prioritize console.
      let isLikelyGame = VIDEOGAME_KEYWORDS.some(vgKeyword => lowerProductName.includes(vgKeyword));
      if (lowerProductName.includes("juego") && !isLikelyGame) isLikelyGame = true;

      if (isLikelyGame && !lowerProductName.includes("consola")) { // "Juego para PS5" vs "Consola PS5 con juego"
        category.isVideogame = true;
        category.description = "Videojuego";
      } else {
        category.isConsole = true;
        category.description = "Consola de Videojuegos";
      }
    }
    if (VIDEOGAME_KEYWORDS.some(keyword => lowerProductName.includes(keyword)) && !category.isConsole) {
      category.isVideogame = true;
      category.description = "Videojuego";
    }
    if (PHOTOGRAPHY_KEYWORDS.some(keyword => lowerProductName.includes(keyword))) {
      category.isPhotography = true;
      category.description = category.isHighEnd ? "Fotografía (Alta Gama)" : "Fotografía";
    }
  }
  return category;
};


const ValuationResultsScreen: React.FC<ValuationResultsScreenProps> = ({ 
  productInfo, 
  priceInfo, 
  onGenerateChecklist,
  onNewSearch
}) => {
  const productName = productInfo.manualName || productInfo.identifiedProduct?.name || "Producto Desconocido";
  const productCondition = productInfo.condition || ProductCondition.USED;
  const stockQuantity = productInfo.stockQuantity;
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  const PURCHASE_MARGIN_FACTOR = 0.6; 

  const { recommendedPurchasePrice, recommendationExplanation } = useMemo(() => {
    const category = getProductCategory(productName);
    let newNumericPrice = priceInfo.newPrice?.numericPrice;
    let isNewPriceEstimated = false;
    let explanation = `Producto: ${productName} (${category.description}).\n`;

    const platformPrices: number[] = [
      priceInfo.cashConverters?.numericPrice,
      priceInfo.cex?.numericPrice,
      priceInfo.backmarket?.numericPrice,
      priceInfo.wallapop?.numericPrice,
      priceInfo.milanuncios?.numericPrice,
      priceInfo.ebay?.numericPrice,
      priceInfo.gameStore?.numericPrice,
      priceInfo.priceCharting?.numericPrice,
      priceInfo.otherSource1?.numericPrice,
      priceInfo.otherSource2?.numericPrice,
    ].filter(p => typeof p === 'number' && p > 0) as number[];
    
    let averagePlatformPrice: number | undefined = undefined;
    if (platformPrices.length > 0) {
      averagePlatformPrice = platformPrices.reduce((sum, p) => sum + p, 0) / platformPrices.length;
    }

    if (!newNumericPrice || newNumericPrice <= 0) {
      if (averagePlatformPrice && averagePlatformPrice > 0) {
        const discountForGoodConditionFromNew = category.isVideogame ? 0.50 : (category.isApple || category.isHighEnd ? 0.25 : (category.isTech ? 0.32 : 0.50));
        newNumericPrice = averagePlatformPrice / (1 - discountForGoodConditionFromNew);
        isNewPriceEstimated = true;
        explanation += `Precio nuevo no disponible. Se estima un precio nuevo teórico de €${newNumericPrice.toFixed(2)} basado en el promedio de plataformas de 2ª mano (€${averagePlatformPrice.toFixed(2)}).\n`;
      } else {
        return {
          recommendedPurchasePrice: "N/A",
          recommendationExplanation: `No se dispone de precio nuevo ni suficientes precios de segunda mano para "${productName}" para calcular la recomendación. ${explanation}`,
        };
      }
    } else {
      explanation += `Precio nuevo base: €${newNumericPrice.toFixed(2)}.\n`;
    }

    let baseDiscountPercent: number;
    if (category.isVideogame) {
      baseDiscountPercent = 0.40; // Videogames depreciate fast from new, or rely on market price
    } else if (category.isApple || category.isHighEnd) {
      baseDiscountPercent = 0.12; // Retain value better
    } else if (category.isTech) { // Other tech (consoles, photo, general tech)
      baseDiscountPercent = 0.18;
    } else { // Non-tech
      baseDiscountPercent = 0.375;
    }
    
    let targetSecondHandAsNewPrice: number;
    if (category.isVideogame && averagePlatformPrice && averagePlatformPrice > 0) {
        // For videogames, if average platform price is available, it's a much better indicator for "As New" than a generic discount from new.
        targetSecondHandAsNewPrice = averagePlatformPrice; // Use market average as "as new" proxy
        explanation += `Para videojuegos, se usa el promedio de plataformas (€${averagePlatformPrice.toFixed(2)}) como base de venta "Como Nuevo".\n`;
    } else {
        targetSecondHandAsNewPrice = newNumericPrice * (1 - baseDiscountPercent);
        explanation += `Precio de venta objetivo (Como Nuevo) estimado: €${targetSecondHandAsNewPrice.toFixed(2)} (descuento del ${baseDiscountPercent * 100}% sobre precio ${isNewPriceEstimated ? 'nuevo estimado' : 'nuevo'}).\n`;
    }


    let currentConditionTargetSellPrice = targetSecondHandAsNewPrice;
    let conditionAdjustmentSellFactor = 1.0;

    if (productCondition === ProductCondition.GOOD_CONDITION) {
      conditionAdjustmentSellFactor = 0.80; 
      explanation += `Ajuste por estado 'Buen Estado': -20% sobre precio 'Como Nuevo'. `;
    } else if (productCondition === ProductCondition.USED) {
      conditionAdjustmentSellFactor = 0.60; 
      explanation += `Ajuste por estado 'Usado': -40% sobre precio 'Como Nuevo'. `;
    }
    currentConditionTargetSellPrice *= conditionAdjustmentSellFactor;

    if (conditionAdjustmentSellFactor !== 1.0) explanation += `Precio venta obj. (estado ${productCondition}): €${currentConditionTargetSellPrice.toFixed(2)}.\n`;
    else explanation += `El estado 'Como Nuevo' no requiere ajuste adicional.\n`;
    
    let effectiveTargetSellPrice = currentConditionTargetSellPrice;
    if (averagePlatformPrice && !category.isVideogame) { // For non-videogames, compare calculated with market
        explanation += `Precio promedio en plataformas de 2ª mano: €${averagePlatformPrice.toFixed(2)}.\n`;
        if (averagePlatformPrice < currentConditionTargetSellPrice * 0.75) { 
            effectiveTargetSellPrice = averagePlatformPrice;
            explanation += `El promedio de plataformas es notablemente inferior, se usa como precio de venta efectivo: €${effectiveTargetSellPrice.toFixed(2)}.\n`;
        } else {
            explanation += `El precio de venta objetivo calculado (€${currentConditionTargetSellPrice.toFixed(2)}) se considera razonable.\n`;
        }
    } else if (!averagePlatformPrice) {
        explanation += `No se encontraron suficientes precios en plataformas de 2ª mano para un ajuste comparativo.\n`;
    }
    
    let recommendedPriceBeforeStock = effectiveTargetSellPrice * PURCHASE_MARGIN_FACTOR;
    explanation += `Precio de compra recomendado (antes de ajuste stock): €${recommendedPriceBeforeStock.toFixed(2)} (margen del ${(1 - PURCHASE_MARGIN_FACTOR) * 100}% sobre venta efectiva).\n`;

    let stockAdjustmentFactor = 1.0;
    let stockExplanation = "";
    if (stockQuantity !== undefined && stockQuantity >= 4 && stockQuantity <= 10) {
      stockAdjustmentFactor = 0.9; 
      stockExplanation = `Ajuste por stock (${stockQuantity} uds): -10%.`;
    } else if (stockQuantity !== undefined && stockQuantity >= 11) {
      stockAdjustmentFactor = 0.8; 
      stockExplanation = `Ajuste por stock (${stockQuantity} uds): -20%.`;
    }

    const finalRecommendedPurchasePrice = recommendedPriceBeforeStock * stockAdjustmentFactor;
    if (stockAdjustmentFactor !== 1.0) {
      explanation += `${stockExplanation} Precio final recomendado: €${finalRecommendedPurchasePrice.toFixed(2)}.\n`;
    } else {
      explanation += `Sin ajuste por cantidad en stock. Precio final recomendado: €${finalRecommendedPurchasePrice.toFixed(2)}.\n`;
    }
    
    if (finalRecommendedPurchasePrice <=0 ) {
         return {
            recommendedPurchasePrice: "N/A",
            recommendationExplanation: `No se pudo calcular un precio de compra recomendado positivo. ${explanation}`
         };
    }

    return {
      recommendedPurchasePrice: finalRecommendedPurchasePrice.toFixed(2),
      recommendationExplanation: explanation
    };

  }, [productName, productCondition, priceInfo, stockQuantity]);

  const PriceCard: React.FC<{title: string; detail?: PriceDetail; defaultNote?: string}> = ({title, detail, defaultNote}) => {
    if (!detail || detail.price === "N/A" || detail.price === undefined) { // Added check for undefined price
      return null;
    }
    const displayPrice = detail.price;
    // Prioritize specificNote from detail, if it contains "Fuente:", use it as title. Otherwise, use given title.
    const cardTitle = detail.specificNote && detail.specificNote.toLowerCase().startsWith("fuente:") 
        ? detail.specificNote 
        : title;
    
    const noteToDisplay = detail.specificNote && !detail.specificNote.toLowerCase().startsWith("fuente:")
        ? detail.specificNote 
        : (!detail.specificNote && defaultNote ? defaultNote : "");


    return (
      <div className="bg-slate-700 p-4 rounded-lg shadow flex flex-col justify-between min-h-[120px]">
        <div>
          <h4 className="text-sm font-semibold text-indigo-400">{cardTitle}</h4>
          <p className="text-2xl font-bold text-white my-1">{displayPrice}</p>
          {noteToDisplay && <p className="text-xs text-slate-400 mt-1">{noteToDisplay}</p>}
        </div>
        {detail.sourceUrl && (
          <a 
            href={detail.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center text-xs text-indigo-400 hover:text-indigo-300 hover:underline bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded self-start"
          >
            <SearchIcon className="w-3 h-3 mr-1" />
            Verificar Fuente
          </a>
        )}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">Resultados de Valoración</h2>

      <div className="bg-slate-800 p-6 rounded-lg shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {productInfo.userImage && (
            <img 
              src={`data:image/jpeg;base64,${productInfo.userImage}`} 
              alt="Producto" 
              className="w-32 h-32 object-cover rounded-lg shadow-md flex-shrink-0"
            />
          )}
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-semibold text-white">{productName}</h3>
            <p className="text-md text-slate-300">Estado: <span className="font-medium text-indigo-400">{productCondition} ({ProductConditionDescriptions[productCondition]})</span></p>
            {stockQuantity !== undefined && (
              <p className="text-md text-slate-300">Cantidad en stock: <span className="font-medium text-indigo-400">{stockQuantity}</span></p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-xl mb-8">
        <h3 className="text-xl font-semibold mb-4 text-slate-200">Valoración del Producto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriceCard title="Precio Nuevo Estimado" detail={priceInfo.newPrice} defaultNote="Promedio tiendas online" />
          <PriceCard title="Cash Converters" detail={priceInfo.cashConverters} />
          <PriceCard title="CEX" detail={priceInfo.cex} />
          <PriceCard title="Backmarket" detail={priceInfo.backmarket} defaultNote={`Precio para estado: ${productCondition}`} />
          <PriceCard title="Wallapop" detail={priceInfo.wallapop} />
          <PriceCard title="Milanuncios" detail={priceInfo.milanuncios} />
          <PriceCard title="eBay" detail={priceInfo.ebay} />
          <PriceCard title="GAME" detail={priceInfo.gameStore} />
          <PriceCard title="PriceCharting" detail={priceInfo.priceCharting} />
          <PriceCard title="Otra Fuente 1" detail={priceInfo.otherSource1} />
          <PriceCard title="Otra Fuente 2" detail={priceInfo.otherSource2} />
        </div>
        {priceInfo.sources && priceInfo.sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Fuentes Generales Consultadas (Google Search):</h4>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
              {priceInfo.sources.map((source, index) => source.web && (
                <li key={index}>
                  <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 underline">
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              ))}
            </ul>
             <p className="text-xs text-slate-500 mt-2 italic">Nota: Los enlaces 'Verificar Fuente' en cada tarjeta de precio (si están disponibles) apuntan a fuentes específicas para ese precio si la IA pudo identificarlas. Las fuentes generales anteriores son las páginas consultadas por la IA para su análisis global.</p>
          </div>
        )}
      </div>
      
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-lg shadow-2xl mb-8 text-white">
        <h3 className="text-2xl font-bold mb-3 text-center">Precio de Compra Recomendado</h3>
        <p className="text-6xl font-extrabold text-center my-4">
           €{recommendedPurchasePrice}
        </p>
        <button 
          onClick={() => setShowCalculationDetails(!showCalculationDetails)}
          className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-200 hover:text-white bg-black bg-opacity-10 hover:bg-opacity-20 p-2 rounded-md mb-2 transition-colors"
          aria-expanded={showCalculationDetails}
          aria-controls="calculation-details"
        >
          Detalle del cálculo
          <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${showCalculationDetails ? 'rotate-180' : ''}`} />
        </button>
        {showCalculationDetails && (
          <p id="calculation-details" className="text-xs text-left text-slate-200 px-1 whitespace-pre-line bg-black bg-opacity-20 p-3 rounded">
            {recommendationExplanation}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onGenerateChecklist}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition duration-150"
        >
          <ChecklistIcon className="mr-2" /> Generar Checklist de Funcionamiento
        </button>
        <button
          onClick={onNewSearch}
          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition duration-150"
        >
          <RefreshIcon className="mr-2" /> Realizar Nueva Búsqueda
        </button>
      </div>
    </div>
  );
};

export default ValuationResultsScreen;