import { Transform } from 'stream';

/**
 * Custom JSON stream parser to replace JSONStream library
 * Parses JSON arrays and emits individual elements
 */
export class JsonStreamParser extends Transform {
  constructor(path = [true]) {
    super({ objectMode: true });
    this.path = path;
    this.buffer = '';
    this.depth = 0;
    this.inArray = false;
    this.objectStart = -1;
    this.bracketCount = 0;
    this.inString = false;
    this.escaped = false;
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    this._parse();
    callback();
  }

  _parse() {
    let i = 0;
    while (i < this.buffer.length) {
      const char = this.buffer[i];
      
      if (this.escaped) {
        this.escaped = false;
        i++;
        continue;
      }

      if (this.inString) {
        if (char === '\\') {
          this.escaped = true;
        } else if (char === '"') {
          this.inString = false;
        }
        i++;
        continue;
      }

      switch (char) {
        case '"':
          this.inString = true;
          break;
        case '[':
          if (this.depth === 0) {
            this.inArray = true;
          }
          this.depth++;
          break;
        case ']':
          this.depth--;
          if (this.depth === 0 && this.inArray) {
            // End of root array
            this._flushObject(i);
            this.inArray = false;
          }
          break;
        case '{':
          if (this.inArray && this.depth === 1 && this.objectStart === -1) {
            this.objectStart = i;
          }
          this.bracketCount++;
          break;
        case '}':
          this.bracketCount--;
          if (this.inArray && this.depth === 1 && this.bracketCount === 0 && this.objectStart !== -1) {
            // Complete object found
            const objectStr = this.buffer.slice(this.objectStart, i + 1).trim();
            if (objectStr) {
              try {
                const obj = JSON.parse(objectStr);
                this.push(obj);
              } catch (err) {
                this.emit('error', err);
                return;
              }
            }
            this._clearProcessed(i + 1);
            i = 0; // Reset index after clearing buffer
            continue;
          }
          break;
        case ',':
          if (this.inArray && this.depth === 1 && this.bracketCount === 0) {
            this._flushObject(i);
            i = 0; // Reset index after clearing buffer
            continue;
          }
          break;
      }
      i++;
    }
  }

  _flushObject(endIndex) {
    if (this.objectStart !== -1) {
      const objectStr = this.buffer.slice(this.objectStart, endIndex).trim();
      if (objectStr && objectStr !== ',') {
        try {
          const obj = JSON.parse(objectStr);
          this.push(obj);
        } catch (err) {
          // Ignore incomplete objects, they'll be completed in next chunk
        }
      }
      this._clearProcessed(endIndex + 1);
    }
  }

  _clearProcessed(index) {
    this.buffer = this.buffer.slice(index).trim();
    this.objectStart = -1;
    this.bracketCount = 0;
    
    // Skip whitespace and commas to find next object start
    let i = 0;
    while (i < this.buffer.length && (this.buffer[i] === ' ' || this.buffer[i] === '\n' || this.buffer[i] === '\r' || this.buffer[i] === '\t' || this.buffer[i] === ',')) {
      i++;
    }
    if (i > 0) {
      this.buffer = this.buffer.slice(i);
    }
  }

  _clearProcessedOptimized(index) {
    this.buffer = this.buffer.slice(index);
    this.objectStart = -1;
    this.bracketCount = 0;
    
    // Fast skip whitespace and commas using char codes
    let i = 0;
    const bufferLength = this.buffer.length;
    while (i < bufferLength) {
      const charCode = this.buffer.charCodeAt(i);
      if (charCode === 32 || charCode === 10 || charCode === 13 || charCode === 9 || charCode === 44) { // space, \n, \r, \t, comma
        i++;
      } else {
        break;
      }
    }
    if (i > 0) {
      this.buffer = this.buffer.slice(i);
    }
  }

  _flush(callback) {
    if (this.buffer.trim()) {
      // Handle any remaining data
      this._parse();
    }
    callback();
  }
}

/**
 * Factory function to create a JSON stream parser
 * @param {Array|string} path - Path to parse (use [true] for array elements)
 * @returns {JsonStreamParser} Stream parser instance
 */
export function parse(path = [true]) {
  return new JsonStreamParser(path);
}