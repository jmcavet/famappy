import { Component, inject, OnInit } from '@angular/core';
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
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { DialogModule } from 'primeng/dialog';

interface Item {
  id: string;
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FormsModule,
    ButtonModule,
    InputTextModule,
    Tree,
    DialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'famappy';
  files: TreeNode[] = [
    {
      key: '0',
      label: 'Documents',
      data: 'Documents Folder',
      icon: 'pi pi-fw pi-inbox',
      children: [
        {
          key: '0-0',
          label: 'Work',
          data: 'Work Folder',
          icon: 'pi pi-fw pi-cog',
          children: [
            {
              key: '0-0-0',
              label: 'Expenses.doc',
              icon: 'pi pi-fw pi-file',
              data: 'Expenses Document',
            },
            {
              key: '0-0-1',
              label: 'Resume.doc',
              icon: 'pi pi-fw pi-file',
              data: 'Resume Document',
            },
          ],
        },
        {
          key: '0-1',
          label: 'Home',
          data: 'Home Folder',
          icon: 'pi pi-fw pi-home',
          children: [
            {
              key: '0-1-0',
              label: 'Invoices.txt',
              icon: 'pi pi-fw pi-file',
              data: 'Invoices for this month',
            },
          ],
        },
      ],
    },
  ];

  message: string = '';

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  firestore = inject(Firestore);
  itemCollection = collection(this.firestore, 'items');
  item$ = collectionData<any>(this.itemCollection, { idField: 'id' });

  items?: Item[];

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.item$.subscribe((data) => {
      this.items = data;
    });
  }

  onSubmit() {
    addDoc(this.itemCollection, { text: this.message });
    this.message = '';
  }

  onDelete(docId: string): Promise<void> {
    console.log('docId: ', docId);
    const docRef = doc(this.firestore, 'items', docId);

    return deleteDoc(docRef);
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
}
