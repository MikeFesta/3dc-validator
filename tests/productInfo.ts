import { expect } from 'chai';
import { Validator } from '../dist/Validator.js';

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
    it('should be (L:2.02 x W:2.01 x H:1.99)', function () {
      expect(v.productInfo.length.value as number).to.equal(2.02);
      expect(v.productInfo.width.value as number).to.equal(2.01);
      expect(v.productInfo.height.value as number).to.equal(1.99);
    });
  });
});
