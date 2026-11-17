export const PORTFOLIO_ORIGIN = 'https://lynxpardelle.com';
export const PORTFOLIO_PERSON = PORTFOLIO_ORIGIN + '/#person';
export type PortfolioLanguage = 'es' | 'en';

interface PageCopy {
  readonly title: string;
  readonly description: string;
}

const pages: Record<string, Record<PortfolioLanguage, PageCopy>> = {
  '/': {
    es: { title: 'Alec Montaño / Lynx Pardelle · Full Stack y Gen AI', description: 'Portafolio de Alec Jonathan Montaño Romero, Lynx Pardelle. Desarrollo Full Stack y AI generativa, con proyectos de software, música, audiovisual y web.' },
    en: { title: 'Alec Montaño / Lynx Pardelle · Full Stack and Gen AI', description: 'Alec Jonathan Montaño Romero, also known as Lynx Pardelle. Full-stack development and generative AI, with software, music, audiovisual and web projects.' },
  },
  '/webs': {
    es: { title: 'Proyectos web y servicios digitales | Lynx Pardelle', description: 'Proyectos web de Lynx Pardelle y servicios para sitios web, landing pages, press kits y portafolios en línea.' },
    en: { title: 'Web projects and digital services | Lynx Pardelle', description: 'Web projects by Lynx Pardelle and services for websites, landing pages, electronic press kits and online portfolios.' },
  },
  '/reel': {
    es: { title: 'Demo reel y producción audiovisual | Lynx Pardelle', description: 'Selección audiovisual de Lynx Pardelle, con enlaces a producción de video, animación y formación en edición y producción audiovisual.' },
    en: { title: 'Demo reel and audiovisual production | Lynx Pardelle', description: 'Audiovisual work by Lynx Pardelle, with links to video production, animation and training in audiovisual production and editing.' },
  },
  '/book': {
    es: { title: 'Book de diseño gráfico | Lynx Pardelle', description: 'Galería de diseño de Lynx Pardelle con acceso a servicios de portadas musicales, logotipos y flyers digitales.' },
    en: { title: 'Graphic design portfolio | Lynx Pardelle', description: 'Graphic design work by Lynx Pardelle, with links to music cover art, logo design and digital flyers.' },
  },
  '/music': {
    es: { title: 'Música, audio y formación musical | Lynx Pardelle', description: 'Música de Lynx Pardelle y enlaces a cursos, clases, masterclasses, mezcla y producción de audio.' },
    en: { title: 'Music, audio and music training | Lynx Pardelle', description: 'Music by Lynx Pardelle with links to courses, lessons, masterclasses, mixing and audio production.' },
  },
  '/cv': {
    es: { title: 'CV de Alec Montaño · Full Stack y Gen AI | Lynx Pardelle', description: 'Trayectoria profesional de Alec Jonathan Montaño Romero en desarrollo Full Stack, AWS e inteligencia artificial generativa.' },
    en: { title: 'Alec Montaño CV · Full Stack and Gen AI | Lynx Pardelle', description: 'Professional experience of Alec Jonathan Montaño Romero in full-stack development, AWS and generative AI.' },
  },
  '/proyectos': {
    es: { title: 'Casos de ingeniería Full Stack y Gen AI | Lynx Pardelle', description: 'Casos de ingeniería de Lynx Pardelle en aplicaciones Full Stack, arquitectura AWS e inteligencia artificial generativa.' },
    en: { title: 'Full Stack and Gen AI engineering case studies | Lynx Pardelle', description: 'Engineering case studies by Lynx Pardelle in full-stack applications, AWS architecture and generative AI.' },
  },
  '/proyectos/aws': {
    es: { title: 'Proyectos Full Stack y AWS | Lynx Pardelle', description: 'Casos de desarrollo Full Stack y AWS de Lynx Pardelle, con contexto sobre arquitectura y entrega.' },
    en: { title: 'Full Stack and AWS projects | Lynx Pardelle', description: 'Full-stack and AWS case studies by Lynx Pardelle, including the architecture and delivery work.' },
  },
  '/proyectos/genai': {
    es: { title: 'Proyectos de inteligencia artificial generativa | Lynx Pardelle', description: 'Casos de inteligencia artificial generativa de Lynx Pardelle, con proyectos de asistentes, recuperación y evaluación.' },
    en: { title: 'Generative AI projects | Lynx Pardelle', description: 'Generative AI case studies by Lynx Pardelle, including assistants, retrieval and evaluation work.' },
  },
  '/blog': {
    es: { title: 'Blog de desarrollo, AWS y Gen AI | Lynx Pardelle', description: 'Artículos de Lynx Pardelle sobre desarrollo de software, sistemas en AWS e inteligencia artificial generativa.' },
    en: { title: 'Software, AWS and Gen AI blog | Lynx Pardelle', description: 'Articles by Lynx Pardelle on software development, AWS and generative AI.' },
  },
};

export const PUBLIC_INDEX_PATHS = Object.freeze(Object.keys(pages));

export interface PortfolioRoute {
  readonly path: string;
  readonly language: PortfolioLanguage;
  readonly kind: 'public' | 'article' | 'private' | 'missing';
  readonly canonicalPath: string;
  readonly copy?: PageCopy;
}

export function portfolioRoute(url: string): PortfolioRoute {
  let pathname = '/';
  try {
    // Match a path from an HTTP request or a full SSR URL.
    pathname = (url.startsWith('/') ? url.split(/[?#]/, 1)[0] : new URL(url || '/', PORTFOLIO_ORIGIN).pathname)
      .replace(/\/+$/, '') || '/';
  } catch {
    return { path: url, language: 'es', canonicalPath: '/', kind: 'missing' };
  }
  const language = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es';
  const path = language === 'en' ? pathname.slice(3) || '/' : pathname;
  const canonicalPath = portfolioPath(path, language);
  const state = { path, language, canonicalPath } as const;
  if (/^\/(?:admin|auth)(?:\/|$)/.test(path)) return { ...state, kind: 'private' };
  const indexPath = path === '/inicio' ? '/' : path === '/blog/1' ? '/blog' : path;
  const copy = Object.prototype.hasOwnProperty.call(pages, indexPath) ? pages[indexPath][language] : undefined;
  if (copy) return { ...state, canonicalPath: portfolioPath(indexPath, language), copy, kind: 'public' };
  if (/^\/blog\/(?:[1-9]\d*)$/.test(path)) {
    return { ...state, copy: pages['/blog'][language], kind: 'public' };
  }
  if (/^\/blog\/article\/[^/]+$/.test(path)) {
    return { ...state, copy: pages['/blog'][language], kind: 'article' };
  }
  return { ...state, kind: 'missing' };
}

export function portfolioPath(path: string, language: PortfolioLanguage): string {
  return language === 'en' ? '/en' + (path === '/' ? '' : path) : path;
}
