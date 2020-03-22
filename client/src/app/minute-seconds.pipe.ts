import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'minuteSeconds'
})
export class MinuteSecondsPipe implements PipeTransform {

  transform(value: number): string {
    const seconds = value % 60;
    const hours = Math.floor(value / 60 / 60);
    const minutes = Math.floor(value / 60) - hours * 60;
    return isNaN(value) ? '00:00' : (hours === 0 ? '' : this.padZero(hours) + ':') + this.padZero(minutes) + ':' + this.padZero(seconds);
  }

  private padZero(value: number) {
    return value.toString().length === 1 ? '0' + value : value;
  }
}
