import { Routes } from '@angular/router';
import { User } from './user/user';
import { Registration } from './user/registration/registration';
import { Login } from './user/login/login';
import { Component } from '@angular/core';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './shared/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
    {path: '', redirectTo:'/login', pathMatch:'full'},
    {path: '', component:User,
        children:[
            {path:'signup', component:Registration},
            {path:'login', component:Login}
        ]
    },
    {path:'', component:MainLayout, canActivate: [authGuard],
        children:[
            {path:'dashboard', component:Dashboard}
        ]}
];
