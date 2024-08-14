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
    // return of({
    //   address: {
    //     0: { x: true },
    //     10: { x: true },
    //     12: { x: true },
    //   },
    // } as unknown as Post[]);
  }
}
