import { Place, User } from './model';

interface Error {
    error: string;
}

interface Success<T> {
    data: T;
}

export type Response<T> = Error | Success<T>;

export interface ServerEvents {
   "place:created": (place: Place) => void;
   "place:updated": (place: Place) => void;
   "place:deleted": (id: string) => void;
}

export interface ClientEvents {
   // user
   "user:login": (
      payload: Pick<User, "email">,
      callback: (res: Response<string>) => void
   ) => void;

   // place
  "place:list": (callback: (res: Response<Place[]>) => void) => void;
  "place:create": (
    payload: Omit<Place, "id">,
    callback: (res: Response<string>) => void
  ) => void;
  "place:update": (
    payload: Place,
    callback: (res?: Response<void>) => void
  ) => void;
  "place:delete": (id: string, callback: (res?: Response<void>) => void) => void;
}
