import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { ConnectionService } from 'app/services/connection.service';
import { environment } from '../../environments/environment';

const CHAT_URL = 'ws://' + environment.webSocket + ':1337';

export interface Message {
  dataType: string,
  payload: string
}

@Injectable()
export class BoardService {

  boardsStorageLocation = 'boards';
  boardStoragePrefix = 'Board-';

  public messages: Subject<Message>;

  constructor(public connectionService: ConnectionService) {}

  InitConnection() {
    this.messages = <Subject<Message>>this.connectionService
      .connect(CHAT_URL)
      .map((response: MessageEvent): Message => {
        const data = JSON.parse(response.data);
        console.log(data);
        return {
          dataType: data.dataType,
          payload: data.payload
        }
      });

    this.messages.next({ dataType: "Test", payload: "Test" });
  }

  HasBoards(): boolean {
    return (localStorage.getItem(this.boardsStorageLocation)) ? true : false;
  }

  HasBoard(name): boolean {
    const boards = this.GetAllBoards();
    if (boards.indexOf(name) === -1) {
      return false;
    } else {
      return true;
    }
  }

  GetAllBoards(): string[] {
    if (this.HasBoards()) {
      return JSON.parse(localStorage.getItem(this.boardsStorageLocation));
    } else {
      return [];
    }
  }

  AddBoard(name): boolean {
    if (this.HasBoard(name)) {
      return false;
    }

    const boards = this.GetAllBoards();
    boards.push(name);
    localStorage.setItem(this.boardsStorageLocation, JSON.stringify(boards));

    this.SetBoardData(name, []);
    return true;
  }

  GetBoardData(boardName) {
    const data = localStorage.getItem(this.boardStoragePrefix + boardName);
    console.log(this.boardStoragePrefix + boardName);
    if (data) {
      return JSON.parse(data);
    } else {
      return [];
    }
  }

  SetBoardData(boardName, boardData) {
    localStorage.setItem(this.boardStoragePrefix + boardName, JSON.stringify(boardData));
  }

  EditBoard(boardName, newName): boolean {
    const boards = this.GetAllBoards();
    const index = boards.indexOf(boardName);

    if (index === -1) {
      return false;
    } else {
      boards[index] = newName;

      const boardData = this.GetBoardData(boardName);

      localStorage.removeItem(this.boardStoragePrefix + boardName);
      this.SetBoardData(newName, boardData);
    }

    localStorage.setItem(this.boardsStorageLocation, JSON.stringify(boards));
    return true;
  }

  DeleteBoard(boardName): boolean {
    const boards = this.GetAllBoards();
    const index = boards.indexOf(boardName);
    boards.splice(index, 1);
    localStorage.removeItem(this.boardStoragePrefix + boardName);

    localStorage.setItem(this.boardsStorageLocation, JSON.stringify(boards));

    return true;
  }
}
