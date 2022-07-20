export interface ReportItemInterface {
  message: string;
  name: string;
  pass: boolean;
  tested: boolean;
  test: (passCondition: boolean) => void;
}

export class ReportItem implements ReportItemInterface {
  message = '';
  name = '';
  pass = false;
  tested = false;

  constructor(name: string) {
    this.name = name;
  }

  public test(passCondition: boolean, message?: string) {
    this.message = message ?? '';
    this.pass = passCondition;
    this.tested = true;
  }
}
