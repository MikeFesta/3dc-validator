import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Model Passing', function () {
  const v = new Validator();

  before('Load Model', async function () {
    try {
      await v.model.loadFromFileSystem('tests/blender-default-cube-passing.glb');
    } catch (err) {
      throw new Error('Unable to load test model');
    }
  });
  describe('Loaded', function () {
    it('should load the blender-default-cube-passing', function () {
      expect(v.model.loaded).to.be.true;
    });
  });
  describe('File Size', function () {
    it('should match the blender-default-cube-passing filesize of 2kb', function () {
      expect(v.model.fileSizeInKb.value as number).to.equal(2); // test cube is currenly only 2kb, but this will change once adding some materials
    });
  });
  describe('Triangle Count', function () {
    it('should match the blender-default-cube-passing triangle count of 12', function () {
      expect(v.model.triangleCount.value as number).to.equal(12);
    });
  });
  describe('Material Count', function () {
    it('should match the blender-default-cube-passing material count of 1', function () {
      expect(v.model.materialCount.value as number).to.equal(1);
    });
  });
  describe('Width', function () {
    it('should match the blender-default-cube-passing width of 2m', function () {
      expect(v.model.width.value as number).to.equal(2);
    });
  });
  describe('Height', function () {
    it('should match the blender-default-cube-passing height of 2m', function () {
      expect(v.model.height.value as number).to.equal(2);
    });
  });
  describe('Depth', function () {
    it('should match the blender-default-cube-passing depth of 2m', function () {
      expect(v.model.depth.value as number).to.equal(2);
    });
  });
});

describe('Model Failing', function () {
  const v = new Validator();

  before('Load Model', async function () {
    try {
      await v.model.loadFromFileSystem('tests/blender-default-cube-failing.glb');
    } catch (err) {
      throw new Error('Unable to load test model');
    }
  });
  describe('Loaded', function () {
    it('should load the blender-default-cube-failing model', function () {
      expect(v.model.loaded).to.be.true;
    });
  });
  describe('Power of Two Textures', function () {
    it('should fail for blender-default-cube-failing because the resolution is 500x500', function () {
      expect(v.model.texturesPowerOfTwo.value as boolean).to.be.false;
    });
  });
});
