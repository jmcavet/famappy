import { Component } from '@angular/core';
import { MemberComponent } from './member/member.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/widgets/button/button.component';
import { MembersService } from '../../services/members.service';
import { MemberModalComponent } from './member-modal/member-modal.component';
import { MemberWithId } from './member/member.model';
import { LoadingComponent } from '../../shared/widgets/loading/loading.component';

@Component({
  selector: 'app-members-page',
  imports: [
    MemberComponent,
    FormsModule,
    CommonModule,
    ButtonComponent,
    MemberModalComponent,
    LoadingComponent,
  ],
  templateUrl: './members-page.component.html',
  styleUrl: './members-page.component.css',
})
export class MembersPageComponent {
  members: MemberWithId[] = [];
  memberType: string = 'parent';
  isLoading: boolean = true;
  modalTitle: string = '';

  constructor(private membersService: MembersService) {}

  ngOnInit() {
    // Subscribe to real-time updates with a callback
    this.membersService.getMembersFromStore((members) => {
      if (members) {
        this.members = members;
      }
      this.isLoading = false; // Data is fetched, hide loading
    });
  }

  showParents() {
    this.memberType = 'parent';
    this.modalTitle = `Enter new ${this.memberType}`;
  }

  showChildren() {
    this.memberType = 'child';
    this.modalTitle = `Enter new ${this.memberType}`;
  }

  getMembersByType(memberType: string) {
    return this.members.filter((member) => member.type === memberType);
  }
}
