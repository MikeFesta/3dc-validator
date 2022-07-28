import { Model, ModelInterface } from './Model';
import { Report, ReportInterface } from './Report';
import { Schema, SchemaInterface } from './Schema';

export interface ValidatorInterface {
  model: ModelInterface;
  report: ReportInterface;
  reportReady: boolean;
  schema: SchemaInterface;
  version: string;
}

export class Validator implements ValidatorInterface {
  model = new Model();
  report = new Report();
  reportReady = false;
  schema = new Schema();
  version = '1.0.0-alpha.5';

  public generateReport() {
    if (!this.model.loaded) {
      throw new Error('Unable to generate report. No 3D model loaded.');
    }
    if (!this.schema.loaded) {
      throw new Error('Unable to generate report. No schema loaded.');
    }

    // File Size
    const filesizeOK =
      // Greater than Min
      (this.model.fileSizeInKb.value as number) >= (this.schema.minFileSizeInKb.value as number) &&
      // Less than Max
      (this.model.fileSizeInKb.value as number) <= (this.schema.maxFileSizeInKb.value as number);
    let filesizeMessage =
      this.schema.minFileSizeInKb.value +
      'kb <= ' +
      this.model.fileSizeInKb.value +
      'kb <= ' +
      this.schema.maxFileSizeInKb.value +
      'kb';
    if (!filesizeOK) {
      if ((this.model.fileSizeInKb.value as number) < (this.schema.minFileSizeInKb.value as number)) {
        filesizeMessage =
          'File too small: ' + this.model.fileSizeInKb.value + 'kb < ' + this.schema.minFileSizeInKb.value + 'kb';
      } else if ((this.model.fileSizeInKb.value as number) > (this.schema.maxFileSizeInKb.value as number)) {
        filesizeMessage =
          'File too large: ' + this.model.fileSizeInKb.value + 'kb > ' + this.schema.maxFileSizeInKb.value + 'kb';
      }
    }
    this.report.fileSize.test(filesizeOK, filesizeMessage);

    // Triangle Count
    const triangleCountOK =
      (this.model.triangleCount.value as number) <= (this.schema.maxTriangleCount.value as number);
    let triangleCountMessage = this.model.triangleCount.value + ' =< ' + this.schema.maxTriangleCount.value;
    if (!triangleCountOK) {
      triangleCountMessage =
        'Too many triangles: ' + this.model.triangleCount.value + ' > ' + this.schema.maxTriangleCount.value;
    }
    this.report.triangleCount.test(triangleCountOK, triangleCountMessage);

    // Material Count
    const materialCountOK =
      (this.model.materialCount.value as number) <= (this.schema.maxMaterialCount.value as number);
    let materialCountMessage = this.model.materialCount.value + ' <= ' + this.schema.maxMaterialCount.value;
    if (!materialCountOK) {
      materialCountMessage =
        'Too Many Materials: ' + this.model.materialCount.value + ' > ' + this.schema.maxMaterialCount.value;
    }
    this.report.materialCount.test(materialCountOK, materialCountMessage);

    // Texture Size Power of 2
    const po2WouldHave = (this.model.texturesPowerOfTwo.value as boolean) ? 'passed' : 'failed';
    const po2message = this.schema.requireTextureDimensionsBePowersOfTwo.value
      ? 'Required by schema'
      : 'Not Required by schema, but would have ' + po2WouldHave;
    this.report.texturesPowerOfTwo.test(
      !this.schema.requireTextureDimensionsBePowersOfTwo.value || (this.model.texturesPowerOfTwo.value as boolean),
      po2message,
    );

    this.reportReady = true;
  }
}
