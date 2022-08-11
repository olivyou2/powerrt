const { Room } = require("./room");

class RoomManager {
  rooms;

  constructor() {
    this.rooms = {};
  }

  /**
   *
   * @param {string} name
   * @returns {Room | undefined} Return created room if room name is not exists, but undefined when room name is already exists
   */
  createRoom(name) {
    if (Object.keys(this.rooms).includes(name)) {
      return undefined;
    }

    const room = new Room();
    room.name = name;
    this.rooms[name] = room;

    return room;
  }

  /**
   *
   * @param {string} name
   * @returns {Room | undefined} return room if room is exists, but undefined if room is not exists
   */
  getRoom(name) {
    if (Object.keys(this.room).includes(name)) {
      return this.rooms[name];
    } else {
      return undefined;
    }
  }
}

exports.RoomManager = RoomManager;
