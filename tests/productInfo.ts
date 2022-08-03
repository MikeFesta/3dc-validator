import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Product Info Passing', function () {
  const v = new Validator();

  before('Load Product Info', async function () {
    try {
      await v.productInfo.loadFromFileSystem('tests/passing-product.json');
    } catch (err) {
      throw new Error('Unable to load passing product info');
    }
  });
  describe('Loaded', function () {
    it('should load the passing product info', function () {
      expect(v.productInfo.loaded).to.be.true;
    });
  });
  describe('Dimensions', function () {
    it('should be 1.99 for height, 2.01 for width, and 2.02 for depth', function () {
      expect(v.productInfo.dimensionsDepth.value as number).to.equal(2.02);
      expect(v.productInfo.dimensionsHeight.value as number).to.equal(1.99);
      expect(v.productInfo.dimensionsWidth.value as number).to.equal(2.01);
    });
  });
});
