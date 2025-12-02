import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from 'config';

let io = null;
const userSockets = new Map(); // userId => Set(socketId)

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', async (socket) => {
    try {
      const token = socket.handshake.query?.token;
      if (token) {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        const userId = decoded.id;
        socket.join(`user_${userId}`);
        // add to map
        const set = userSockets.get(userId) || new Set();
        set.add(socket.id);
        userSockets.set(userId, set);
      }
    } catch (e) {
      // invalid token — ignore. clients without token will not be joined to user rooms.
    }

    socket.on('disconnect', () => {
      // remove from map
      for (const [userId, set] of userSockets.entries()) {
        if (set.has(socket.id)) {
          set.delete(socket.id);
          if (set.size === 0) userSockets.delete(userId);
          else userSockets.set(userId, set);
          break;
        }
      }
    });
  });
}

export function getIO() { return io; }
