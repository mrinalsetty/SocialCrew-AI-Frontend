export type GeneratedPost = {
  id: number;
  title: string;
  content: string;
  hashtags: string[];
};

export type GenerateResponse = {
  contentCreator: GeneratedPost[];
  contentSummary: string;
  socialAnalyst: {
    bestPost: number;
    reason: string;
    suggestions: string[];
    positioning: string;
  };
};

export type BackendHealth = {
  status: string;
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  llmProvider: string;
  graphRuntime: string;
  creatorModel: string;
  analystModel: string;
};

export type BackendMeta = {
  name: string;
  version: string;
  statusPage: string;
  architecture: string[];
  stack: {
    runtime: string[];
    ai: string[];
    models: string[];
    deployment: string[];
  };
  endpoints: { method: string; path: string }[];
  notes: string[];
};
