import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { MainMainSelector } from '../../../state/selectors/main.selector';
import { AppState } from '../../../state/app.state';
import { portfolioCopy, PortfolioCopyKey } from '../../interfaces/main';

@Component({
  selector: 'portfolio-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './portfolio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
  private readonly translate = inject(TranslateService);
  private readonly language = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), {
    initialValue: this.translate.getCurrentLang(),
  });
  private readonly profile = toSignal(inject(Store<AppState>).select(MainMainSelector));
  protected copy(key: PortfolioCopyKey) { return portfolioCopy(this.profile(), key, this.language()); }
  protected caseIntro(item: string) { return this.copy(item === 'aws' ? 'awsIntro' : 'genaiIntro'); }
  protected readonly view = inject(ActivatedRoute).snapshot.data['view'] as string;
  protected readonly roles = [
    { name: 'Continental General', date: '2026-02', role: 'AI Cloud Engineer', key: 'continental' },
    { name: 'Ancient', date: '2025-07 — 2026-01', role: 'Senior Software Developer, Data & AI', key: 'ancient' },
    { name: 'HK Consulting', date: '2024-07 — 2025-07', role: 'Senior Software Developer & Product Engineer', key: 'hk' },
    { name: 'Jobsity', date: '2024-01 — 2024-07', role: 'Senior Front-End Developer & Angular Specialist', key: 'jobsity' },
    { name: 'Stand8', date: '2023-07 — 2024-01', role: 'Senior Full-Stack Developer', key: 'stand8' },
    { name: 'ABDP', date: '2022-11 — 2024-01', role: 'Front-End Developer', key: 'abdp' },
    { name: 'Alseam', date: '2021-07 — 2022-11', role: 'Full-Stack Developer & SRE', key: 'alseam' },
    { name: 'Katze Records', date: '2018-01 — 2021-04', role: 'Full-Stack Developer & SRE', key: 'katze' },
    { name: 'Freelance', date: '2018', role: 'Full-Stack Developer & AWS Solutions Engineer', key: 'freelance' },
  ];
  protected readonly cases = ['aws', 'genai'];
}
