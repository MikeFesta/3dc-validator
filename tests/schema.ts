import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Schema', function () {
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
});
