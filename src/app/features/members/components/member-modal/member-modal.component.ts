import { NgClass, NgIf } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Member } from '../member/member.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { MemberBackendService } from '../../../../services/backend/member.service';
import { pastDateValidator } from '../../../../shared/validators/form-validators';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

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

  /** Services */
  private memberBackendService = inject(MemberBackendService);

  /** Declaration of signals communicating with firestore */
  readonly savingMember = this.memberBackendService.saving;
  readonly updatingMember = this.memberBackendService.updating;

  /** Declaration of local signals */
  isModalOpen = signal<boolean>(false);
  originalName = signal<string>('');
  originalSex = signal<string>('');
  originalBirthday = signal<string>('');

  modalForm: FormGroup = this._formBuilder.group({});
  initialForm = {
    name: '',
    sex: 'male',
    birthday: '',
  };

  @Input() id: string = '';
  @Input() title: string = '';
  @Input() type: string = '';
  @Input() name: string = this.initialForm.name;
  @Input() sex: string = this.initialForm.sex;
  @Input() birthday: string = this.initialForm.birthday;
  @Input() mainBtnText: string = 'Save';
  @Input() buttonIsDisabled: boolean = true;

  ngOnInit(): void {
    this.modalForm = this._formBuilder.group({
      name: [this.name, [Validators.required, Validators.minLength(2)]],
      sex: [this.sex, Validators.required],
      birthday: [this.birthday, [Validators.required, pastDateValidator]],
    });

    // Save the original member properties (refer below within the 'closeModal' method)
    this.originalName.set(this.name);
    this.originalSex.set(this.sex);
    this.originalBirthday.set(this.birthday);

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

  readonly pageIsRefreshing = computed(() => {
    return this.savingMember() || this.updatingMember();
  });

  isFormValid() {
    // When updating, button is disabled if there are no changes compared to the original data
    if (
      this.mainBtnText !== 'Save' &&
      this.name === this.originalName() &&
      this.sex === this.originalSex() &&
      this.birthday === this.originalBirthday()
    ) {
      return true;
    }

    return this.name.length > 0 && this.birthday.length > 0 ? false : true;
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal(update: boolean = false) {
    this.isModalOpen.set(false);

    if (this.mainBtnText === 'Save') {
      // If you were about to save a new member but you finally cancel: clear the form
      this.clearForm();
    } else {
      if (!update) {
        // If you were about to update an existing member but you finally cancel: re-render the original member properties
        this.modalForm.setValue({
          name: this.originalName(),
          sex: this.originalSex(),
          birthday: this.originalBirthday(),
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

  async onSaveOrUpdateMember() {
    // This action can be to save a new member into Firestore or to update an existing member in Firestore

    const member: Member = {
      type: this.type,
      name: this.modalForm.value.name,
      sex: this.modalForm.value.sex,
      birthday: this.modalForm.value.birthday,
    };

    if (this.mainBtnText === 'Save') {
      try {
        await this.memberBackendService.saveMemberIntoStore(member);
      } catch (error) {
        console.error('Error: ', error);
      }
      this.closeModal();
    } else {
      try {
        await this.memberBackendService.updateMemberInStore(this.id, member);

        this.closeModal(true);
      } catch (error) {
        console.error('Error updating member: ', error);
      }
    }
  }

  clearForm() {
    // Reset the modal form fields
    this.modalForm.reset(this.initialForm);
  }
}
