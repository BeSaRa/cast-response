import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

import { CastResponse } from 'cast-response';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  URL: string = 'https://jsonplaceholder.typicode.com/users/1';
  http = inject(HttpClient);

  @CastResponse(() => Post)
  load(): Observable<Post[]> {
    return this.http.get<Post[]>(this.URL);
  }

  @CastResponse(() => Post)
  loadPromise(): Promise<Post[]> {
    return Promise.resolve([{ id: 1 }, { id: 2 }] as unknown as Post[]);
  }

  @CastResponse(() => Post)
  loadMethod(): Post[] {
    return [
      { id: 1, body: 'content', title: 'title', userId: 1 },
      { id: 2, body: 'content', title: 'title', userId: 2 },
    ];
  }
}
