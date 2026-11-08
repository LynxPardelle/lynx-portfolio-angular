export type PortfolioCopyKey = 'profileHeadline' | 'profileSummary' | 'awsIntro' | 'genaiIntro';
export type PortfolioCopy = Partial<Record<PortfolioCopyKey | `${PortfolioCopyKey}Eng`, string | null>>;

export interface IMain extends PortfolioCopy {
  welcome: string;
  welcomeEng: string;
  logo: any;
  backgroundImg: any;
  CVImage: any;
  CVBackground: any;
  CVDesc: string;
  CVDescEng: string;
  CVDesc2: string;
  CVDesc2Eng: string;
  key: string;
  keyOld: string;
  errorMessage: string;
  errorMessageEng: string;
  seoTags: string;
  seoImg: string;
}

export function portfolioCopy(main: PortfolioCopy | undefined, key: PortfolioCopyKey, language: string) {
  return main?.[language === 'en' ? `${key}Eng` as const : key];
}
