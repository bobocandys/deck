import { ScrollToService } from 'core/utils/scrollTo/scrollTo.service';

export interface IWizardPageState {
  done: boolean;
  blocked: boolean;
  rendered: boolean;
  current: boolean;
  dirty: boolean;
  markCompleteOnView: boolean;
  required: boolean;
}

export interface IWizardPage {
  state: IWizardPageState;
  key: string;
  label: string;
}

export class ModalWizard {
  public static renderedPages: IWizardPage[] = [];
  public static pageRegistry: IWizardPage[] = [];
  public static currentPage: IWizardPage;
  public static heading: string;

  public static setHeading(heading: string): void {
    this.heading = heading;
  }

  public static getPage(key: string): IWizardPage {
    return this.pageRegistry.find(p => p.key === key);
  }

  public static markDirty(key: string): void {
    this.getPage(key).state.dirty = true;
  }

  public static markClean(key: string): void {
    this.getPage(key).state.dirty = false;
  }

  public static markComplete(key: string): void {
    this.getPage(key).state.done = true;
  }

  public static markIncomplete(key: string): void {
    this.getPage(key).state.done = false;
  }

  public static setCurrentPage(page: IWizardPage, skipScroll?: boolean): void {
    this.pageRegistry.forEach(test => (test.state.current = test === page));
    this.currentPage = page;
    this.markClean(page.key);

    if (page.state.markCompleteOnView) {
      this.markComplete(page.key);
    }

    if (!skipScroll) {
      ScrollToService.scrollTo(`[waypoint="${page.key}"]`, '[waypoint-container]', 143);
    }
  }

  public static registerPage(key: string, label: string, state?: IWizardPageState): void {
    state = state || {
      done: false,
      blocked: true,
      rendered: true,
      current: false,
      dirty: false,
      markCompleteOnView: false,
      required: false,
    };
    this.pageRegistry.push({ key, label, state });
    this.renderPages();
  }

  public static renderPages(): void {
    const renderedPages: IWizardPage[] = this.pageRegistry.filter(page => page.state.rendered);
    this.renderedPages = renderedPages;
    if (renderedPages.length === 1) {
      this.setCurrentPage(renderedPages[0]);
    }
  }

  public static isComplete(): boolean {
    return this.renderedPages
      .map(p => p.state)
      .filter(s => s.rendered && s.required)
      .every(s => s.done && !s.dirty);
  }

  public static allPagesVisited(): boolean {
    return this.renderedPages
      .map(p => p.state)
      .filter(s => s.rendered && s.required)
      .every(s => s.done);
  }

  public static setRendered(key: string, rendered: boolean): void {
    this.pageRegistry.filter(page => page.key === key).forEach(page => (page.state.rendered = rendered));
    this.renderPages();
  }

  public static includePage(key: string): void {
    this.setRendered(key, true);
  }

  public static excludePage(key: string): void {
    this.setRendered(key, false);
  }

  public static resetWizard(): void {
    this.renderedPages.length = 0;
    this.pageRegistry.length = 0;
    this.currentPage = null;
    this.heading = null;
  }
}
