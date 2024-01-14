import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Post} from '../models/post';

// @ts-ignore
import {CastResponse, CastResponseContainer} from 'cast-response';


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

  @CastResponse(() => Post)
  loadAPP(): Observable<any> {
    return this.http.post(
      'http://eblaepm.no-ip.org:7800/mme-services/kpi/rent/default',
      {
        municipalityId: 1,
        propertyTypeList: [-1],
        rentPurposeList: [-1],
      },
      {
        headers: {
          Authorization: 'Bearer 9856898698989'
        }
      }
    );
  }
}
