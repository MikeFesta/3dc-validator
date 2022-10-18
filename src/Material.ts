import { BaseTexture, Material as BabylonMaterial } from '@babylonjs/core';
import { Texture } from './Texture.js';
export interface MaterialInterface {
  colorValueMax: number;
  colorValueMin: number;
  name: string;
  textures: Texture[];
}

// TODO: R.8 Improved - report which textures are not power of 2
// TODO: R.9 Improved - texel density calculation per material

export class Material implements MaterialInterface {
  colorValueMax = undefined as unknown as number;
  colorValueMin = undefined as unknown as number;
  name = '';
  textures = [] as Texture[];

  constructor(material: BabylonMaterial) {
    this.name = material.name;
    material.getActiveTextures().forEach((texture: BaseTexture) => {
      this.textures.push(new Texture(texture));
    });
    this.calculateColorValueMaxMin();
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////
  private calculateColorValueMaxMin = () => {
    this.textures.forEach((texture: Texture) => {
      if (this.colorValueMax === undefined || texture.colorValueMax > this.colorValueMax) {
        this.colorValueMax = texture.colorValueMax;
      }
      if (this.colorValueMin === undefined || texture.colorValueMin < this.colorValueMin) {
        this.colorValueMin = texture.colorValueMin;
      }
    });
  };
}
