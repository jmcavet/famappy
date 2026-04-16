import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalServingsSelectionComponent } from './modal-servings-selection.component';

describe('ModalServingsSelectionComponent', () => {
  let component: ModalServingsSelectionComponent;
  let fixture: ComponentFixture<ModalServingsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalServingsSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalServingsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
