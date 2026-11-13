import { IFile } from '../../core/interfaces/file.interface';

export type TaxonomyKind = 'category' | 'subcategory' | 'tag';
export interface ArticleTerm {
  kind: TaxonomyKind;
  key: string;
  label: string;
  labelEng: string;
}

export interface BlogFilter { kind: TaxonomyKind; key: string }

const technologyLabels: Record<string, string> = { angular: 'Angular', 'node-js': 'Node.js', 'aws-lambda': 'AWS Lambda', ssr: 'SSR' };

export function taxonomyLabel(term: ArticleTerm, english: boolean): string {
  if (term.kind === 'category' && term.label === term.key) {
    if (term.key === 'technology') return english ? 'Technology' : 'Tecnología';
    if (term.key === 'art') return english ? 'Art' : 'Arte';
    if (term.key === 'other') return english ? 'Other' : 'Otros';
  }
  const label = english ? term.labelEng : term.label;
  return label === term.key ? (technologyLabels[term.key] ?? label.replaceAll('-', ' ')) : label;
}

export interface IArticle {
  _id: string;
  title: string;
  titleEng: string;
  subtitle: string;
  subtitleEng: string;
  insertions: string[];
  cat?: IArticleCat | string | any;
  subCats: (IArticleSubCat | string | any)[];
  intro: string;
  introEng: string;
  outro: string;
  outroEng: string;
  sections: (IArticleSection | string | any)[];
  tags: string;
  urltitle: string;
  coverImg: (IFile | string | any)[];
  titleColor: string;
  textColor: string;
  linkColor: string;
  bgColor: string;
  langs: string[];
  show: boolean;
  taxonomy?: ArticleTerm[];
  create_at: Date;
  editorial?: { category: string; sources: string[]; eventDate: string; revision: number; origin: string };
}

export interface IArticleCat {
  _id: string;
  title: string;
  titleEng: string;
  titleColor: string;
  textColor: string;
  textColor2: string;
  linkColor: string;
  linkColor2: string;
  bgColor: string;
  bgColor2: string;
  buttonColor: string;
  subcats: (IArticleSubCat | string | any)[];
  show: boolean;
  create_at: Date;
}

export interface IArticleSubCat {
  _id: string;
  title: string;
  titleEng: string;
  titleColor: string;
  buttonColor: string;
  cat?: IArticleCat | string | any;
  show: boolean;
  create_at: Date;
}

export interface IArticleSection {
  _id: string;
  title: string;
  titleEng: string;
  text: string;
  textEng: string;
  article?: IArticle | string | any;
  principalFile?: IFile | string | any;
  files: (IFile | string | any)[];
  order: number;
  titleColor: string;
  textColor: string;
  linkColor: string;
  bgColor: string;
  show: boolean;
  insertions: string[];
}
