import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Report Failing', function () {
  const v = new Validator();

  before('Load Report', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/fail.schema');
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
    it('should have the failing report ready', function () {
      expect(v.reportReady).to.be.true;
    });
  });
  describe('File Size', function () {
    it('should fail for fail.schema and blender-default-cube', function () {
      expect(v.report.fileSize.tested).to.be.true;
      expect(v.report.fileSize.pass).to.be.false;
    });
  });
  describe('Triangle Count', function () {
    it('should fail for fail.schema and blender-default-cube', function () {
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.false;
    });
  });
  describe('Material Count', function () {
    it('should fail for fail.schema and blender-default-cube', function () {
      expect(v.report.materialCount.tested).to.be.true;
      expect(v.report.materialCount.pass).to.be.false;
    });
  });
});
