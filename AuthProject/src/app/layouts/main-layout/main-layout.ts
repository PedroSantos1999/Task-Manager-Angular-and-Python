import { Component, ViewChild } from '@angular/core';
import { Auth } from '../../shared/services/auth';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatButtonModule, MatSidenav, MatListModule],
  templateUrl: './main-layout.html',
  styles: ``,
  styleUrls: ["./main-layout.css"]
})
export class MainLayout {

  constructor(private router: Router,
    private authService: Auth) { }
    isExpanded = true;
    isShowing = false;
    sizeWidth = '200px';

    @ViewChild('sidenav') sidenav: MatSidenav;

  onLogout() {
    this.authService.deleteToken();
    this.router.navigateByUrl('/login');
  }

  menuClick() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.isShowing = true;
      this.sizeWidth = '200px';
    } else {
      this.isShowing = false;
      this.sizeWidth = 'auto';
    }
  }
}


