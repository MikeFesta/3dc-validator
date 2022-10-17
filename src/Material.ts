import { Material as BabylonMaterial } from '@babylonjs/core';
export interface MaterialInterface {
  name: string;
  // Note: NullEngine does not provide the correct texture resolution.
  // material.getActiveTextures()[0].getSize() always returns 512x512

  // TODO: R.8 Improved - report which textures are not power of 2
  // TODO: R.9 Improved - texel density calculation per material
  // TODO: O.12 - PBR Safe Colors
}

export class Material implements MaterialInterface {
  name = '';

  constructor(mat: BabylonMaterial) {
    this.name = mat.name;
  }
}
