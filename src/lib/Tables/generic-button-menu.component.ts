import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DrillDownMenu } from '../common/Classes';

@Component({
  selector: 'genericButtonmenu',
  templateUrl: './generic-button-menu.html',
})
export class GeneriButtonMenuComponent implements OnInit {
  @Input() name?: string = 'more';
  @Input() buttonMenus?: DrillDownMenu[] = [];
  @Input() rowValue: any;
  @Input() commonValues: string = '';
  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log({ btns: this.buttonMenus });
    if (this.buttonMenus) {
      if (this.buttonMenus.length == 0) {
        var mnu = new DrillDownMenu();
        mnu.name = 'testmenu';
        this.buttonMenus.push(mnu);
      }
    }
    // if (this.buttonMenus.length > 0) {
    //   this.buttonMenus.forEach((itm) => {
    //     itm.queryUrl = this.generateUrl(itm);
    //   });
    //   console.log({ btnmenus: this.buttonMenus });
    // }
  }

  // private generateUrl(urlbtn: DrillDownMenu) {
  //   var queries = urlbtn.queries;
  //   let querymap = new Map<string, string>();
  //   var urlQuery: string = '';
  //   //'/pages/masters/quotation',
  //   //  { id: event._id, mode: 'view', returnUrl: this.router.url };
  //   console.log({ btnqueris: queries });
  //   if (queries.length > 0) {
  //     var query: string;
  //     queries.forEach((x) => {
  //       if (x.queryType == 'variable') {
  //         querymap.set(x.queryName, this.rowValue[x.queryField]);
  //       }
  //       if (x.queryType == 'static') {
  //         querymap.set(x.queryName, x.queryValue);
  //       }
  //       if (x.queryType == 'common') {
  //         querymap.set(x.queryName, this.router.url);
  //       }
  //     });
  //     console.log({ querymap: querymap });
  //     // var queryobj:any = [...querymap].reduce(
  //     //   (o, [key, value]) => ((o[key] = value), o),
  //     //   {}
  //     // );
  //     //console.log({ reducequeryobj: queryobj });
  //   }

  //   var url = [urlbtn.url];
  //   //var url = [urlbtn.url, queryobj];
  //   console.log({ returnUrl: url });
  //   return url;
  // }

  onMenuClick(event: DrillDownMenu) {
    // let url = this.generateUrl(event);
    console.log({ menuclick: event, url: event });
    // this.router.navigate(url);
  }
}
