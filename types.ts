
export enum AppStep {
  CAPTURE = 'CAPTURE',
  CONFIRM_CONDITION = 'CONFIRM_CONDITION',
  RESULTS = 'RESULTS',
  CHECKLIST = 'CHECKLIST',
}

export enum ProductCondition {
  AS_NEW = 'Como Nuevo',
  GOOD_CONDITION = 'Buen Estado',
  USED = 'Usado',
}

export const ProductConditionDescriptions: Record<ProductCondition, string> = {
  [ProductCondition.AS_NEW]: "Sin marcas de uso, embalaje original si es posible.",
  [ProductCondition.GOOD_CONDITION]: "Pocas marcas de uso, totalmente funcional.",
  [ProductCondition.USED]: "Marcas de uso evidentes, funcional pero con desgaste.",
};

export interface IdentifiedProduct {
  name: string;
  stockImageUrl?: string;
}

export interface ProductInfo {
  userImage?: string; // base64 string
  identifiedProduct?: IdentifiedProduct;
  manualName?: string;
  condition?: ProductCondition;
  stockQuantity?: number;
}

export interface GroundingSource {
  web?: {
    // FIX: Made uri and title optional to match GroundingChunkWeb from @google/genai
    uri?: string;
    title?: string;
  };
  // Add other source types if needed
}

export interface PriceDetail {
  price?: string;       // e.g., "€150", "N/A"
  numericPrice?: number; // e.g., 150. For calculations. Parsed or provided by AI.
  sourceUrl?: string;   // Optional URL for this specific price listing if AI can provide it
  specificNote?: string; // e.g., "Precio para estado 'Como Nuevo'", "Basado en X anuncios"
}

export interface PriceInfo {
  newPrice?: PriceDetail;
  cashConverters?: PriceDetail;
  cex?: PriceDetail;
  backmarket?: PriceDetail;
  wallapop?: PriceDetail;
  milanuncios?: PriceDetail;
  ebay?: PriceDetail;          // Nueva fuente
  gameStore?: PriceDetail;     // Nueva fuente (GAME)
  priceCharting?: PriceDetail; // Nueva fuente
  otherSource1?: PriceDetail;  // Para fuentes alternativas genéricas
  otherSource2?: PriceDetail;  // Para fuentes alternativas genéricas
  sources?: GroundingSource[]; // General grounding sources from Google Search
}

export interface Checklist {
  [category: string]: string[];
}
