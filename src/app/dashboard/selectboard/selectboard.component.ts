import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { BoardService } from 'app/services/board.service';

import { Directory } from "app/models/directory";
import { Sound } from "app/models/sound";

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-selectboard',
  templateUrl: './selectboard.component.html',
  styleUrls: ['./selectboard.component.css']
})
export class SelectboardComponent implements OnInit {

  @Output() selectBoard: EventEmitter<string>;

  newBoardName = '';
  boards: string[] = [];
  editBoardName = '';

  alertStructure = {
    success: false,
    error: false,
    message: ''
  }

  constructor(private authService: AuthService, private boardService: BoardService) {
    this.selectBoard = new EventEmitter<string>();
  }

  ngOnInit() {
    this.boards = this.boardService.GetAllBoards();

    // Initialize Edit Handler
    $(window).keydown(function (evt) {
      if (evt.which === 17) { // ctrl
        $('.board').each(function (index) {
          $(this).addClass('board-edit');
        });
      }
    }).keyup(function (evt) {
      if (evt.which === 17) { // ctrl
        $('.board').each(function (index) {
          $(this).removeClass('board-edit');
        });
      }
    });
  }

  handleBoardClick(event) {
    const target = $(event.target);
    if (target.hasClass('board-edit')) {
      this.ResetAlertStructure();

      console.log($(target).attr('id') + ' - Edit');
      $('#editBoard').modal('show');
      this.editBoardName = $(target).attr('id');
    } else {
      console.log($(target).attr('id') + ' - Open');
      this.selectBoard.emit($(target).attr('id'));
    }
  }

  AddBoard() {
    this.ResetAlertStructure();

    if (this.newBoardName.length <= 3) {
      this.alertStructure.error = true;
      this.alertStructure.message = '<strong>Whoops!</strong> something went wrong: <ul> <li>Must have more than 3 characters?</li> </ul>';
      return;
    } else if (this.newBoardName.length > 50) {
      this.alertStructure.error = true;
      this.alertStructure.message = '<strong>Whoops!</strong> something went wrong: <ul> <li>Must have 50 or less characters</li> </ul>';
      return;
    }

    const success = this.boardService.AddBoard(this.newBoardName);
    if (success) {
      this.alertStructure.success = true;
      this.alertStructure.message = 'Successfully added new board';

      const data = {};
      const root = new Directory();

      data[''] = root;

      this.boardService.SetBoardData(this.newBoardName, data);

      this.newBoardName = '';
    } else {
      this.alertStructure.error = true;
      this.alertStructure.message = '<strong>Whoops!</strong> something went wrong: <ul> <li>Does the board already exist?</li> </ul>';
    }

    this.boards = this.boardService.GetAllBoards();
  }

  RenameBoard() {
    this.ResetAlertStructure();

    const success = this.boardService.EditBoard(this.editBoardName, this.newBoardName);
    if (success) {
      this.alertStructure.success = true;
      this.alertStructure.message = 'Successfully renamed board';
      this.newBoardName = '';
    } else {
      this.alertStructure.error = true;
      this.alertStructure.message = '<strong>Whoops!</strong> something went wrong: <ul> <li>Does the board already exist?</li> <li>Does it no longer exist?</li> </ul>';
    }

    this.boards = this.boardService.GetAllBoards();
  }

  DeleteBoard() {
    this.ResetAlertStructure();

    const success = this.boardService.DeleteBoard(this.editBoardName);
    if (success) {
      this.alertStructure.success = true;
      this.alertStructure.message = 'Successfully deleted board';
      this.newBoardName = '';
    } else {
      this.alertStructure.error = true;
      this.alertStructure.message = '<strong>Whoops!</strong> something went wrong.';
    }

    this.boards = this.boardService.GetAllBoards();
  }

  ResetAlertStructure() {
    this.alertStructure = {
      success: false,
      error: false,
      message: ''
    }
  }

}
