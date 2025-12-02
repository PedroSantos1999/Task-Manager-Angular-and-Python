import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../shared/services/auth';
import { User } from '../shared/services/user';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [MatTableModule, MatPaginatorModule,],
  templateUrl: './dashboard.html',
  styles: ``,
  styleUrls: ["./dashboard.css"]
})
export class Dashboard implements OnInit, AfterViewInit  {
  constructor(private router: Router,
    private authService: Auth,
    private userService: User) { }
    fullName: string;
    displayedColumns: string[] = ['task', 'description', 'user', 'status', 'options'];
    tasks: Array<Task>[];
    newTasks :Task[]= []; 
    dataSource = new MatTableDataSource<Task>([]);
    names: Array<String>[];
    

    @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
      this.getTasksList();
  }

    
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  addTask() {
    console.log("TBA");
  }

  getTasksList() {
    this.authService.getTasks().subscribe({
        next: (res: any) => {
          this.tasks = res;
          //this.dataSource = res;
          for(let i in this.tasks){
            var task = this.tasks[i];
            var obj = JSON.stringify(task);
            var stringify = JSON.parse(obj);
            this.getUserTask(stringify.user_id).subscribe((r)=> console.log(r));
            this.newTasks.push({task:stringify.task, description:stringify.description, user_id: stringify.user_id, status: stringify.status});
            
          }    
          this.dataSource = new MatTableDataSource<Task>(this.newTasks);
        },
        error: err => {
          console.log('error getting tasks:\n', err);
        }
      })
  }

  getUserTask(user_id: string): Observable<string> {
    let userName:string;
    var subject = new Subject<string>(); 

    this.authService.getTaskUsername(user_id).subscribe(items => {
      var obj = JSON.stringify(items);
      var stringify = JSON.parse(obj);
      userName = stringify.fullName;
      //console.log(userName);
      subject.next(userName);
    });
    return subject.asObservable();
  }
  

  // displayTable() {
  //   for(let task of this.tasks){
  //        this.dataSource
  //     }
  // }
}


export interface Task {
  task: string;
  description: string;
  user_id: string;
  status: string;
}

const ELEMENT_DATA: Task[] = [
  {task: 'Test1', description: 'etc', user_id: 'Pero Santos', status: 'Ongoing'},
  {task: 'Test2', description: 'etc', user_id: 'Pero Santos', status: 'Closed'},
];