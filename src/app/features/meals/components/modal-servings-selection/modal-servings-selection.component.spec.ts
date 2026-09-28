import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ModalServingsSelectionComponent } from './modal-servings-selection.component';

describe('ModalServingsSelectionComponent', () => {
  let component: ModalServingsSelectionComponent;
  let fixture: ComponentFixture<ModalServingsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalServingsSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalServingsSelectionComponent);
    fixture.componentRef.setInput('servings', signal(2));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
