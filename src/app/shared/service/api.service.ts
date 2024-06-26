import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private local = 'http://127.0.0.1:8000';
  private url = '/mypt-ho-auth-api';

  constructor(private http: HttpClient) {}

  // Get list of groups
  getGroups(data: any): Observable<any> {
    return this.http.post<any>(this.local + `${this.url}/group-show`, data);
  }

  // Remove group
  removeGroup(groupId: number): Observable<any> {
    return this.http.post<any>(this.local + `${this.url}/group-remove`, {
      group_ID: groupId,
    });
  }

  // Update group
  updateGroup(groupId: number, updatedData: any): Observable<any> {
    return this.http.post<any>(this.local + `${this.url}/group-update`, {
      group_ID: groupId,
      ...updatedData,
    });
  }

  // Get the detail of group
  getGroupDetails(groupId: number): Observable<any> {
    return this.http.post<any>(this.local + `${this.url}/config-show`, {
      group_ID: groupId,
    });
  }

  // Corrected method to handle pagination
  getPagination(
    groupId: number,
    page: number,
    pageSize: number
  ): Observable<any> {
    const body = { group_ID: groupId };
    let params = new HttpParams()
      .set('page_size', pageSize.toString())
      .set('page', page.toString());

    return this.http.post<any>(this.local + `${this.url}/config-show`, body, {
      params,
    });
  }

  // Add element of group
  addGroupItem(groupId: number, groupData: any): Observable<any> {
    return this.http.post<any>(this.local + `${this.url}/config-add`, {
      group_ID: groupId,
      ...groupData,
    });
  }

  deleteItem(configID: number): Observable<any> {
    return this.http.post<any>(this.local + `${this.url}/config-remove`, {
      config_ID: configID,
    });
  }

  // Edit element of group
  updateItem(itemId: number, updatedData: any): Observable<any> {
    return this.http.post<any>(this.local + `${this.url}/config-update`, {
      config_ID: itemId,
      ...updatedData,
    });
  }
}
