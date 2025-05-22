import { GoogleGenAI, GenerateContentResponse, Part, GenerateContentParameters, Content } from "@google/genai";
import { PriceInfo, Checklist, IdentifiedProduct, ProductCondition, GroundingSource, PriceDetail } from '../types';
import { GEMINI_MULTIMODAL_MODEL, GEMINI_TEXT_MODEL } from "../constants";

// Ensure API_KEY is available from environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

function parseJsonFromText(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    throw new Error("La respuesta del servicio no pudo ser procesada como JSON.");
  }
}

// Helper to attempt to parse a numeric price from a string like "€XXX.YY" or "XXX"
const parseNumericPrice = (priceString?: string): number | undefined => {
    if (!priceString || typeof priceString !== 'string' || priceString.toLowerCase() === 'n/a') {
      return undefined;
    }
    // Remove currency symbols, thousands separators, and keep only numbers and decimal point
    const cleanedString = priceString.replace(/[€$£RpRs¥元\s]/g, '').replace(',', '.');
    const numericVal = parseFloat(cleanedString);
    return isNaN(numericVal) ? undefined : numericVal;
};


export const identifyProduct = async (imageBase64: string): Promise<IdentifiedProduct> => {
  try {
    const imagePart: Part = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };
    const textPart: Part = {
      text: `Identifica el producto en esta imagen. Proporciona su nombre común. Ejemplo de respuesta: {"name": "iPhone 13 Pro", "stockImageUrl": "https://example.com/iphone13pro.jpg"}. Si no puedes determinar una URL de imagen de stock, omite la propiedad stockImageUrl. Responde solo con el JSON.`,
    };

    const contents: Content = { parts: [imagePart, textPart] };
    const params: GenerateContentParameters = {
        model: GEMINI_MULTIMODAL_MODEL,
        contents: contents,
        config: { responseMimeType: "application/json" }
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent(params);
    const parsed = parseJsonFromText(response.text);

    if (parsed && typeof parsed.name === 'string') {
      return {
        name: parsed.name,
        stockImageUrl: typeof parsed.stockImageUrl === 'string' ? parsed.stockImageUrl : undefined,
      };
    }
    throw new Error("Producto no reconocido o formato de respuesta inesperado.");

  } catch (error) {
    console.error("Error identifying product:", error);
    throw new Error("Error al identificar el producto. Inténtalo de nuevo.");
  }
};

export const searchPrices = async (productName: string, condition: ProductCondition): Promise<PriceInfo> => {
  const prompt = `
Busca precios actuales para un "${productName}" en estado "${condition}".
Necesito la siguiente información en formato JSON. Para cada plataforma, proporciona:
- "price": El precio como string (ej: "€XXX", "N/A" si no se encuentra). Para Wallapop y Milanuncios, dame el precio individual más bajo estimado para el estado "${condition}", no un rango.
- "numericPrice": El precio como número (ej: XXX, 0 o nulo si no es aplicable/encontrado).
- "sourceUrl": (Opcional) Si encuentras un enlace directo a la página del producto o una página de búsqueda relevante en la plataforma específica donde encontraste ese precio, inclúyelo. Si no, omite esta clave o déjala nula.
- "specificNote": (Opcional) Una nota breve sobre el precio (ej: "Para estado '${condition}'", "Basado en X anuncios", "Fuente: eBay").

Plataformas principales a consultar (intenta obtener precios de estas primero):
1.  Precio nuevo promedio en tiendas online (clave: "newPrice").
2.  Cash Converters (clave: "cashConverters").
3.  CEX (clave: "cex").
4.  Backmarket (clave: "backmarket").
5.  Wallapop (clave: "wallapop").
6.  Milanuncios (clave: "milanuncios").

Si no encuentras precios suficientes o relevantes en las plataformas principales (especialmente si faltan datos de Wallapop, Milanuncios o plataformas de segunda mano), puedes consultar adicionalmente HASTA DOS de las siguientes fuentes alternativas para completar la información. Indica claramente en "specificNote" de qué fuente alternativa proviene el precio si la clave JSON no es específica (ej., para "otherSource1").
Fuentes alternativas:
- eBay (clave preferida: "ebay")
- GAME (tienda de videojuegos, España) (clave preferida: "gameStore")
- PriceCharting (especialmente para videojuegos y coleccionables) (clave preferida: "priceCharting")
- Tiendas de segunda mano genéricas online (usa claves "otherSource1", "otherSource2" e indica la tienda en "specificNote").

Por favor, considera las siguientes guías de estado al buscar precios:
- CEX (guía: https://es.support.webuy.com/support/solutions/articles/43000073240--c%C3%B3mo-clasifica-cex-los-art%C3%ADculos-).
- Backmarket (guía: https://help.backmarket.com/hc/es/articles/360026656634--Cu%C3%A1l-ser%C3%A1-el-estado-del-dispositivo-que-reciba): Es crucial que el precio para Backmarket sea específico para el estado "${condition}".
- Cash Converters (guía: https://www.cashconverters.es/es/es/oportunidades/nosotros/guia-estados-de-producto/).

Si alguna información no está disponible, usa "N/A" para "price", y nulo o 0 para "numericPrice".
Asegúrate de que la respuesta sea únicamente el objeto JSON.

Ejemplo de respuesta (incluyendo posibles fuentes alternativas):
{
  "newPrice": { "price": "€799", "numericPrice": 799, "specificNote": "Promedio tiendas online" },
  "cashConverters": { "price": "€450", "numericPrice": 450, "sourceUrl": "https://cashconverters.es/...", "specificNote": "Precio orientativo para '${condition}'" },
  "cex": { "price": "€500", "numericPrice": 500, "sourceUrl": "https://webuy.com/...", "specificNote": "Para estado '${condition}'" },
  "backmarket": { "price": "N/A", "numericPrice": null },
  "wallapop": { "price": "€480", "numericPrice": 480 },
  "milanuncios": { "price": "N/A", "numericPrice": null },
  "ebay": { "price": "€470", "numericPrice": 470, "sourceUrl": "https://ebay.es/...", "specificNote": "Precio más bajo encontrado en eBay para '${condition}'" },
  "gameStore": { "price": "€55", "numericPrice": 55, "sourceUrl": "https://game.es/...", "specificNote": "Juego '${productName}' para '${condition}' en GAME" }
}
`;

  try {
    const params: GenerateContentParameters = {
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    };

    const response: GenerateContentResponse = await ai.models.generateContent(params);
    const parsedRaw = parseJsonFromText(response.text) as Partial<Record<keyof Omit<PriceInfo, 'sources'>, PriceDetail>>;

    // Post-process to ensure numericPrice is derived if not directly provided by AI
    const processedData: PriceInfo = {};
    for (const key in parsedRaw) {
      if (Object.prototype.hasOwnProperty.call(parsedRaw, key)) {
        const detailKey = key as keyof Omit<PriceInfo, 'sources'>;
        const detail = parsedRaw[detailKey];
        if (detail) {
          processedData[detailKey] = {
            ...detail,
            numericPrice: detail.numericPrice !== undefined ? detail.numericPrice : parseNumericPrice(detail.price),
          };
        }
      }
    }
    
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web?.uri).map(chunk => ({web: chunk.web})) || [];
    processedData.sources = sources;
    
    return processedData;

  } catch (error) {
    console.error("Error searching prices:", error);
    throw new Error("Error al buscar precios. Inténtalo de nuevo.");
  }
};

export const generateChecklist = async (productName: string): Promise<Checklist> => {
  const prompt = `
Genera un checklist de funcionamiento conciso para un "${productName}".
Enfócate en comprobaciones comunes para este tipo de producto.
Si es un dispositivo electrónico, incluye verificaciones de encendido, pantalla (si aplica), botones, puertos y batería (si aplica).
Para aspectos físicos, incluye el estado de la pantalla (si existe), carcasa y signos de daño.
Estructura la salida como un objeto JSON con categorías como claves y un array de ítems de verificación (strings) como valores.
Ejemplo de respuesta:
{
  "Aspecto Físico": ["Pantalla sin arañazos profundos", "Carcasa sin golpes ni fisuras", "Lentes de cámara limpias (si aplica)"],
  "Funcionalidad Básica": ["Enciende y apaga correctamente", "Todos los botones físicos responden", "Pantalla táctil funciona en todas las áreas (si aplica)"],
  "Conectividad (si aplica)": ["WiFi se conecta", "Bluetooth empareja", "Puertos de carga/datos funcionan"],
  "Batería (si aplica)": ["Carga correctamente", "Duración de batería acorde al uso (subjetivo)"]
}
Responde únicamente con el objeto JSON.
`;

  try {
    const params: GenerateContentParameters = {
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    };
    const response: GenerateContentResponse = await ai.models.generateContent(params);
    return parseJsonFromText(response.text) as Checklist;
  } catch (error) {
    console.error("Error generating checklist:", error);
    throw new Error("Error al generar el checklist. Inténtalo de nuevo.");
  }
};