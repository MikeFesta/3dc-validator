import { Model, ModelInterface } from './Model';
import { Report, ReportInterface } from './Report';
import { Schema, SchemaInterface } from './Schema';

export interface ValidatorInterface {
  model: ModelInterface;
  report: ReportInterface;
  reportReady: boolean;
  schema: SchemaInterface;
}

export class Validator implements ValidatorInterface {
  model = new Model();
  report = new Report();
  reportReady = false;
  schema = new Schema();

  public generateReport() {
    if (!this.model.loaded) {
      throw new Error('Unable to generate report. No 3D model loaded.');
    }
    if (!this.schema.loaded) {
      throw new Error('Unable to generate report. No schema loaded.');
    }
    this.report.fileSize.test(
      (this.model.fileSizeInKb.value as number) > (this.schema.minFileSizeInKb.value as number) &&
        (this.model.fileSizeInKb.value as number) < (this.schema.maxFileSizeInKb.value as number),
    );
    this.report.triangleCount.test(
      (this.model.triangleCount.value as number) < (this.schema.maxTriangleCount.value as number),
    );
    this.reportReady = true;
  }
}
