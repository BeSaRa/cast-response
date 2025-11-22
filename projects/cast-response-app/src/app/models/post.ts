// @ts-ignore
import { InterceptModel, InterceptorContract } from 'cast-response';
import { ReceiveInterceptorFn } from 'cast-response';

class Inter implements InterceptorContract<Post> {
  send(_model: Partial<Post>): Partial<Post> {
    throw new Error('Method not implemented.');
  }

  receive(model: Post): Post {
    console.log('MODEL', model);
    return model;
  }
}
const receive: ReceiveInterceptorFn<Post> = (model) => {
  console.log('Receive From Function', model);
  return model;
};
@InterceptModel({
  send: new Inter().send,
  receive: receive,
})
export class Post {
  userId!: number;
  id!: number;
  title!: string;
  body!: string;

  constructor(welcome: string) {
    console.log(welcome);
  }
}
