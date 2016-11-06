function FmFriend() {
    var self = this;

    self.outputs = [];
    self.output = undefined;
    
    self.get_output = function() {
        return self.outputs[self.output];
    };
    
    self.set_output = function(output) {
        self.output = output;        
    }
    
    self.channel = 11;
    
    self.send_on_update = true;
    
    self.updated = _.debounce(function() {
        if(self.send_on_update) {
            self.send_patch();
        }
    }, 250);
    
    self.name = "Untitled";
    
    self.get_name = function() {
        return self.name;
    };
    
    self.set_name = function(name) {
        var clean_name = "";
        
        for(var i = 0; i < name.length && clean_name.length < 10; i++) {
            if(name.charCodeAt(i) < 0x80) {
                clean_name += name[i];
            }
        }
        
        self.name = clean_name;        
    };
    
    self.param_defs = {};
    
    self.restore_default_value = function(index) {
        self.param_values[index] = self.param_defs[index].default_value;
    }
    
    self.define_param = function(name, index, min, max, default_value) {
        if(self.param_defs.hasOwnProperty(index)) {
            console.warn("Parameter " + index + " redefined");
        }
        
        var param_def = {
            name: name,
            index: index,
            min: min,
            max: max,
            default_value: default_value,
            get: function() {
                return self.param_values[index];
            },
            set: function(value) {
                var clipped_value = Math.max(min, Math.min(max, value));
                console.log(name + " (" + index + "): " + clipped_value);
                self.param_values[index] = clipped_value;                
            },
            reset: function() {
                self.param_values[index] = default_value;
            }
        };
        param_def.reset();
        
        self.param_defs[index] = param_def;
        
        return param_def;
    }
    
    self.param_values = [];
    for(var i = 0; i < 145; i++) {
        self.param_values.push(0);
    }
    
    self.level_scale_curve_pretty = function(value) {
        return ["-LIN", "-EXP", "EXP", "LIN"][value];
    };
    
    self.osc_mode_pretty = function(value) {
        return ["RATIO", "FIXED"][value];
    };
    
    self.osc_key_sync_pretty = function(value) {
        return ["OFF", "ON"][value];
    };
    
    self.lfo_sync_pretty = function(value) {
        return ["OFF", "ON"][value];
    };
    
    self.operators = [];
        
    self.define_operator = function(number) {
        var get_index = function(index) { return (5 - number) * 21 + index; };
        
        var operator = {
            name: "Operator " + (number+1),
            enabled: number === 0,
            eg_rates: _.map([99, 99, 99, 99], function(value, i) {
                return self.define_param("EG Rate " + (i+1), get_index(i), 0, 99, value);
            }),
            eg_levels: _.map([99, 99, 99, 0], function(value, i) {
                return self.define_param("EG Level " + (i+1), get_index(i+4), 0, 99, value);
            }),
            level_scale_break_point: self.define_param("Level Scale Break Point", get_index(8), 0, 99, 50),
            level_scale_left_depth: self.define_param("Level Scale Left Depth", get_index(9), 0, 99, 0),
            level_scale_right_depth: self.define_param("Level Scale Right Depth", get_index(10), 0, 99, 0),
            level_scale_left_curve: self.define_param("Level Scale Left Curve", get_index(11), 0, 3, 0),
            level_scale_right_curve: self.define_param("Level Scale Right Curve", get_index(12), 0, 3, 0),
            osc_rate_scale: self.define_param("OSC Rate Scale", get_index(13), 0, 7, 0),
            amp_mod_sense: self.define_param("Amp Mod Sense", get_index(14), 0, 3, 0),
            key_velocity_sense: self.define_param("Key Velocity Sense", get_index(15), 0, 7, 0),
            output_level: self.define_param("Output Level", get_index(16), 0, 99, 99),
            osc_mode: self.define_param("Oscillator Mode", get_index(17), 0, 1, 0),
            freq_coarse: self.define_param("Freq Coarse", get_index(18), 0, 31, 0),
            freq_fine: self.define_param("Freq Fine", get_index(19), 0, 99, 0),
            detune: self.define_param("Detune", get_index(20), 0, 14, 0),
        };
                
        return operator;
    }
    
    for(var i = 0; i < 6; i++) {
        self.operators.push(self.define_operator(i));        
    }
    
    self.global = {
        pitch_eg_rates: _.map([99, 99, 99, 99], function(value, i) {
            return self.define_param("Pitch EG Rate " + (i+1), 126+i, 0, 99, value);
        }),
        pitch_eg_levels: _.map([50, 50, 50, 50], function(value, i) {
            return self.define_param("Pitch EG Level " + (i+1), 130+i, 0, 99, value);
        }),
        algorithm: self.define_param("Algorithm", 134, 0, 31, 0),
        feedback: self.define_param("Feedback", 135, 0, 7, 0),
        osc_key_sync: self.define_param("OSC Key Sync", 136, 0, 1, 0),
        lfo_rate: self.define_param("LFO Rate", 137, 0, 99, 50),
        lfo_delay: self.define_param("LFO Delay", 138, 0, 99, 0),
        lfo_pitch_mod_depth: self.define_param("LFO Pitch Mod Depth", 139, 0, 99, 0),
        lfo_amp_mod_depth: self.define_param("LFO Amp Mod Depth", 140, 0, 99, 0),
        lfo_sync: self.define_param("LFO Sync", 141, 0, 1, 0),
        lfo_wave: self.define_param("LFO Wave", 142, 0, 5, 0),
        mod_sense_pitch: self.define_param("Mod Sense Pitch", 143, 0, 7, 0),
        transpose: self.define_param("Transpose", 144, 0, 48, 24),
    };
    
    self.send_cc = function(number, value) {
        self.get_output().send([0xb0 + self.channel, number, value]);
    };
    
    self.patch_foreach = function(f) {        
        for(var i = 0; i < 156; i++) {
            var byte = 0;
            
            if(i < 145) {
                // Regular parameter
                byte = self.param_values[i];
            } else if(i < 155) {
                // Patch name
                var name = self.get_name();
                var name_ix = i - 145;
                if(name_ix < name.length) {
                    byte = name.charCodeAt(name_ix);
                }
            } else if(i === 155) {
                // Operator on/off flags
                var op_on_off_flags = 0;
                _.each(self.operators, function(operator, i) {
                    if(operator.enabled) {
                        op_on_off_flags |= 1 << i;
                    }
                });
                console.log(op_on_off_flags);
                byte = op_on_off_flags;
            }
            
            f(byte, i);
        }
    };
    
    self.send_patch = function() {
        console.log("Sending patch");
        
        var sysex = [
            0xf0,   // Exclusive Status
            0x43,   // YAMAHA ID
            0x00,   // Global MIDI Channel (Device ID)
            0x00,   // Format Number (0 = 1 voice, 9 = 32 voices)
            0x01,   // Byte Count MSB (01 = 1 voice, 20 = 32 voices)
            0x1b    // Byte Count LSB (1B = 1 voice, 00 = 32 voices)
        ];

        var checksum = 0;
        self.patch_foreach(function(byte, i) {
            sysex.push(byte);
            checksum += byte;            
        });
        checksum = (~checksum + 1) & 0x7f;
        sysex.push(checksum);
        sysex.push(0xf7); // End Of Exclusive
        
        self.get_output().send(sysex);
    }
    
    self.on_midi_success = function(interface) {
        self.status = {success: true};

        interface.outputs.forEach(function(output) {
            self.outputs.push(output);
        });

        if(self.outputs.length === 0) {
            self.status = {success: false, error: "No MIDI outputs found"};
            return;
        }
        
        self.set_output(0);
        
        /*
        var name_field = $("<input type='text' maxlength='10'>");
        name_field.on("change", function() {
            var value = $(this).val();
            for(var i = 0; i < 10; i++) {
                var byte = 0;
                if(i < value.length) {
                    var char_code = value.charCodeAt(i);
                    if(char_code < 0x80) {
                        byte = char_code;
                    }
                }
                self.patch[145+i] = byte;
            }
            self.send_patch();
        });
        self.root.append(name_field);
        
        
        var operators = $("<div class='operators'>");
        for(var i = 0; i < 6; i++) {
            operators.append(self.make_operator_controls(i, i === 0));
        }
        self.root.append(operators);
        */
    }

    self.on_midi_failure = function(error) {        
        self.status = {success: false, error: "Failed to initialize WebMIDI"};
    }

    self.status = {success: false, error: "Initializing WebMIDI..."};

    if(!navigator.requestMIDIAccess) {
        self.status = {success: false, error: "WebMIDI support not available"};
        return;
    }
    
    navigator.requestMIDIAccess({sysex: true}).then(self.on_midi_success, self.on_midi_failure);        
}

$(function() {
    var fm_friend = new FmFriend($("body"));
});
