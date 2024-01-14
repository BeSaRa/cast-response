// @ts-ignore
import { InterceptModel, InterceptorContract } from 'cast-response';

class Inter implements InterceptorContract<Post> {
  send(_model: Partial<Post>): Partial<Post> {
    throw new Error('Method not implemented.');
  }

  receive(model: Post): Post {
    console.log('MODEL', model);
    return model;
  }
}

const { send, receive } = new Inter();

@InterceptModel({ send, receive })
export class Post {
  userId!: number;
  id!: number;
  title!: string;
  body!: string;
}
