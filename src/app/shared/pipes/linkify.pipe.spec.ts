import { LinkifyPipe } from './linkify.pipe';
import { WebService } from '../services/web.service';

describe('LinkifyPipe', () => {
  it('create an instance', () => {
    const pipe = new LinkifyPipe({} as WebService);
    expect(pipe).toBeTruthy();
  });
});
