import { Component, OnInit } from '@angular/core';
import { PostService } from './services/post.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'cast-response-app';

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.loadAPP().subscribe((value) => {
      console.log(value);
    });
  }
}
