import { Model, ModelInterface } from './Model.js';
import { ProductInfo, ProductInfoInterface } from './ProductInfo.js';
import { Report, ReportInterface } from './Report.js';
import { Schema, SchemaInterface } from './Schema.js';

export interface ValidatorInterface {
  decimalDisplayPrecision: number;
  model: ModelInterface;
  productInfo: ProductInfoInterface;
  report: ReportInterface;
  reportReady: boolean;
  schema: SchemaInterface;
  version: string;
}

export class Validator implements ValidatorInterface {
  decimalDisplayPrecision = 3; // Used for display only (not comparisons), can be changed before running generateReport()
  model = new Model();
  productInfo = new ProductInfo(); // This is optional and can provide more specific per product validation
  report = new Report();
  reportReady = false;
  schema = new Schema();
  version = '1.0.0-alpha.18';

  public generateReport() {
    if (!this.model.loaded) {
      throw new Error('Unable to generate report. No 3D model loaded.');
    }
    if (!this.schema.loaded) {
      throw new Error('Unable to generate report. No schema loaded.');
    }

    this.testGltfValidator();
    this.testFileSize();
    this.testTriangleCount();
    this.testMaterialCount();
    this.testTextures();
    this.testDimensions();
    this.testObjectCount();
    this.testRootNodeTransform();
    this.testUVs();

    if (this.productInfo.loaded) {
      // Additional checks that require product information to be made available
      this.testProductDimensions();
    }

    this.reportReady = true;
  }

  // Check that the model fits within viewer/application min/max dimensions
  private testDimensions() {
    let dimensionsMessage =
      '(L:' +
      (this.model.length.value as number).toFixed(this.decimalDisplayPrecision) +
      ' x W:' +
      (this.model.width.value as number).toFixed(this.decimalDisplayPrecision) +
      ' x H:' +
      (this.model.height.value as number).toFixed(this.decimalDisplayPrecision) +
      ')';
    // Dimensions (Max)
    if (this.schema.maxHeight.value === -1 && this.schema.maxLength.value === -1 && this.schema.maxWidth.value === -1) {
      this.report.dimensionsMax.skipTestWithMessage(dimensionsMessage);
    } else {
      let dimensionsMaxOK = true;
      let dimensionsMaxMessage = dimensionsMessage + ' vs (L:';
      // Length (max)
      if (this.schema.maxLength.value === -1) {
        dimensionsMaxMessage += 'n/a';
      } else {
        dimensionsMaxOK = dimensionsMaxOK && this.model.length.value <= this.schema.maxLength.value;
        dimensionsMaxMessage += (this.schema.maxLength.value as number).toFixed(this.decimalDisplayPrecision);
      }
      dimensionsMaxMessage += ' x W:';
      // Width (max)
      if (this.schema.maxWidth.value === -1) {
        dimensionsMaxMessage += 'n/a';
      } else {
        dimensionsMaxOK = dimensionsMaxOK && this.model.width.value <= this.schema.maxWidth.value;
        dimensionsMaxMessage += (this.schema.maxWidth.value as number).toFixed(this.decimalDisplayPrecision);
      }
      dimensionsMaxMessage += ' x H:';
      // Height (max)
      if (this.schema.maxHeight.value === -1) {
        dimensionsMaxMessage += 'n/a';
      } else {
        dimensionsMaxOK = dimensionsMaxOK && this.model.height.value <= this.schema.maxHeight.value;
        dimensionsMaxMessage += (this.schema.maxHeight.value as number).toFixed(this.decimalDisplayPrecision);
      }
      dimensionsMaxMessage += ') Max';
      this.report.dimensionsMax.test(dimensionsMaxOK, dimensionsMaxMessage);
    }

    // Dimensions (Min)
    if (this.schema.minHeight.value === -1 && this.schema.minLength.value === -1 && this.schema.minWidth.value === -1) {
      this.report.dimensionsMin.skipTestWithMessage(dimensionsMessage);
    } else {
      let dimensionsMinOK = true;
      let dimensionsMinMessage = dimensionsMessage + ' vs (L:';
      // Length (min)
      if (this.schema.minLength.value === -1) {
        dimensionsMinMessage += 'n/a';
      } else {
        dimensionsMinOK = dimensionsMinOK && this.model.length.value >= this.schema.minLength.value;
        dimensionsMinMessage += (this.schema.minLength.value as number).toFixed(this.decimalDisplayPrecision);
      }
      dimensionsMinMessage += ' x W:';
      // Width (min)
      if (this.schema.minWidth.value === -1) {
        dimensionsMinMessage += 'n/a';
      } else {
        dimensionsMinOK = dimensionsMinOK && this.model.width.value >= this.schema.minWidth.value;
        dimensionsMinMessage += (this.schema.minWidth.value as number).toFixed(this.decimalDisplayPrecision);
      }
      dimensionsMinMessage += ' x H:';
      // Height (min)
      if (this.schema.minHeight.value === -1) {
        dimensionsMinMessage += 'n/a';
      } else {
        dimensionsMinOK = dimensionsMinOK && this.model.height.value >= this.schema.minHeight.value;
        dimensionsMinMessage += (this.schema.minHeight.value as number).toFixed(this.decimalDisplayPrecision);
      }
      dimensionsMinMessage += ') Min';
      this.report.dimensionsMin.test(dimensionsMinOK, dimensionsMinMessage);
    }
  }

  // The filesize should be within the specified range. Min and/or Max size can be ignored with a value of -1
  private testFileSize() {
    if (this.schema.maxFileSizeInKb.value === -1 && this.schema.minFileSizeInKb.value === -1) {
      // Skip test, but still report the file size
      this.report.fileSize.skipTestWithMessage(this.model.fileSizeInKb.value.toLocaleString() + 'kb');
    } else if (this.schema.maxFileSizeInKb.value === -1) {
      // Check only the min filesize
      const filesizeOK = (this.model.fileSizeInKb.value as number) >= (this.schema.minFileSizeInKb.value as number);
      let filesizeMessage = filesizeOK
        ? this.model.fileSizeInKb.value.toLocaleString() +
          'kb >= ' +
          this.schema.minFileSizeInKb.value.toLocaleString() +
          'kb'
        : 'File too small: ' +
          this.model.fileSizeInKb.value.toLocaleString() +
          'kb < ' +
          this.schema.minFileSizeInKb.value.toLocaleString() +
          'kb';
      this.report.fileSize.test(filesizeOK, filesizeMessage);
    } else if (this.schema.minFileSizeInKb.value === -1) {
      // Check only the max filesize
      const filesizeOK = (this.model.fileSizeInKb.value as number) <= (this.schema.maxFileSizeInKb.value as number);
      let filesizeMessage = filesizeOK
        ? this.model.fileSizeInKb.value.toLocaleString() +
          'kb <= ' +
          this.schema.maxFileSizeInKb.value.toLocaleString() +
          'kb'
        : 'File too large: ' +
          this.model.fileSizeInKb.value.toLocaleString() +
          'kb > ' +
          this.schema.maxFileSizeInKb.value.toLocaleString() +
          'kb';
      this.report.fileSize.test(filesizeOK, filesizeMessage);
    } else {
      // Check that filesize is within range (min-max)
      const filesizeOK =
        // Greater than Min
        (this.model.fileSizeInKb.value as number) >= (this.schema.minFileSizeInKb.value as number) &&
        // Less than Max
        (this.model.fileSizeInKb.value as number) <= (this.schema.maxFileSizeInKb.value as number);
      let filesizeMessage =
        this.schema.minFileSizeInKb.value.toLocaleString() +
        'kb <= ' +
        this.model.fileSizeInKb.value.toLocaleString() +
        'kb <= ' +
        this.schema.maxFileSizeInKb.value.toLocaleString() +
        'kb';
      if (!filesizeOK) {
        if ((this.model.fileSizeInKb.value as number) < (this.schema.minFileSizeInKb.value as number)) {
          filesizeMessage =
            'File too small: ' +
            this.model.fileSizeInKb.value.toLocaleString() +
            'kb < ' +
            this.schema.minFileSizeInKb.value.toLocaleString() +
            'kb';
        } else if ((this.model.fileSizeInKb.value as number) > (this.schema.maxFileSizeInKb.value as number)) {
          filesizeMessage =
            'File too large: ' +
            this.model.fileSizeInKb.value.toLocaleString() +
            'kb > ' +
            this.schema.maxFileSizeInKb.value.toLocaleString() +
            'kb';
        }
      }
      this.report.fileSize.test(filesizeOK, filesizeMessage);
    }
  }

  // glTF validation is considered passed if there are no errors.
  private testGltfValidator() {
    if (this.model.gltfValidatorReport) {
      this.report.gltfValidator.test(
        this.model.gltfValidatorReport.issues.numErrors === 0,
        'Errors: ' +
          this.model.gltfValidatorReport.issues.numErrors +
          ', Warnings: ' +
          this.model.gltfValidatorReport.issues.numWarnings +
          ', Hints: ' +
          this.model.gltfValidatorReport.issues.numHints +
          ', Info: ' +
          this.model.gltfValidatorReport.issues.numInfos,
      );
    }
  }

  // The number of materials should be less than or equal to the max, unless the max is -1
  private testMaterialCount() {
    if (this.schema.maxMaterialCount.value === -1) {
      this.report.materialCount.skipTestWithMessage(this.model.materialCount.value.toLocaleString());
    } else {
      const materialCountOK =
        (this.model.materialCount.value as number) <= (this.schema.maxMaterialCount.value as number);
      const materialCountMessage =
        this.model.materialCount.value + (materialCountOK ? ' <= ' : ' > ') + this.schema.maxMaterialCount.value;
      this.report.materialCount.test(materialCountOK, materialCountMessage);
    }
  }

  // Check the number of meshes, nodes, and primitives
  private testObjectCount() {
    if (this.schema.maxMeshCount.value === -1) {
      this.report.meshCount.skipTestWithMessage(this.model.meshCount.value.toLocaleString());
    } else {
      const meshCountOK = this.model.meshCount.value <= this.schema.maxMeshCount.value;
      const meshCountMessage =
        this.model.meshCount.value + (meshCountOK ? ' <= ' : ' > ') + this.schema.maxMeshCount.value;
      this.report.meshCount.test(meshCountOK, meshCountMessage);
    }
    if (this.schema.maxNodeCount.value === -1) {
      this.report.nodeCount.skipTestWithMessage(this.model.nodeCount.value.toLocaleString());
    } else {
      const nodeCountOK = this.model.nodeCount.value <= this.schema.maxNodeCount.value;
      const nodeCountMessage =
        this.model.nodeCount.value + (nodeCountOK ? ' <= ' : ' > ') + this.schema.maxNodeCount.value;
      this.report.nodeCount.test(nodeCountOK, nodeCountMessage);
    }
    if (this.schema.maxPrimitiveCount.value === -1) {
      this.report.primitiveCount.skipTestWithMessage(this.model.primitiveCount.value.toLocaleString());
    } else {
      const primitiveCountOK = this.model.primitiveCount.value <= this.schema.maxPrimitiveCount.value;
      const primitiveCountMessage =
        this.model.primitiveCount.value + (primitiveCountOK ? ' <= ' : ' > ') + this.schema.maxPrimitiveCount.value;
      this.report.primitiveCount.test(primitiveCountOK, primitiveCountMessage);
    }
  }

  // If product info is available, check that dimensions are within the specified tolerance
  private testProductDimensions() {
    // Product Dimensions meet tolerance (assume true for any missing product dimensions)
    let heightWithinTolerance = true;
    let lengthWithinTolerance = true;
    let widthWithinTolerance = true;
    let productToleranceMessage = '';

    if (this.productInfo.height.loaded) {
      const heightMarginOfError =
        ((this.schema.percentToleranceHeight.value as number) / 100) * (this.productInfo.height.value as number);
      const heightTooSmall = this.model.height.value < (this.productInfo.height.value as number) - heightMarginOfError;
      const heightTooLarge = this.model.height.value > (this.productInfo.height.value as number) + heightMarginOfError;
      heightWithinTolerance = !heightTooSmall && !heightTooLarge;
      if (heightTooSmall) {
        productToleranceMessage +=
          'Height too small: ' +
          (this.model.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' < (' +
          (this.productInfo.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' - ' +
          heightMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
      if (heightTooLarge) {
        productToleranceMessage +=
          'Height too large: ' +
          (this.model.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' > (' +
          (this.productInfo.height.value as number).toFixed(this.decimalDisplayPrecision) +
          ' + ' +
          heightMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
    }
    if (this.productInfo.length.loaded) {
      const lengthMarginOfError =
        ((this.schema.percentToleranceLength.value as number) / 100) * (this.productInfo.length.value as number);
      const lengthTooSmall = this.model.length.value < (this.productInfo.length.value as number) - lengthMarginOfError;
      const lengthTooLarge = this.model.length.value > (this.productInfo.length.value as number) + lengthMarginOfError;
      lengthWithinTolerance = !lengthTooSmall && !lengthTooLarge;
      if (lengthTooSmall) {
        productToleranceMessage +=
          'Length too small: ' +
          (this.model.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' < (' +
          (this.productInfo.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' - ' +
          lengthMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
      if (lengthTooLarge) {
        productToleranceMessage +=
          'Length too large: ' +
          (this.model.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' > (' +
          (this.productInfo.length.value as number).toFixed(this.decimalDisplayPrecision) +
          ' + ' +
          lengthMarginOfError.toFixed(this.decimalDisplayPrecision) +
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
          (this.model.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' < (' +
          (this.productInfo.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' - ' +
          widthMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
      if (widthTooLarge) {
        productToleranceMessage +=
          'Width too large: ' +
          (this.model.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' > (' +
          (this.productInfo.width.value as number).toFixed(this.decimalDisplayPrecision) +
          ' + ' +
          widthMarginOfError.toFixed(this.decimalDisplayPrecision) +
          '); ';
      }
    }

    if (!productToleranceMessage) {
      productToleranceMessage =
        'Product Dimensions: (L: ' +
        (this.productInfo.length.value as number).toFixed(this.decimalDisplayPrecision) +
        ' x W: ' +
        (this.productInfo.width.value as number).toFixed(this.decimalDisplayPrecision) +
        ' x H: ' +
        (this.productInfo.height.value as number).toFixed(this.decimalDisplayPrecision) +
        ') +/- ';
      if (
        this.schema.percentToleranceLength.value == this.schema.percentToleranceWidth.value &&
        this.schema.percentToleranceLength.value == this.schema.percentToleranceHeight.value
      ) {
        productToleranceMessage +=
          (this.schema.percentToleranceLength.value as number).toFixed(this.decimalDisplayPrecision) + '%';
      } else {
        productToleranceMessage +=
          '(L: ' +
          (this.schema.percentToleranceLength.value as number).toFixed(this.decimalDisplayPrecision) +
          '% x W: ' +
          (this.schema.percentToleranceWidth.value as number).toFixed(this.decimalDisplayPrecision) +
          '% x H: ' +
          (this.schema.percentToleranceHeight.value as number).toFixed(this.decimalDisplayPrecision) +
          '%)';
      }
    }

    this.report.productDimensionsWithinTolerance.test(
      widthWithinTolerance && heightWithinTolerance && lengthWithinTolerance,
      productToleranceMessage,
    );
  }

  private testRootNodeTransform() {
    if (this.schema.requireCleanRootNodeTransform.value === false) {
      this.report.rootNodeCleanTransform.skipTestWithMessage(this.model.rootNodeTransform.isClean() ? 'true' : 'false');
    } else {
      let rootNodeTransformOK = this.model.rootNodeTransform.isClean();
      let rootNodeTransformMessage = '';
      if (!rootNodeTransformOK) {
        if (!this.model.rootNodeTransform.locationIsZero()) {
          rootNodeTransformMessage +=
            'Location: (' +
            (this.model.rootNodeTransform.location.x.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.location.y.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.location.z.value as number).toFixed(this.decimalDisplayPrecision) +
            ') ';
        }
        if (!this.model.rootNodeTransform.rotationIsZero()) {
          rootNodeTransformMessage +=
            'Rotation: (' +
            (this.model.rootNodeTransform.rotation.x.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.rotation.y.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.rotation.z.value as number).toFixed(this.decimalDisplayPrecision) +
            ') ';
        }
        if (!this.model.rootNodeTransform.scaleIsOne()) {
          rootNodeTransformMessage +=
            'Scale: (' +
            (this.model.rootNodeTransform.scale.x.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.scale.y.value as number).toFixed(this.decimalDisplayPrecision) +
            ',' +
            (this.model.rootNodeTransform.scale.z.value as number).toFixed(this.decimalDisplayPrecision) +
            ')';
        }
      }
      this.report.rootNodeCleanTransform.test(rootNodeTransformOK, rootNodeTransformMessage);
    }
  }

  // The number of triangles should be less than or equal to the max, unless the max is -1
  private testTriangleCount() {
    if (this.schema.maxTriangleCount.value === -1) {
      this.report.triangleCount.skipTestWithMessage(this.model.triangleCount.value.toLocaleString());
    } else {
      const triangleCountOK =
        (this.model.triangleCount.value as number) <= (this.schema.maxTriangleCount.value as number);
      const triangleCountMessage =
        this.model.triangleCount.value.toLocaleString() +
        (triangleCountOK ? ' <= ' : ' > ') +
        this.schema.maxTriangleCount.value.toLocaleString();
      this.report.triangleCount.test(triangleCountOK, triangleCountMessage);
    }
  }

  // Texture dimensions should be within range, powers of 2, and (optionally) quadratic
  private testTextures() {
    // Texture Size - Height (max)
    if (this.schema.maxTextureHeight.value === -1) {
      this.report.textureDimensionsMaxHeight.skipTestWithMessage(this.model.texturesMaxHeight.value.toLocaleString());
    } else {
      const maxHeightPasses = this.model.texturesMaxHeight.value <= this.schema.maxTextureHeight.value;
      this.report.textureDimensionsMaxHeight.test(
        maxHeightPasses,
        this.model.texturesMaxHeight.value + (maxHeightPasses ? ' <= ' : ' > ') + this.schema.maxTextureHeight.value,
      );
    }

    // Texture Size - Height (min)
    if (this.schema.minTextureHeight.value === -1) {
      this.report.textureDimensionsMinHeight.skipTestWithMessage(this.model.texturesMinHeight.value.toLocaleString());
    } else {
      const minHeightPasses = this.model.texturesMinHeight.value >= this.schema.minTextureHeight.value;
      this.report.textureDimensionsMinHeight.test(
        minHeightPasses,
        this.model.texturesMinHeight.value + (minHeightPasses ? ' >= ' : ' < ') + this.schema.minTextureHeight.value,
      );
    }

    // Texture Size - Width (max)
    if (this.schema.maxTextureWidth.value === -1) {
      this.report.textureDimensionsMaxWidth.skipTestWithMessage(this.model.texturesMaxWidth.value.toLocaleString());
    } else {
      const maxWidthPasses = this.model.texturesMaxWidth.value <= this.schema.maxTextureWidth.value;
      this.report.textureDimensionsMaxWidth.test(
        maxWidthPasses,
        this.model.texturesMaxWidth.value + (maxWidthPasses ? ' <= ' : ' > ') + this.schema.maxTextureWidth.value,
      );
    }

    // Texture Size - Width (min)
    if (this.schema.minTextureWidth.value === -1) {
      this.report.textureDimensionsMinWidth.skipTestWithMessage(this.model.texturesMinWidth.value.toLocaleString());
    } else {
      const minWidthPasses = this.model.texturesMinWidth.value >= this.schema.minTextureWidth.value;
      this.report.textureDimensionsMinWidth.test(
        minWidthPasses,
        this.model.texturesMinWidth.value + (minWidthPasses ? ' >= ' : ' < ') + this.schema.minTextureWidth.value,
      );
    }

    // Texture Size - Power of 2
    if (this.schema.requireTextureDimensionsBePowersOfTwo.value === false) {
      this.report.texturesPowerOfTwo.skipTestWithMessage(
        (this.model.texturesPowerOfTwo.value as boolean) ? 'true' : 'false',
      );
    } else {
      this.report.texturesPowerOfTwo.test(
        this.model.texturesPowerOfTwo.value as boolean,
        '', // TODO: R.8 Improved - report which textures failed (if any)
      );
    }

    // Texture Size - Quadratic (width=height)
    if (this.schema.requireTextureDimensionsBeQuadratic.value === false) {
      this.report.texturesQuadratic.skipTestWithMessage(
        (this.model.texturesQuadratic.value as boolean) ? 'true' : 'false',
      );
    } else {
      this.report.texturesQuadratic.test(
        this.model.texturesQuadratic.value as boolean,
        '', // TODO: R.8 Improved - report which textures failed (if any)
      );
    }

    // PBR safe colors
    if (this.schema.pbrColorMax.value === -1) {
      this.report.pbrColorMax.skipTestWithMessage((this.model.colorValueMax.value as number).toLocaleString());
    } else {
      this.report.pbrColorMax.test(
        this.model.colorValueMax.value <= this.schema.pbrColorMax.value,
        (this.model.colorValueMax.value as number).toLocaleString() +
          (this.model.colorValueMax.value <= this.schema.pbrColorMax.value ? ' <= ' : ' > ') +
          (this.schema.pbrColorMax.value as number).toLocaleString(),
      );
    }
    if (this.schema.pbrColorMin.value === -1) {
      this.report.pbrColorMin.skipTestWithMessage((this.model.colorValueMin.value as number).toLocaleString());
    } else {
      this.report.pbrColorMin.test(
        this.model.colorValueMin.value >= this.schema.pbrColorMin.value,
        (this.model.colorValueMin.value as number).toLocaleString() +
          (this.model.colorValueMin.value >= this.schema.pbrColorMin.value ? ' >= ' : ' < ') +
          (this.schema.pbrColorMin.value as number).toLocaleString(),
      );
    }
  }

  // UVs are in the 0 to 1 range, not inverted, and texel density is within limits
  private testUVs() {
    // 0-1 Range
    const uvRangeMessage =
      'u: ' +
      (this.model.u.min.value as number).toFixed(this.decimalDisplayPrecision) +
      ' to ' +
      (this.model.u.max.value as number).toFixed(this.decimalDisplayPrecision) +
      ', v: ' +
      (this.model.v.min.value as number).toFixed(this.decimalDisplayPrecision) +
      ' to ' +
      (this.model.v.max.value as number).toFixed(this.decimalDisplayPrecision);
    if (this.schema.requireUVRangeZeroToOne.value === false) {
      this.report.uvsInZeroToOneRange.skipTestWithMessage(uvRangeMessage);
    } else {
      this.report.uvsInZeroToOneRange.test(this.model.uvIsInRangeZeroToOne(), uvRangeMessage);
    }

    // Inverted UVs
    if (this.schema.notInvertedUVs.value === false) {
      this.report.uvsInverted.skipTestWithMessage(this.model.invertedTriangleCount.value.toLocaleString());
    } else {
      // TODO: O.15 Improved - report which primitives have inverted normals
      this.report.uvsInverted.test(
        this.model.invertedTriangleCount.value === 0,
        this.model.invertedTriangleCount.value.toLocaleString(),
      );
    }

    // Overlapping UVs
    if (this.schema.notOverlappingUVs.value === false) {
      this.report.uvsOverlap.skipTestWithMessage(this.model.overlappingUvCount.value.toLocaleString());
    } else {
      // TODO: O.13 Improved - report which primitives have overlapping uvs
      this.report.uvsOverlap.test(
        this.model.overlappingUvCount.value === 0,
        this.model.overlappingUvCount.value.toLocaleString(),
      );
    }

    // Pixels per Meter (Texel Density)
    // TODO: R.9 Improved - texel density calculation per material (move this to Primitive.ts)
    const maxResolutionSquared =
      (this.model.texturesMaxWidth.value as number) * (this.model.texturesMaxHeight.value as number);
    const minResolutionSquared =
      (this.model.texturesMinWidth.value as number) * (this.model.texturesMinHeight.value as number);
    const maxPixelDensity = (this.model.maxUvDensity.value as number) * maxResolutionSquared;
    const minPixelDensity = (this.model.minUvDensity.value as number) * minResolutionSquared;
    const maxPixelDensityMessage = maxPixelDensity.toLocaleString();
    const minPixelDensityMessage = minPixelDensity.toLocaleString();
    // Max ppm
    if (this.schema.maxPixelsPerMeter.value === -1) {
      this.report.pixelsPerMeterMax.skipTestWithMessage(maxPixelDensityMessage);
    } else {
      const maxUvDensityOK = maxPixelDensity <= this.schema.maxPixelsPerMeter.value;
      this.report.pixelsPerMeterMax.test(
        maxUvDensityOK,
        maxPixelDensityMessage +
          (maxUvDensityOK ? ' <= ' : ' > ') +
          (this.schema.maxPixelsPerMeter.value as number).toLocaleString(),
      );
    }
    // Min ppm
    if (this.schema.minPixelsPerMeter.value === -1) {
      this.report.pixelsPerMeterMin.skipTestWithMessage(minPixelDensityMessage);
    } else {
      const minUvDensityOK = minPixelDensity >= this.schema.minPixelsPerMeter.value;
      this.report.pixelsPerMeterMin.test(
        minUvDensityOK,
        minPixelDensityMessage +
          (minUvDensityOK ? ' >= ' : ' < ') +
          (this.schema.minPixelsPerMeter.value as number).toLocaleString(),
      );
    }
  }
}
