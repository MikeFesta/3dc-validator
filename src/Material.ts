import { BaseTexture, Material as BabylonMaterial } from '@babylonjs/core';
import { Texture } from './Texture.js';
export interface MaterialInterface {
  name: string;
  textures: Texture[];
}

// TODO: Optional Improvement - report which textures are not power of 2
// TODO: Optional Improvement - texel density calculation per material

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
