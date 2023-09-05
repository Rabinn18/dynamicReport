import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output } from '@angular/core';
import {
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[resizable]',
})
export class ResizableDirective {
  @Output()
  readonly resizable = fromEvent<MouseEvent>(
    this.elementRef.nativeElement,
    'mousedown'
  ).pipe(
    tap((e) => e.preventDefault()),
    switchMap(() => {
      const rect = this.elementRef.nativeElement
        ?.closest('th')
        ?.getBoundingClientRect();
      console.log({ mousetrigger: this.elementRef.nativeElement });
      const ret = fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
        map(({ clientX }) => rect!.width + clientX - rect!.right),
        distinctUntilChanged(),
        takeUntil(fromEvent(this.documentRef, 'mouseup'))
      );
      console.log({ emit: ret });
      return ret;
    })
  );

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}
}
