import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  //get ids from url
  const roomId = req.query.roomId;
  const messageId = req.query.messageId;
  //check token
  const username = checkToken(req);
  if (!username)
    return res.status(401).json({
      ok: false,
      message: "You don't have permission to access this api",
    });
  const rooms = readChatRoomsDB();
  const foundRoom = rooms.find((x) => x.roomId === roomId);

  //check if roomId exist

  if (foundRoom === undefined) {
    return res.status(404).json({ ok: false, message: "Invalid room id" });
  }
  //check if messageId exist
  const foundMessage = foundRoom.messages.find(
    (x) => x.messageId === messageId
  );
  console.log(foundMessage);
  if (foundMessage === undefined) {
    return res.status(404).json({ ok: false, message: "Invalid message id" });
  }

  //check if token owner is admin, they can delete any message
  if (username.isAdmin) {
    foundRoom.messages = foundRoom.messages.filter(
      (x) => x.messageId !== messageId
    );
    rooms.messages = foundRoom.messages;
    writeChatRoomsDB(rooms);
    return res.json({ ok: true });
  } else {
    if (username.username === foundMessage.username) {
      foundRoom.messages = foundRoom.messages.filter(
        (x) => x.messageId !== messageId
      );
      rooms.messages = foundRoom.messages;
      writeChatRoomsDB(rooms);
      return res.json({ ok: true });
    } else {
      return res.status(401).json({
        ok: false,
        message: "You don't have permission to access this api",
      });
    }
  }
  //or if token owner is normal user, they can only delete their own message!
}
