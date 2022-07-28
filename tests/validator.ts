import { expect } from 'chai';
import { Validator } from '../dist/Validator';

describe('Validator', function () {
  const v = new Validator();

  describe('Version', function () {
    it('should match the current version', function () {
      expect(v.version).to.equal('1.0.0-alpha.5');
    });
  });
});
