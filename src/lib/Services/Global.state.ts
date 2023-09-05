import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeLast } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class GlobalState {
  private _subjectData: any = {};
  private _data = new Subject<Object>();
  private _dataStream$ = this._data.asObservable();
  //sag
  private _globalSettings: Map<string, Array<any>> = new Map<
    string,
    Array<any>
  >();
  private _subscriptions: Map<string, Array<Function>> = new Map<
    string,
    Array<Function>
  >();

  constructor() {
    console.log({ datastream: 'initiated' });
    this._dataStream$.subscribe((data: any) => this._onEvent(data));
  }

  notifyDataChanged(event: any, value: any) {
    console.log({
      notifyDataChanged: {
        event: event,
        value: value,
        subjectData: this._subjectData,
      },
    });
    let current = this._subjectData[event];
    if (current !== value) {
      //this._data[event] = value;

      this._subjectData[event] = value;
      console.log('4');
      console.log({
        subjectdata: this._subjectData,
        current: current,
        value: value,
      });

      this._data.next({
        event: event,
        data: this._subjectData,
      });
      //this._data.next(this._subjectData);
    }
  }

  subscribe(event: string, callback: Function) {
    let subscribers = this._subscriptions.get(event) || [];
    subscribers.push(callback);

    this._subscriptions.set(event, subscribers);
    //let current = this._subjectData[event];
    console.log({ subscribeevent: event, value: callback });
    // callback.call(null, false);
  }

  _onEvent(data: any) {
    let subscribers = this._subscriptions.get(data['event']) || [];

    subscribers.forEach((callback) => {
      callback.call(null, data['data']);
    });
  }

  setGlobalSetting(key: string, items: Array<any>) {
    this._globalSettings.set(key, items);
  }
  getGlobalSetting(key: string): Array<any> {
    var retVal: any[] = [];
    if (this._globalSettings.get(key))
      retVal = this._globalSettings.get(key) as any[];
    return retVal;
  }
}
