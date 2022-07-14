export interface ReportItemInterface {
  name: string;
  pass: boolean;
  tested: boolean;
  test: (passCondition: boolean) => void;
}

export class ReportItem implements ReportItemInterface {
  name = '';
  pass = false;
  tested = false;

  constructor(name: string) {
    this.name = name;
  }

  public test(passCondition: boolean) {
    this.pass = passCondition;
    this.tested = true;
  }
}
