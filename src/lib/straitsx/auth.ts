import { StraitsXClient } from './client';

export type HelloResponse = {
  msg: string;
};

export function sayHello(client: StraitsXClient) {
  return client.get<HelloResponse>('/authorize/hello');
}
