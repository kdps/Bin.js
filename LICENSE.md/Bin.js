"use strict";
(function() {
    var Bin = function(data, length) {
        this.data = data;
        this.length = length;
        this.offset = 0;
    }
    Bin.prototype = {
        incrementOffset: function(len) {
            this.offset += len;
        },
        hasNextData: function(len) {
            if (this.offset + len <= this.length) {
                return true;
            }
            return false;
        },
        getUI8: function() { // BYTE
            var d = this.data;
            return d[this.offset++];
        },
        getSI8: function() { // CHAR
            var v = this.data[this.offset++];
            return (v<0x80)?v:(v-0x100);
        },
        getUI16BE: function() { // WORD
            var d = this.data;
            var o = this.offset;
            this.offset += 2;
            return 0x100*d[o] + d[o+1];
        },
        getSI16BE: function() { // SHORT
            var v = this.getUI16BE(o);
            return (v<0x8000)?v:(v-0x10000);
        },
        getUI32BE: function() { // DWORD
            var d = this.data;
            var o = this.offset;
            this.offset += 4;
            return ((d[o]*0x100 + d[o+1])*0x100 + d[o+2])*0x100 + d[o+3];
        },

        getUI16LE: function() { // WORD
            var d = this.data;
            var o = this.offset;
            this.offset += 2;
            return d[o] + 0x100*d[o+1];
        },
        getSI16LE: function() { // SHORT
            var v = this.getUI16();
            return (v<0x8000)?v:(v-0x10000);
        },
        getUI32LE: function() { // DWORD
            var d = this.data;
            var o = this.offset;
            this.offset += 4;
            return d[o] + 0x100*(d[o+1] + 0x100*(d[o+2] + 0x100*d[o+3]));
        },
        getString: function(len) {
            var d = this.data;
            var s = [];
            var o = this.offset;
            this.offset += len;
            while (len--) {
                var c = d[o++];
                if (c === 0) { // null terminate
                    break;
                }
                s.push(String.fromCharCode(c));
            }
            return s.join('');
        },
    }
    window.Bin = Bin;
})();
