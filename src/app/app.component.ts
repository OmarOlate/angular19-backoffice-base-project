import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { I18nService, LanguageSelectorComponent } from '@app/i18n';
import { Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { filter, merge } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LanguageSelectorComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-boilerplate-v18';

  constructor(
    private readonly _router: Router,
    private readonly _titleService: Title,
    private readonly _translateService: TranslateService,
    private readonly _i18nService: I18nService,
  ) {}

  ngOnInit() {
    // Initialize i18nService with default language and supported languages
    this._i18nService.init(environment.defaultLanguage, environment.supportedLanguages);

    const onNavigationEnd = this._router.events.pipe(filter((event) => event instanceof NavigationEnd));

    merge(this._translateService.onLangChange, onNavigationEnd)
      .pipe(untilDestroyed(this))
      .subscribe((event) => {
        const titles = this.getTitle(this._router.routerState, this._router.routerState.root);

        if (titles.length === 0) {
          this._titleService.setTitle(this._translateService.instant('Home'));
        } else {
          const translatedTitles = titles.map((titlePart) => this._translateService.instant(titlePart));
          const allTitlesSame = translatedTitles.every((title, _, arr) => title === arr[0]);
          this._titleService.setTitle(allTitlesSame ? translatedTitles[0] : translatedTitles.join(' | '));
        }

        if (event['lang']) {
          // Uncomment the following line to force a reload of the page when the language changes if needed for translations from backend
          // window.location.reload();
        }
      });
  }

  getTitle(state: any, parent: any): any[] {
    const data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(...this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }

  ngOnDestroy() {
    this._i18nService.destroy();
  }
}
