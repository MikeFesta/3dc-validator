export interface SchemaJSONInterface {
  version: string;
  fileSizeInKb?: {
    min: number;
    max: number;
  };
  maxTriangleCount?: number;
  maxMaterialCount?: number;
  dimensions?: {
    maximum?: {
      length: number;
      width: number;
      height: number;
    };
    minimum?: {
      length: number;
      width: number;
      height: number;
    };
    percentTolerance?: {
      length: number;
      width: number;
      height: number;
    };
  };
  textures?: {
    maximum?: {
      width: number;
      height: number;
    };
    minimum?: {
      width: number;
      height: number;
    };
    requireDimensionsBePowersOfTwo?: boolean;
    requireDimensionsBeQuadratic?: boolean;
  };
  objectCount?: {
    meshes?: {
      maximum: number;
    };
    nodes?: {
      maximum: number;
    };
    primitives?: {
      maximum: number;
    };
  };
  requireCleanRootNodeTransform?: boolean;
}
