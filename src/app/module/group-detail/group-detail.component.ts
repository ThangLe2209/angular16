import { Component, Input, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/shared/service/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import swal from 'sweetalert';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent {
  @Input() groupDetails: any;
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize: number = 10;
  pageSizeOptions: number[] = [];
  totalItems: number = 0;
  maxPage: number = 0;
  count: number = 0;

  // ADD
  addItemForm: FormGroup;
  addItemFormVisible: boolean = false;
  @Input() groupId!: number;

  // DELETE
  deleteForm: FormGroup;
  groups: any[] = [];
  selectedGroup: any = null;

  // EDIT
  editFormVisible = false;
  elementToEdit: any = null;
  editForm: FormGroup;

  displayedColumns: string[] = [
    'config_ID',
    'config_key',
    'config_value',
    'config_description_vi',
    'date_created',
    'date_last_updated',
    'actions',
  ];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.addItemForm = new FormGroup({
      config_type: new FormControl(''),
      config_key: new FormControl(''),
      config_value: new FormControl(''),
      config_description_vi: new FormControl(''),
      owner: new FormControl(''),
      note: new FormControl(''),
      config_status: new FormControl(''),
    });

    this.deleteForm = this.fb.group({
      config_ID: ['', Validators.required],
    });

    this.editForm = new FormGroup({
      config_ID: new FormControl({ value: '', disabled: true }),
      config_type: new FormControl('', [Validators.required]),
      config_key: new FormControl('', [Validators.required]),
      config_value: new FormControl('', [Validators.required]),
      config_description_vi: new FormControl(''),
      owner: new FormControl('', [Validators.required, Validators.email]),
      note: new FormControl(''),
      config_status: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.addItemForm = new FormGroup({
      config_type: new FormControl('', Validators.required),
      config_key: new FormControl('', Validators.required),
      config_value: new FormControl('', Validators.required),
      config_description_vi: new FormControl(''),
      owner: new FormControl('', [Validators.required, Validators.email]),
      note: new FormControl(''),
      config_status: new FormControl('', Validators.required),
    });
  }

  loadData(page: number = 1) {
    if (!this.groupId) {
      console.error('No group ID provided');
      return;
    }

    this.apiService.getPagination(this.groupId, page, this.pageSize).subscribe({
      next: (data) => {
        if (data && data.list_data) {
          console.log('data: ', data);
          this.dataSource.data = data.list_data;
          this.totalItems = data.total;
          this.count = data.count;
          this.maxPage = data.max_page;
          this.pageSize = this.count; // Cập nhật pageSize dựa trên số phần tử trả về từ backend
          this.pageSizeOptions = [this.count]; // Cập nhật pageSizeOptions để hiển thị đúng số phần tử
          this.paginator.length = this.totalItems; // Cập nhật totalItems từ backend
          this.paginator.pageSize = this.pageSize;
          this.paginator.pageIndex = page - 1;
        } else {
          console.error('Data is missing from the response');
        }
      },
      error: (error) => {
        console.error('Failed to load group details:', error);
      },
    });
  }

  handlePageEvent(event: PageEvent) {
    this.loadData(event.pageIndex + 1);
  }

  onGroupSelected(groupId: number) {
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

  saveGroupDetails() {
    // Call to API to save updated group details
  }

  // Load group details to refresh data in the table
  loadGroupDetails() {
    this.apiService.getGroupDetails(this.groupId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.groupDetails = response; // Assuming groupDetails is used to display the table
        }
      },
      error: (error) => {
        console.error('Error loading group details:', error);
      },
    });
  }

  showAddForm(): void {
    this.addItemFormVisible = true; // Show the add form
  }

  onSubmit(): void {
    console.log(this.addItemForm.value);
    console.log(this.groupId);
    // Call the API to add the item, handle response...
    if (this.addItemForm.valid && this.groupId) {
      this.apiService
        .addGroupItem(this.groupId, this.addItemForm.value)
        .subscribe(
          (res) => {
            this.addItemForm.reset();
            this.addItemFormVisible = false;
            console.log('Item added successfully');
            swal('Successfully', 'Item added successfully', 'success');
            this.loadGroupDetails();
          },
          (err) => {
            console.error('Failed to add item', err);
            swal('Failed', 'Item added Failed', 'error');
          }
        );
    } else {
      Object.keys(this.addItemForm.controls).forEach((key) => {
        const controlErrors = this.addItemForm.get(key)?.errors;
        if (controlErrors) {
          console.log('Validation error in ', key, controlErrors);
          swal('Error', 'Validation error in ' + key, controlErrors, 'Error');
        }
      });
    }
  }

  removeItem(configId: number) {
    const element = this.groupDetails.data.list_data.find(
      (el: any) => el.config_ID === configId
    );

    if (element && element.config_status === 'enabled') {
      this.apiService.deleteItem(configId).subscribe({
        next: (res) => {
          if (res.statusCode === 1) {
            this.groupDetails.data.list_data =
              this.groupDetails.data.list_data.filter(
                (el: any) => el.config_ID !== configId
              );

            swal('Successfully', 'Item deleted successfully', 'success');
          } else {
            console.error(
              'Failed to delete item, status code:',
              res.statusCode
            );
            swal('Failed', 'Failed to delete item', 'error');
          }
        },
        error: (error) => {
          console.error('Error deleting item:', error);
        },
      });
    }
  }

  editItem(element: any) {
    // this.elementToEdit = { ...element };
    this.editFormVisible = true;

    this.editForm.setValue({
      config_ID: element.config_ID,
      config_type: element.config_type,
      config_key: element.config_key,
      config_value: element.config_value,
      config_description_vi: element.config_description_vi,
      owner: element.owner,
      note: element.note,
      config_status: element.config_status,
    });
  }

  saveEdit() {
    if (this.editForm.valid) {
      const itemId = this.editForm.get('config_ID')!.value;
      if (itemId) {
        const updatedData = this.editForm.value;
        console.log('updatedData: ', updatedData);
        this.apiService.updateItem(itemId, updatedData).subscribe(
          (res) => {
            // Cập nhật thành công, cập nhật dữ liệu trong bảng
            this.editFormVisible = false;
            this.editForm.reset();
            swal('Successfully', 'Item updated successfully', 'success');
            this.loadGroupDetails();
          },
          (err) => {
            console.error('Update failed', err);
            this.snackBar.open('Failed to update item', 'Close', {
              duration: 3000,
            });
            swal('Failed', 'Failed to update item', 'error');
          }
        );
      }
    }
  }

  cancelEdit() {
    this.editFormVisible = false;
    this.elementToEdit = null;
  }
}
