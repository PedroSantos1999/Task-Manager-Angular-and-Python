import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class User {
  constructor(private http: HttpClient,
    private authService: Auth) { }

    getUserProfile() {
      let token = this.authService.getToken() as string;
      const reqHeader = new HttpHeaders().set('x-access-token', token)
      return this.http.get(environment.apiBaseUrl + '/useronline', {headers: reqHeader});
    }
}
