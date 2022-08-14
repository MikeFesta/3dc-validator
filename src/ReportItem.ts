export interface ReportItemInterface {
  guidelinesUrl: string;
  message: string;
  name: string;
  pass: boolean;
  tested: boolean;
  test: (passCondition: boolean) => void;
}

export class ReportItem implements ReportItemInterface {
  guidelinesUrl = '';
  message = '';
  name = '';
  pass = false;
  tested = false;

  constructor(name: string, guidelinesUrl?: string) {
    this.guidelinesUrl =
      guidelinesUrl ??
      'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md';
    this.name = name;
  }

  public test(passCondition: boolean, message?: string) {
    this.message = message ?? '';
    this.pass = passCondition;
    this.tested = true;
  }

  public skipTestWithMessage(message: string) {
    this.message = message;
    this.tested = false;
  }
}
