export interface GltfValidatorReportInfoResourceImageInterface {
  width: number;
  height: number;
  format: string;
  primaries: string;
  transfer: string;
  bits: number;
}

export interface GltfValidatorReportInfoResourceInterface {
  pointer: string;
  mimeType: string;
  storage: string;
  byteLength?: number;
  image?: GltfValidatorReportInfoResourceImageInterface;
}

export interface GltfValidatorReportInfoInterface {
  version: string;
  generator: string;
  extensionsUsed: Array<string>;
  resources: Array<GltfValidatorReportInfoResourceInterface>;
  animationCount: number;
  materialCount: number;
  hasMorphTargets: boolean;
  hasSkins: boolean;
  hasTextures: boolean;
  hasDefaultScene: boolean;
  drawCallCount: number;
  totalVertexCount: number;
  totalTriangleCount: number;
  maxUVs: number;
  maxInfluences: number;
  maxAttributes: number;
}

export interface GltfValidatorReportIssuesMessageInterface {
  code: string;
  message: string;
  pointer: string;
  severity: number;
}

export interface GltfValidatorReportIssuesInterface {
  numErrors: number;
  numWarnings: number;
  numInfos: number;
  numHints: number;
  messages: Array<GltfValidatorReportIssuesMessageInterface>;
  truncated: boolean;
}

export interface GltfValidatorReportInterface {
  uri: string;
  mimeType: string;
  validatorVersion: string;
  validatedAt: string;
  issues: GltfValidatorReportIssuesInterface;
  info: GltfValidatorReportInfoInterface;
}
