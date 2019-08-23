"use strict";
(function() {
    var SMF = function() {
        this.header = null;
        this.tracks = [];
    }
    SMF.prototype = {
        input: function(smfdata) {
            this.parse(smfdata);
        },
        parse: function(smfbuffer) {
            var offset = 0;
            var smfdata = new Uint8Array(smfbuffer);
            var smflength = smfbuffer.byteLength;
            var bin = new Bin(smfdata, smflength);
            while (bin.hasNextData(8)) {
                var type = bin.getString(4);
                var len = bin.getUI32BE();
                switch (type) {
                  case 'MThd':
                    this.header = this.parseHeader(bin);
                    break;
                  case 'MTrk':
                    this.tracks.push(this.parseTrack(bin));
                    break;
                }
                offset += 8 + len;
            }
        },
        parseHeader: function(bin) {
            var format = bin.getUI16BE();
            var nTracks = bin.getUI16BE();
            var division = bin.getUI16BE();
            return { format:format, nTracks:nTracks, 
                     divisionFlag:(division >> 15),
                     division:(division & 0x7fff) };
        },
        parseTrack: function(bin) {
            var runningStatus = null;
            var chunks = [];
            while (bin.hasNextData(3)) {
                var delta = this.getVariableLengthValue(bin);
                var status = bin.getUI8();
                if (status < 0x80) {
                    status = runningStatus;
                    bin.incrementOffset(-1);
                } else {
                    runningStatus = status;
                }
                var type = status >> 4;
                var chunk;
                if (type < 0xF) {
                    var channel = status & 0x0f;
                    chunk = {delta:delta, type:type, channel:channel};
                    switch(type) {
                    case 0x8: // Note Off
                    case 0x9: // Note On
                        chunk['note'] = bin.getUI8();
                        chunk['velocity'] = bin.getUI8();
                        break;
                    case 0xA: // Note Aftertouch Event
                        chunk['note'] = bin.getUI8();
                        chunk['amount'] = bin.getUI8();
                        break;
                    case 0xB: // Controller
                        chunk['controller'] = bin.getUI8();
                        chunk['value'] = bin.getUI8();
                        break;
                    case 0xC: //  Program Change
                        chunk['program'] = bin.getUI8();
                        break;
                    case 0xD: // Channel Aftertouch Event
                        chunk['amount'] = bin.getUI8();
                        break;
                    case 0xE: // Pitch Bend Event
                        var value1 = bin.getUI8();
                        var value2 = bin.getUI8();
                        chunk['value'] =  ((value2 & 0x7f) << 7) + (value1 & 0x7f);
                        break;

                    }
                } else {
                    var type2 = status & 0x0f;
                    chunk = {delta:delta, type:type};
                    if (type2  == 0xF) { // Meta Event
                        chunk['metatype'] = bin.getUI8();
                        var len = this.getVariableLengthValue(bin);
                        chunk['metadata'] = bin.getString(len);
                    } else if (type2 == 0x0) { // System Exclusive
                        var len = this.getVariableLengthValue(bin);
                        chunk['systemex'] = bin.getString(len);
                    } else {
                        console.error("metaevent"+metaevent);
                        break;
                    }
                }
                chunks.push(chunk);
            }
            return chunks;
        },
        getVariableLengthValue: function(bin) {
            var ret_value = 0;
            while (true) {
                var value = bin.getUI8();
                if (value & 0x80) {
                    ret_value = (ret_value << 7) + (value & 0x7f);
                } else {
                    ret_value = (ret_value << 7) + value;
                    break;
                }
            }
            return ret_value;
        },
    },
    window.SMF = SMF;
})();
