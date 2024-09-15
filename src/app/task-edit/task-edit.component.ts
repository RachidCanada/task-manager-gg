import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { TaskApiService } from '../services/task-api.service';
import { Task } from '../models/task.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebSocketService } from '../services/websocket.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.scss'
})
export class TaskEditComponent {

  task: Task | undefined;
  editForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private taskApiService: TaskApiService,
    private router: Router,
    private fb: FormBuilder,
    private webSocketService: WebSocketService,
    private authService: AuthService
  ){
    this.editForm = this.fb.group({
      description: ['', Validators.required]
    });

    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId !== null) {
      this.task = this.taskService.getTask(taskId);
      if (this.task) {
        this.editForm.patchValue({
          description: this.task.description
        });
      }
    } else {
      // Handle the case where no id is provided, perhaps redirect to the task list
      this.router.navigate(['/tasks']);
    }
  }

  onSubmit(){
    if(this.task){
      this.task.description = this.editForm.value.description;
      this.taskApiService.updateTask(this.task.id, this.task).subscribe(
        (updatedTask) => {
          // Envoyer une notification via WebSocket
          this.webSocketService.sendMessage({
            event: 'taskUpdated',
            taskId: updatedTask.id,
            createdBy: updatedTask.createdBy
          });
          this.router.navigate(['']);
        },
        (error) => {
          console.error('Error updating task:', error);
          // Handle the error, perhaps show a message to the user
        }
      );
    }
  }
}