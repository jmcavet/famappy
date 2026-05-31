import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-upload-loader',
  imports: [],
  templateUrl: './image-upload-loader.component.html',
  styleUrl: './image-upload-loader.component.css',
})
export class ImageUploadLoaderComponent {
  @Input() progress: number = 0;
}
