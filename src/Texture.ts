import { BaseTexture } from '@babylonjs/core';
export interface TextureInterface {
  colorValueMax: number;
  colorValueMin: number;
  height: number;
  name: string;
  url: string;
  width: number;

  // TODO: R.8 Improved - report which textures are not power of 2
  // TODO: R.9 Improved - texel density calculation per material
}

export class Texture implements TextureInterface {
  colorValueMax = undefined as unknown as number;
  colorValueMin = undefined as unknown as number;
  height = 0;
  name = '';
  url = '';
  width = 0;

  constructor(texture: BaseTexture) {
    // Note: NullEngine does not provide the correct texture resolution.
    // material.getActiveTextures()[0].getSize() always returns 512x512
    // TODO: read the file from memory
    this.height = 512;
    this.name = texture.name;
    this.width = 512;
    const internalTexture = texture.getInternalTexture();
    if (internalTexture) {
      this.url = texture.getInternalTexture()?.url ?? '';
    }

    this.calculateMaxMinColorValues();
  }

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////

  private calculateMaxMinColorValues = () => {
    // TODO: load the real color values by checking every pixel
    // Note: HSV color space (sRGB gamma)

    // I may or may not be able to get the pixels from blender internal.
    // If not, I can get it from the glb json info pointing to the arraybuffer
    // Since null engine might not load the actual textures, I might need another
    // package such as image magic that can load the image data from the binary
    // note that I need to support all valid glTF image formats, including KTX

    // TODO: these are just some dummy values for testing
    this.colorValueMax = 240;
    this.colorValueMin = 30;
  };
}
