import { Component, OnInit, signal } from '@angular/core';
import { PostService } from './services/post.service';
import { GeneralInterceptorContract } from 'cast-response';
import { Post } from './models/post';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
})
export class AppComponent implements OnInit {
  posts = signal<Post[]>([]);

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.load().subscribe((value) => {
      this.posts.set(value);
    });
    const value = this.postService.loadMethod();
    console.log('method', value);

    this.postService.loadPromise().then((value) => {
      console.log('Promise', value);
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
