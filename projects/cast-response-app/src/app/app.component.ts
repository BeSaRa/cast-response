import { Component, OnInit } from '@angular/core';
import { PostService } from './services/post.service';
import { GeneralInterceptorContract } from 'cast-response';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
})
export class AppComponent implements OnInit {
  constructor(private postService: PostService) {}

  ngOnInit(): void {
    const value = this.postService.loadMethod();
    console.log('method', value);

    this.postService.loadPromise().then((value) => {
      console.log('Promise', value);
    });

    this.postService.load().subscribe((value) => {
      console.log('Observable', value);
    });

    this.postService.loadAndCastObject().subscribe((value) => {
      console.log('Observable shape Object', value);
    });

    this.postService.loadAndCastObjectWithArray().subscribe((value) => {
      console.log('Observable shape Object With Array', value);
    });
  }
}

export class GInterceptor implements GeneralInterceptorContract {
  send(model: Partial<any>): Partial<any> {
    return model;
  }

  receive(model: any) {
    return model;
  }
}
