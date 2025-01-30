import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
} from '@angular/fire/firestore';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { HeaderComponent } from './header/header/header.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { BottomNavigationComponent } from './footer/bottomNavigation/bottom-navigation.component';

interface Item {
  id: string;
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    HeaderComponent,
    ButtonModule,
    InputTextModule,
    DialogModule,
    MatMenuModule,
    MatButtonModule,
    BottomNavigationComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  message: string = '';

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  // firestore = inject(Firestore);
  // itemCollection = collection(this.firestore, 'items');
  // item$ = collectionData<any>(this.itemCollection, { idField: 'id' });

  items?: Item[];

  ngOnInit(): void {
    // this.item$.subscribe((data) => {
    //   this.items = data;
    // });
  }

  onSubmit() {
    // addDoc(this.itemCollection, { text: this.message });
    this.message = '';
  }

  // onDelete(docId: string): Promise<void> {
  //   console.log('docId: ', docId);
  //   const docRef = doc(this.firestore, 'items', docId);

  //   return deleteDoc(docRef);
  // }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
}
