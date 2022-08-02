import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Schema Passing', function () {
  const v = new Validator();

  before('Load Schema', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/pass.schema');
    } catch (err) {
      throw new Error('Unable to load pass schema');
    }
  });
  describe('Loaded', function () {
    it('should load the pass schema', function () {
      expect(v.schema.loaded).to.be.true;
    });
  });
  describe('Min File Size', function () {
    it('should match the pass.schema min file size of 1kb', function () {
      expect(v.schema.minFileSizeInKb.value as number).to.equal(1);
    });
  });
  describe('Max File Size', function () {
    it('should match the pass.schema max file size of 5120kb', function () {
      expect(v.schema.maxFileSizeInKb.value as number).to.equal(5120);
    });
  });
  describe('Max Triangle Count', function () {
    it('should match the pass.schema max triangle count of 30,000', function () {
      expect(v.schema.maxTriangleCount.value as number).to.equal(30000);
    });
  });
  describe('Max Material Count', function () {
    it('should match the pass.schema max material count of 2', function () {
      expect(v.schema.maxMaterialCount.value as number).to.equal(2);
    });
  });
  describe('Require Texture Dimensions be Powers of 2', function () {
    it('should be set to true', function () {
      expect(v.schema.requireTextureDimensionsBePowersOfTwo.value as boolean).to.be.true;
    });
  });
  describe('Minimum Dimensions', function () {
    it('should be 0.01 for height, width, and depth', function () {
      expect(v.schema.dimensionsMinDepth.value as number).to.equal(0.01);
      expect(v.schema.dimensionsMinHeight.value as number).to.equal(0.01);
      expect(v.schema.dimensionsMinWidth.value as number).to.equal(0.01);
    });
  });
  describe('Maximum Dimensions', function () {
    it('should be 100 for height, width, and depth', function () {
      expect(v.schema.dimensionsMaxDepth.value as number).to.equal(100);
      expect(v.schema.dimensionsMaxHeight.value as number).to.equal(100);
      expect(v.schema.dimensionsMaxWidth.value as number).to.equal(100);
    });
  });
});

describe('Schema Failing', function () {
  const v = new Validator();

  before('Load Schema', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/fail.schema');
    } catch (err) {
      throw new Error('Unable to load fail schema');
    }
  });
  describe('Loaded', function () {
    it('should load the fail schema', function () {
      expect(v.schema.loaded).to.be.true;
    });
  });
  describe('Min File Size', function () {
    it('should match the fail.schema min file size of 100kb', function () {
      expect(v.schema.minFileSizeInKb.value as number).to.equal(100);
    });
  });
  describe('Max File Size', function () {
    it('should match the fail.schema max file size of 1024kb', function () {
      expect(v.schema.maxFileSizeInKb.value as number).to.equal(1024);
    });
  });
  describe('Max Triangle Count', function () {
    it('should match the fail.schema max triangle count of 6', function () {
      expect(v.schema.maxTriangleCount.value as number).to.equal(6);
    });
  });
  describe('Max Material Count', function () {
    it('should match the fail.schema max material count of 1', function () {
      expect(v.schema.maxMaterialCount.value as number).to.equal(1);
    });
  });
  describe('Require Texture Dimensions be Powers of 2', function () {
    it('should be set to true', function () {
      expect(v.schema.requireTextureDimensionsBePowersOfTwo.value as boolean).to.be.true;
    });
  });
  describe('Minimum Dimensions', function () {
    it('should be 1 for height, width, and depth', function () {
      expect(v.schema.dimensionsMinDepth.value as number).to.equal(1);
      expect(v.schema.dimensionsMinHeight.value as number).to.equal(1);
      expect(v.schema.dimensionsMinWidth.value as number).to.equal(1);
    });
  });
  describe('Maximum Dimensions', function () {
    it('should be 10 for height, width, and depth', function () {
      expect(v.schema.dimensionsMaxDepth.value as number).to.equal(10);
      expect(v.schema.dimensionsMaxHeight.value as number).to.equal(10);
      expect(v.schema.dimensionsMaxWidth.value as number).to.equal(10);
    });
  });
});
