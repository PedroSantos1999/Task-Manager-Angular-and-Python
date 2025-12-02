import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class User {
  constructor(private http: HttpClient,
    private authService: Auth) { }
}
