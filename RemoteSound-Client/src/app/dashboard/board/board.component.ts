import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BoardService } from 'app/services/board.service';
import { ConnectionService } from 'app/services/connection.service';

import { Directory } from "app/models/directory";
import { Sound } from "app/models/sound";
import { dirname } from 'path';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { AuthService } from 'app/services/auth.service';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy {

  @Input() selectedBoard: string;
  @Output() setBoard: EventEmitter<string>;

  data = [];
  selectedDirectory = '';

  newDirName = '';
  newSoundName = '';
  newSoundFile = '';

  editDirName = '';
  editSoundName = '';
  editSoundFile = '';

  editDirectory = '';
  editSound = '';

  allDirectories = [];
  allSounds = [];

  dirsToShow = [];
  soundsToShow = [];

  alertStructure = {
    success: false,
    error: false,
    message: ''
  }

  audio = new Audio();

  audioDuration = null;
  audioCurTime = null;

  selectedAudio = '';

  connectionStatus = {
    message: 'Connecting to remote server',
    isConnecting: true
  };

  private message = {
    dataType: 'ConnectionInformation',
    payload: 'NO PAYLOAD'
  }

  wsConnection = null;

  constructor(private boardService: BoardService, private conService: ConnectionService, private authService: AuthService) {
    this.setBoard = new EventEmitter<string>();
  }

  ngOnInit() {
    if (this.wsConnection == null) {
      this.ConnectToServers();
    }

    this.audio = new Audio();
    this.allDirectories = [];
    this.allSounds = [];

    this.data = this.boardService.GetBoardData(this.selectedBoard);
    this.allDirectories = Object.keys(this.data);

    const data = this.data;
    const keys = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
      const element = keys[i];
      const soundKeys = Object.keys(data[element].sounds);

      for (let j = 0; j < soundKeys.length; j++) {
        this.allSounds.push(soundKeys[j]);
      }
    }

    console.log(this.allDirectories, this.allSounds);

    $(window).keydown(function (evt) {
      if (evt.which === 17) { // ctrl
        $('.sound-card').each(function (index) {
          $(this).addClass('sound-card-edit');
        });
      } else if (evt.which === 68 && evt.ctrlKey) {
        console.log('Open create directory');
        $('#addDirectory').modal('show');
      } else if (evt.which === 83 && evt.ctrlKey) {
        console.log('Open create sound');
        $('#addSound').modal('show');
      }
    }).keyup(function (evt) {
      if (evt.which === 17) { // ctrl
        $('.sound-card').each(function (index) {
          $(this).removeClass('sound-card-edit');
        });
      }
    });

    setInterval(() => {
      var duration = new Date(null);
      duration.setSeconds(this.audio.duration);
      this.audioDuration = duration;

      var current = new Date(null);
      current.setSeconds(this.audio.currentTime);
      this.audioCurTime = current;

      $('#audioSlider').val(this.audio.currentTime);
    }, 10);

    this.ShowSelectedDirectory();
  }

  ngOnDestroy() {
    //this.audio.currentTime = this.audio.duration;
    this.wsConnection.unsubscribe();
    this.boardService.connectionService.clearConnection();
  }

  ConnectToServers() {
    $('#loading').modal({
      backdrop: 'static',
      keyboard: false
    });

    this.boardService.connectionService.clearConnection();

    this.connectionStatus.isConnecting = true;
    this.connectionStatus.message = "Connecting to remote servers";

    this.message.dataType = 'ConnectionInformation';
    this.message.payload = JSON.stringify({ userData: this.authService.GetUser(), connectionType: 'client' });

    this.boardService.InitConnection();
    this.wsConnection = this.boardService.messages.subscribe(msg => {
      if (msg.dataType === 'ConnectionAccepted') {
        this.boardService.messages.next(this.message);
        this.connectionStatus.isConnecting = false;
        this.connectionStatus.message = "Connection to remote servers established";
        setTimeout(() => { // I have to do this because we connect to fast
          $('#loading').modal('hide');
        }, 1000);
      } else if (msg.dataType === 'RemoteConnected') {
        // Send sound data to remote
        this.message.dataType = "SoundBoardInfo";
        this.message.payload = JSON.stringify(this.boardService.GetBoardData(this.selectedBoard));
        this.boardService.messages.next(this.message);
      }

      console.log("Response from websocket: ", msg);
    }, error => {
      this.connectionStatus.isConnecting = false;
      this.connectionStatus.message = "Connection to remote servers failed. Continueing in offline mode";
      setTimeout(() => { // I have to do this because we connect to fast
        $('#loading').modal('hide');
      }, 2000);
    });
  }

  AddSound() {
    const soundName = this.newSoundName.replace(/\s/g, '');
    if (soundName.length < 3 || soundName.length > 50) {
      this.alertStructure.error = true;
      this.alertStructure.message = '<stong>Something went wrong:</stong> <li>The name must be larger than 3 characters.</li> <li>The name must be shorter than 50 characters.</li>';
      return;
    }

    if (soundName === '') {
      this.alertStructure.error = true;
      this.alertStructure.message = '<stong>Something went wrong:</stong> <li>The sound name cannot be empty.</li>';
      return;
    }

    if (this.newSoundFile === '') {
      this.alertStructure.error = true;
      this.alertStructure.message = '<stong>Something went wrong:</stong> <li>You have not selected a file.</li>';
      return;
    }

    const ID = this.MakeUniqueID(10);

    const data = new Sound();
    data.id = ID;
    data.name = this.newSoundName;
    data.file = this.newSoundFile;

    const dir = this.data[this.selectedDirectory];

    dir.sounds[ID] = data;

    this.data[this.selectedDirectory].sounds = dir.sounds;
    this.boardService.SetBoardData(this.selectedBoard, this.data);

    this.newSoundFile = '';
    this.newSoundName = '';

    this.ngOnInit();
  }

  AddDirectory() {
    const dirName = this.newDirName.replace(/\s/g, '');

    if(dirName.length < 3 || dirName.length > 50) {
      this.alertStructure.error = true;
      this.alertStructure.message = '<stong>Something went wrong:</stong> <li>The name must be larger than 3 characters.</li>  <li>The name must be shorter than 50 characters.</li>';
      return;
    }

    if (dirName === '') {
      this.alertStructure.error = true;
      this.alertStructure.message = '<stong>Something went wrong:</stong> <li>The directory name cannot be empty.</li>';
      return;
    }

    const data = new Directory();
    data.name = this.newDirName;
    data.parent = this.selectedDirectory;

    const ID = this.MakeUniqueID(10);

    this.data[ID] = data;

    this.boardService.SetBoardData(this.selectedBoard, this.data);

    this.ngOnInit();
    this.ShowSelectedDirectory();

    this.newDirName = '';
  }

  SetSelectedDirectory(id) {
    this.ResetAlertStructure();
    if ($("#" + id).hasClass('sound-card-edit')) {
      console.log('Open directory edit menu');
      this.editDirName = this.GetDirInfo(id).name;
      $('#editDirectory').modal('show');
      this.editDirectory = id;
    } else {
      this.selectedDirectory = id;
      this.ShowSelectedDirectory();
    }
  }

  PlaySound(id) {
    this.ResetAlertStructure();
    if ($("#" + id).hasClass('sound-card-edit')) {
      this.editSoundFile = '';
      this.newSoundFile = '';

      console.log('Open sound edit menu');
      const sound = this.data[this.selectedDirectory].sounds[id];
      this.editSoundName = sound.name;
      this.editSoundFile = sound.file;

      $('#editSound').modal('show');
      this.editSound = id;
    } else {
      // Play File
      if(this.selectedAudio === '' || this.audio.ended || this.selectedAudio !== id || this.audio.paused ) {
        // Play new sound
        this.selectedAudio = id;
        const sound = this.data[this.selectedDirectory].sounds[id];
        this.audio.src = sound.file;
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        // Stop sound because it was the same
        this.audio.pause();
      }
      
    }
  }

  EditDirectory() {
    this.data[this.editDirectory].name = this.editDirName;
    this.boardService.SetBoardData(this.selectedBoard, this.data);
    this.ShowSelectedDirectory();
  }

  EditSound() {
    const sound = this.data[this.selectedDirectory].sounds[this.editSound];
    sound.name = this.editSoundName;

    if (this.editSoundFile !== '') {
      sound.file = this.editSoundFile;
    }
    
    console.log(this.editSoundFile);

    this.data[this.selectedDirectory].sounds[this.editSound] = sound;

    this.boardService.SetBoardData(this.selectedBoard, this.data);
    this.ShowSelectedDirectory();
  }

  ShowSelectedDirectory() {
    this.dirsToShow = [];
    this.soundsToShow = [];

    const data = this.data;
    const keys = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
      const element = keys[i];
      if (element === this.selectedDirectory) {
        continue;
      }

      if (data[element].parent === this.selectedDirectory) {
        this.dirsToShow.push(keys[i]);
      }
    }

    const soundKeys = Object.keys(this.data[this.selectedDirectory].sounds);
    for (let i = 0; i < soundKeys.length; i++) {
      const element = soundKeys[i];
      const sound = this.data[this.selectedDirectory].sounds[element];
      this.soundsToShow.push(sound);
    }

    console.log(this.soundsToShow);
  }

  ResetAlertStructure() {
    this.alertStructure = {
      success: false,
      error: false,
      message: ''
    };
  }

  MakeUniqueID(length: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let foundID = false;

    while(!foundID) {
      text = '';
      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      if(this.allDirectories.indexOf(text) === -1 && this.allSounds.indexOf(text) === -1) {
        foundID = true;
      }
    }


    return text;
  }

  GoPageUp() {
    if(this.selectedDirectory === '') {
      return;
    } 

    this.selectedDirectory = this.data[this.selectedDirectory].parent;
    this.ShowSelectedDirectory();
  }

  GetDirInfo(dirId) {
    return this.data[dirId];
  }

  getFiles(event) {
    console.log(event.target.files[0]);
    this.editSoundFile = event.target.files[0].path;
    this.newSoundFile = event.target.files[0].path;
  } 
}
