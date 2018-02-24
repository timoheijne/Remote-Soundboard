import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { BoardService } from 'app/services/board.service';
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  selectedBoard = '';

  constructor(private authService: AuthService, private boardService: BoardService) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }

  SelectBoard(name) {
    console.log('Selected board: ' + name);
    this.selectedBoard = name;
  }

}
