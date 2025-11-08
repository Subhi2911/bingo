import { io } from "socket.io-client";
import {BACKEND_URL} from './config/backend'

export const socket = io({BACKEND_URL}, {
  transports: ["websocket"],
  autoConnect: false,
});
