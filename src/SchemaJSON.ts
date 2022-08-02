export interface SchemaJSONInterface {
  fileSizeInKb: {
    min: number;
    max: number;
  };
  maxTriangleCount: number;
  maxMaterialCount: number;
  requireTextureDimensionsBePowersOfTwo: boolean;
  dimensions: {
    maximum: {
      width: number;
      height: number;
      depth: number;
    };
    minimum: {
      width: number;
      height: number;
      depth: number;
    };
    percentTolerance: {
      width: number;
      height: number;
      depth: number;
    };
  };
}
