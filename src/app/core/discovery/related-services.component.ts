import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

const music = 'https://music.lynxpardelle.com';
const offer = (slug: string) => 'https://' + slug + '.music.lynxpardelle.com/';

const sections = {
  music: [
    { key: 'artist', url: music + '/' },
    { key: 'training', url: music + '/formacion' },
    { key: 'masterclasses', url: music + '/formacion/masterclasses' },
    { key: 'lessons', url: offer('servicio-clases-personalizadas') },
    { key: 'mixing', url: offer('servicio-mezcla') },
  ],
  reel: [
    { key: 'video', url: offer('servicio-videoclips') },
    { key: 'animation', url: offer('servicio-animaciones') },
    { key: 'production', url: offer('curso-produccion-audiovisual') },
  ],
  book: [
    { key: 'cover', url: offer('servicio-portadas-musicales') },
    { key: 'logos', url: offer('servicio-logos') },
    { key: 'flyers', url: offer('servicio-flyers-digitales') },
  ],
  webs: [
    { key: 'sites', url: offer('servicio-sitios-web') },
    { key: 'landing', url: offer('servicio-landing-pages') },
    { key: 'presskits', url: offer('servicio-presskits-online') },
    { key: 'portfolios', url: offer('servicio-portafolios-online') },
  ],
} as const;

@Component({
  selector: 'portfolio-related-services',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="related portfolio-surface" aria-labelledby="related-services-heading">
      <h2 id="related-services-heading">{{ group() + ".title" | translate }}</h2>
      <p>{{ group() + ".intro" | translate }}</p>
      <ul>
        @for (link of links(); track link.key) {
          <li><a [href]="link.url">{{ "discovery.links." + link.key | translate }}</a></li>
        }
      </ul>
    </section>
  `,
  styles: `
    .related {
      width: min(68rem, calc(100% - 2rem));
      margin: 0 auto 2rem;
      padding: clamp(1rem, 3vw, 2rem);
    }
    h2 { margin: 0 0 .6rem; }
    p { max-width: 66ch; }
    ul { display: flex; flex-wrap: wrap; column-gap: 1.5rem; padding-inline-start: 0; margin: 0; list-style: none; }
    a { display: inline-flex; align-items: center; min-block-size: 44px; text-underline-offset: .22em; }
    a:focus-visible { outline-offset: 3px; }
  `,
})
export class RelatedServices {
  readonly section = input.required<keyof typeof sections>();
  protected readonly group = computed(() => 'discovery.' + this.section());
  protected readonly links = computed(() => sections[this.section()]);
}
