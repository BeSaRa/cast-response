import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import { CastResponse, CastResponseContainer } from 'cast-response';

@CastResponseContainer({
  $default: {
    model: () => Post,
    unwrap: 'address',
  },
})
@Injectable({
  providedIn: 'root',
})
export class PostService {
  URL: string = 'https://jsonplaceholder.ir/users/1';

  constructor(private http: HttpClient) {}

  @CastResponse()
  load(): Observable<Post[]> {
    return this.http.get<Post[]>(this.URL);
  }
}
