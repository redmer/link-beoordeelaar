export class Formatter {
  static format(format: string, ...args: string[]) {
    // var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match: string, n: number) {
      return typeof args[n] != "undefined" ? args[n] : match;
    });
  }
}
