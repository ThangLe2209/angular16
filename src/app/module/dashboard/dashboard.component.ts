import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ApiService } from 'src/app/shared/service/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  selectedGroup: any = null;
  @ViewChild(SideBarComponent, { static: false }) sidebar!: SideBarComponent;
  sidebarOpen = false;
  selectedGroupId!: number;

  editMode = false;
  editGroupForm: FormGroup;

  constructor(private apiService: ApiService) {
    this.editGroupForm = new FormGroup({
      group_ID: new FormControl({ value: '', disabled: true }),
      group_title: new FormControl('', [Validators.required]),
      group_status: new FormControl('', [Validators.required]),
    });
  }

  handleToggleSidenav(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onGroupSelected(groupId: number) {
    this.selectedGroupId = groupId;
    this.apiService.getGroupDetails(groupId).subscribe({
      next: (groupDetails) => {
        this.selectedGroup = groupDetails;
        console.log('Received group details:', groupDetails); // In thông tin chi tiết nhóm nhận được
      },
      error: (error) => {
        console.error('Failed to load group details:', error);
      },
    });
  }

  saveGroupDetails() {}

  closeEditForm() {
    this.editMode = false; // Close the edit form
  }
}
