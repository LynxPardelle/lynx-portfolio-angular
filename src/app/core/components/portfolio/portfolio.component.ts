import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'portfolio-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './portfolio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
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
