import { LoadableAttribute, LoadableAttributeInterface } from './LoadableAttribute.js';
import { Svg, SvgInterface } from './Svg.js';

export interface MaxMinLoadableAttributeInterface {
  max: LoadableAttributeInterface;
  min: LoadableAttributeInterface;
}

export interface UVInterface {
  invertedFaceCount: LoadableAttribute;
  invertedFacesSvgs: SvgInterface[];
  u: MaxMinLoadableAttributeInterface;
  v: MaxMinLoadableAttributeInterface;
  isInRangeZeroToOne: () => boolean;
}

export class UV implements UVInterface {
  invertedFaceCount = new LoadableAttribute('Number of inverted faces', 0);
  invertedFacesSvgs = [] as SvgInterface[];
  u = {
    max: new LoadableAttribute('Max U value', 0),
    min: new LoadableAttribute('Min U value', 0),
  };
  v = {
    max: new LoadableAttribute('Max V value', 0),
    min: new LoadableAttribute('Min V value', 0),
  };

  isInRangeZeroToOne = () => {
    return (
      (this.u.max.value as number) <= 1 &&
      (this.u.min.value as number) >= 0 &&
      (this.v.max.value as number) <= 1 &&
      (this.v.min.value as number) >= 0
    );
  };
}
