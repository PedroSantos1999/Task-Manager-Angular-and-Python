import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TOKEN_KEY } from '../constants';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http:HttpClient) { }

  createUser(formData:any){
    return this.http.post(environment.apiBaseUrl+'/signup', formData);
  }

  signin(formData:any){
    return this.http.post(environment.apiBaseUrl+'/signin', formData);
  }

  isLoggedIn(){
    return this.getToken() != null ? true : false;
  }

  saveToken(token:string){
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(){
    return localStorage.getItem(TOKEN_KEY);
  }

  deleteToken(){
    localStorage.removeItem(TOKEN_KEY);
  }

  getTasks(){
    return this.http.get(environment.apiBaseUrl+'/tasks');
  }

  getTaskUsername(user_id:string){
    var requestByUrl = environment.apiBaseUrl+'/users/'+user_id;
    return this.http.get(requestByUrl);
  }

  createTask(formData:any){
    return this.http.post(environment.apiBaseUrl+'/tasks', formData);
  }

  getUsers(){
    return this.http.get(environment.apiBaseUrl+'/users');
  }
}
