import { BaseTexture, Material as BabylonMaterial } from '@babylonjs/core';
import { Texture } from './Texture.js';
export interface MaterialInterface {
  name: string;
  textures: Texture[];
}

// TODO: R.8 Improved - report which textures are not power of 2
// TODO: R.9 Improved - texel density calculation per material

export class Material implements MaterialInterface {
  name = '';
  textures = [] as Texture[];

  constructor(material: BabylonMaterial) {
    this.name = material.name;
    material.getActiveTextures().forEach((texture: BaseTexture) => {
      this.textures.push(new Texture(texture));
    });
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////
}
