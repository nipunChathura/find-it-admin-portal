import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users/view' },
      { path: 'users/view', loadComponent: () => import('./dashboard/pages/view-user/view-user.component').then(m => m.ViewUserComponent) },
      { path: 'users/add', loadComponent: () => import('./dashboard/pages/add-user/add-user.component').then(m => m.AddUserComponent) },
      { path: 'items/view', loadComponent: () => import('./dashboard/pages/view-item/view-item.component').then(m => m.ViewItemComponent) },
      { path: 'users/update', loadComponent: () => import('./dashboard/pages/update-user/update-user.component').then(m => m.UpdateUserComponent) },
      { path: 'merchant', loadComponent: () => import('./dashboard/pages/merchant/merchant.component').then(m => m.MerchantComponent) },
      { path: 'category', loadComponent: () => import('./dashboard/pages/category/category.component').then(m => m.CategoryComponent) },
      { path: 'outlet', loadComponent: () => import('./dashboard/pages/outlet/outlet.component').then(m => m.OutletComponent) },
      { path: 'outlet/schedule', loadComponent: () => import('./dashboard/pages/outlet/outlet-schedule.component').then(m => m.OutletScheduleComponent) },
    ],
  },
];
