import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Headers } from '@angular/http/src/headers';
import { Router } from '@angular/router/src/router';

@Injectable()
export class AuthService {

  private storageLocation = 'user';

  constructor(private http: Http, private router: Router) {}

  // Header for authentication
  // Authorization: Bearer {yourtokenhere}

  IsLoggedIn() {
    if (localStorage.getItem(this.storageLocation)) {
      return true;
    } else {
      return false;
    }
  }

  GetUser() {
    return localStorage.getItem(this.storageLocation);
  }

  login(username: string, password: string) {
    const headers = new Headers();
    return new Promise((result) => {

      this.http.post('http://localhost:8000/api/auth/login', { login: username, password: password }, { headers: headers })
        .map((res: Response) => {
          if (res.status < 200 || res.status >= 300) {
            throw new Error('This request has failed ' + res.status);
          } else {
            return res.json();
          }
        })
        .subscribe((data: any) => {
          localStorage.setItem(this.storageLocation, data.token);
          result(true);
        }, (err) => result(false));

    });
  }

  register(username: string, password: string, email: string) {
    const headers = new Headers();
    return new Promise((result) => {
      this.http.post('http://localhost:8000/api/auth/register', { username: username, password: password, email: email }, { headers: headers })
        .map((res: Response) => {
          if (res.status < 200 || res.status >= 300) {
            throw new Error('This request has failed ' + res.status);
          } else {
            return res.json();
          }
        })
        .subscribe((data: any) => {
          result(data.success);
        }, (err) => result(false));

    });
  }

  logout() {
    localStorage.removeItem(this.storageLocation);
    this.router.navigate(['/login']);
  }
}
