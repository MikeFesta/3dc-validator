import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Validator', function () {
  const v = new Validator();

  before('Load Schema and Model', async function () {
    try {
      await v.schema.loadFromFileSystem('/Users/mikefesta/code/3dc-validator-cli/test-data/pass.schema');
    } catch (err) {
      throw new Error('Unable to load test schema');
    }
    try {
      await v.model.loadFromFileSystem('/Users/mikefesta/code/3dc-validator-cli/test-data/test.glb');
    } catch (err) {
      throw new Error('Unable to load test model');
    }
  });
  describe('Version', function () {
    it('should match the current version', function () {
      expect(v.version).to.equal('1.0.0-alpha.3');
    });
  });
  describe('Schema Loaded', function () {
    it('should have the schema loaded', function () {
      expect(v.schema.loaded).to.be.true;
    });
  });
  describe('Model Loaded', function () {
    it('should have the model loaded', function () {
      expect(v.model.loaded).to.be.true;
    });
  });
});
