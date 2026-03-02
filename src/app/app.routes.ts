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
      { path: 'customers/view', loadComponent: () => import('./dashboard/pages/view-customer/view-customer.component').then(m => m.ViewCustomerComponent) },
      { path: 'users/add', loadComponent: () => import('./dashboard/pages/add-user/add-user.component').then(m => m.AddUserComponent) },
      { path: 'items/view', loadComponent: () => import('./dashboard/pages/view-item/view-item.component').then(m => m.ViewItemComponent) },
      { path: 'items/discount', loadComponent: () => import('./dashboard/pages/item-discount/item-discount.component').then(m => m.ItemDiscountComponent) },
      { path: 'users/update', loadComponent: () => import('./dashboard/pages/update-user/update-user.component').then(m => m.UpdateUserComponent) },
      { path: 'merchant', loadComponent: () => import('./dashboard/pages/merchant/merchant.component').then(m => m.MerchantComponent) },
      { path: 'category', loadComponent: () => import('./dashboard/pages/category/category.component').then(m => m.CategoryComponent) },
      { path: 'outlet', loadComponent: () => import('./dashboard/pages/outlet/outlet.component').then(m => m.OutletComponent) },
      { path: 'outlet/schedule', loadComponent: () => import('./dashboard/pages/outlet/outlet-schedule.component').then(m => m.OutletScheduleComponent) },
      { path: 'outlet/payment', loadComponent: () => import('./dashboard/pages/outlet/outlet-payment.component').then(m => m.OutletPaymentComponent) },
      { path: 'notifications', loadComponent: () => import('./dashboard/pages/notifications-page/notifications-page.component').then(m => m.NotificationsPageComponent) },
      { path: 'help', loadComponent: () => import('./dashboard/pages/help/help.component').then(m => m.HelpComponent) },
    ],
  },
];
