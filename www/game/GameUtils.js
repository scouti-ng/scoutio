const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"; //KHICAW
const rooms = new Map();

module.exports = {
    generateCode() {
        let ret = "";
        for (let i = 0; i<6; i++) ret += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
        return ret;
    },
    newRoom(game) {
        let room = null;
        while (room == null) {
            let code = this.generateCode();
            if (!rooms.get(code)) {
                room = {game, code, players: {}, state: 'lobby'};
                rooms.set(code, room);
            }
        }
        return room;
    },
    getRoom(code) {
        return rooms.get(code);
    },
    isRoom(code) {
        return !!rooms.get(code);
    },
    deleteRoom(code) {
        rooms.delete(code);
    }
}