import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  PORTFOLIO_ORIGIN, PORTFOLIO_PERSON, PortfolioLanguage, portfolioPath, portfolioRoute,
} from './public-discovery';

interface ArticleDiscovery {
  title: string;
  description: string;
  hasTranslation: boolean;
}

const IMAGE = PORTFOLIO_ORIGIN + '/assets/images/lynxpardelle-presskit.jpg';

@Injectable({ providedIn: 'root' })
export class PortfolioDiscovery {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  apply(url: string, article?: ArticleDiscovery, displayLanguage?: PortfolioLanguage): void {
    const route = portfolioRoute(url);
    this.doc.documentElement.lang = displayLanguage ?? route.language;
    const privateOrMissing = route.kind === 'private' || route.kind === 'missing';
    const indexable = !privateOrMissing && (route.kind !== 'article' || Boolean(article));
    this.meta.updateTag({ name: 'robots', content: !indexable ? 'noindex, nofollow' : 'index, follow, max-image-preview:large' });
    this.doc.head.querySelectorAll('[data-portfolio-discovery]').forEach(element => element.remove());

    if (!indexable || !route.copy) {
      if (route.kind === 'missing') this.title.setTitle(route.language === 'en' ? 'Page not found | Lynx Pardelle' : 'Página no encontrada | Lynx Pardelle');
      if (route.kind === 'article') this.title.setTitle(route.copy?.title || 'Lynx Pardelle');
      this.meta.removeTag("name='description'");
      for (const property of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:locale']) {
        this.meta.removeTag("property='" + property + "'");
      }
      for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
        this.meta.removeTag("name='" + name + "'");
      }
      return;
    }

    const canonical = PORTFOLIO_ORIGIN + route.canonicalPath;
    const title = article ? article.title + ' | Lynx Pardelle' : route.copy.title;
    const description = article?.description || route.copy.description;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    for (const [property, content] of Object.entries({
      'og:type': route.kind === 'article' ? 'article' : 'website',
      'og:title': title, 'og:description': description,
      'og:url': canonical, 'og:image': IMAGE, 'og:locale': route.language === 'es' ? 'es_MX' : 'en_US',
    })) {
      this.meta.updateTag({ property, content });
    }
    for (const [name, content] of Object.entries({
      'twitter:card': 'summary_large_image', 'twitter:title': title,
      'twitter:description': description, 'twitter:image': IMAGE,
    })) {
      this.meta.updateTag({ name, content });
    }

    this.link('canonical', canonical);
    if (route.kind === 'public' || article?.hasTranslation) {
      const localizedPath = portfolioRoute(route.canonicalPath).path;
      this.link('alternate', PORTFOLIO_ORIGIN + portfolioPath(localizedPath, 'es'), 'es');
      this.link('alternate', PORTFOLIO_ORIGIN + portfolioPath(localizedPath, 'en'), 'en');
      this.link('alternate', PORTFOLIO_ORIGIN + portfolioPath(localizedPath, 'es'), 'x-default');
    }
    if (route.kind === 'public') {
      const schema = this.doc.createElement('script');
      schema.type = 'application/ld+json';
      schema.setAttribute('data-portfolio-discovery', '');
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Person', '@id': PORTFOLIO_PERSON, name: 'Alec Jonathan Montaño Romero', alternateName: 'Lynx Pardelle', url: PORTFOLIO_ORIGIN + '/' },
          { '@type': 'WebSite', '@id': PORTFOLIO_ORIGIN + '/#website', url: PORTFOLIO_ORIGIN + '/', name: 'Lynx Pardelle', publisher: { '@id': PORTFOLIO_PERSON } },
          { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: route.copy.title, description: route.copy.description,
            inLanguage: route.language, isPartOf: { '@id': PORTFOLIO_ORIGIN + '/#website' }, about: { '@id': PORTFOLIO_PERSON } },
        ],
      }).replace(/</g, '\\u003c');
      this.doc.head.appendChild(schema);
    }
  }

  private link(rel: string, href: string, language?: string): void {
    const link = this.doc.createElement('link');
    link.rel = rel;
    link.href = href;
    if (language) link.hreflang = language;
    link.setAttribute('data-portfolio-discovery', '');
    this.doc.head.appendChild(link);
  }
}
