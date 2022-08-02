import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Report Passing', function () {
  const v = new Validator();

  before('Load Report', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/pass.schema');
    } catch (err) {
      throw new Error('Unable to load test schema');
    }
    try {
      await v.model.loadFromFileSystem('tests/blender-default-cube-passing.glb');
    } catch (err) {
      throw new Error('Unable to load test model');
    }
    await v.generateReport();
  });
  describe('Ready', function () {
    it('should have the passing report ready', function () {
      expect(v.reportReady).to.be.true;
    });
  });
  describe('File Size', function () {
    it('should pass for pass.schema and blender-default-cube-passing', function () {
      expect(v.report.fileSize.tested).to.be.true;
      expect(v.report.fileSize.pass).to.be.true;
    });
  });
  describe('Triangle Count', function () {
    it('should pass for pass.schema and blender-default-cube-passing', function () {
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.true;
    });
  });
  describe('Material Count', function () {
    it('should pass for pass.schema and blender-default-cube-passing', function () {
      expect(v.report.materialCount.tested).to.be.true;
      expect(v.report.materialCount.pass).to.be.true;
    });
  });
  describe('Texture Dimensions are Powers of 2', function () {
    it('should pass for pass.schema and blender-default-cube-passing', function () {
      expect(v.report.texturesPowerOfTwo.tested).to.be.true;
      expect(v.report.texturesPowerOfTwo.pass).to.be.true;
    });
  });
  describe('Max Dimensions', function () {
    it('should be less than 100x100x100', function () {
      expect(v.report.dimensionsMax.tested).to.be.true;
      expect(v.report.dimensionsMax.pass).to.be.true;
    });
  });
  describe('Min Dimensions', function () {
    it('should be greater than 0.01x0.01x0.01', function () {
      expect(v.report.dimensionsMin.tested).to.be.true;
      expect(v.report.dimensionsMin.pass).to.be.true;
    });
  });
});

describe('Report Failing', function () {
  const v = new Validator();

  before('Load Report', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/fail.schema');
    } catch (err) {
      throw new Error('Unable to load test schema');
    }
    try {
      await v.model.loadFromFileSystem('tests/blender-default-cube-failing.glb');
    } catch (err) {
      throw new Error('Unable to load test model');
    }
    await v.generateReport();
  });
  describe('Ready', function () {
    it('should have the failing report ready', function () {
      expect(v.reportReady).to.be.true;
    });
  });
  describe('File Size', function () {
    it('should fail for fail.schema and blender-default-cube-failing', function () {
      expect(v.report.fileSize.tested).to.be.true;
      expect(v.report.fileSize.pass).to.be.false;
    });
  });
  describe('Triangle Count', function () {
    it('should fail for fail.schema and blender-default-cube-failing', function () {
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.false;
    });
  });
  describe('Texture Dimensions are Powers of 2', function () {
    it('should fail for fail.schema and blender-default-cube-failing', function () {
      expect(v.report.texturesPowerOfTwo.tested).to.be.true;
      expect(v.report.texturesPowerOfTwo.pass).to.be.false;
    });
  });
  describe('Material Count', function () {
    it('should fail for fail.schema and blender-default-cube-failing', function () {
      expect(v.report.materialCount.tested).to.be.true;
      expect(v.report.materialCount.pass).to.be.false;
    });
  });
});
