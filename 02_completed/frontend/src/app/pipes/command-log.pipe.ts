import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commandLog'
})
export class CommandLogPipe implements PipeTransform {
  transform(logs: any[]): string {
    if (!logs || !Array.isArray(logs)) {
      return '';
    }
    
    return logs
      .map(log => `[${log.timeStamp}] > ${log.key}: ${log.value}`)
      .join('\n');
  }
}