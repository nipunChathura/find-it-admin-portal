import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page"><h2>Add User</h2><p>Form to add a new user will be here.</p></div>`,
  styles: ['.page { padding: 1rem; } h2 { margin: 0 0 0.5rem; color: var(--mat-sys-primary); } p { margin: 0; color: var(--mat-sys-on-surface-variant); }'],
})
export class AddUserComponent {}
