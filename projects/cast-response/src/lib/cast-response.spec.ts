import { CastResponse } from './cast-response';
import { of } from 'rxjs';

class Post {
  declare id: number;
  declare title: string;
}

class Service {
  @CastResponse(() => Post)
  load() {
    return of([
      { id: 1, title: 'post title' },
      { id: 2, title: 'post title 2' },
    ]);
  }
}

describe('CastResponse Decorator', () => {
  const { service } = setupTest();
  it('Service should be truthy', () => {
    expect(service).toBeTruthy();
  });

  it('should return array of Post instances', () => {});
});

function setupTest() {
  return {
    service: new Service(),
  };
}
