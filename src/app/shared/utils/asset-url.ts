const s3AssetsOrigin = 'https://lynx-portfolio.s3.us-east-1.amazonaws.com';
const cdnAssetsOrigin = 'https://assets.lynxpardelle.com';

export function assetUrl(file: any): string {
  const cdnUrl = typeof file?.cdnUrl === 'string' ? file.cdnUrl.trim() : '';
  const location = typeof file?.location === 'string' ? file.location.trim() : '';

  if (cdnUrl) {
    return cdnUrl;
  }

  if (!location) {
    return '';
  }

  return location.replace(s3AssetsOrigin, cdnAssetsOrigin);
}
