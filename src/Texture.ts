import { BaseTexture } from '@babylonjs/core';
export interface TextureInterface {
  name: string;
  texture: BaseTexture;
  url: string;

  // TODO: Cleanup - compare this to Material.ts
}

export class Texture implements TextureInterface {
  name = '';
  texture = undefined as unknown as BaseTexture;
  url = '';

  constructor(texture: BaseTexture) {
    // Note: NullEngine does not provide the correct texture resolution.
    // material.getActiveTextures()[0].getSize() always returns 512x512
    // TODO: Cleanup - Link this to Image.ts, which has the actual image data and correct resolution
    this.name = texture.name;
    this.texture = texture;
    const internalTexture = texture.getInternalTexture();
    if (internalTexture) {
      this.url = texture.getInternalTexture()?.url ?? '';
    }
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////
}
