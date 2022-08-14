import { Model, ModelInterface } from './Model.js';
import { ProductInfo, ProductInfoInterface } from './ProductInfo.js';
import { Report, ReportInterface } from './Report.js';
import { Schema, SchemaInterface } from './Schema.js';

export interface ValidatorInterface {
  model: ModelInterface;
  productInfo: ProductInfoInterface;
  report: ReportInterface;
  reportReady: boolean;
  schema: SchemaInterface;
  version: string;
}

export class Validator implements ValidatorInterface {
  model = new Model();
  productInfo = new ProductInfo(); // This is optional and can provide more specific per product validation
  report = new Report();
  reportReady = false;
  schema = new Schema();
  version = '1.0.0-alpha.7';

  public generateReport() {
    if (!this.model.loaded) {
      throw new Error('Unable to generate report. No 3D model loaded.');
    }
    if (!this.schema.loaded) {
      throw new Error('Unable to generate report. No schema loaded.');
    }

    this.testFileSize();
    this.testTriangleCount();
    this.testMaterialCount();
    this.testTextures();

    // Dimensions (Max)
    let dimensionsMaxMessage =
      '(L:' +
      this.model.length.value +
      ' x W:' +
      this.model.width.value +
      ' x H:' +
      this.model.height.value +
      ') vs (L:' +
      this.schema.maxLength.value +
      ' x W:' +
      this.schema.maxWidth.value +
      ' x H:' +
      this.schema.maxHeight.value +
      ') Max';
    this.report.dimensionsMax.test(
      this.model.height.value <= this.schema.maxHeight.value &&
        this.model.length.value <= this.schema.maxLength.value &&
        this.model.width.value <= this.schema.maxWidth.value,
      dimensionsMaxMessage,
    );

    // Dimensions (Min)
    let dimensionsMinMessage =
      '(L:' +
      this.model.length.value +
      ' x W:' +
      this.model.width.value +
      ' x H:' +
      this.model.height.value +
      ') vs (L:' +
      this.schema.minLength.value +
      ' x W:' +
      this.schema.minWidth.value +
      ' x H:' +
      this.schema.minHeight.value +
      ') Min';
    this.report.dimensionsMin.test(
      this.model.height.value >= this.schema.minHeight.value &&
        this.model.length.value >= this.schema.minLength.value &&
        this.model.width.value >= this.schema.minWidth.value,
      dimensionsMinMessage,
    );

    // Additional checks that require product information to be made available
    if (this.productInfo.loaded) {
      // Product Dimensions meet tolerance (assume true for any missing product dimensions)
      let heightWithinTolerance = true;
      let lengthWithinTolerance = true;
      let widthWithinTolerance = true;
      let productToleranceMessage = '';

      if (this.productInfo.height.loaded) {
        const heightMarginOfError =
          ((this.schema.percentToleranceHeight.value as number) / 100) * (this.productInfo.height.value as number);
        const heightTooSmall =
          this.model.height.value < (this.productInfo.height.value as number) - heightMarginOfError;
        const heightTooLarge =
          this.model.height.value > (this.productInfo.height.value as number) + heightMarginOfError;
        heightWithinTolerance = !heightTooSmall && !heightTooLarge;
        if (heightTooSmall) {
          productToleranceMessage +=
            'Height too small: ' +
            this.model.height.value +
            ' < (' +
            this.productInfo.height.value +
            ' - ' +
            heightMarginOfError +
            '); ';
        }
        if (heightTooLarge) {
          productToleranceMessage +=
            'Height too large: ' +
            this.model.height.value +
            ' > (' +
            this.productInfo.height.value +
            ' + ' +
            heightMarginOfError +
            '); ';
        }
      }
      if (this.productInfo.length.loaded) {
        const lengthMarginOfError =
          ((this.schema.percentToleranceLength.value as number) / 100) * (this.productInfo.length.value as number);
        const lengthTooSmall =
          this.model.length.value < (this.productInfo.length.value as number) - lengthMarginOfError;
        const lengthTooLarge =
          this.model.length.value > (this.productInfo.length.value as number) + lengthMarginOfError;
        lengthWithinTolerance = !lengthTooSmall && !lengthTooLarge;
        if (lengthTooSmall) {
          productToleranceMessage +=
            'Length too small: ' +
            this.model.length.value +
            ' < (' +
            this.productInfo.length.value +
            ' - ' +
            lengthMarginOfError +
            '); ';
        }
        if (lengthTooLarge) {
          productToleranceMessage +=
            'Length too large: ' +
            this.model.length.value +
            ' > (' +
            this.productInfo.length.value +
            ' + ' +
            lengthMarginOfError +
            '); ';
        }
      }
      if (this.productInfo.width.loaded) {
        const widthMarginOfError =
          ((this.schema.percentToleranceWidth.value as number) / 100) * (this.productInfo.width.value as number);
        const widthTooSmall = this.model.width.value < (this.productInfo.width.value as number) - widthMarginOfError;
        const widthTooLarge = this.model.width.value > (this.productInfo.width.value as number) + widthMarginOfError;
        widthWithinTolerance = !widthTooSmall && !widthTooLarge;
        if (widthTooSmall) {
          productToleranceMessage +=
            'Width too small: ' +
            this.model.width.value +
            ' < (' +
            this.productInfo.width.value +
            ' - ' +
            widthMarginOfError +
            '); ';
        }
        if (widthTooLarge) {
          productToleranceMessage +=
            'Width too large: ' +
            this.model.width.value +
            ' > (' +
            this.productInfo.width.value +
            ' + ' +
            widthMarginOfError +
            '); ';
        }
      }

      if (!productToleranceMessage) {
        productToleranceMessage =
          'Product Dimensions: (L: ' +
          this.productInfo.length.value +
          ' x W: ' +
          this.productInfo.width.value +
          ' x H: ' +
          this.productInfo.height.value +
          ') +/- ';
        if (
          this.schema.percentToleranceLength.value == this.schema.percentToleranceWidth.value &&
          this.schema.percentToleranceLength.value == this.schema.percentToleranceHeight.value
        ) {
          productToleranceMessage += this.schema.percentToleranceLength.value + '%';
        } else {
          productToleranceMessage +=
            '(L: ' +
            this.schema.percentToleranceLength.value +
            '% x W: ' +
            this.schema.percentToleranceWidth.value +
            '% x H: ' +
            this.schema.percentToleranceHeight.value +
            '%)';
        }
      }

      this.report.productDimensionsWithinTolerance.test(
        widthWithinTolerance && heightWithinTolerance && lengthWithinTolerance,
        productToleranceMessage,
      );
    }

    this.reportReady = true;
  }

  // The filesize should be within the specified range. Min and/or Max size can be ignored with a value of -1
  private testFileSize() {
    if (this.schema.maxFileSizeInKb.value === -1 && this.schema.minFileSizeInKb.value === -1) {
      // Skip test, but still report the file size
      this.report.fileSize.skipTestWithMessage('File size: ' + this.model.fileSizeInKb.value + 'kb');
    } else if (this.schema.maxFileSizeInKb.value === -1) {
      // Check only the min filesize
      const filesizeOK = (this.model.fileSizeInKb.value as number) >= (this.schema.minFileSizeInKb.value as number);
      let filesizeMessage = filesizeOK
        ? this.model.fileSizeInKb.value + 'kb >= ' + this.schema.minFileSizeInKb.value + 'kb'
        : 'File too small: ' + this.model.fileSizeInKb.value + 'kb < ' + this.schema.minFileSizeInKb.value + 'kb';
      this.report.fileSize.test(filesizeOK, filesizeMessage);
    } else if (this.schema.minFileSizeInKb.value === -1) {
      // Check only the max filesize
      const filesizeOK = (this.model.fileSizeInKb.value as number) <= (this.schema.maxFileSizeInKb.value as number);
      let filesizeMessage = filesizeOK
        ? this.model.fileSizeInKb.value + 'kb <= ' + this.schema.maxFileSizeInKb.value + 'kb'
        : 'File too large: ' + this.model.fileSizeInKb.value + 'kb > ' + this.schema.maxFileSizeInKb.value + 'kb';
      this.report.fileSize.test(filesizeOK, filesizeMessage);
    } else {
      // Check that filesize is within range (min-max)
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
    }
  }

  // The number of materials should be less than or equal to the max, unless the max is -1
  private testMaterialCount() {
    if (this.schema.maxMaterialCount.value === -1) {
      this.report.materialCount.skipTestWithMessage(
        this.model.materialCount.value + ' material' + (this.model.materialCount.value == 1 ? '' : 's'),
      );
    } else {
      const materialCountOK =
        (this.model.materialCount.value as number) <= (this.schema.maxMaterialCount.value as number);
      const materialCountMessage = materialCountOK
        ? this.model.materialCount.value + ' <= ' + this.schema.maxMaterialCount.value
        : 'Too many materials: ' + this.model.materialCount.value + ' > ' + this.schema.maxMaterialCount.value;
      this.report.materialCount.test(materialCountOK, materialCountMessage);
    }
  }

  // The number of triangles should be less than or equal to the max, unless the max is -1
  private testTriangleCount() {
    if (this.schema.maxTriangleCount.value === -1) {
      this.report.triangleCount.skipTestWithMessage('Triangle count: ' + this.model.triangleCount.value);
    } else {
      const triangleCountOK =
        (this.model.triangleCount.value as number) <= (this.schema.maxTriangleCount.value as number);
      const triangleCountMessage = triangleCountOK
        ? this.model.triangleCount.value + ' <= ' + this.schema.maxTriangleCount.value
        : 'Too many triangles: ' + this.model.triangleCount.value + ' > ' + this.schema.maxTriangleCount.value;
      this.report.triangleCount.test(triangleCountOK, triangleCountMessage);
    }
  }

  // Texture dimensions should be within range, powers of 2, and (optionally) quadratic
  private testTextures() {
    // Texture Size - Height (max)
    if (this.schema.maxTextureHeight.value === -1) {
      this.report.textureDimensionsMaxHeight.skipTestWithMessage(
        (this.model.texturesMaxHeight.value as number).toFixed(0),
      );
    } else {
      const maxHeightPasses = this.model.texturesMaxHeight.value <= this.schema.maxTextureHeight.value;
      this.report.textureDimensionsMaxHeight.test(
        maxHeightPasses,
        this.model.texturesMaxHeight.value +
          ' ' +
          (maxHeightPasses ? '<=' : '>') +
          ' ' +
          this.schema.maxTextureHeight.value,
      );
    }

    // Texture Size - Height (min)
    if (this.schema.minTextureHeight.value === -1) {
      this.report.textureDimensionsMinHeight.skipTestWithMessage(
        (this.model.texturesMinHeight.value as number).toFixed(0),
      );
    } else {
      const minHeightPasses = this.model.texturesMinHeight.value >= this.schema.minTextureHeight.value;
      this.report.textureDimensionsMinHeight.test(
        minHeightPasses,
        this.model.texturesMinHeight.value +
          ' ' +
          (minHeightPasses ? '>=' : '<') +
          ' ' +
          this.schema.minTextureHeight.value,
      );
    }

    // Texture Size - Width (max)
    if (this.schema.maxTextureWidth.value === -1) {
      this.report.textureDimensionsMaxWidth.skipTestWithMessage(
        (this.model.texturesMaxWidth.value as number).toFixed(0),
      );
    } else {
      const maxWidthPasses = this.model.texturesMaxWidth.value <= this.schema.maxTextureWidth.value;
      this.report.textureDimensionsMaxWidth.test(
        maxWidthPasses,
        this.model.texturesMaxWidth.value +
          ' ' +
          (maxWidthPasses ? '<=' : '>') +
          ' ' +
          this.schema.maxTextureWidth.value,
      );
    }

    // Texture Size - Width (min)
    if (this.schema.minTextureWidth.value === -1) {
      this.report.textureDimensionsMinWidth.skipTestWithMessage(
        (this.model.texturesMinWidth.value as number).toFixed(0),
      );
    } else {
      const minWidthPasses = this.model.texturesMinWidth.value >= this.schema.minTextureWidth.value;
      this.report.textureDimensionsMinWidth.test(
        minWidthPasses,
        this.model.texturesMinWidth.value +
          ' ' +
          (minWidthPasses ? '>=' : '<') +
          ' ' +
          this.schema.minTextureWidth.value,
      );
    }

    // Texture Size - Power of 2
    if (this.schema.requireTextureDimensionsBePowersOfTwo.value === false) {
      this.report.texturesPowerOfTwo.skipTestWithMessage(
        'Not Required, but would have ' + ((this.model.texturesPowerOfTwo.value as boolean) ? 'passed' : 'failed'),
      );
    } else {
      this.report.texturesPowerOfTwo.test(
        this.model.texturesPowerOfTwo.value as boolean,
        '', // TODO: report which textures failed (if any)
      );
    }

    // Texture Size - Quadratic (width=height)
    if (this.schema.requireTextureDimensionsBeQuadratic.value === false) {
      this.report.texturesQuadratic.skipTestWithMessage(
        'Not Required, but would have ' + ((this.model.texturesQuadratic.value as boolean) ? 'passed' : 'failed'),
      );
    } else {
      this.report.texturesQuadratic.test(
        this.model.texturesQuadratic.value as boolean,
        '', // TODO: report which textures failed (if any)
      );
    }
  }
}
