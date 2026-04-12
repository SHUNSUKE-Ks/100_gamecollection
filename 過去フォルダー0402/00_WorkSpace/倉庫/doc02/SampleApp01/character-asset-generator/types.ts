
export interface AssetOrder {
  name: string;
  type: 'Standing' | 'Expression' | 'CG';
  filename: string;
  description: string;
}

export interface OrderList {
  order_id: string;
  character_name: string;
  assets: AssetOrder[];
}

export interface AnalysisResult {
  id: string; // e.g., remi_unant
  name: string; // e.g., レミナント
  description: string;
  tags: string[];
  visualStyle: string;
  keyFeatures: string[];
  assets: GeneratedAsset[];
}

export interface GeneratedAsset {
  id: number;
  filename: string;
  type: 'Standing' | 'Expression' | 'CG';
  description: string;
  prompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}
