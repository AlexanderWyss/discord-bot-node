import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'minuteSeconds'
})
export class MinuteSecondsPipe implements PipeTransform {

  transform(value: number): string {
    return value ? this.padZero(Math.floor(value / 60)) + ':' + this.padZero(value % 60) : '';
  }

  private padZero(value: number) {
    return value.toString().length === 1 ? '0' + value : value;
  }
}
