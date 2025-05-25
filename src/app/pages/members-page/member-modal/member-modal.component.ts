import { NgClass, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { AbstractControl, FormsModule, ValidationErrors } from '@angular/forms';
import { MembersService } from '../../../services/members.service';
import { ButtonComponent } from '../../../shared/widgets/button/button.component';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoadingComponent } from '../../../shared/widgets/loading/loading.component';
import { Member } from '../member/member.model';
import { pastDateValidator } from '../../../shared/validators/form-validators';

@Component({
  selector: 'app-member-modal',
  imports: [
    NgClass,
    FormsModule,
    ButtonComponent,
    ReactiveFormsModule,
    LoadingComponent,
    NgIf,
  ],
  templateUrl: './member-modal.component.html',
  styleUrl: './member-modal.component.css',
})
export class MemberModalComponent {
  private _formBuilder = inject(FormBuilder);
  modalForm: FormGroup = this._formBuilder.group({});
  initialForm = {
    name: '',
    sex: 'male',
    birthday: '',
  };

  isModalOpen = false;
  isLoading = false;

  @Input() id: string = '';
  @Input() title: string = '';
  @Input() type: string = '';
  @Input() name: string = this.initialForm.name;
  @Input() sex: string = this.initialForm.sex;
  @Input() birthday: string = this.initialForm.birthday;
  @Input() mainBtnText: string = 'Save';
  @Input() buttonIsDisabled: boolean = true;

  originalName: string = '';
  originalSex: string = '';
  originalBirthday: string = '';

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.modalForm = this._formBuilder.group({
      name: [this.name, [Validators.required, Validators.minLength(2)]],
      sex: [this.sex, Validators.required],
      birthday: [this.birthday, [Validators.required, pastDateValidator]],
    });

    // Save the original member properties (refer below within the 'closeModal' method)
    this.originalName = this.name;
    this.originalSex = this.sex;
    this.originalBirthday = this.birthday;

    // Subscribe to the 'name' input field value changes
    this.modalForm.get('name')?.valueChanges.subscribe((value) => {
      this.name = value;
      this.buttonIsDisabled = this.isFormValid();
    });

    // Subscribe to the 'birthday' input field value changes
    this.modalForm.get('birthday')?.valueChanges.subscribe((value) => {
      this.birthday = value;
      this.buttonIsDisabled = this.isFormValid();
    });
  }

  isFormValid() {
    // When updating, button is disabled if there are no changes compared to the original data
    if (
      this.mainBtnText !== 'Save' &&
      this.name === this.originalName &&
      this.sex === this.originalSex &&
      this.birthday === this.originalBirthday
    ) {
      return true;
    }

    return this.name.length > 0 && this.birthday.length > 0 ? false : true;
  }
  openModal() {
    this.isModalOpen = true;
  }

  closeModal(update: boolean = false) {
    this.isModalOpen = false;

    if (this.mainBtnText === 'Save') {
      // If you were about to save a new member but you finally cancel: clear the form
      this.clearForm();
    } else {
      if (!update) {
        // If you were about to update an existing member but you finally cancel: re-render the original member properties
        this.modalForm.setValue({
          name: this.originalName,
          sex: this.originalSex,
          birthday: this.originalBirthday,
        });
      }
    }
  }

  closeModalOnOutsideClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (targetElement.classList.contains('fixed')) {
      this.closeModal();
    }
  }

  async onMainAction() {
    // This action can be to save a new member into Firestore or to update an existing member in Firestore
    this.isLoading = true;

    const member: Member = {
      type: this.type,
      name: this.modalForm.value.name,
      sex: this.modalForm.value.sex,
      birthday: this.modalForm.value.birthday,
    };

    if (this.mainBtnText === 'Save') {
      try {
        const docId = await this.membersService.saveMemberIntoStore(member);
        console.log('New member document ID: ', docId);
        this.closeModal();
      } catch (error) {
        console.error('Error saving member: ', error);
      }
    } else {
      try {
        await this.membersService.updateMemberIntoStore(this.id, member);

        this.closeModal(true);
      } catch (error) {
        console.error('Error updating member: ', error);
      }
    }

    this.isLoading = false;
  }

  clearForm() {
    // Reset the modal form fields
    this.modalForm.reset(this.initialForm);
  }
}
