"use strict";
(function() {
    var SMFPlayer = function() {
        this.smf = null;
        this.sequence = [];
        this.audioctx = new webkitAudioContext();
    }
    SMFPlayer.prototype = {
        input: function(smf) {
            this.smf = smf;
        },
        play: function() {
            var header = this.smf.header;
            var tracks = this.smf.tracks;
            for (var i = 0, n = tracks.length; i < n ; i++) {
                console.debug("### Track:"+i);
                var track = tracks[i];
                var currentTime = 0;
                var division = header.division;
                var tempo = 0.5; // = 120
                for (var j = 0, m = track.length; j < m ; j++) {
                    var chunk = track[j];
                    console.log(chunk);
                    var delta = chunk['delta'];
                    var type  = chunk['type'];
                    switch (type) {
                    case 0x8: // Note Off
                        
                        break;
                    case 0x9: // Note On

                        break;
                    case 0xF: // meta event | sysex
                        var type2 = chunk['type2'];
                        if (type2 == 0xF) {
                            switch (chunk['metaevent']) {
                            case 0x51: // Tempo Setting
                                tempo = chunk['tempo'] / 1000000; //usec => sec
                                break;
                            }
                        } else if (rtpe2 == 0x0) { // SysEx
                            ;
                        } else {
                            console.warn("type:0xF and Unknown type2:"+type2);
                        }
                        break;
                    default:
                        break;
                    }
                }
            }
        },
        stop: function() {
            ;
        },
        advance: function(advance) {
            ;
        },
    },
    window.SMFPlayer = SMFPlayer;
})();
