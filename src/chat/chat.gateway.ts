import { 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer, 
  WsResponse 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server : Server;

  connectedClients = new Map<string, string>();
  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }
  async handleDisconnect(client : Socket) {
    this.connectedClients.delete(client.id);
    console.log('Client Disconnected:', client.id);
  }
  @SubscribeMessage('set_username')
  setUserName(client: Socket, username: string): void {
    if (this.isUsernameTaken(username)) {
      client.emit('username_taken');
      client.disconnect(true);
    } else {
      this.connectedClients.set(client.id, username);
      client.emit('username_accepted', username);
    }
  }
  isUsernameTaken(username: string) : boolean {
    return Array.from(this.connectedClients.values()).includes(username);
  }

  @SubscribeMessage('chat message')
  handleMessage(client: any, payload: any): WsResponse<void> {
    console.log(payload);
    this.server.emit('chat message', payload);
    return ;
  }
}
