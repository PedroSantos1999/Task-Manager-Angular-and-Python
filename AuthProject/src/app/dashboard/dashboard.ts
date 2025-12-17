import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../shared/services/auth';
import { User } from '../shared/services/user';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { Taskpopup } from './taskpopup/taskpopup';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [MatTableModule, MatPaginatorModule,MatDialogModule],
  templateUrl: './dashboard.html',
  styles: ``,
  styleUrls: ["./dashboard.css"]
})
@Injectable({
  providedIn: 'root',
})
export class Dashboard implements OnInit, AfterViewInit  {
  constructor(private router: Router,
    private authService: Auth,
    private userService: User) { }
    fullName: string;
    displayedColumns: string[] = ['task', 'description', 'user', 'status', 'options'];
    tasks: Array<Task>[];
    newTasks :Task[]= []; 
    users: Array<UserClass>[];
    newUser :UserClass[]= [];  
    dataSource = new MatTableDataSource<Task>(this.newTasks);
    names: Array<String>[];
    private dialog = inject(MatDialog);
    userID: string[] = [];
    

    @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.userID = [];
    this.getUserId();
    this.getUserData();
    this.getTasksList();
  }

  getUserId(){
    this.userService.getUserProfile().subscribe({
        next: (res: any) => {
          this.userID.push(res);
          
        },
        error: err => {
          console.log('error getting users:\n', err);
        }
      })
  }

    
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  addTask(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(Taskpopup, {
      width: '50%',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { defaultValue: this.userID }
    });
  }

  getUserData() {
    this.authService.getUsers().subscribe({
        next: (res: any) => {
          this.users = res;
          for(let i in this.users){
            var user = this.users[i];
            var obj = JSON.stringify(user);
            var stringify = JSON.parse(obj);
            this.newUser.push({user_id:stringify.public_id, name:stringify.fullName})       
          }    
        },
        error: err => {
          console.log('error getting users:\n', err);
        }
      })
  }

  getTasksList() {
    this.authService.getTasks().subscribe({
        next: (res: any) => {
          this.tasks = res;
          for(let i in this.tasks){
            var task = this.tasks[i];
            var obj = JSON.stringify(task);
            var stringify = JSON.parse(obj);
            
            var userName = this.newUser.find(item => item.user_id === stringify.user_id);
            let name = userName?.name as string;
            this.newTasks.push({task:stringify.task, description:stringify.description, user: name, status: stringify.status});
          }    
          this.dataSource.data = this.newTasks;
        },
        error: err => {
          console.log('error getting tasks:\n', err);
        }
      })
  }
}

export interface UserClass {
  user_id: string;
  name: string;
}

export interface Task {
  task: string;
  description: string;
  user: string;
  status: string;
}

const ELEMENT_DATA: Task[] = [
  {task: 'Test1', description: 'etc', user: 'Pero Santos', status: 'Ongoing'},
  {task: 'Test2', description: 'etc', user: 'Pero Santos', status: 'Closed'},
];