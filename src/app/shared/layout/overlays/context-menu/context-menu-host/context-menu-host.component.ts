import { NgComponentOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ContextMenuService } from './context-menu.service';

@Component({
  selector: 'app-context-menu-host',
  imports: [NgComponentOutlet],
  templateUrl: './context-menu-host.component.html',
  styleUrl: './context-menu-host.component.css',
})
export class ContextMenuHostComponent {
  contextMenuService = inject(ContextMenuService);
}
