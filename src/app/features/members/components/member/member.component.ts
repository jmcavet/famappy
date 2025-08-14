import {
  Component,
  computed,
  inject,
  input,
  Input,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MemberWithId } from './member.model';
import { MemberModalComponent } from '../member-modal/member-modal.component';
import { DatePipe } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ModalConfirmComponent } from '../../../../shared/components/modal-confirm/modal-confirm.component';
import { MemberBackendService } from '../../../../services/backend/member.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-member',
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    ModalConfirmComponent,
    MemberModalComponent,
    DatePipe,
    LoadingComponent,
  ],
  templateUrl: './member.component.html',
  styleUrl: './member.component.css',
})
export class MemberComponent {
  private _formBuilder = inject(FormBuilder);

  /** Services */
  private memberBackendService = inject(MemberBackendService);

  /** Declaration of signals communicating with firestore */
  readonly memberIsBeingDeleted = this.memberBackendService.deleting;

  /** Declaration of local signals */
  title = signal<string>('Test');
  showConfirmModal = signal<boolean>(false);

  member = input.required<MemberWithId>();
  members = input.required<MemberWithId[]>();

  memberForm: FormGroup = this._formBuilder.group({});

  readonly pageIsRefreshing = computed(() => {
    return this.memberIsBeingDeleted();
  });

  ngOnInit(): void {
    this.memberForm = this._formBuilder.group({
      name: [this.member().name, Validators.required],
      sex: [this.member().sex, Validators.required],
      birthday: [this.member().birthday, Validators.required],
    });

    const index = this.members()
      .filter((member) => member.type === this.member().type)
      .findIndex((member) => member.name === this.member().name);

    this.title.set(
      `${this.capitalizeFirstLetter(this.member().type)} ${index + 1}`
    );
  }

  capitalizeFirstLetter(str: string) {
    if (str.length === 0) return str; // Handle empty string case
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onConfirmRemoveMember() {
    // Open the Cancel/Confirm modal
    this.showConfirmModal.set(true);
  }

  onConfirmModalAction(confirm: boolean) {
    // Close the Cancel/Confirm modal
    this.showConfirmModal.set(false);

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.onRemoveMember();
    }
  }

  async onRemoveMember() {
    try {
      this.memberBackendService.removeMemberFromStore(this.member().id);
    } catch (error) {
      console.error('Error removing member: ', error);
    }
  }
}
