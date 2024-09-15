import { Component, OnInit } from '@angular/core';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { Router } from '@angular/router';
import { TaskAPI } from '../models/task-api.model';
import { TaskApiService } from '../services/task-api.service';
import { WebSocketService } from '../services/websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  isMobile: boolean;
  showCreatedBy: boolean;
  showAssignedTo: boolean;

  createdTasks: TaskAPI[] = [];
  assignedTasks: TaskAPI[] = [];
  lastUidAssigned = "";

  constructor(
    private taskApiService: TaskApiService,
    private router: Router,
    private webSocketService: WebSocketService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ){
    this.isMobile = Capacitor.isNativePlatform();
    this.showCreatedBy = true;
    this.showAssignedTo = false;
  }

  ngOnInit() {
    this.fetchTasks();

    this.webSocketService.getMessage().subscribe(
      (message: any) => {
        if(message.event === "taskCreated"){
          this.fetchTasks();
          if(message.assignedToUid === this.authService.getId()){
            this.snackBar.open("New Task assigned To you!", "OK", {
              duration: 5000,
            });
            this.lastUidAssigned = message.taskUid;
          }
        } else if (message.event === 'taskUpdated' && message.createdBy === this.authService.getId()) {
          this.snackBar.open("A task you created has been updated!", "OK", {
            duration: 5000,
          });
          this.fetchTasks();
        } else if (message.event === 'taskDeleted' && message.assignedTo === this.authService.getId()) {
          this.snackBar.open("A task assigned to you has been deleted!", "OK", {
            duration: 5000,
          });
          this.fetchTasks();
        }
      }
    );
  }

  fetchTasks(){
    this.taskApiService.getTasksCreatedBy().subscribe(
      (res) => {
        this.createdTasks = res.allTasks;
      }
    );

    this.taskApiService.getTasksAssignedTo().subscribe(
      (res) => {
        this.assignedTasks = res.allTasks;
        console.log(this.assignedTasks)
      }
    );
  }

  changeStatus(task: TaskAPI){
    this.taskApiService.updateTaskStatus(task.taskUid, !task.done).subscribe(
      () => {
        this.fetchTasks();
      }
    );
  }

  deleteTask(task: TaskAPI){
    this.taskApiService.deleteTask(task.taskUid).subscribe(
      ()=>{
        this.fetchTasks();
        // Envoyer une notification via WebSocket
        this.webSocketService.sendMessage({
          event: 'taskDeleted',
          taskId: task.taskUid,
          assignedTo: task.assignedToUid
        });
      }
    );
  }

  goToDetail(task: Task){
    this.router.navigate(['/task', task.id])
  }

  shouldHighlight(taskUid: string){
    if(taskUid === this.lastUidAssigned){
      this.lastUidAssigned = "";
      return true;
    }
    return false;
  }

  shouldShowCreatedBy(){
    this.showCreatedBy = true;
    this.showAssignedTo = false;
  }
  shouldShowAssingedTo(){
    this.showCreatedBy = false;
    this.showAssignedTo = true;
  }
}