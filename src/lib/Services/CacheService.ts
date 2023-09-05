import { Injectable } from '@angular/core';
export class CACHE_CONSTANT {
  USER_PROFILE: string = '';
  TOKEN: string = '';
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  remove(key: string) {
    window.sessionStorage.removeItem(key);
    //SessionStorage.remove(key);
  }
  exist(key: string): boolean {
    return window.sessionStorage.getItem(key) != null;
    //return sessionStorage.exist(key);
  }
  get(key: string): any {
    if (!this.exist(key)) {
      return null;
    }
    let data: any = window.sessionStorage.getItem(key);
    return JSON.parse(data);
    //return sessionStorage.get(key);
  }
  set(key: string, data: any): any {
    window.sessionStorage.setItem(key, JSON.stringify(data));
    //return sessionStorage.set(key, data);
  }

  checkUserRight(right: string) {
    let user_profile: any = window.sessionStorage.getItem('USER_PROFILE');
    let user_rights: any;
    var result;
    if (user_profile) {
      user_rights = user_profile.userRights;
      if (user_rights) {
        result = user_rights[right];
      }
    }
    return result;
  }
}
