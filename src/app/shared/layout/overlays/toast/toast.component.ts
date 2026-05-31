import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';

  ngOnInit(): void {
    setTimeout(() => {
      this.dismiss();
    }, 3000); // Auto-dismiss after 3s
  }

  dismiss() {
    const element = document.getElementById(this.message);
    element?.remove();
  }
}
