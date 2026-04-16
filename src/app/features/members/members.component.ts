import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MemberComponent } from './components/member/member.component';
import { MemberModalComponent } from './components/member-modal/member-modal.component';
// import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MemberBackendService } from '../../services/backend/member.service';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-members',
  imports: [
    MemberComponent,
    FormsModule,
    CommonModule,
    ButtonComponent,
    MemberModalComponent,
    LoadingComponent,
    SegmentedControlComponent,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent {
  /** Services */
  private memberBackendService = inject(MemberBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbMembers: Signal<any[]> = this.memberBackendService.members;
  readonly isLoading = this.memberBackendService.loading;

  /** Declaration of local signals */
  memberType = signal<string>('parent');
  modalTitle = signal<string>('');

  toggleMember(member: string) {
    this.memberType.update(() => member);
    this.modalTitle.set(`Enter new ${this.memberType()}`);
  }

  // showParents() {
  //   this.memberType.set('parent');
  //   this.modalTitle.set(`Enter new ${this.memberType}`);
  // }

  // showChildren() {
  //   this.memberType.set('child');
  //   this.modalTitle.set(`Enter new ${this.memberType}`);
  // }

  getMembersByTypeComputed(memberType: string): Signal<any[]> {
    return computed(() => {
      return this.dbMembers().filter((member) => member.type === memberType);
    });
  }
}
