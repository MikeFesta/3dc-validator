import { GltfJsonImageInterface } from './GltfJson';
import { loadImage, Image as CanvasImage, createCanvas } from 'canvas';

export interface ImageInterface {
  canvasImage: CanvasImage;
  height: number;
  maxValue: number;
  minValue: number;
  mimeType: string;
  name: string;
  width: number;
  init(buffer: Buffer): Promise<void>;
}

export class Image implements ImageInterface {
  canvasImage = undefined as unknown as CanvasImage;
  height = 0;
  maxValue = undefined as unknown as number;
  minValue = undefined as unknown as number;
  mimeType = '';
  name = '';
  width = 0;

  constructor(imageJson: GltfJsonImageInterface) {
    this.name = imageJson.name;
    this.mimeType = imageJson.mimeType;
  }

  // constructor cannot be async, but we need to await loadImage
  public init = async (buffer: Buffer): Promise<void> => {
    try {
      // TODO: ktx2 support
      this.canvasImage = await loadImage(buffer);
      this.height = this.canvasImage.naturalHeight;
      this.width = this.canvasImage.naturalWidth;
    } catch (err) {
      console.log('error creating image from binary data');
      console.log(err);
    }
    this.calculateColorValueMaxMin();
  };

  ///////////////////////
  // PRIVATE FUNCTIONS //
  ///////////////////////
  private calculateColorValueMaxMin = () => {
    try {
      // create a canvas to write the pixels to
      const canvas = createCanvas(this.canvasImage.naturalWidth, this.canvasImage.naturalHeight);

      // draw the image on the cavnas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.canvasImage, 0, 0, this.canvasImage.naturalWidth, this.canvasImage.naturalHeight);

      // read the pixels from the canvas
      const pixelData = ctx.getImageData(0, 0, this.canvasImage.naturalWidth, this.canvasImage.naturalHeight);

      // loop through the pixels to find the min/max values
      for (let i = 0; i < pixelData.data.length; i = i + 4) {
        // Stride length is 4: [R, G, B, A]
        const r = pixelData.data[4 * i + 0];
        const g = pixelData.data[4 * i + 1];
        const b = pixelData.data[4 * i + 2];
        //const a = pixelData.data[4 * i + 3];

        // Value in HSV is just the biggest channel
        const v = Math.max(r, g, b);
        if (this.maxValue === undefined || v > this.maxValue) {
          this.maxValue = v;
        }
        if (this.minValue === undefined || v < this.minValue) {
          this.minValue = v;
        }
      }
    } catch (err) {
      console.log('Error reading color values');
      console.log(err);
    }
  };
}
