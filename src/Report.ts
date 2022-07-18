import { ReportItem, ReportItemInterface } from './ReportItem';

export interface ReportInterface {
  fileSize: ReportItemInterface;
  triangleCount: ReportItemInterface;
  getItems: () => ReportItemInterface[];
}

export class Report implements ReportInterface {
  fileSize = new ReportItem('File Size');
  triangleCount = new ReportItem('Triangle Count');
  getItems() {
    return [this.fileSize, this.triangleCount];
  }
}
