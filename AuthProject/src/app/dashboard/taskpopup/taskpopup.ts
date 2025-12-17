import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../shared/services/auth';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-taskpopup',
  imports: [MatButtonModule, 
    MatDialogActions, 
    MatDialogClose, 
    MatDialogTitle, 
    MatDialogContent, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule,
    ReactiveFormsModule],
  templateUrl: './taskpopup.html',
  styles: ``,
  styleUrls: ["./taskpopup.css"]
})
export class Taskpopup implements OnInit  {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { defaultValue: any },
    public formBuilder: FormBuilder,
    private service: Auth,
    private toastr: ToastrService,
    private router: Router,
  ){}
  isSubmitted: boolean = false;
  readonly dialogRef = inject(MatDialogRef<Taskpopup>);
  disableValue: boolean = true;

  ngOnInit(): void {
    console.log(this.data.defaultValue);
  }

  form = this.formBuilder.group({
    task: ['', Validators.required],
    description: ['', Validators.required],
    //user_id: ['', Validators.required],
    user_id: this.data.defaultValue,
    status: ['', Validators.required],
  })

  addTask() {
    this.isSubmitted = true;
    console.log("Form: ", this.form.valid)
    if (this.form.valid) {
      this.disableValue = false;
      this.service.createTask(this.form.value)
        .subscribe({
          next: (res: any) => {
            if (res.succeeded) {
              this.form.reset();
              this.isSubmitted = false;
              //this.toastr.success('New task created!', 'Task added successfully')
              console.log("Task created!");
            }
          },
          error: err => {
          if (err.status == 400)
            this.toastr.error('Incorrect information.', 'Login failed')
          else
            console.log('error during submit:\n', err);

        }

        });
    }
    else {
      console.log("Inputs are either empty or invalid!");
    }
  }
}
