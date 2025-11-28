import { inject, Injectable, makeStateKey, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Post } from '../models/post';
import { CastResponse, CastTransferState, StateCaster } from 'cast-response';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

const POSTS_STATE_KEY = makeStateKey<Post[]>('posts');

StateCaster.registerStateCaster(POSTS_STATE_KEY, {
  model: () => Post,
});

@Injectable({
  providedIn: 'root',
})
export class PostService {
  URL: string = 'https://jsonplaceholder.typicode.com/users';
  http = inject(HttpClient);
  transferState = inject(CastTransferState);
  platformId = inject(PLATFORM_ID);

  @CastResponse(() => Post)
  private _load(): Observable<Post[]> {
    return this.http.get<Post[]>(this.URL);
  }

  load() {
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(POSTS_STATE_KEY)
    ) {
      return of(this.transferState.get(POSTS_STATE_KEY, [] as Post[]));
    }
    return this._load().pipe(
      tap((posts) => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(POSTS_STATE_KEY, posts);
        }
      })
    );
  }

  @CastResponse(() => Post)
  loadPromise(): Promise<Post[]> {
    return Promise.resolve([{ id: 1 }, { id: 2 }] as unknown as Post[]);
  }

  @CastResponse(() => Post)
  loadMethod(): Post[] {
    return [
      { id: 1, name: 'content', username: 'title', userId: 1 } as Post,
      { id: 2, name: 'content', username: 'title', userId: 2 } as Post,
    ];
  }

  @CastResponse(() => Post, {
    shape: {
      '{}': () => Post,
    },
  })
  loadAndCastObject(): Observable<{ first: Post; second: Post }> {
    return of({
      first: { id: 1, name: 'content', username: 'title', userId: 1 } as Post,
      second: { id: 1, name: 'content', username: 'title', userId: 1 } as Post,
    });
  }

  @CastResponse(undefined, {
    shape: {
      '{}.*': () => Post,
    },
  })
  loadAndCastObjectWithArray(): Observable<{ first: Post[]; second: Post[] }> {
    return of({
      first: [{ id: 1, name: 'content', username: 'title', userId: 1 } as Post],
      second: [
        { id: 1, name: 'content', username: 'title', userId: 1 } as Post,
      ],
    });
  }

  loadUsers() {
    return this.http.get<Post[]>('http://localhost:3002/users');
  }
}
