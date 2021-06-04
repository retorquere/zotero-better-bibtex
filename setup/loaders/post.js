export class Pinger {
  constructor({ start = 0, total, step = 5, name = "", callback }) {
    console.log('enter' + ' ' + 'constructor' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.incr = 100 / total;
      this.name = name;
      this.pct = start * this.incr;
      this.step = step;
      this.callback = callback;
      this.next = Math.floor(this.pct / step) * step;
      if (this.name)
        Zotero.debug(`ping: ${name} start ${JSON.stringify({ ...this, start, total })}`);
      this.emit();
    } catch (trace$error) {
      console.log('error' + ' ' + 'constructor' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'constructor');
    }
  }
  update() {
    console.log('enter' + ' ' + 'update' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      this.pct += this.incr;
      if (this.name)
        Zotero.debug(`ping: ${this.name} update to ${this.pct}`);
      if (Math.round(this.pct) >= this.next)
        this.emit();
    } catch (trace$error) {
      console.log('error' + ' ' + 'update' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'update');
    }
  }
  emit() {
    console.log('enter' + ' ' + 'emit' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      if (this.callback) {
        if (this.name)
          Zotero.debug(`ping: ${this.name} emit ${Math.max(this.next, 100)}`);
        this.callback(Math.max(this.next, 100));
        if (this.next > 100)
          this.callback = null;
        this.next += this.step;
      }
    } catch (trace$error) {
      console.log('error' + ' ' + 'emit' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'emit');
    }
  }
  done() {
    console.log('enter' + ' ' + 'done' + '(' + JSON.stringify(Array.from(arguments)) + ')');

    try {
      if (this.name)
        Zotero.debug(`ping: ${this.name} done`);
      if (this.callback && this.pct < this.next)
        this.callback(Math.max(this.next, 100));
    } catch (trace$error) {
      console.log('error' + ' ' + 'done' + ': ' + trace$error.message);
      throw trace$error;
    } finally {
      console.log('exit' + ' ' + 'done');
    }
  }
}
