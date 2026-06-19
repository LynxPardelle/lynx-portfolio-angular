import { assetUrl } from './asset-url';

describe('assetUrl', () => {
  it('rewrites the legacy S3 origin to the public assets CDN', () => {
    expect(
      assetUrl({
        location:
          'https://lynx-portfolio.s3.us-east-1.amazonaws.com/uploads/main/song.mp3',
      })
    ).toBe('https://assets.lynxpardelle.com/uploads/main/song.mp3');
  });

  it('keeps existing assets CDN URLs unchanged', () => {
    expect(
      assetUrl({
        location: 'https://assets.lynxpardelle.com/uploads/main/image.webp',
      })
    ).toBe('https://assets.lynxpardelle.com/uploads/main/image.webp');
  });

  it('prefers cdnUrl when available', () => {
    expect(
      assetUrl({
        cdnUrl: 'https://assets.lynxpardelle.com/uploads/blog/hero.webp',
        location:
          'https://lynx-portfolio.s3.us-east-1.amazonaws.com/uploads/blog/hero.webp',
      })
    ).toBe('https://assets.lynxpardelle.com/uploads/blog/hero.webp');
  });

  it('does not generate API get-file URLs when location is missing', () => {
    expect(assetUrl({ _id: 'file-id' })).toBe('');
  });
});
