import { ReportItem, ReportItemInterface } from './ReportItem';

export interface ReportInterface {
  fileSize: ReportItemInterface;
  getItems: () => ReportItemInterface[];
}

export class Report implements ReportInterface {
  fileSize = new ReportItem('File Size');
  getItems() {
    return [this.fileSize];
  }
}
