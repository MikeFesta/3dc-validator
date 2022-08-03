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
      length: number;
      width: number;
      height: number;
    };
    minimum: {
      length: number;
      width: number;
      height: number;
    };
    percentTolerance: {
      length: number;
      width: number;
      height: number;
    };
  };
}
