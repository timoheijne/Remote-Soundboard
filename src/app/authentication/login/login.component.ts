import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router/src/router';
declare var jquery: any;
declare var $: any;

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    hasErrored   = false;
    errorMessage = '';

    hasSuccess = false;
    successMessage = '';

    login = {login: '', password: ''};
    register = {username: '', email: '', password: '', password_confirm: ''};

    constructor(private authService: AuthService, private router: Router) {}

    ToggleRegister() {
        $('.login-form').animate({
            height: 'toggle', opacity: 'toggle'
        }, 'slow');

        $('.register-form').animate({
            height: 'toggle', opacity: 'toggle'
        }, 'slow');
    }

    onLogin() {
        console.log("Test");

        this.hasErrored = false;
        this.hasSuccess = false;

        const test = this.authService.login(this.login.login, this.login.password);
        test.then((result) => {
            if (result) {
                this.hasSuccess = true;
                this.successMessage = 'Successfully loggedin... Redirecting';

                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 1000);
            } else {
                this.hasErrored = true;
                this.errorMessage = 'Credentials invalid';
            }
        });
    }

    onRegister() {
        this.hasErrored = false;
        this.hasSuccess = false;

        // TODO: Propper validating
        if (this.register.password !== this.register.password_confirm) {
            return;
        }

        this.authService.register(this.register.username, this.register.password, this.register.email).then((result) => {
            if(result) {
                this.hasSuccess = true;
                this.successMessage = 'Successfully registered... You can now login';
                this.ToggleRegister();
            } else {
                this.hasErrored = true;
                this.errorMessage = 'Whoops, Something went wrong';
            }
        })

    }
}
