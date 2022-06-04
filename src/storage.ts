import { Place, User } from "./model";
import { v4 as uuid } from "uuid";
import { existsSync, mkdirSync } from "fs";
import JSONdb = require("simple-json-db");

const dataPath = 'data';

export class Storage {
    private usersDb: JSONdb<User>;
    private placesDb: JSONdb<Place>;

    constructor() {
        if (!existsSync(dataPath)) {
            mkdirSync(dataPath);
        }
        this.usersDb = new JSONdb<User>(`${dataPath}/users.json`);
        this.placesDb = new JSONdb<Place>(`${dataPath}/places.json`);
    }

    findUser(payload: Pick<User, "email">): User | undefined {
        const data = this.usersDb.JSON();
        for (const id in data) {
            if (data[id].email == payload.email) {
                return data[id];
            }
        }
        return undefined;
    }

    createUser(payload: Omit<User, "id">): User {
        const user: User = {...payload, id: uuid()};
        this.usersDb.set(user.id, user);
        return user;
    }

    listPlaces(): Place[] {
        let res = [];
        const data = this.placesDb.JSON();
        for (const id in data) {
            res.push(data[id]);
        }
        return res;
    }

    createPlace(user: User, payload: Omit<Place, "id"|"user">): Place {
        const place: Place = {...payload, id: uuid(), owner: user, created: new Date()};
        place.updated = place.created;
        this.placesDb.set(place.id, place);
        return place;
    }

    updatePlace(user: User, payload: Omit<Place, "created"|"updated">): Place {
        const oldPlace = this.placesDb.get(payload.id);
        if (oldPlace !== undefined) {
            if (this.placesDb.get(payload.id)?.owner.id !== user.id) {
                throw new Error("Cannot update other user place");
            }
            const place: Place = {...payload, created: oldPlace.created, updated: new Date()};
            this.placesDb.set(payload.id, place);
            return place;
        } else {
            throw new Error("Place does not exist");
        }
    }

    deletePlace(user: User, id: string) {
        if (this.placesDb.get(id)?.owner.id !== user.id) {
            throw new Error("Cannot delete other user place");
        }
        this.placesDb.delete(id);
    }
}
