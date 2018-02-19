import { RemoteSoundPage } from './app.po';

describe('remote-sound App', function() {
  let page: RemoteSoundPage;

  beforeEach(() => {
    page = new RemoteSoundPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
