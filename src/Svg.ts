export interface SvgViewBoxInterface {
  height: number;
  width: number;
  xStart: number;
  yStart: number;
}

export interface ExtentsInterface {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface SvgInterface {
  extents: ExtentsInterface;
  id: string;
  height: number;
  pathCount: number;
  pathData: string;
  version: string;
  viewBox: SvgViewBoxInterface;
  width: number;

  adjustExtents: (x: number, y: number) => void;
  getSvgData: () => string;
  getSvgDataZoomedToExtents: () => string;
}

export class Svg implements SvgInterface {
  extents = {
    minX: undefined as unknown as number,
    maxX: undefined as unknown as number,
    minY: undefined as unknown as number,
    maxY: undefined as unknown as number,
  };
  id = '';
  height = 1024;
  pathCount = 0;
  pathData = '';
  version = '1.1';
  viewBox = {
    height: 1000,
    width: 1000,
    xStart: 0,
    yStart: 0,
  };
  width = 1024;

  constructor(id: string) {
    this.id = id;
  }

  adjustExtents = (x: number, y: number) => {
    if (this.extents.minX === undefined || x < this.extents.minX) {
      this.extents.minX = x;
    } else if (this.extents.maxX === undefined || x > this.extents.maxX) {
      this.extents.maxX = x;
    }
    if (this.extents.minY === undefined || y < this.extents.minY) {
      this.extents.minY = y;
    } else if (this.extents.maxY === undefined || y > this.extents.maxY) {
      this.extents.maxY = y;
    }
  };

  getSvgData = () => {
    return (
      '<svg version="' +
      this.version +
      '" id="' +
      this.id +
      '" width="' +
      this.width +
      '" height="' +
      this.height +
      '" viewBox="' +
      this.viewBox.xStart +
      ' ' +
      this.viewBox.yStart +
      ' ' +
      this.viewBox.width +
      ' ' +
      this.viewBox.height +
      '" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
      this.pathData +
      '</svg>'
    );
  };
  getSvgDataZoomedToExtents = () => {
    return (
      '<svg version="' +
      this.version +
      '" id="' +
      this.id +
      '" width="' +
      this.width +
      '" height="' +
      this.height +
      '" viewBox="' +
      this.extents.minX +
      ' ' +
      this.extents.minY +
      ' ' +
      (this.extents.maxX - this.extents.minX) +
      ' ' +
      (this.extents.maxY - this.extents.minY) +
      '" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
      this.pathData +
      '</svg>'
    );
  };
}
