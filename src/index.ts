import { createServer } from "http";
import { Server } from "socket.io";
import { ClientEvents, ServerEvents } from "./events";
import { User } from "./model";
import { Storage } from "./storage";

const httpServer = createServer();
const io = new Server<ClientEvents, ServerEvents>(httpServer, {
    cors: {
        origin: false
    }
});
const storage = new Storage();

io.on("connection", (socket) => {

    var currentUser: User;

    socket.on("user:login", (payload, callback) => {
        let user = storage.findUser(payload);
        if (!user) {
            user = storage.createUser(payload);
        }
        if (typeof callback === "function") {
            callback({
                data: user.id
            });
        }
        currentUser = user;
    });

    socket.on("place:list", (callback) => {
        if (!currentUser) {
            callback({error: "Please log in first"});
            return;
        }
        if (typeof callback === "function") {
            callback({
                data: storage.listPlaces()
            });
        }
    });
    socket.on("place:create", (payload, callback) => {
        if (!currentUser) {
            callback({error: "Please log in first"});
            return;
        }
        const value = storage.createPlace(currentUser, payload);
        if (typeof callback === "function") {
            callback({
                data: value.id
            });
        }
        socket.broadcast.emit("place:created", value);
    });
    socket.on("place:update", (payload, callback) => {
        if (!currentUser) {
            callback({error: "Please log in first"});
            return;
        }
        try {
            const place = storage.updatePlace(currentUser, payload);
            if (typeof callback === "function") {
                callback();
            }
            socket.broadcast.emit("place:updated", place);
        } catch (err) {
            if (typeof callback == "function") {
                callback({error: (<Error>err).message});
            }
        }
    });
    socket.on("place:delete", (id, callback) => {
        if (!currentUser) {
            callback({error: "Please log in first"});
            return;
        }
        try {
            storage.deletePlace(currentUser, id);
            if (typeof callback === "function") {
                callback();
            }
            socket.broadcast.emit("place:deleted", id);
        } catch (err) {
            if (typeof callback == "function") {
                callback({error: (<Error>err).message});
            }
        }
    });
});

httpServer.listen(3000);
