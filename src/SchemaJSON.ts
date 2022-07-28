export interface SchemaJSONInterface {
  fileSizeInKb: {
    min: number;
    max: number;
  };
  maxTriangleCount: number;
  maxMaterialCount: number;
  requireTextureDimensionsBePowersOfTwo: boolean;
}
