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
      await v.model.loadFromFileSystem('tests/blender-default-cube.glb');
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
    it('should pass for pass.schema and blender-default-cube', function () {
      expect(v.report.fileSize.tested).to.be.true;
      expect(v.report.fileSize.pass).to.be.true;
    });
  });
  describe('Triangle Count', function () {
    it('should pass for pass.schema and blender-default-cube', function () {
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.true;
    });
  });
  describe('Material Count', function () {
    it('should pass for pass.schema and blender-default-cube', function () {
      expect(v.report.materialCount.tested).to.be.true;
      expect(v.report.materialCount.pass).to.be.true;
    });
  });
  describe('Texture Dimensions are Powers of 2', function () {
    it('should pass for pass.schema and blender-default-cube', function () {
      expect(v.report.texturesPowerOfTwo.tested).to.be.true;
      expect(v.report.texturesPowerOfTwo.pass).to.be.true;
    });
  });
});
