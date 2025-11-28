// @ts-ignore
import { InterceptModel, InterceptorContract } from 'cast-response';
import { ReceiveInterceptorFn } from 'cast-response';

class Inter implements InterceptorContract<Post> {
  send(_model: Partial<Post>): Partial<Post> {
    throw new Error('Method not implemented.');
  }

  receive(model: Post): Post {
    return model;
  }
}
const receive: ReceiveInterceptorFn<Post> = (model) => {
  return model;
};
@InterceptModel({
  send: new Inter().send,
  receive: receive,
})
export class Post {
  userId!: number;
  id!: number;
  name!: string;
  username!: string;

  get nameWithUsername() {
    return `${this.username} - ${this.name}`;
  }
}
