import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../service/api.service';
import swal from 'sweetalert';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  @Output() groupSelected = new EventEmitter<number>();
  @Input() isOpen = false;

  groups: any[] = [];
  addGroupFormVisible: boolean = false;

  constructor(public dialog: MatDialog, private apiService: ApiService) {}

  ngOnChanges(changes: any): void {}

  ngOnInit() {
    this.loadGroups();
  }

  @Output() editGroupRequested = new EventEmitter<number>();

  editGroup(groupId: number) {
    this.editGroupRequested.emit(groupId);
  }

  loadGroups() {
    this.apiService.getGroups({}).subscribe({
      next: (res) => {
        console.log('API Response:', res); // In phản hồi từ API để theo dõi
        if (res.statusCode === 1) {
          this.groups = res.data; // Cập nhật danh sách nhóm
          console.log('Loaded groups:', this.groups); // In các nhóm được tải
        } else {
          console.error('Failed to load groups, status code:', res.statusCode);
        }
      },
      error: (error) => {
        console.error('Error fetching groups:', error); // Xử lý lỗi khi gọi API
      },
    });
  }

  selectGroup(groupId: number) {
    this.groupSelected.emit(groupId);
  }

  newGroupForm = new FormGroup({
    group_ID: new FormControl('', [Validators.required]),
    group_title: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    console.log('Form submitted:', this.newGroupForm.value);
  }

  removeGroup(groupId: number) {
    console.log(groupId);
    const findGroup = this.groups.find((el: any) => el.group_ID === groupId);
    console.log('findGroup: ', findGroup);
    if (findGroup) {
      this.apiService.removeGroup(groupId).subscribe({
        next: (res) => {
          if (res.statusCode === 1) {
            console.log('Loaded groups:', this.groups); // In các nhóm là tải
            swal('Successfully', 'Group deleted successfully', 'success');
            this.loadGroups();
          } else {
            swal('Failed', res.message, 'error');
          }
        },
        error: (error) => {
          console.error('Error fetching groups:', error); // Xử lý lỗi khi gọi API
        },
      });
    }
  }
}
