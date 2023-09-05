import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { CACHE_CONSTANT, CacheService } from './CacheService';
import { HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
// import { CookieService } from 'angular2-cookie/core';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit, OnDestroy {
  cache_constant: CACHE_CONSTANT = <CACHE_CONSTANT>{};
  private _subscriptions: Array<Subscription> = [];
  RightObj: any = <any>{};
  rightObject: any;
  menuName: any;
  add = false;
  edit = false;
  delete = false;
  view = false;
  user: any;
  constructor(
    private cacheService: CacheService // , private _cookieService: CookieService
  ) {}
  ngOnInit() {}

  isAuthorized(routeInstruction: any) {
    let profile = this.getUserProfile();
    return this.isAuthenticated(profile);
  }
  removeAuth(): void {
    this.cacheService.remove('USER_PROFILE');
    this.cacheService.remove('TOKEN');
  }
  isAuthenticated(profile: any) {
    return !!profile;
  }
  setAuth(auth: any) {
    //  alert("reached SetAuth")
    this.cacheService.set('USER_PROFILE', auth.profile);
    this.cacheService.set('TOKEN', auth.token);
    this.cacheService.set('setting', auth.setting);
    //  console.log("Token", this.cacheService.get('TOKEN'));
    // console.log("userCheck",this.cacheService.get('USER_PROFILE'),auth)
    //this.setting.appSetting.setSetting(auth.setting);
  }
  setSessionVariable(key: string, value: any) {
    if (this.cacheService.exist(key)) this.cacheService.remove(key);
    this.cacheService.set(key, value);
  }

  getSessionVariable(key: string) {
    if (!this.cacheService.exist(key)) {
      return null;
    }
    let sessionVariable = this.cacheService.get(key);
    return sessionVariable;
  }
  removeSessionVariable(key: string) {
    this.cacheService.remove(key);
  }

  getAuth(): any {
    let auth: any = {
      profile: this.cacheService.get('USER_PROFILE'),
      token: this.cacheService.get('TOKEN'),
    };
    console.log({ gettoken: auth });
    return auth;
  }
  getUserProfile(): any {
    if (!this.cacheService.exist('USER_PROFILE')) {
      return null;
    }
    let userProfile = this.cacheService.get('USER_PROFILE');
    this.user = this.cacheService.get('USER_PROFILE');
    return userProfile;
  }

  checkUserRight(right: string) {
    let user_profile: any = this.getUserProfile();
    let user_rights: any;
    var result: any[] = [];
    if (user_profile) {
      user_rights = user_profile.userRights;
      if (user_rights) {
        result = user_rights[right];
      }
    }
    return result;
  }

  ///function for canactivate menu
  public getMenuRight(menu: string, right: string): any {
    // alert("reached")
    var result = { list: false, right: false };
    console.log('MenuName', menu);
    if (menu == '') return result;
    let user_profile: any = this.getUserProfile();
    // console.log("userPPPP", user_profile)
    let menu_rights: any[] = [];

    var list: boolean = false;
    var mRight: boolean = false;
    if (user_profile) {
      menu_rights = user_profile.menuRights;
      console.log('MenuRights', menu_rights, menu);
      if (menu_rights) {
        for (var m in menu_rights) {
          // alert("reached1")
          console.log('Reached1', menu_rights[m].menu, menu);

          if (menu_rights[m].menu == menu) {
            // alert("reached")
            console.log('Reached2');
            this.RightObj = menu_rights[m];
            this.rightObject = menu_rights[m];
            this.menuName = menu;
            console.log('RRRR', this.RightObj);
            console.log({ menu: menu, menus: menu_rights[m] });
            if (menu_rights[m].right.length > 0) {
              list = true;
            }
            for (var r in menu_rights[m].right) {
              if (menu_rights[m].right[r] == right) {
                this.canActive = true;
                mRight = true;
              }
            }
          }
        }
      }
    }
    console.log(this.RightObj, 'RRRRRRRRRR');
    console.log(this.rightObject, 'lllllll');
    result = { list: list, right: mRight };
    console.log(result, 'resulttttt');
    return result;
  }

  public canActive: boolean = false;
  checkMenuRight(menu: string, right: string) {
    // return true;
    let user_profile: any = this.getUserProfile();
    let menu_rights: any[] = [];
    var result = false;
    if (user_profile) {
      menu_rights = user_profile.menuRights;
      if (menu_rights) {
        for (var m in menu_rights) {
          if (menu_rights[m].menu == menu) {
            for (var r in menu_rights[m].right) {
              if (menu_rights[m].right[r] == right) {
                this.canActive = result;
                result = true;
              }
            }
          }
        }
      }
    }
    return result;
  }

  getSetting() {
    if (!this.cacheService.exist('setting')) {
      return undefined;
    }
    let setting = this.cacheService.get('setting');
    return setting.EnableRealTimeStockCheck;
  }

  getCookie() {
    var cookie = ''; //this._cookieService.get("imsposcookie");

    var j;
    if (!cookie) {
      return undefined;
    }

    return JSON.parse(cookie);
  }
  getRequestHeaders() {
    return new HttpHeaders({ Authorization: this.getAuth().token });
  }
  getRequestOption() {
    const httpOptions = {
      'Content-Type': 'application/json',
      headers: new HttpHeaders({
        Authorization: this.getAuth().token,
      }),
    };
    // console.log({ httpoption: httpOptions });
    return httpOptions;
  }
  ngOnDestroy() {
    this._subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  // ClientTerminalValidation(){
  //    var CT= this._cookieService.get("imsposcookie");
  //    if(CT==null){return false;}
  //    else{
  //    }
  // }
  // getFormRights(fname) {
  //     if (this.menuName == fname) {
  //         var userRights = this.RightObj.right;
  //         for (let i of userRights) {
  //             if (i == "add") this.add = true;
  //             if (i == "edit") this.edit = true;
  //             if (i == "delete") this.delete = true;
  //             if (i == "view") this.view = true;
  //         }
  //         console.log("CheckName", this.add, this.edit, this.delete, this.view, !this.add)
  //     }

  // }
}
