$(function() {
    var fmf = new FmFriend();
    
    var fmf_slider = Vue.component('fmf-slider', {
        props: ["fmf", "param"],
        data: function() {
            return {
                value: this.param.get()
            };
        },
        template: [
            '<div class="slider-container">',
            '    <h2>{{ param.name }}</h2>',
            '    <div class="slider">',
            '        <input type="range" :min="param.min" :max="param.max" v-model.number="param_prop" v-on:input="fmf.updated"></input>',
            '        <div class="display">',
            '            <label>{{ param_prop }}</label>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join("\n"),
        computed: {
            param_prop: {
                get: function() {
                    return this.value;
                },
                set: function(value) {
                    this.param.set(value);
                    this.value = this.param.get();
                }
            }
        }
    });
    
    var fmf_radios = Vue.component('fmf-radios', {
        props: ["fmf", "param", "operator", "group", "pretty"],
        data: function() {
            return {
                value: this.param.get()
            };
        },
        template: [
            '<div class="radios-container">',
            '    <h2>{{ param.name }}</h2>',
            '    <div class="radios">',
            //'        <form>',
            '            <div v-for="value in values()" class="radio-container" >',
            '                <input :name="name()" :id="id(value)" type="radio" v-model.number="param_prop" :value="value" v-on:change="fmf.updated"><label :for="id(value)">{{ pretty_value(value) }}</label>',
            '            </div>',
            //'        </form>',
            //'        <input type="range" :min="param.min" :max="param.max" v-model.number="param_prop" v-on:input="fmf.updated"></input>',
            //'        <div class="display">',
            //'            <label>{{ param_prop }}</label>',
            //'        </div>',
            '    </div>',
            '</div>'
        ].join("\n"),
        computed: {
            param_prop: {
                get: function() {
                    return this.value;
                },
                set: function(value) {
                    this.param.set(value);
                    this.value = this.param.get();
                }
            }
        },
        methods: {
            values: function() {
                return _.range(this.param.min, this.param.max + 1);
            },
            name: function() {
                return this.group + "-" + this.operator;
            },
            id: function(value) {
                return this.name() + "-" + value;
            },
            pretty_value: function(value) {
                return this.pretty ? this.pretty(value) : value;
            }
        }
    });
    
    var vue = new Vue({
        el: "#fmfriend",
        data: {
            fmf: fmf
        },
        computed: {
            patch_name: {
                get: fmf.get_name,
                set: fmf.set_name
            },
            param: function(index) {
                return {
                    get: fmf.param_defs[index].get,
                    set: fmf.param_defs[index].set
                };
            }
        }
    });
});