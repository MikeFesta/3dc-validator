import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Model', function () {
  const v = new Validator();

  before('Load Model', async function () {
    try {
      await v.model.loadFromFileSystem('tests/blender-default-cube.glb');
    } catch (err) {
      throw new Error('Unable to load test model');
    }
  });
  describe('Loaded', function () {
    it('should load the blender-default-cube', function () {
      expect(v.model.loaded).to.be.true;
    });
  });
  describe('File Size', function () {
    it('should match the blender-default-cube filesize of 2kb', function () {
      expect(v.model.fileSizeInKb.value as number).to.equal(2); // test cube is currenly only 2kb, but this will change once adding some materials
    });
  });
  describe('Triangle Count', function () {
    it('should match the blender-default-cube triangle count of 12', function () {
      expect(v.model.triangleCount.value as number).to.equal(12);
    });
  });
  describe('Material Count', function () {
    it('should match the blender-default-cube material count of 1', function () {
      expect(v.model.materialCount.value as number).to.equal(1);
    });
  });
});
