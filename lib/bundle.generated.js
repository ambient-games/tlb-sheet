
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        return definition[2] && fn
            ? $$scope.dirty | definition[2](fn(dirty))
            : $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\layout\header\SheetLogo.svelte generated by Svelte v3.16.0 */

    const file = "src\\layout\\header\\SheetLogo.svelte";

    function create_fragment(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "— A Sword & Sorcery Game —";
    			if (img.src !== (img_src_value = "https://thelastbook.github.io/sheet/tlb-logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "The Last Book");
    			attr_dev(img, "class", "svelte-ltabfj");
    			add_location(img, file, 20, 2, 979);
    			attr_dev(span, "class", "svelte-ltabfj");
    			add_location(span, file, 23, 2, 1075);
    			attr_dev(div, "class", "svelte-ltabfj");
    			add_location(div, file, 19, 0, 970);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetLogo",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\layout\header\SheetModeToggle.svelte generated by Svelte v3.16.0 */

    const file$1 = "src\\layout\\header\\SheetModeToggle.svelte";

    function create_fragment$1(ctx) {
    	let input;
    	let input_class_value;
    	let input_checked_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", input_class_value = "sheet-mode-" + /*mode*/ ctx[0]);
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", "attr_sheet_mode");
    			input.value = /*mode*/ ctx[0];
    			input.checked = input_checked_value = /*checked*/ ctx[1] ? "checked" : null;
    			input.disabled = true;
    			add_location(input, file$1, 10, 0, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mode*/ 1 && input_class_value !== (input_class_value = "sheet-mode-" + /*mode*/ ctx[0])) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*mode*/ 1) {
    				prop_dev(input, "value", /*mode*/ ctx[0]);
    			}

    			if (dirty & /*checked*/ 2 && input_checked_value !== (input_checked_value = /*checked*/ ctx[1] ? "checked" : null)) {
    				prop_dev(input, "checked", input_checked_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { mode } = $$props;
    	let { checked = false } = $$props;
    	const writable_props = ["mode", "checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetModeToggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
    		if ("checked" in $$props) $$invalidate(1, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => {
    		return { mode, checked };
    	};

    	$$self.$inject_state = $$props => {
    		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
    		if ("checked" in $$props) $$invalidate(1, checked = $$props.checked);
    	};

    	return [mode, checked];
    }

    class SheetModeToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, { mode: 0, checked: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetModeToggle",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*mode*/ ctx[0] === undefined && !("mode" in props)) {
    			console.warn("<SheetModeToggle> was created without expected prop 'mode'");
    		}
    	}

    	get mode() {
    		throw new Error("<SheetModeToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<SheetModeToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<SheetModeToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<SheetModeToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\header\SheetMode.svelte generated by Svelte v3.16.0 */
    const file$2 = "src\\layout\\header\\SheetMode.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;

    	const field = new SheetField({
    			props: { hidden: true, id: "sheet_mode" },
    			$$inline: true
    		});

    	const modetoggle0 = new SheetModeToggle({
    			props: { mode: "character", checked: true },
    			$$inline: true
    		});

    	const modetoggle1 = new SheetModeToggle({ props: { mode: "party" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(field.$$.fragment);
    			t0 = space();
    			create_component(modetoggle0.$$.fragment);
    			t1 = space();
    			create_component(modetoggle1.$$.fragment);
    			attr_dev(div, "class", "sheet-modetoggle");
    			add_location(div, file$2, 46, 0, 3214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(field, div, null);
    			append_dev(div, t0);
    			mount_component(modetoggle0, div, null);
    			append_dev(div, t1);
    			mount_component(modetoggle1, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(modetoggle0.$$.fragment, local);
    			transition_in(modetoggle1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(modetoggle0.$$.fragment, local);
    			transition_out(modetoggle1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(field);
    			destroy_component(modetoggle0);
    			destroy_component(modetoggle1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetMode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetMode",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\layout\header\SheetHeader.svelte generated by Svelte v3.16.0 */
    const file$3 = "src\\layout\\header\\SheetHeader.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let t;
    	let current;
    	const logo = new SheetLogo({ $$inline: true });
    	const modetoggle = new SheetMode({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(logo.$$.fragment);
    			t = space();
    			create_component(modetoggle.$$.fragment);
    			attr_dev(div, "class", "sheet-header svelte-1epsh8q");
    			add_location(div, file$3, 15, 0, 780);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(logo, div, null);
    			append_dev(div, t);
    			mount_component(modetoggle, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(modetoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(modetoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(logo);
    			destroy_component(modetoggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetHeader",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\layout\header\SheetModeContent.svelte generated by Svelte v3.16.0 */

    const file$4 = "src\\layout\\header\\SheetModeContent.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "sheet-modecontent sheet-modecontent-" + /*mode*/ ctx[0]);
    			add_location(div, file$4, 9, 0, 257);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}

    			if (!current || dirty & /*mode*/ 1 && div_class_value !== (div_class_value = "sheet-modecontent sheet-modecontent-" + /*mode*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { mode } = $$props;
    	const writable_props = ["mode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetModeContent> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { mode };
    	};

    	$$self.$inject_state = $$props => {
    		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
    	};

    	return [mode, $$scope, $$slots];
    }

    class SheetModeContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$4, safe_not_equal, { mode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetModeContent",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*mode*/ ctx[0] === undefined && !("mode" in props)) {
    			console.warn("<SheetModeContent> was created without expected prop 'mode'");
    		}
    	}

    	get mode() {
    		throw new Error("<SheetModeContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<SheetModeContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\SheetSection.svelte generated by Svelte v3.16.0 */

    const file$5 = "src\\layout\\components\\SheetSection.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "sheet-sec sheet-sec-" + /*id*/ ctx[0] + " svelte-4g90va");
    			add_location(div, file$5, 21, 0, 1113);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}

    			if (!current || dirty & /*id*/ 1 && div_class_value !== (div_class_value = "sheet-sec sheet-sec-" + /*id*/ ctx[0] + " svelte-4g90va")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetSection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { id };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	return [id, $$scope, $$slots];
    }

    class SheetSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$5, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetSection",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetSection> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\SheetBox.svelte generated by Svelte v3.16.0 */
    const file$6 = "src\\layout\\components\\SheetBox.svelte";

    // (60:32) 
    function create_if_block_1(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			if (default_slot) default_slot.c();
    			add_location(h2, file$6, 60, 4, 3218);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(60:32) ",
    		ctx
    	});

    	return block;
    }

    // (51:2) {#if label && hasToggle}
    function create_if_block(ctx) {
    	let t0;
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let div;
    	let current;

    	const toggle0 = new SheetToggle({
    			props: { hidden: true, id: /*id*/ ctx[0] },
    			$$inline: true
    		});

    	const toggle1 = new SheetToggle({
    			props: {
    				style: "arrow",
    				id: /*id*/ ctx[0],
    				wrap: "span"
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			create_component(toggle0.$$.fragment);
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(/*label*/ ctx[1]);
    			t2 = space();
    			create_component(toggle1.$$.fragment);
    			t3 = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(h2, file$6, 52, 4, 3039);
    			attr_dev(div, "class", "sheet-drawer svelte-r5lskj");
    			add_location(div, file$6, 56, 4, 3124);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			mount_component(toggle1, h2, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toggle0_changes = {};
    			if (dirty & /*id*/ 1) toggle0_changes.id = /*id*/ ctx[0];
    			toggle0.$set(toggle0_changes);
    			if (!current || dirty & /*label*/ 2) set_data_dev(t1, /*label*/ ctx[1]);
    			const toggle1_changes = {};
    			if (dirty & /*id*/ 1) toggle1_changes.id = /*id*/ ctx[0];
    			toggle1.$set(toggle1_changes);

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle0.$$.fragment, local);
    			transition_in(toggle1.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle0.$$.fragment, local);
    			transition_out(toggle1.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h2);
    			destroy_component(toggle1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(51:2) {#if label && hasToggle}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*label*/ ctx[1] && /*hasToggle*/ ctx[3]) return 0;
    		if (/*label*/ ctx[1] && !/*hasToggle*/ ctx[3]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "sheet-" + /*id*/ ctx[0] + " " + (/*boxed*/ ctx[2] ? "sheet-boxed" : null) + " svelte-r5lskj");
    			add_location(div, file$6, 49, 0, 2922);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}

    			if (!current || dirty & /*id, boxed*/ 5 && div_class_value !== (div_class_value = "sheet-" + /*id*/ ctx[0] + " " + (/*boxed*/ ctx[2] ? "sheet-boxed" : null) + " svelte-r5lskj")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { label = false } = $$props;
    	let { boxed = false } = $$props;
    	let { hasToggle = false } = $$props;
    	const writable_props = ["id", "label", "boxed", "hasToggle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetBox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("boxed" in $$props) $$invalidate(2, boxed = $$props.boxed);
    		if ("hasToggle" in $$props) $$invalidate(3, hasToggle = $$props.hasToggle);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { id, label, boxed, hasToggle };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("boxed" in $$props) $$invalidate(2, boxed = $$props.boxed);
    		if ("hasToggle" in $$props) $$invalidate(3, hasToggle = $$props.hasToggle);
    	};

    	return [id, label, boxed, hasToggle, $$scope, $$slots];
    }

    class SheetBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$6, safe_not_equal, { id: 0, label: 1, boxed: 2, hasToggle: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetBox",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetBox> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<SheetBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SheetBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get boxed() {
    		throw new Error("<SheetBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boxed(value) {
    		throw new Error("<SheetBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasToggle() {
    		throw new Error("<SheetBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasToggle(value) {
    		throw new Error("<SheetBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\SheetAttributeBox.svelte generated by Svelte v3.16.0 */
    const file$7 = "src\\layout\\components\\SheetAttributeBox.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let t2_value = /*id*/ ctx[0].toUpperCase() + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current;

    	const fieldgroup0 = new SheetFieldGroup({
    			props: {
    				left: true,
    				id: /*id*/ ctx[0],
    				label: "Level",
    				count: "2"
    			},
    			$$inline: true
    		});

    	const fieldgroup1 = new SheetFieldGroup({
    			props: {
    				right: true,
    				id: "" + (/*id*/ ctx[0] + "_max"),
    				label: "Chance",
    				button: `&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=${/*name*/ ctx[1]}}} {{roll=[[d100cs<3cf>99</FieldGroup>]]}} {{chance=@{${/*id*/ ctx[0]}|max}}} {{note=?{Note}}}`,
    				count: "2"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text("):");
    			t4 = space();
    			create_component(fieldgroup0.$$.fragment);
    			t5 = space();
    			create_component(fieldgroup1.$$.fragment);
    			attr_dev(h3, "class", "svelte-19fodwe");
    			add_location(h3, file$7, 26, 2, 1114);
    			attr_dev(div, "class", "svelte-19fodwe");
    			add_location(div, file$7, 25, 0, 1105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(h3, t3);
    			append_dev(div, t4);
    			mount_component(fieldgroup0, div, null);
    			append_dev(div, t5);
    			mount_component(fieldgroup1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);
    			if ((!current || dirty & /*id*/ 1) && t2_value !== (t2_value = /*id*/ ctx[0].toUpperCase() + "")) set_data_dev(t2, t2_value);
    			const fieldgroup0_changes = {};
    			if (dirty & /*id*/ 1) fieldgroup0_changes.id = /*id*/ ctx[0];
    			fieldgroup0.$set(fieldgroup0_changes);
    			const fieldgroup1_changes = {};
    			if (dirty & /*id*/ 1) fieldgroup1_changes.id = "" + (/*id*/ ctx[0] + "_max");
    			if (dirty & /*name, id*/ 3) fieldgroup1_changes.button = `&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=${/*name*/ ctx[1]}}} {{roll=[[d100cs<3cf>99</FieldGroup>]]}} {{chance=@{${/*id*/ ctx[0]}|max}}} {{note=?{Note}}}`;
    			fieldgroup1.$set(fieldgroup1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fieldgroup0.$$.fragment, local);
    			transition_in(fieldgroup1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fieldgroup0.$$.fragment, local);
    			transition_out(fieldgroup1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fieldgroup0);
    			destroy_component(fieldgroup1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { name } = $$props;
    	const writable_props = ["id", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetAttributeBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { id, name };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    	};

    	return [id, name];
    }

    class SheetAttributeBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$7, safe_not_equal, { id: 0, name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetAttributeBox",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetAttributeBox> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<SheetAttributeBox> was created without expected prop 'name'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetAttributeBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetAttributeBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SheetAttributeBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SheetAttributeBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\SheetDerivedBox.svelte generated by Svelte v3.16.0 */

    const file$8 = "src\\layout\\components\\SheetDerivedBox.svelte";

    // (67:2) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*name*/ ctx[1]);
    			attr_dev(span, "class", "svelte-1wjbjkl");
    			add_location(span, file$8, 67, 4, 3556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 2) set_data_dev(t, /*name*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(67:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:2) {#if button}
    function create_if_block$1(ctx) {
    	let button_1;
    	let t;
    	let button_1_name_value;
    	let button_1_value_value;

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			t = text(/*name*/ ctx[1]);
    			attr_dev(button_1, "type", "roll");
    			attr_dev(button_1, "name", button_1_name_value = "roll_" + /*id*/ ctx[0]);
    			button_1.value = button_1_value_value = `&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=${/*name*/ ctx[1]}}} {{roll=[[d100cs<3cf>99]]}} {{chance=@{${/*id*/ ctx[0]}}}} {{note=?{Note}}}`;
    			attr_dev(button_1, "class", "svelte-1wjbjkl");
    			add_location(button_1, file$8, 60, 4, 3308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 2) set_data_dev(t, /*name*/ ctx[1]);

    			if (dirty & /*id*/ 1 && button_1_name_value !== (button_1_name_value = "roll_" + /*id*/ ctx[0])) {
    				attr_dev(button_1, "name", button_1_name_value);
    			}

    			if (dirty & /*name, id*/ 3 && button_1_value_value !== (button_1_value_value = `&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=${/*name*/ ctx[1]}}} {{roll=[[d100cs<3cf>99]]}} {{chance=@{${/*id*/ ctx[0]}}}} {{note=?{Note}}}`)) {
    				prop_dev(button_1, "value", button_1_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(60:2) {#if button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let label;
    	let t;
    	let input;
    	let input_name_value;

    	function select_block_type(ctx, dirty) {
    		if (/*button*/ ctx[3]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			if_block.c();
    			t = space();
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0]);
    			input.value = /*value*/ ctx[2];
    			attr_dev(input, "autocomplete", "false");
    			attr_dev(input, "class", "svelte-1wjbjkl");
    			add_location(input, file$8, 69, 2, 3588);
    			set_style(label, "width", 100 / /*count*/ ctx[4] + "%");
    			attr_dev(label, "class", "svelte-1wjbjkl");
    			add_location(label, file$8, 58, 0, 3250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			if_block.m(label, null);
    			append_dev(label, t);
    			append_dev(label, input);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(label, t);
    				}
    			}

    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 4) {
    				prop_dev(input, "value", /*value*/ ctx[2]);
    			}

    			if (dirty & /*count*/ 16) {
    				set_style(label, "width", 100 / /*count*/ ctx[4] + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { name } = $$props;
    	let { value = "" } = $$props;
    	let { button = false } = $$props;
    	let { count = "1" } = $$props;
    	const writable_props = ["id", "name", "value", "button", "count"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetDerivedBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("button" in $$props) $$invalidate(3, button = $$props.button);
    		if ("count" in $$props) $$invalidate(4, count = $$props.count);
    	};

    	$$self.$capture_state = () => {
    		return { id, name, value, button, count };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("button" in $$props) $$invalidate(3, button = $$props.button);
    		if ("count" in $$props) $$invalidate(4, count = $$props.count);
    	};

    	return [id, name, value, button, count];
    }

    class SheetDerivedBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$8, safe_not_equal, {
    			id: 0,
    			name: 1,
    			value: 2,
    			button: 3,
    			count: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetDerivedBox",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetDerivedBox> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<SheetDerivedBox> was created without expected prop 'name'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetDerivedBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetDerivedBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SheetDerivedBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SheetDerivedBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SheetDerivedBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SheetDerivedBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<SheetDerivedBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<SheetDerivedBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<SheetDerivedBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<SheetDerivedBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
     */
    /**
     * Lower case as a function.
     */
    function lowerCase(str) {
        return str.toLowerCase();
    }
    //# sourceMappingURL=index.js.map

    // Support camel case ("camelCase" -> "camel Case" and "CAMELCase" -> "CAMEL Case").
    var DEFAULT_SPLIT_REGEXP = /([a-z0-9])([A-Z])|([A-Z])([A-Z][a-z])/g;
    // Remove all non-word characters.
    var DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;
    /**
     * Normalize the string into something other libraries can manipulate easier.
     */
    function noCase(input, options) {
        if (options === void 0) { options = {}; }
        var _a = options.splitRegexp, splitRegexp = _a === void 0 ? DEFAULT_SPLIT_REGEXP : _a, _b = options.stripRegexp, stripRegexp = _b === void 0 ? DEFAULT_STRIP_REGEXP : _b, _c = options.transform, transform = _c === void 0 ? lowerCase : _c, _d = options.delimiter, delimiter = _d === void 0 ? " " : _d;
        var result = input
            .replace(splitRegexp, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args
                .slice(1, -2)
                .filter(function (x) { return x !== undefined; })
                .join("\0");
        })
            .replace(stripRegexp, "\0");
        var start = 0;
        var end = result.length;
        // Trim the delimiter from around the output string.
        while (result.charAt(start) === "\0")
            start++;
        while (result.charAt(end - 1) === "\0")
            end--;
        // Transform each token independently.
        return result
            .slice(start, end)
            .split("\0")
            .map(transform)
            .join(delimiter);
    }
    //# sourceMappingURL=index.js.map

    /**
     * Upper case the first character of an input string.
     */
    function upperCaseFirst(input) {
        return input.charAt(0).toUpperCase() + input.substr(1);
    }
    //# sourceMappingURL=index.js.map

    function capitalCaseTransform(input) {
        return upperCaseFirst(input.toLowerCase());
    }
    function capitalCase(input, options) {
        if (options === void 0) { options = {}; }
        return noCase(input, __assign({ delimiter: " ", transform: capitalCaseTransform }, options));
    }
    //# sourceMappingURL=index.js.map

    /* src\layout\components\SheetManeuverBox.svelte generated by Svelte v3.16.0 */
    const file$9 = "src\\layout\\components\\SheetManeuverBox.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const fieldgroup0 = new SheetFieldGroup({
    			props: {
    				left: true,
    				id: "" + (/*id*/ ctx[0] + "-level"),
    				label: "Level",
    				count: "3"
    			},
    			$$inline: true
    		});

    	const fieldgroup1 = new SheetFieldGroup({
    			props: {
    				center: true,
    				id: "" + (/*id*/ ctx[0] + "-parent"),
    				label: "Parent",
    				value: /*parent*/ ctx[3] ? /*parent*/ ctx[3] : "",
    				disabled: /*disabled*/ ctx[4],
    				count: "3"
    			},
    			$$inline: true
    		});

    	const fieldgroup2 = new SheetFieldGroup({
    			props: {
    				right: true,
    				id: /*id*/ ctx[0],
    				label: "Rat.",
    				button: `&{template:TLBattackRoll} {{name=@{character-name}}} {{move=${/*name*/ ctx[1]}}} {{${/*type*/ ctx[2]}=[[2d6+(@{${/*id*/ ctx[0]}})+(?{${capitalCase(/*type*/ ctx[2])} modifier|+0})]]}} {{note=?{Note}}}`,
    				count: "3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = text(":");
    			t2 = space();
    			create_component(fieldgroup0.$$.fragment);
    			t3 = space();
    			create_component(fieldgroup1.$$.fragment);
    			t4 = space();
    			create_component(fieldgroup2.$$.fragment);
    			attr_dev(h3, "class", "svelte-ys69e9");
    			add_location(h3, file$9, 34, 2, 1448);
    			attr_dev(div, "class", "svelte-ys69e9");
    			add_location(div, file$9, 33, 0, 1439);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(div, t2);
    			mount_component(fieldgroup0, div, null);
    			append_dev(div, t3);
    			mount_component(fieldgroup1, div, null);
    			append_dev(div, t4);
    			mount_component(fieldgroup2, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);
    			const fieldgroup0_changes = {};
    			if (dirty & /*id*/ 1) fieldgroup0_changes.id = "" + (/*id*/ ctx[0] + "-level");
    			fieldgroup0.$set(fieldgroup0_changes);
    			const fieldgroup1_changes = {};
    			if (dirty & /*id*/ 1) fieldgroup1_changes.id = "" + (/*id*/ ctx[0] + "-parent");
    			if (dirty & /*parent*/ 8) fieldgroup1_changes.value = /*parent*/ ctx[3] ? /*parent*/ ctx[3] : "";
    			if (dirty & /*disabled*/ 16) fieldgroup1_changes.disabled = /*disabled*/ ctx[4];
    			fieldgroup1.$set(fieldgroup1_changes);
    			const fieldgroup2_changes = {};
    			if (dirty & /*id*/ 1) fieldgroup2_changes.id = /*id*/ ctx[0];
    			if (dirty & /*name, type, id*/ 7) fieldgroup2_changes.button = `&{template:TLBattackRoll} {{name=@{character-name}}} {{move=${/*name*/ ctx[1]}}} {{${/*type*/ ctx[2]}=[[2d6+(@{${/*id*/ ctx[0]}})+(?{${capitalCase(/*type*/ ctx[2])} modifier|+0})]]}} {{note=?{Note}}}`;
    			fieldgroup2.$set(fieldgroup2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fieldgroup0.$$.fragment, local);
    			transition_in(fieldgroup1.$$.fragment, local);
    			transition_in(fieldgroup2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fieldgroup0.$$.fragment, local);
    			transition_out(fieldgroup1.$$.fragment, local);
    			transition_out(fieldgroup2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fieldgroup0);
    			destroy_component(fieldgroup1);
    			destroy_component(fieldgroup2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { name } = $$props;
    	let { type } = $$props;
    	let { parent = false } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ["id", "name", "type", "parent", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetManeuverBox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("parent" in $$props) $$invalidate(3, parent = $$props.parent);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => {
    		return { id, name, type, parent, disabled };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("parent" in $$props) $$invalidate(3, parent = $$props.parent);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    	};

    	return [id, name, type, parent, disabled];
    }

    class SheetManeuverBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$9, safe_not_equal, {
    			id: 0,
    			name: 1,
    			type: 2,
    			parent: 3,
    			disabled: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetManeuverBox",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetManeuverBox> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<SheetManeuverBox> was created without expected prop 'name'");
    		}

    		if (/*type*/ ctx[2] === undefined && !("type" in props)) {
    			console.warn("<SheetManeuverBox> was created without expected prop 'type'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetManeuverBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetManeuverBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SheetManeuverBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SheetManeuverBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<SheetManeuverBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<SheetManeuverBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parent() {
    		throw new Error("<SheetManeuverBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parent(value) {
    		throw new Error("<SheetManeuverBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SheetManeuverBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SheetManeuverBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\fields\SheetField.svelte generated by Svelte v3.16.0 */

    const file$a = "src\\layout\\components\\fields\\SheetField.svelte";

    // (129:2) {:else}
    function create_else_block_1(ctx) {
    	let input;
    	let input_name_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0]);
    			input.value = /*value*/ ctx[3];
    			attr_dev(input, "autocomplete", "new-password");
    			attr_dev(input, "style", /*style*/ ctx[10]);
    			attr_dev(input, "class", "svelte-hgmd0u");
    			add_location(input, file$a, 129, 4, 5967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 8) {
    				prop_dev(input, "value", /*value*/ ctx[3]);
    			}

    			if (dirty & /*style*/ 1024) {
    				attr_dev(input, "style", /*style*/ ctx[10]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(129:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (127:19) 
    function create_if_block_7(ctx) {
    	let button_1;
    	let button_1_name_value;

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			attr_dev(button_1, "type", "roll");
    			attr_dev(button_1, "name", button_1_name_value = "roll_" + /*id*/ ctx[0]);
    			button_1.value = /*button*/ ctx[8];
    			attr_dev(button_1, "class", "svelte-hgmd0u");
    			add_location(button_1, file$a, 127, 4, 5896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && button_1_name_value !== (button_1_name_value = "roll_" + /*id*/ ctx[0])) {
    				attr_dev(button_1, "name", button_1_name_value);
    			}

    			if (dirty & /*button*/ 256) {
    				prop_dev(button_1, "value", /*button*/ ctx[8]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(127:19) ",
    		ctx
    	});

    	return block;
    }

    // (123:22) 
    function create_if_block_6(ctx) {
    	let select;
    	let select_name_value;
    	let select_value_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (default_slot) default_slot.c();
    			attr_dev(select, "name", select_name_value = "attr_" + /*id*/ ctx[0]);
    			attr_dev(select, "style", /*style*/ ctx[10]);
    			attr_dev(select, "class", "svelte-hgmd0u");
    			add_location(select, file$a, 123, 4, 5797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			select_value_value = /*value*/ ctx[3];

    			for (var i = 0; i < select.options.length; i += 1) {
    				var option_1 = select.options[i];

    				if (option_1.__value === select_value_value) {
    					option_1.selected = true;
    					break;
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2048) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[11], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null));
    			}

    			if (!current || dirty & /*id*/ 1 && select_name_value !== (select_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(select, "name", select_name_value);
    			}

    			if (!current || dirty & /*value*/ 8 && select_value_value !== (select_value_value = /*value*/ ctx[3])) {
    				for (var i = 0; i < select.options.length; i += 1) {
    					var option_1 = select.options[i];

    					if (option_1.__value === select_value_value) {
    						option_1.selected = true;
    						break;
    					}
    				}
    			}

    			if (!current || dirty & /*style*/ 1024) {
    				attr_dev(select, "style", /*style*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(123:22) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if textarea}
    function create_if_block_5(ctx) {
    	let textarea_1;
    	let textarea_1_name_value;

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			attr_dev(textarea_1, "name", textarea_1_name_value = "attr_" + /*id*/ ctx[0]);
    			textarea_1.value = /*value*/ ctx[3];
    			attr_dev(textarea_1, "rows", /*rows*/ ctx[9]);
    			attr_dev(textarea_1, "style", /*style*/ ctx[10]);
    			attr_dev(textarea_1, "class", "svelte-hgmd0u");
    			add_location(textarea_1, file$a, 121, 4, 5715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && textarea_1_name_value !== (textarea_1_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(textarea_1, "name", textarea_1_name_value);
    			}

    			if (dirty & /*value*/ 8) {
    				prop_dev(textarea_1, "value", /*value*/ ctx[3]);
    			}

    			if (dirty & /*rows*/ 512) {
    				attr_dev(textarea_1, "rows", /*rows*/ ctx[9]);
    			}

    			if (dirty & /*style*/ 1024) {
    				attr_dev(textarea_1, "style", /*style*/ ctx[10]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(121:2) {#if textarea}",
    		ctx
    	});

    	return block;
    }

    // (102:16) 
    function create_if_block_2(ctx) {
    	let label_1;
    	let span;
    	let t0;
    	let span_title_value;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_3, create_if_block_4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*textarea*/ ctx[6]) return 0;
    		if (/*selectbox*/ ctx[7]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			span = element("span");
    			t0 = text(/*label*/ ctx[1]);
    			t1 = space();
    			if_block.c();
    			attr_dev(span, "title", span_title_value = /*tooltip*/ ctx[2] ? /*tooltip*/ ctx[2] : null);
    			attr_dev(span, "class", "svelte-hgmd0u");
    			add_location(span, file$a, 103, 4, 5268);
    			attr_dev(label_1, "class", "svelte-hgmd0u");
    			add_location(label_1, file$a, 102, 2, 5255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, span);
    			append_dev(span, t0);
    			append_dev(label_1, t1);
    			if_blocks[current_block_type_index].m(label_1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*label*/ 2) set_data_dev(t0, /*label*/ ctx[1]);

    			if (!current || dirty & /*tooltip*/ 4 && span_title_value !== (span_title_value = /*tooltip*/ ctx[2] ? /*tooltip*/ ctx[2] : null)) {
    				attr_dev(span, "title", span_title_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(label_1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(102:16) ",
    		ctx
    	});

    	return block;
    }

    // (100:26) 
    function create_if_block_1$1(ctx) {
    	let button_1;
    	let t;
    	let button_1_name_value;

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(button_1, "type", "roll");
    			attr_dev(button_1, "name", button_1_name_value = "roll_" + /*id*/ ctx[0]);
    			button_1.value = /*button*/ ctx[8];
    			attr_dev(button_1, "class", "svelte-hgmd0u");
    			add_location(button_1, file$a, 100, 2, 5165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);

    			if (dirty & /*id*/ 1 && button_1_name_value !== (button_1_name_value = "roll_" + /*id*/ ctx[0])) {
    				attr_dev(button_1, "name", button_1_name_value);
    			}

    			if (dirty & /*button*/ 256) {
    				prop_dev(button_1, "value", /*button*/ ctx[8]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(100:26) ",
    		ctx
    	});

    	return block;
    }

    // (94:0) {#if hidden}
    function create_if_block$2(ctx) {
    	let input;
    	let input_name_value;
    	let input_class_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "hidden");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0]);
    			attr_dev(input, "class", input_class_value = /*option*/ ctx[5] ? `sheet-option` : null);
    			input.value = /*value*/ ctx[3];
    			add_location(input, file$a, 94, 2, 5026);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*option*/ 32 && input_class_value !== (input_class_value = /*option*/ ctx[5] ? `sheet-option` : null)) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*value*/ 8) {
    				prop_dev(input, "value", /*value*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(94:0) {#if hidden}",
    		ctx
    	});

    	return block;
    }

    // (111:4) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let input_name_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0]);
    			input.value = /*value*/ ctx[3];
    			attr_dev(input, "autocomplete", "new-password");
    			attr_dev(input, "style", /*style*/ ctx[10]);
    			attr_dev(input, "class", "svelte-hgmd0u");
    			add_location(input, file$a, 111, 6, 5532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 8) {
    				prop_dev(input, "value", /*value*/ ctx[3]);
    			}

    			if (dirty & /*style*/ 1024) {
    				attr_dev(input, "style", /*style*/ ctx[10]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(111:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (107:24) 
    function create_if_block_4(ctx) {
    	let select;
    	let select_name_value;
    	let select_value_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (default_slot) default_slot.c();
    			attr_dev(select, "name", select_name_value = "attr_" + /*id*/ ctx[0]);
    			attr_dev(select, "style", /*style*/ ctx[10]);
    			attr_dev(select, "class", "svelte-hgmd0u");
    			add_location(select, file$a, 107, 6, 5435);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			select_value_value = /*value*/ ctx[3];

    			for (var i = 0; i < select.options.length; i += 1) {
    				var option_1 = select.options[i];

    				if (option_1.__value === select_value_value) {
    					option_1.selected = true;
    					break;
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2048) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[11], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null));
    			}

    			if (!current || dirty & /*id*/ 1 && select_name_value !== (select_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(select, "name", select_name_value);
    			}

    			if (!current || dirty & /*value*/ 8 && select_value_value !== (select_value_value = /*value*/ ctx[3])) {
    				for (var i = 0; i < select.options.length; i += 1) {
    					var option_1 = select.options[i];

    					if (option_1.__value === select_value_value) {
    						option_1.selected = true;
    						break;
    					}
    				}
    			}

    			if (!current || dirty & /*style*/ 1024) {
    				attr_dev(select, "style", /*style*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(107:24) ",
    		ctx
    	});

    	return block;
    }

    // (105:4) {#if textarea}
    function create_if_block_3(ctx) {
    	let textarea_1;
    	let textarea_1_name_value;

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			attr_dev(textarea_1, "name", textarea_1_name_value = "attr_" + /*id*/ ctx[0]);
    			textarea_1.value = /*value*/ ctx[3];
    			attr_dev(textarea_1, "rows", /*rows*/ ctx[9]);
    			attr_dev(textarea_1, "style", /*style*/ ctx[10]);
    			attr_dev(textarea_1, "class", "svelte-hgmd0u");
    			add_location(textarea_1, file$a, 105, 6, 5349);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && textarea_1_name_value !== (textarea_1_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(textarea_1, "name", textarea_1_name_value);
    			}

    			if (dirty & /*value*/ 8) {
    				prop_dev(textarea_1, "value", /*value*/ ctx[3]);
    			}

    			if (dirty & /*rows*/ 512) {
    				attr_dev(textarea_1, "rows", /*rows*/ ctx[9]);
    			}

    			if (dirty & /*style*/ 1024) {
    				attr_dev(textarea_1, "style", /*style*/ ctx[10]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(105:4) {#if textarea}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block$2,
    		create_if_block_1$1,
    		create_if_block_2,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_else_block_1
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hidden*/ ctx[4]) return 0;
    		if (/*label*/ ctx[1] && /*button*/ ctx[8]) return 1;
    		if (/*label*/ ctx[1]) return 2;
    		if (/*textarea*/ ctx[6]) return 3;
    		if (/*selectbox*/ ctx[7]) return 4;
    		if (/*button*/ ctx[8]) return 5;
    		return 6;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { label = false } = $$props;
    	let { tooltip = false } = $$props;
    	let { value = "" } = $$props;
    	let { hidden = false } = $$props;
    	let { option = false } = $$props;
    	let { textarea = false } = $$props;
    	let { selectbox = false } = $$props;
    	let { button = false } = $$props;
    	let { rows = "3" } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"id",
    		"label",
    		"tooltip",
    		"value",
    		"hidden",
    		"option",
    		"textarea",
    		"selectbox",
    		"button",
    		"rows",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetField> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("tooltip" in $$props) $$invalidate(2, tooltip = $$props.tooltip);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("hidden" in $$props) $$invalidate(4, hidden = $$props.hidden);
    		if ("option" in $$props) $$invalidate(5, option = $$props.option);
    		if ("textarea" in $$props) $$invalidate(6, textarea = $$props.textarea);
    		if ("selectbox" in $$props) $$invalidate(7, selectbox = $$props.selectbox);
    		if ("button" in $$props) $$invalidate(8, button = $$props.button);
    		if ("rows" in $$props) $$invalidate(9, rows = $$props.rows);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			id,
    			label,
    			tooltip,
    			value,
    			hidden,
    			option,
    			textarea,
    			selectbox,
    			button,
    			rows,
    			style
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("tooltip" in $$props) $$invalidate(2, tooltip = $$props.tooltip);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("hidden" in $$props) $$invalidate(4, hidden = $$props.hidden);
    		if ("option" in $$props) $$invalidate(5, option = $$props.option);
    		if ("textarea" in $$props) $$invalidate(6, textarea = $$props.textarea);
    		if ("selectbox" in $$props) $$invalidate(7, selectbox = $$props.selectbox);
    		if ("button" in $$props) $$invalidate(8, button = $$props.button);
    		if ("rows" in $$props) $$invalidate(9, rows = $$props.rows);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    	};

    	return [
    		id,
    		label,
    		tooltip,
    		value,
    		hidden,
    		option,
    		textarea,
    		selectbox,
    		button,
    		rows,
    		style,
    		$$scope,
    		$$slots
    	];
    }

    class SheetField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$a, safe_not_equal, {
    			id: 0,
    			label: 1,
    			tooltip: 2,
    			value: 3,
    			hidden: 4,
    			option: 5,
    			textarea: 6,
    			selectbox: 7,
    			button: 8,
    			rows: 9,
    			style: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetField",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetField> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltip() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltip(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get option() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set option(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectbox() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectbox(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<SheetField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<SheetField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\fields\SheetFieldGroup.svelte generated by Svelte v3.16.0 */

    const file$b = "src\\layout\\components\\fields\\SheetFieldGroup.svelte";

    // (101:2) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(span, "class", "svelte-mzabj1");
    			add_location(span, file$b, 101, 4, 5127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(101:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (99:2) {#if button}
    function create_if_block$3(ctx) {
    	let button_1;
    	let t;
    	let button_1_name_value;

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(button_1, "type", "roll");
    			attr_dev(button_1, "name", button_1_name_value = "roll_" + /*id*/ ctx[0]);
    			button_1.value = /*button*/ ctx[3];
    			attr_dev(button_1, "class", "svelte-mzabj1");
    			add_location(button_1, file$b, 99, 4, 5042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);

    			if (dirty & /*id*/ 1 && button_1_name_value !== (button_1_name_value = "roll_" + /*id*/ ctx[0])) {
    				attr_dev(button_1, "name", button_1_name_value);
    			}

    			if (dirty & /*button*/ 8) {
    				prop_dev(button_1, "value", /*button*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(99:2) {#if button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let label_1;
    	let input;
    	let input_name_value;
    	let t;
    	let label_1_style_value;

    	function select_block_type(ctx, dirty) {
    		if (/*button*/ ctx[3]) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			input = element("input");
    			t = space();
    			if_block.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0]);
    			input.value = /*value*/ ctx[2];
    			input.disabled = /*disabled*/ ctx[9];
    			attr_dev(input, "autocomplete", "new-password");
    			attr_dev(input, "class", "svelte-mzabj1");
    			add_location(input, file$b, 92, 2, 4910);
    			attr_dev(label_1, "style", label_1_style_value = "width:" + 100 / /*count*/ ctx[4] + "%; " + /*style*/ ctx[5]);
    			attr_dev(label_1, "class", "svelte-mzabj1");
    			toggle_class(label_1, "sheet-left", /*left*/ ctx[6]);
    			toggle_class(label_1, "sheet-center", /*center*/ ctx[7]);
    			toggle_class(label_1, "sheet-right", /*right*/ ctx[8]);
    			add_location(label_1, file$b, 87, 0, 4771);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, input);
    			append_dev(label_1, t);
    			if_block.m(label_1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0])) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 4) {
    				prop_dev(input, "value", /*value*/ ctx[2]);
    			}

    			if (dirty & /*disabled*/ 512) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[9]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(label_1, null);
    				}
    			}

    			if (dirty & /*count, style*/ 48 && label_1_style_value !== (label_1_style_value = "width:" + 100 / /*count*/ ctx[4] + "%; " + /*style*/ ctx[5])) {
    				attr_dev(label_1, "style", label_1_style_value);
    			}

    			if (dirty & /*left*/ 64) {
    				toggle_class(label_1, "sheet-left", /*left*/ ctx[6]);
    			}

    			if (dirty & /*center*/ 128) {
    				toggle_class(label_1, "sheet-center", /*center*/ ctx[7]);
    			}

    			if (dirty & /*right*/ 256) {
    				toggle_class(label_1, "sheet-right", /*right*/ ctx[8]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { label } = $$props;
    	let { value = "" } = $$props;
    	let { button = false } = $$props;
    	let { count = "1" } = $$props;
    	let { style = "" } = $$props;
    	let { left = false } = $$props;
    	let { center = false } = $$props;
    	let { right = false } = $$props;
    	let { disabled = false } = $$props;

    	const writable_props = [
    		"id",
    		"label",
    		"value",
    		"button",
    		"count",
    		"style",
    		"left",
    		"center",
    		"right",
    		"disabled"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetFieldGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("button" in $$props) $$invalidate(3, button = $$props.button);
    		if ("count" in $$props) $$invalidate(4, count = $$props.count);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("left" in $$props) $$invalidate(6, left = $$props.left);
    		if ("center" in $$props) $$invalidate(7, center = $$props.center);
    		if ("right" in $$props) $$invalidate(8, right = $$props.right);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => {
    		return {
    			id,
    			label,
    			value,
    			button,
    			count,
    			style,
    			left,
    			center,
    			right,
    			disabled
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("button" in $$props) $$invalidate(3, button = $$props.button);
    		if ("count" in $$props) $$invalidate(4, count = $$props.count);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("left" in $$props) $$invalidate(6, left = $$props.left);
    		if ("center" in $$props) $$invalidate(7, center = $$props.center);
    		if ("right" in $$props) $$invalidate(8, right = $$props.right);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    	};

    	return [id, label, value, button, count, style, left, center, right, disabled];
    }

    class SheetFieldGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$b, safe_not_equal, {
    			id: 0,
    			label: 1,
    			value: 2,
    			button: 3,
    			count: 4,
    			style: 5,
    			left: 6,
    			center: 7,
    			right: 8,
    			disabled: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetFieldGroup",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetFieldGroup> was created without expected prop 'id'");
    		}

    		if (/*label*/ ctx[1] === undefined && !("label" in props)) {
    			console.warn("<SheetFieldGroup> was created without expected prop 'label'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SheetFieldGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SheetFieldGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\fields\SheetToggle.svelte generated by Svelte v3.16.0 */

    const file$c = "src\\layout\\components\\fields\\SheetToggle.svelte";

    // (132:0) {:else}
    function create_else_block$3(ctx) {
    	let input;
    	let input_name_value;
    	let input_value_value;
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*label*/ ctx[2]);
    			attr_dev(input, "class", "sheet-toggle");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle");
    			input.value = input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked";
    			input.checked = /*checked*/ ctx[4];
    			add_location(input, file$c, 132, 2, 6582);
    			add_location(span, file$c, 138, 2, 6725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle")) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 32 && input_value_value !== (input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked")) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*checked*/ 16) {
    				prop_dev(input, "checked", /*checked*/ ctx[4]);
    			}

    			if (dirty & /*label*/ 4) set_data_dev(t1, /*label*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(132:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (122:26) 
    function create_if_block_3$1(ctx) {
    	let span1;
    	let input;
    	let input_class_value;
    	let input_name_value;
    	let input_value_value;
    	let t0;
    	let span0;
    	let t1;

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			input = element("input");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(/*label*/ ctx[2]);
    			attr_dev(input, "class", input_class_value = "sheet-toggle " + (/*style*/ ctx[1] ? `sheet-${/*style*/ ctx[1]}` : ""));
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle");
    			input.value = input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked";
    			input.checked = /*checked*/ ctx[4];
    			add_location(input, file$c, 123, 4, 6351);
    			add_location(span0, file$c, 129, 4, 6538);
    			add_location(span1, file$c, 122, 2, 6339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, input);
    			append_dev(span1, t0);
    			append_dev(span1, span0);
    			append_dev(span0, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2 && input_class_value !== (input_class_value = "sheet-toggle " + (/*style*/ ctx[1] ? `sheet-${/*style*/ ctx[1]}` : ""))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle")) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 32 && input_value_value !== (input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked")) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*checked*/ 16) {
    				prop_dev(input, "checked", /*checked*/ ctx[4]);
    			}

    			if (dirty & /*label*/ 4) set_data_dev(t1, /*label*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(122:26) ",
    		ctx
    	});

    	return block;
    }

    // (112:25) 
    function create_if_block_2$1(ctx) {
    	let div;
    	let input;
    	let input_class_value;
    	let input_name_value;
    	let input_value_value;
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*label*/ ctx[2]);
    			attr_dev(input, "class", input_class_value = "sheet-toggle " + (/*style*/ ctx[1] ? `sheet-${/*style*/ ctx[1]}` : ""));
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle");
    			input.value = input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked";
    			input.checked = /*checked*/ ctx[4];
    			add_location(input, file$c, 113, 4, 6090);
    			add_location(span, file$c, 119, 4, 6277);
    			add_location(div, file$c, 112, 2, 6079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2 && input_class_value !== (input_class_value = "sheet-toggle " + (/*style*/ ctx[1] ? `sheet-${/*style*/ ctx[1]}` : ""))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle")) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 32 && input_value_value !== (input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked")) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*checked*/ 16) {
    				prop_dev(input, "checked", /*checked*/ ctx[4]);
    			}

    			if (dirty & /*label*/ 4) set_data_dev(t1, /*label*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(112:25) ",
    		ctx
    	});

    	return block;
    }

    // (102:24) 
    function create_if_block_1$2(ctx) {
    	let li;
    	let input;
    	let input_class_value;
    	let input_name_value;
    	let input_value_value;
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*label*/ ctx[2]);
    			attr_dev(input, "class", input_class_value = "sheet-toggle " + (/*style*/ ctx[1] ? `sheet-${/*style*/ ctx[1]}` : ""));
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle");
    			input.value = input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked";
    			input.checked = /*checked*/ ctx[4];
    			add_location(input, file$c, 103, 4, 5832);
    			add_location(span, file$c, 109, 4, 6019);
    			add_location(li, file$c, 102, 2, 5822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, input);
    			append_dev(li, t0);
    			append_dev(li, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*style*/ 2 && input_class_value !== (input_class_value = "sheet-toggle " + (/*style*/ ctx[1] ? `sheet-${/*style*/ ctx[1]}` : ""))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle")) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*value*/ 32 && input_value_value !== (input_value_value = /*value*/ ctx[5] ? /*value*/ ctx[5] : "checked")) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*checked*/ 16) {
    				prop_dev(input, "checked", /*checked*/ ctx[4]);
    			}

    			if (dirty & /*label*/ 4) set_data_dev(t1, /*label*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(102:24) ",
    		ctx
    	});

    	return block;
    }

    // (96:0) {#if hidden}
    function create_if_block$4(ctx) {
    	let input;
    	let input_name_value;
    	let input_value_value;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "sheet-toggle ");
    			attr_dev(input, "type", "hidden");
    			attr_dev(input, "name", input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle");
    			input.value = input_value_value = /*checked*/ ctx[4] ? "checked" : null;
    			add_location(input, file$c, 96, 2, 5668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1 && input_name_value !== (input_name_value = "attr_" + /*id*/ ctx[0] + "-toggle")) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*checked*/ 16 && input_value_value !== (input_value_value = /*checked*/ ctx[4] ? "checked" : null)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(96:0) {#if hidden}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*hidden*/ ctx[3]) return create_if_block$4;
    		if (/*wrap*/ ctx[6] === "li") return create_if_block_1$2;
    		if (/*wrap*/ ctx[6] === "div") return create_if_block_2$1;
    		if (/*wrap*/ ctx[6] === "span") return create_if_block_3$1;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { style = false } = $$props;
    	let { label = "" } = $$props;
    	let { hidden = false } = $$props;
    	let { checked = null } = $$props;
    	let { value = false } = $$props;
    	let { wrap = false } = $$props;
    	const writable_props = ["id", "style", "label", "hidden", "checked", "value", "wrap"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetToggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("hidden" in $$props) $$invalidate(3, hidden = $$props.hidden);
    		if ("checked" in $$props) $$invalidate(4, checked = $$props.checked);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("wrap" in $$props) $$invalidate(6, wrap = $$props.wrap);
    	};

    	$$self.$capture_state = () => {
    		return {
    			id,
    			style,
    			label,
    			hidden,
    			checked,
    			value,
    			wrap
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("hidden" in $$props) $$invalidate(3, hidden = $$props.hidden);
    		if ("checked" in $$props) $$invalidate(4, checked = $$props.checked);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("wrap" in $$props) $$invalidate(6, wrap = $$props.wrap);
    	};

    	return [id, style, label, hidden, checked, value, wrap];
    }

    class SheetToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$c, safe_not_equal, {
    			id: 0,
    			style: 1,
    			label: 2,
    			hidden: 3,
    			checked: 4,
    			value: 5,
    			wrap: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetToggle",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetToggle> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<SheetToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<SheetToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<SheetToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SheetToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hidden() {
    		throw new Error("<SheetToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hidden(value) {
    		throw new Error("<SheetToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<SheetToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<SheetToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SheetToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SheetToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrap() {
    		throw new Error("<SheetToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrap(value) {
    		throw new Error("<SheetToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\tables\SheetTable.svelte generated by Svelte v3.16.0 */
    const file$d = "src\\layout\\components\\tables\\SheetTable.svelte";

    // (127:2) {#if header}
    function create_if_block_1$3(ctx) {
    	let current;

    	const tableheader = new SheetTableHeader({
    			props: { items: /*header*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tableheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableheader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableheader_changes = {};
    			if (dirty & /*header*/ 8) tableheader_changes.items = /*header*/ ctx[3];
    			tableheader.$set(tableheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(127:2) {#if header}",
    		ctx
    	});

    	return block;
    }

    // (138:2) {:else}
    function create_else_block$4(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();

    			attr_dev(div, "class", div_class_value = /*subtable*/ ctx[2]
    			? "sheet-tablerow sheet-subtable"
    			: "sheet-tablerow");

    			add_location(div, file$d, 138, 4, 8226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			if (!current || dirty & /*subtable*/ 4 && div_class_value !== (div_class_value = /*subtable*/ ctx[2]
    			? "sheet-tablerow sheet-subtable"
    			: "sheet-tablerow")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(138:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (131:2) {#if repeat}
    function create_if_block$5(ctx) {
    	let fieldset;
    	let div;
    	let div_class_value;
    	let fieldset_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			div = element("div");
    			if (default_slot) default_slot.c();

    			attr_dev(div, "class", div_class_value = /*subtable*/ ctx[2]
    			? "sheet-tablerow sheet-subtable"
    			: "sheet-tablerow");

    			add_location(div, file$d, 132, 6, 8076);
    			attr_dev(fieldset, "class", fieldset_class_value = "repeating_" + /*id*/ ctx[0]);
    			add_location(fieldset, file$d, 131, 4, 8035);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    			}

    			if (!current || dirty & /*subtable*/ 4 && div_class_value !== (div_class_value = /*subtable*/ ctx[2]
    			? "sheet-tablerow sheet-subtable"
    			: "sheet-tablerow")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*id*/ 1 && fieldset_class_value !== (fieldset_class_value = "repeating_" + /*id*/ ctx[0])) {
    				attr_dev(fieldset, "class", fieldset_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(131:2) {#if repeat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let t;
    	let current_block_type_index;
    	let if_block1;
    	let div_class_value;
    	let current;
    	let if_block0 = /*header*/ ctx[3] && create_if_block_1$3(ctx);
    	const if_block_creators = [create_if_block$5, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*repeat*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if_block1.c();
    			attr_dev(div, "class", div_class_value = "sheet-table " + (/*id*/ ctx[0] ? `sheet-${/*id*/ ctx[0]}table` : null));
    			add_location(div, file$d, 125, 0, 7892);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*header*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div, null);
    			}

    			if (!current || dirty & /*id*/ 1 && div_class_value !== (div_class_value = "sheet-table " + (/*id*/ ctx[0] ? `sheet-${/*id*/ ctx[0]}table` : null))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { repeat = false } = $$props;
    	let { subtable = false } = $$props;
    	let { header = false } = $$props;
    	const writable_props = ["id", "repeat", "subtable", "header"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetTable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("repeat" in $$props) $$invalidate(1, repeat = $$props.repeat);
    		if ("subtable" in $$props) $$invalidate(2, subtable = $$props.subtable);
    		if ("header" in $$props) $$invalidate(3, header = $$props.header);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { id, repeat, subtable, header };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("repeat" in $$props) $$invalidate(1, repeat = $$props.repeat);
    		if ("subtable" in $$props) $$invalidate(2, subtable = $$props.subtable);
    		if ("header" in $$props) $$invalidate(3, header = $$props.header);
    	};

    	return [id, repeat, subtable, header, $$scope, $$slots];
    }

    class SheetTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$d, safe_not_equal, { id: 0, repeat: 1, subtable: 2, header: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetTable",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<SheetTable> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<SheetTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get repeat() {
    		throw new Error("<SheetTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set repeat(value) {
    		throw new Error("<SheetTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtable() {
    		throw new Error("<SheetTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtable(value) {
    		throw new Error("<SheetTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<SheetTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<SheetTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\tables\SheetTableHeader.svelte generated by Svelte v3.16.0 */

    const file$e = "src\\layout\\components\\tables\\SheetTableHeader.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (62:4) {:else}
    function create_else_block$5(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[1].label + "";
    	let t;
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "title", span_title_value = /*item*/ ctx[1].tooltip ? /*item*/ ctx[1].tooltip : null);
    			attr_dev(span, "class", "svelte-18p1e1v");
    			add_location(span, file$e, 62, 6, 3482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[1].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*items*/ 1 && span_title_value !== (span_title_value = /*item*/ ctx[1].tooltip ? /*item*/ ctx[1].tooltip : null)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(62:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if item.type === 'toggle'}
    function create_if_block$6(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "sheet-eye svelte-18p1e1v");
    			add_location(span, file$e, 60, 6, 3435);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(60:4) {#if item.type === 'toggle'}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#each items as item}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[1].type === "toggle") return create_if_block$6;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(59:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div;
    	let each_value = /*items*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "sheet-tableheader svelte-18p1e1v");
    			add_location(div, file$e, 57, 0, 3337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 1) {
    				each_value = /*items*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { items = [] } = $$props;
    	const writable_props = ["items"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetTableHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    	};

    	$$self.$capture_state = () => {
    		return { items };
    	};

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    	};

    	return [items];
    }

    class SheetTableHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$e, safe_not_equal, { items: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetTableHeader",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get items() {
    		throw new Error("<SheetTableHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<SheetTableHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\components\tables\SheetTableItem.svelte generated by Svelte v3.16.0 */
    const file$f = "src\\layout\\components\\tables\\SheetTableItem.svelte";

    // (39:0) {:else}
    function create_else_block$6(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 32) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(39:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:26) 
    function create_if_block_4$1(ctx) {
    	let current;

    	const field = new SheetField({
    			props: {
    				id: /*id*/ ctx[0],
    				value: /*value*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const field_changes = {};
    			if (dirty & /*id*/ 1) field_changes.id = /*id*/ ctx[0];
    			if (dirty & /*value*/ 8) field_changes.value = /*value*/ ctx[3];
    			field.$set(field_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(37:26) ",
    		ctx
    	});

    	return block;
    }

    // (35:28) 
    function create_if_block_3$2(ctx) {
    	let current;

    	const field = new SheetField({
    			props: {
    				button: /*value*/ ctx[3],
    				id: /*id*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const field_changes = {};
    			if (dirty & /*value*/ 8) field_changes.button = /*value*/ ctx[3];
    			if (dirty & /*id*/ 1) field_changes.id = /*id*/ ctx[0];
    			field.$set(field_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(35:28) ",
    		ctx
    	});

    	return block;
    }

    // (31:28) 
    function create_if_block_2$2(ctx) {
    	let current;

    	const field = new SheetField({
    			props: {
    				id: /*id*/ ctx[0],
    				selectbox: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const field_changes = {};
    			if (dirty & /*id*/ 1) field_changes.id = /*id*/ ctx[0];

    			if (dirty & /*$$scope*/ 32) {
    				field_changes.$$scope = { dirty, ctx };
    			}

    			field.$set(field_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(31:28) ",
    		ctx
    	});

    	return block;
    }

    // (27:28) 
    function create_if_block_1$4(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "sheet-drawer " + (/*id*/ ctx[0] ? `sheet-${/*id*/ ctx[0]}` : null));
    			add_location(div, file$f, 27, 2, 1409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 32) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    			}

    			if (!current || dirty & /*id*/ 1 && div_class_value !== (div_class_value = "sheet-drawer " + (/*id*/ ctx[0] ? `sheet-${/*id*/ ctx[0]}` : null))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(27:28) ",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if type === 'toggle'}
    function create_if_block$7(ctx) {
    	let current;

    	const toggle = new SheetToggle({
    			props: {
    				id: /*id*/ ctx[0],
    				checked: /*checked*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toggle_changes = {};
    			if (dirty & /*id*/ 1) toggle_changes.id = /*id*/ ctx[0];
    			if (dirty & /*checked*/ 4) toggle_changes.checked = /*checked*/ ctx[2];
    			toggle.$set(toggle_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(25:0) {#if type === 'toggle'}",
    		ctx
    	});

    	return block;
    }

    // (32:2) <Field {id} selectbox>
    function create_default_slot(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 32) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(32:2) <Field {id} selectbox>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block$7,
    		create_if_block_1$4,
    		create_if_block_2$2,
    		create_if_block_3$2,
    		create_if_block_4$1,
    		create_else_block$6
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] === "toggle") return 0;
    		if (/*type*/ ctx[1] === "drawer") return 1;
    		if (/*type*/ ctx[1] === "select") return 2;
    		if (/*type*/ ctx[1] === "button") return 3;
    		if (/*type*/ ctx[1] === "text") return 4;
    		return 5;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { id = false } = $$props;
    	let { type = "text" } = $$props;
    	let { checked = false } = $$props;
    	let { value = "" } = $$props;
    	const writable_props = ["id", "type", "checked", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SheetTableItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("checked" in $$props) $$invalidate(2, checked = $$props.checked);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { id, type, checked, value };
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("checked" in $$props) $$invalidate(2, checked = $$props.checked);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    	};

    	return [id, type, checked, value, $$slots, $$scope];
    }

    class SheetTableItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$f, safe_not_equal, { id: 0, type: 1, checked: 2, value: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetTableItem",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get id() {
    		throw new Error("<SheetTableItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SheetTableItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<SheetTableItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<SheetTableItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<SheetTableItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<SheetTableItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SheetTableItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SheetTableItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\section-character\SheetDetails.svelte generated by Svelte v3.16.0 */

    // (13:0) <Box id="details" label="Details" boxed>
    function create_default_slot$1(ctx) {
    	let t;
    	let current;

    	const field0 = new SheetField({
    			props: { id: "character-name", label: "Name" },
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				id: "character-desc",
    				label: "Description",
    				textarea: true,
    				rows: "5"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field0.$$.fragment);
    			t = space();
    			create_component(field1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(field1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(field1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(13:0) <Box id=\\\"details\\\" label=\\\"Details\\\" boxed>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "details",
    				label: "Details",
    				boxed: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetDetails",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\layout\section-character\SheetAttributes.svelte generated by Svelte v3.16.0 */
    const file$g = "src\\layout\\section-character\\SheetAttributes.svelte";

    // (24:0) <Box id="attributes" label="Attributes">
    function create_default_slot$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let h3;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let hr;
    	let t12;
    	let current;

    	const attributebox0 = new SheetAttributeBox({
    			props: { id: "iq", name: "Intelligence" },
    			$$inline: true
    		});

    	const attributebox1 = new SheetAttributeBox({
    			props: { id: "wl", name: "Willpower" },
    			$$inline: true
    		});

    	const attributebox2 = new SheetAttributeBox({
    			props: { id: "aw", name: "Awareness" },
    			$$inline: true
    		});

    	const attributebox3 = new SheetAttributeBox({
    			props: { id: "st", name: "Strength" },
    			$$inline: true
    		});

    	const attributebox4 = new SheetAttributeBox({
    			props: { id: "ag", name: "Agility" },
    			$$inline: true
    		});

    	const attributebox5 = new SheetAttributeBox({
    			props: { id: "sm", name: "Stamina" },
    			$$inline: true
    		});

    	const derivedbox0 = new SheetDerivedBox({
    			props: { id: "stun", name: "Stun", button: true },
    			$$inline: true
    		});

    	const derivedbox1 = new SheetDerivedBox({
    			props: { id: "con", name: "Con.", button: true },
    			$$inline: true
    		});

    	const derivedbox2 = new SheetDerivedBox({
    			props: {
    				id: "react",
    				name: "Reaction",
    				button: true
    			},
    			$$inline: true
    		});

    	const derivedbox3 = new SheetDerivedBox({
    			props: { id: "sp", name: "Speed (SP)" },
    			$$inline: true
    		});

    	const explog = new SheetExpLog({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(attributebox0.$$.fragment);
    			t0 = space();
    			create_component(attributebox1.$$.fragment);
    			t1 = space();
    			create_component(attributebox2.$$.fragment);
    			t2 = space();
    			create_component(attributebox3.$$.fragment);
    			t3 = space();
    			create_component(attributebox4.$$.fragment);
    			t4 = space();
    			create_component(attributebox5.$$.fragment);
    			t5 = space();
    			h3 = element("h3");
    			h3.textContent = "Derived Stats:";
    			t7 = space();
    			create_component(derivedbox0.$$.fragment);
    			t8 = space();
    			create_component(derivedbox1.$$.fragment);
    			t9 = space();
    			create_component(derivedbox2.$$.fragment);
    			t10 = space();
    			create_component(derivedbox3.$$.fragment);
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			create_component(explog.$$.fragment);
    			add_location(h3, file$g, 31, 2, 1622);
    			add_location(hr, file$g, 36, 2, 1838);
    		},
    		m: function mount(target, anchor) {
    			mount_component(attributebox0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(attributebox1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(attributebox2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(attributebox3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(attributebox4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(attributebox5, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(derivedbox0, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(derivedbox1, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(derivedbox2, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(derivedbox3, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(explog, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(attributebox0.$$.fragment, local);
    			transition_in(attributebox1.$$.fragment, local);
    			transition_in(attributebox2.$$.fragment, local);
    			transition_in(attributebox3.$$.fragment, local);
    			transition_in(attributebox4.$$.fragment, local);
    			transition_in(attributebox5.$$.fragment, local);
    			transition_in(derivedbox0.$$.fragment, local);
    			transition_in(derivedbox1.$$.fragment, local);
    			transition_in(derivedbox2.$$.fragment, local);
    			transition_in(derivedbox3.$$.fragment, local);
    			transition_in(explog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(attributebox0.$$.fragment, local);
    			transition_out(attributebox1.$$.fragment, local);
    			transition_out(attributebox2.$$.fragment, local);
    			transition_out(attributebox3.$$.fragment, local);
    			transition_out(attributebox4.$$.fragment, local);
    			transition_out(attributebox5.$$.fragment, local);
    			transition_out(derivedbox0.$$.fragment, local);
    			transition_out(derivedbox1.$$.fragment, local);
    			transition_out(derivedbox2.$$.fragment, local);
    			transition_out(derivedbox3.$$.fragment, local);
    			transition_out(explog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(attributebox0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(attributebox1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(attributebox2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(attributebox3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(attributebox4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(attributebox5, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t7);
    			destroy_component(derivedbox0, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(derivedbox1, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(derivedbox2, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(derivedbox3, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t12);
    			destroy_component(explog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(24:0) <Box id=\\\"attributes\\\" label=\\\"Attributes\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "attributes",
    				label: "Attributes",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetAttributes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetAttributes",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\layout\section-character\SheetAdvantages.svelte generated by Svelte v3.16.0 */
    const file$h = "src\\layout\\section-character\\SheetAdvantages.svelte";

    // (53:4) <TableItem type="select" id="advantage-type">
    function create_default_slot_3(ctx) {
    	let option0;
    	let t1;
    	let option1;
    	let t3;
    	let option2;
    	let t5;
    	let option3;
    	let t7;
    	let option4;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			t1 = space();
    			option1 = element("option");
    			option1.textContent = "Advantage";
    			t3 = space();
    			option2 = element("option");
    			option2.textContent = "Affliction";
    			t5 = space();
    			option3 = element("option");
    			option3.textContent = "Ailment";
    			t7 = space();
    			option4 = element("option");
    			option4.textContent = "Obstacle";
    			option0.selected = true;
    			option0.__value = "Choose...";
    			option0.value = option0.__value;
    			add_location(option0, file$h, 53, 6, 3491);
    			option1.__value = "Advantage";
    			option1.value = option1.__value;
    			add_location(option1, file$h, 54, 6, 3534);
    			option2.__value = "Affliction";
    			option2.value = option2.__value;
    			add_location(option2, file$h, 55, 6, 3568);
    			option3.__value = "Ailment";
    			option3.value = option3.__value;
    			add_location(option3, file$h, 56, 6, 3603);
    			option4.__value = "Obstacle";
    			option4.value = option4.__value;
    			add_location(option4, file$h, 57, 6, 3635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, option1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, option2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, option3, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, option4, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(option1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(option2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(option3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(option4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(53:4) <TableItem type=\\\"select\\\" id=\\\"advantage-type\\\">",
    		ctx
    	});

    	return block;
    }

    // (60:4) <TableItem type="drawer">
    function create_default_slot_2(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "advantage-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "advantage-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$h, 61, 6, 3772);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(60:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:2) <Table id="advantage" {header} repeat>
    function create_default_slot_1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "advantage-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "advantage" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "advantage-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: {
    				type: "select",
    				id: "advantage-type",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem2_changes.$$scope = { dirty, ctx };
    			}

    			tableitem2.$set(tableitem2_changes);
    			const tableitem3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem3_changes.$$scope = { dirty, ctx };
    			}

    			tableitem3.$set(tableitem3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(49:2) <Table id=\\\"advantage\\\" {header} repeat>",
    		ctx
    	});

    	return block;
    }

    // (48:0) <Box id="advantages" label="Advantages/Disadvantages" boxed hasToggle>
    function create_default_slot$3(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "advantage",
    				header: /*header*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(48:0) <Box id=\\\"advantages\\\" label=\\\"Advantages/Disadvantages\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "advantages",
    				label: "Advantages/Disadvantages",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self) {
    	let header = [{ type: "toggle" }, { label: "Name" }, { label: "Type" }];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	return [header];
    }

    class SheetAdvantages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetAdvantages",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\layout\section-character\SheetSkills.svelte generated by Svelte v3.16.0 */
    const file$i = "src\\layout\\section-character\\SheetSkills.svelte";

    // (91:4) <TableItem type="drawer">
    function create_default_slot_2$1(ctx) {
    	let t0;
    	let ul;
    	let t1;
    	let li;
    	let span;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "skill-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "skill-skillset",
    				label: "Mark as skillset",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t0 = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			t1 = space();
    			li = element("li");
    			span = element("span");
    			span.textContent = "...";
    			attr_dev(span, "name", "attr_skill-id");
    			add_location(span, file$i, 101, 10, 4558);
    			attr_dev(li, "class", "sheet-id");
    			attr_dev(li, "title", "Copy this ID to reference this skill when writing macros");
    			add_location(li, file$i, 98, 8, 4438);
    			add_location(ul, file$i, 92, 6, 4291);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			append_dev(ul, t1);
    			append_dev(ul, li);
    			append_dev(li, span);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(91:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (79:2) <Table id="skills" {header} repeat>
    function create_default_slot_1$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let current;

    	const field = new SheetField({
    			props: {
    				hidden: true,
    				id: "skill-skillset-toggle"
    			},
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "skill" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "skill-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "skill-level" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "skill-parent" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: { type: "text", id: "skill-diff" },
    			$$inline: true
    		});

    	const tableitem5 = new SheetTableItem({
    			props: { type: "text", id: "skill-chance" },
    			$$inline: true
    		});

    	const tableitem6 = new SheetTableItem({
    			props: {
    				type: "button",
    				id: "skill-roll",
    				value: `&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=@{skill-name}}} {{roll=[[d100cs<3cf>99]]}} {{chance=@{skill-chance}}} {{note=?{Note}}}`
    			},
    			$$inline: true
    		});

    	const tableitem7 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    			t4 = space();
    			create_component(tableitem4.$$.fragment);
    			t5 = space();
    			create_component(tableitem5.$$.fragment);
    			t6 = space();
    			create_component(tableitem6.$$.fragment);
    			t7 = space();
    			create_component(tableitem7.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem4, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(tableitem5, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(tableitem6, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(tableitem7, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem7_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				tableitem7_changes.$$scope = { dirty, ctx };
    			}

    			tableitem7.$set(tableitem7_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			transition_in(tableitem5.$$.fragment, local);
    			transition_in(tableitem6.$$.fragment, local);
    			transition_in(tableitem7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			transition_out(tableitem5.$$.fragment, local);
    			transition_out(tableitem6.$$.fragment, local);
    			transition_out(tableitem7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem4, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(tableitem5, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(tableitem6, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(tableitem7, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(79:2) <Table id=\\\"skills\\\" {header} repeat>",
    		ctx
    	});

    	return block;
    }

    // (78:0) <Box id="skills" label="Skills" boxed hasToggle>
    function create_default_slot$4(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "skills",
    				header: /*header*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(78:0) <Box id=\\\"skills\\\" label=\\\"Skills\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "skills",
    				label: "Skills",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self) {
    	let skillsets = [
    		"acedemia",
    		"craftsmanship",
    		"professional",
    		"athletics",
    		"self-mastery",
    		"entertainment",
    		"subsistence",
    		"legerdemain",
    		"communication",
    		"investigation"
    	];

    	let header = [
    		{ type: "toggle" },
    		{ label: "Name" },
    		{ label: "Level/ Spec." },
    		{ label: "Parent" },
    		{ label: "Diff." },
    		{ label: "Chance" }
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("skillsets" in $$props) skillsets = $$props.skillsets;
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	return [header];
    }

    class SheetSkills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetSkills",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\layout\section-character\SheetNotes.svelte generated by Svelte v3.16.0 */
    const file$j = "src\\layout\\section-character\\SheetNotes.svelte";

    // (42:4) <TableItem type="drawer">
    function create_default_slot_2$2(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "note-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "note-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$j, 43, 6, 2775);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(42:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (38:2) <Table id="note" {header} repeat>
    function create_default_slot_1$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "note-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "note" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "note-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem2_changes.$$scope = { dirty, ctx };
    			}

    			tableitem2.$set(tableitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(38:2) <Table id=\\\"note\\\" {header} repeat>",
    		ctx
    	});

    	return block;
    }

    // (37:0) <Box id="notes" label="notes" boxed hasToggle>
    function create_default_slot$5(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "note",
    				header: /*header*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(37:0) <Box id=\\\"notes\\\" label=\\\"notes\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "notes",
    				label: "notes",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self) {
    	let header = [{ type: "toggle" }, { label: "Note" }];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	return [header];
    }

    class SheetNotes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetNotes",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\layout\section-character\SheetPools.svelte generated by Svelte v3.16.0 */
    const file$k = "src\\layout\\section-character\\SheetPools.svelte";

    // (28:0) <Box id="pools" label="Resource Pools">
    function create_default_slot$6(ctx) {
    	let h30;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let div0;
    	let h31;
    	let t12;
    	let t13;
    	let t14;
    	let div1;
    	let h32;
    	let t16;
    	let t17;
    	let t18;
    	let div2;
    	let h33;
    	let t20;
    	let t21;
    	let current;

    	const fieldgroup0 = new SheetFieldGroup({
    			props: {
    				left: true,
    				id: "health-0",
    				label: "Healthy",
    				count: "7.1"
    			},
    			$$inline: true
    		});

    	const fieldgroup1 = new SheetFieldGroup({
    			props: {
    				center: true,
    				id: "health-1",
    				label: "Minor",
    				count: "7.1"
    			},
    			$$inline: true
    		});

    	const fieldgroup2 = new SheetFieldGroup({
    			props: {
    				center: true,
    				id: "health-2",
    				label: "Moderate",
    				count: "7.1"
    			},
    			$$inline: true
    		});

    	const fieldgroup3 = new SheetFieldGroup({
    			props: {
    				center: true,
    				id: "health-3",
    				label: "Serious",
    				count: "7.1"
    			},
    			$$inline: true
    		});

    	const fieldgroup4 = new SheetFieldGroup({
    			props: {
    				center: true,
    				id: "health-4",
    				label: "Severe",
    				count: "7.1"
    			},
    			$$inline: true
    		});

    	const fieldgroup5 = new SheetFieldGroup({
    			props: {
    				right: true,
    				id: "health-5",
    				label: "Critical",
    				count: "7"
    			},
    			$$inline: true
    		});

    	const fieldgroup6 = new SheetFieldGroup({
    			props: {
    				id: "health_max",
    				label: "Capacity",
    				count: "7",
    				style: "margin-left:4px;"
    			},
    			$$inline: true
    		});

    	const field0 = new SheetField({
    			props: {
    				hidden: true,
    				id: "wound-level",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				hidden: true,
    				id: "wound-level_max",
    				value: "6"
    			},
    			$$inline: true
    		});

    	const fieldgroup7 = new SheetFieldGroup({
    			props: {
    				left: true,
    				id: "vigor",
    				label: "Current",
    				count: "2"
    			},
    			$$inline: true
    		});

    	const fieldgroup8 = new SheetFieldGroup({
    			props: {
    				right: true,
    				id: "vigor_max",
    				label: "Capacity",
    				count: "2"
    			},
    			$$inline: true
    		});

    	const fieldgroup9 = new SheetFieldGroup({
    			props: {
    				left: true,
    				id: "resolve",
    				label: "Current",
    				count: "2"
    			},
    			$$inline: true
    		});

    	const fieldgroup10 = new SheetFieldGroup({
    			props: {
    				right: true,
    				id: "resolve_max",
    				label: "Capacity",
    				count: "2"
    			},
    			$$inline: true
    		});

    	const fieldgroup11 = new SheetFieldGroup({
    			props: {
    				left: true,
    				id: "favor",
    				label: "Current",
    				count: "2"
    			},
    			$$inline: true
    		});

    	const fieldgroup12 = new SheetFieldGroup({
    			props: {
    				right: true,
    				id: "favor_max",
    				label: "Capacity",
    				count: "2"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "Health";
    			t1 = space();
    			create_component(fieldgroup0.$$.fragment);
    			t2 = space();
    			create_component(fieldgroup1.$$.fragment);
    			t3 = space();
    			create_component(fieldgroup2.$$.fragment);
    			t4 = space();
    			create_component(fieldgroup3.$$.fragment);
    			t5 = space();
    			create_component(fieldgroup4.$$.fragment);
    			t6 = space();
    			create_component(fieldgroup5.$$.fragment);
    			t7 = space();
    			create_component(fieldgroup6.$$.fragment);
    			t8 = space();
    			create_component(field0.$$.fragment);
    			t9 = space();
    			create_component(field1.$$.fragment);
    			t10 = space();
    			div0 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Vigor";
    			t12 = space();
    			create_component(fieldgroup7.$$.fragment);
    			t13 = space();
    			create_component(fieldgroup8.$$.fragment);
    			t14 = space();
    			div1 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Resolve";
    			t16 = space();
    			create_component(fieldgroup9.$$.fragment);
    			t17 = space();
    			create_component(fieldgroup10.$$.fragment);
    			t18 = space();
    			div2 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Favor";
    			t20 = space();
    			create_component(fieldgroup11.$$.fragment);
    			t21 = space();
    			create_component(fieldgroup12.$$.fragment);
    			attr_dev(h30, "class", "svelte-tnhjdp");
    			add_location(h30, file$k, 28, 2, 1339);
    			attr_dev(h31, "class", "svelte-tnhjdp");
    			add_location(h31, file$k, 44, 4, 1971);
    			attr_dev(div0, "class", "svelte-tnhjdp");
    			add_location(div0, file$k, 43, 2, 1960);
    			attr_dev(h32, "class", "svelte-tnhjdp");
    			add_location(h32, file$k, 50, 4, 2142);
    			attr_dev(div1, "class", "svelte-tnhjdp");
    			add_location(div1, file$k, 49, 2, 2131);
    			attr_dev(h33, "class", "svelte-tnhjdp");
    			add_location(h33, file$k, 56, 4, 2319);
    			attr_dev(div2, "class", "svelte-tnhjdp");
    			add_location(div2, file$k, 55, 2, 2308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(fieldgroup0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(fieldgroup1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(fieldgroup2, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(fieldgroup3, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(fieldgroup4, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(fieldgroup5, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(fieldgroup6, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(field0, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h31);
    			append_dev(div0, t12);
    			mount_component(fieldgroup7, div0, null);
    			append_dev(div0, t13);
    			mount_component(fieldgroup8, div0, null);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h32);
    			append_dev(div1, t16);
    			mount_component(fieldgroup9, div1, null);
    			append_dev(div1, t17);
    			mount_component(fieldgroup10, div1, null);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h33);
    			append_dev(div2, t20);
    			mount_component(fieldgroup11, div2, null);
    			append_dev(div2, t21);
    			mount_component(fieldgroup12, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fieldgroup0.$$.fragment, local);
    			transition_in(fieldgroup1.$$.fragment, local);
    			transition_in(fieldgroup2.$$.fragment, local);
    			transition_in(fieldgroup3.$$.fragment, local);
    			transition_in(fieldgroup4.$$.fragment, local);
    			transition_in(fieldgroup5.$$.fragment, local);
    			transition_in(fieldgroup6.$$.fragment, local);
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(fieldgroup7.$$.fragment, local);
    			transition_in(fieldgroup8.$$.fragment, local);
    			transition_in(fieldgroup9.$$.fragment, local);
    			transition_in(fieldgroup10.$$.fragment, local);
    			transition_in(fieldgroup11.$$.fragment, local);
    			transition_in(fieldgroup12.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fieldgroup0.$$.fragment, local);
    			transition_out(fieldgroup1.$$.fragment, local);
    			transition_out(fieldgroup2.$$.fragment, local);
    			transition_out(fieldgroup3.$$.fragment, local);
    			transition_out(fieldgroup4.$$.fragment, local);
    			transition_out(fieldgroup5.$$.fragment, local);
    			transition_out(fieldgroup6.$$.fragment, local);
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(fieldgroup7.$$.fragment, local);
    			transition_out(fieldgroup8.$$.fragment, local);
    			transition_out(fieldgroup9.$$.fragment, local);
    			transition_out(fieldgroup10.$$.fragment, local);
    			transition_out(fieldgroup11.$$.fragment, local);
    			transition_out(fieldgroup12.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			destroy_component(fieldgroup0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(fieldgroup1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(fieldgroup2, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(fieldgroup3, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(fieldgroup4, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(fieldgroup5, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(fieldgroup6, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div0);
    			destroy_component(fieldgroup7);
    			destroy_component(fieldgroup8);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div1);
    			destroy_component(fieldgroup9);
    			destroy_component(fieldgroup10);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div2);
    			destroy_component(fieldgroup11);
    			destroy_component(fieldgroup12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(28:0) <Box id=\\\"pools\\\" label=\\\"Resource Pools\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "pools",
    				label: "Resource Pools",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetPools extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetPools",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\layout\section-character\SheetTechniques.svelte generated by Svelte v3.16.0 */
    const file$l = "src\\layout\\section-character\\SheetTechniques.svelte";

    // (118:4) <TableItem type="drawer" id="movebuttons">
    function create_default_slot_3$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const field0 = new SheetField({
    			props: {
    				id: "technique-attackroll",
    				button: `@{technique-attackmacro}`,
    				label: "Use Technique"
    			},
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				id: "technique-damageroll",
    				button: `@{technique-damagemacro}`,
    				label: "Roll Damage"
    			},
    			$$inline: true
    		});

    	const field2 = new SheetField({
    			props: {
    				hidden: true,
    				id: "technique-attackmacro"
    			},
    			$$inline: true
    		});

    	const field3 = new SheetField({
    			props: {
    				hidden: true,
    				id: "technique-damagemacro"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			create_component(field3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(field2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(field3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(field2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(field3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(118:4) <TableItem type=\\\"drawer\\\" id=\\\"movebuttons\\\">",
    		ctx
    	});

    	return block;
    }

    // (130:4) <TableItem type="drawer">
    function create_default_slot_2$3(ctx) {
    	let t0;
    	let ul;
    	let t1;
    	let li;
    	let span;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "technique-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "technique-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t0 = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			t1 = space();
    			li = element("li");
    			span = element("span");
    			span.textContent = "...";
    			attr_dev(span, "name", "attr_technique-id");
    			add_location(span, file$l, 140, 10, 8018);
    			attr_dev(li, "class", "sheet-id");
    			attr_dev(li, "title", "Copy this ID to reference this technique when writing macros");
    			add_location(li, file$l, 137, 8, 7894);
    			add_location(ul, file$l, 131, 6, 7747);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			append_dev(ul, t1);
    			append_dev(ul, li);
    			append_dev(li, span);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(130:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (110:2) <Table id="techniques" {header} repeat>
    function create_default_slot_1$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "technique-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "technique" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "technique-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "technique-mastery" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "technique-parent" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: { type: "text", id: "technique-vigor" },
    			$$inline: true
    		});

    	const tableitem5 = new SheetTableItem({
    			props: { type: "text", id: "technique-lapse" },
    			$$inline: true
    		});

    	const tableitem6 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				id: "movebuttons",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const tableitem7 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    			t4 = space();
    			create_component(tableitem4.$$.fragment);
    			t5 = space();
    			create_component(tableitem5.$$.fragment);
    			t6 = space();
    			create_component(tableitem6.$$.fragment);
    			t7 = space();
    			create_component(tableitem7.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem4, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(tableitem5, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(tableitem6, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(tableitem7, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem6_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem6_changes.$$scope = { dirty, ctx };
    			}

    			tableitem6.$set(tableitem6_changes);
    			const tableitem7_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem7_changes.$$scope = { dirty, ctx };
    			}

    			tableitem7.$set(tableitem7_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			transition_in(tableitem5.$$.fragment, local);
    			transition_in(tableitem6.$$.fragment, local);
    			transition_in(tableitem7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			transition_out(tableitem5.$$.fragment, local);
    			transition_out(tableitem6.$$.fragment, local);
    			transition_out(tableitem7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem4, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(tableitem5, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(tableitem6, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(tableitem7, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(110:2) <Table id=\\\"techniques\\\" {header} repeat>",
    		ctx
    	});

    	return block;
    }

    // (109:0) <Box id="techniques" label="Techniques" boxed hasToggle>
    function create_default_slot$7(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "techniques",
    				header: /*header*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(109:0) <Box id=\\\"techniques\\\" label=\\\"Techniques\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "techniques",
    				label: "Techniques",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self) {
    	let header = [
    		{ type: "toggle" },
    		{ label: "Technique" },
    		{ label: "Mast." },
    		{ label: "Parent" },
    		{ label: "Vigor" },
    		{ label: "Lapse" }
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	return [header];
    }

    class SheetTechniques extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetTechniques",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\layout\section-character\SheetPrayers.svelte generated by Svelte v3.16.0 */
    const file$m = "src\\layout\\section-character\\SheetPrayers.svelte";

    // (101:4) <TableItem type="drawer" id="movebuttons">
    function create_default_slot_3$2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const field0 = new SheetField({
    			props: {
    				id: "prayer-attackroll",
    				button: `@{prayer-attackmacro}`,
    				label: "Use Ability"
    			},
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				id: "prayer-damageroll",
    				button: `@{prayer-damagemacro}`,
    				label: "Roll Damage"
    			},
    			$$inline: true
    		});

    	const field2 = new SheetField({
    			props: { hidden: true, id: "prayer-attackmacro" },
    			$$inline: true
    		});

    	const field3 = new SheetField({
    			props: { hidden: true, id: "prayer-damagemacro" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			create_component(field3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(field2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(field3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(field2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(field3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(101:4) <TableItem type=\\\"drawer\\\" id=\\\"movebuttons\\\">",
    		ctx
    	});

    	return block;
    }

    // (113:4) <TableItem type="drawer">
    function create_default_slot_2$4(ctx) {
    	let t0;
    	let ul;
    	let t1;
    	let li;
    	let span;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "prayer-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "prayer-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t0 = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			t1 = space();
    			li = element("li");
    			span = element("span");
    			span.textContent = "...";
    			attr_dev(span, "name", "attr_prayer-id");
    			add_location(span, file$m, 123, 10, 6954);
    			attr_dev(li, "class", "sheet-id");
    			attr_dev(li, "title", "Copy this ID to reference this prayer when writing macros");
    			add_location(li, file$m, 120, 8, 6833);
    			add_location(ul, file$m, 114, 6, 6689);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			append_dev(ul, t1);
    			append_dev(ul, li);
    			append_dev(li, span);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(113:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (94:2) <Table id="prayers" {header} repeat>
    function create_default_slot_1$4(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "prayer-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "prayer" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "prayer-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "prayer-parent" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "prayer-cost" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: { type: "text", id: "prayer-act" },
    			$$inline: true
    		});

    	const tableitem5 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				id: "movebuttons",
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const tableitem6 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    			t4 = space();
    			create_component(tableitem4.$$.fragment);
    			t5 = space();
    			create_component(tableitem5.$$.fragment);
    			t6 = space();
    			create_component(tableitem6.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem4, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(tableitem5, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(tableitem6, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem5_changes.$$scope = { dirty, ctx };
    			}

    			tableitem5.$set(tableitem5_changes);
    			const tableitem6_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem6_changes.$$scope = { dirty, ctx };
    			}

    			tableitem6.$set(tableitem6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			transition_in(tableitem5.$$.fragment, local);
    			transition_in(tableitem6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			transition_out(tableitem5.$$.fragment, local);
    			transition_out(tableitem6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem4, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(tableitem5, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(tableitem6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(94:2) <Table id=\\\"prayers\\\" {header} repeat>",
    		ctx
    	});

    	return block;
    }

    // (93:0) <Box id="abilities" label="Abilities" boxed hasOptions hasToggle>
    function create_default_slot$8(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "prayers",
    				header: /*header*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(93:0) <Box id=\\\"abilities\\\" label=\\\"Abilities\\\" boxed hasOptions hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "abilities",
    				label: "Abilities",
    				boxed: true,
    				hasOptions: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self) {
    	let header = [
    		{ type: "toggle" },
    		{ label: "Prayer" },
    		{ label: "Parent" },
    		{ label: "Favor" },
    		{ label: "Act." }
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	return [header];
    }

    class SheetPrayers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetPrayers",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src\layout\section-character\SheetEquipped.svelte generated by Svelte v3.16.0 */
    const file$n = "src\\layout\\section-character\\SheetEquipped.svelte";

    // (314:4) <TableItem type="drawer">
    function create_default_slot_10(ctx) {
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "armor-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(314:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (308:2) <Table id="armor" header={header1} repeat>
    function create_default_slot_9(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "armor" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "armor-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "armor-loc" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "armor-dr" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: { type: "text", id: "armor-weight" },
    			$$inline: true
    		});

    	const tableitem5 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tableitem0.$$.fragment);
    			t0 = space();
    			create_component(tableitem1.$$.fragment);
    			t1 = space();
    			create_component(tableitem2.$$.fragment);
    			t2 = space();
    			create_component(tableitem3.$$.fragment);
    			t3 = space();
    			create_component(tableitem4.$$.fragment);
    			t4 = space();
    			create_component(tableitem5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem5_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tableitem5_changes.$$scope = { dirty, ctx };
    			}

    			tableitem5.$set(tableitem5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			transition_in(tableitem5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			transition_out(tableitem5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(308:2) <Table id=\\\"armor\\\" header={header1} repeat>",
    		ctx
    	});

    	return block;
    }

    // (333:6) <Field selectbox id="weapon-type" label="Type">
    function create_default_slot_8(ctx) {
    	let option0;
    	let t1;
    	let option1;
    	let t3;
    	let option2;
    	let t5;
    	let option3;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "Choose...";
    			t1 = space();
    			option1 = element("option");
    			option1.textContent = "Melee";
    			t3 = space();
    			option2 = element("option");
    			option2.textContent = "Ranged";
    			t5 = space();
    			option3 = element("option");
    			option3.textContent = "Shield";
    			option0.selected = true;
    			option0.__value = "Choose...";
    			option0.value = option0.__value;
    			add_location(option0, file$n, 333, 8, 19685);
    			option1.__value = "melee";
    			option1.value = option1.__value;
    			add_location(option1, file$n, 334, 8, 19730);
    			option2.__value = "ranged";
    			option2.value = option2.__value;
    			add_location(option2, file$n, 335, 8, 19776);
    			option3.__value = "shield";
    			option3.value = option3.__value;
    			add_location(option3, file$n, 336, 8, 19824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, option1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, option2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, option3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(option1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(option2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(option3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(333:6) <Field selectbox id=\\\"weapon-type\\\" label=\\\"Type\\\">",
    		ctx
    	});

    	return block;
    }

    // (331:4) <TableItem type="drawer" id="weapondetails">
    function create_default_slot_7(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let current;

    	const field0 = new SheetField({
    			props: { hidden: true, id: "weapon-type" },
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				selectbox: true,
    				id: "weapon-type",
    				label: "Type",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const field2 = new SheetField({
    			props: {
    				id: "weapon-swing",
    				label: "Swing",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field3 = new SheetField({
    			props: {
    				id: "weapon-thrust",
    				label: "Thrust",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field4 = new SheetField({
    			props: {
    				id: "weapon-throw",
    				label: "Throw",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field5 = new SheetField({
    			props: {
    				id: "weapon-parry",
    				label: "Parry",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field6 = new SheetField({
    			props: {
    				id: "weapon-block",
    				label: "Block",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field7 = new SheetField({
    			props: {
    				id: "weapon-shoot",
    				label: "Shoot",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field8 = new SheetField({
    			props: {
    				id: "weapon-acc",
    				label: "Acc.",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field9 = new SheetField({
    			props: {
    				id: "weapon-block",
    				label: "Block",
    				value: "+0"
    			},
    			$$inline: true
    		});

    	const field10 = new SheetField({
    			props: { id: "weapon-dr", label: "DR", value: "0" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			create_component(field3.$$.fragment);
    			t3 = space();
    			create_component(field4.$$.fragment);
    			t4 = space();
    			create_component(field5.$$.fragment);
    			t5 = space();
    			create_component(field6.$$.fragment);
    			t6 = space();
    			create_component(field7.$$.fragment);
    			t7 = space();
    			create_component(field8.$$.fragment);
    			t8 = space();
    			create_component(field9.$$.fragment);
    			t9 = space();
    			create_component(field10.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(field2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(field3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(field4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(field5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(field6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(field7, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(field8, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(field9, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(field10, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const field1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				field1_changes.$$scope = { dirty, ctx };
    			}

    			field1.$set(field1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			transition_in(field4.$$.fragment, local);
    			transition_in(field5.$$.fragment, local);
    			transition_in(field6.$$.fragment, local);
    			transition_in(field7.$$.fragment, local);
    			transition_in(field8.$$.fragment, local);
    			transition_in(field9.$$.fragment, local);
    			transition_in(field10.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			transition_out(field4.$$.fragment, local);
    			transition_out(field5.$$.fragment, local);
    			transition_out(field6.$$.fragment, local);
    			transition_out(field7.$$.fragment, local);
    			transition_out(field8.$$.fragment, local);
    			transition_out(field9.$$.fragment, local);
    			transition_out(field10.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(field2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(field3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(field4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(field5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(field6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(field7, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(field8, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(field9, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(field10, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(331:4) <TableItem type=\\\"drawer\\\" id=\\\"weapondetails\\\">",
    		ctx
    	});

    	return block;
    }

    // (352:4) <TableItem type="drawer" id="attackbuttons">
    function create_default_slot_6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const field0 = new SheetField({
    			props: {
    				id: "weapon-attackroll",
    				button: `@{weapon-attackmacro}`,
    				label: "Attack"
    			},
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				id: "weapon-attackroll",
    				button: `@{weapon-defensemacro}`,
    				label: "Defense"
    			},
    			$$inline: true
    		});

    	const field2 = new SheetField({
    			props: {
    				id: "weapon-damageroll",
    				button: `@{weapon-damagemacro}`,
    				label: "Damage"
    			},
    			$$inline: true
    		});

    	const field3 = new SheetField({
    			props: { hidden: true, id: "weapon-attackmacro" },
    			$$inline: true
    		});

    	const field4 = new SheetField({
    			props: { hidden: true, id: "weapon-defensemacro" },
    			$$inline: true
    		});

    	const field5 = new SheetField({
    			props: { hidden: true, id: "weapon-damagemacro" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			create_component(field3.$$.fragment);
    			t3 = space();
    			create_component(field4.$$.fragment);
    			t4 = space();
    			create_component(field5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(field2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(field3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(field4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(field5, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			transition_in(field4.$$.fragment, local);
    			transition_in(field5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			transition_out(field4.$$.fragment, local);
    			transition_out(field5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(field2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(field3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(field4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(field5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(352:4) <TableItem type=\\\"drawer\\\" id=\\\"attackbuttons\\\">",
    		ctx
    	});

    	return block;
    }

    // (369:4) <TableItem type="drawer">
    function create_default_slot_5(ctx) {
    	let t0;
    	let ul;
    	let t1;
    	let li;
    	let span;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "weapon-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "weapon-offhand",
    				label: "Mark as an 'off-hand' weapon",
    				style: "small",
    				value: "-2",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t0 = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			t1 = space();
    			li = element("li");
    			span = element("span");
    			span.textContent = "...";
    			attr_dev(span, "name", "attr_weapon-id");
    			add_location(span, file$n, 380, 10, 21463);
    			attr_dev(li, "class", "sheet-id");
    			attr_dev(li, "title", "Copy this ID to reference this weapon when writing macros");
    			add_location(li, file$n, 377, 8, 21342);
    			add_location(ul, file$n, 370, 6, 21161);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			append_dev(ul, t1);
    			append_dev(ul, li);
    			append_dev(li, span);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(369:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (319:2) <Table id="weapons" header={header2} repeat>
    function create_default_slot_4(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let current;

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "weapon" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "weapon-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "weapon-damage" },
    			$$inline: true
    		});

    	const field0 = new SheetField({
    			props: {
    				hidden: true,
    				id: "weapon-damage1",
    				value: "N/A"
    			},
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				hidden: true,
    				id: "weapon-damage2",
    				value: "N/A"
    			},
    			$$inline: true
    		});

    	const field2 = new SheetField({
    			props: {
    				hidden: true,
    				id: "weapon-damage3",
    				value: "N/A"
    			},
    			$$inline: true
    		});

    	const field3 = new SheetField({
    			props: {
    				hidden: true,
    				id: "weapon-damage1_max",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const field4 = new SheetField({
    			props: {
    				hidden: true,
    				id: "weapon-damage2_max",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const field5 = new SheetField({
    			props: {
    				hidden: true,
    				id: "weapon-damage3_max",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "weapon-weight" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				id: "weapondetails",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const tableitem5 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				id: "attackbuttons",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const tableitem6 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tableitem0.$$.fragment);
    			t0 = space();
    			create_component(tableitem1.$$.fragment);
    			t1 = space();
    			create_component(tableitem2.$$.fragment);
    			t2 = space();
    			create_component(field0.$$.fragment);
    			t3 = space();
    			create_component(field1.$$.fragment);
    			t4 = space();
    			create_component(field2.$$.fragment);
    			t5 = space();
    			create_component(field3.$$.fragment);
    			t6 = space();
    			create_component(field4.$$.fragment);
    			t7 = space();
    			create_component(field5.$$.fragment);
    			t8 = space();
    			create_component(tableitem3.$$.fragment);
    			t9 = space();
    			create_component(tableitem4.$$.fragment);
    			t10 = space();
    			create_component(tableitem5.$$.fragment);
    			t11 = space();
    			create_component(tableitem6.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(field0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(field2, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(field3, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(field4, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(field5, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(tableitem4, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(tableitem5, target, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(tableitem6, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem4_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tableitem4_changes.$$scope = { dirty, ctx };
    			}

    			tableitem4.$set(tableitem4_changes);
    			const tableitem5_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tableitem5_changes.$$scope = { dirty, ctx };
    			}

    			tableitem5.$set(tableitem5_changes);
    			const tableitem6_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tableitem6_changes.$$scope = { dirty, ctx };
    			}

    			tableitem6.$set(tableitem6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			transition_in(field4.$$.fragment, local);
    			transition_in(field5.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			transition_in(tableitem5.$$.fragment, local);
    			transition_in(tableitem6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			transition_out(field4.$$.fragment, local);
    			transition_out(field5.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			transition_out(tableitem5.$$.fragment, local);
    			transition_out(tableitem6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(field2, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(field3, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(field4, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(field5, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(tableitem4, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(tableitem5, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(tableitem6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(319:2) <Table id=\\\"weapons\\\" header={header2} repeat>",
    		ctx
    	});

    	return block;
    }

    // (393:4) <TableItem type="drawer">
    function create_default_slot_3$3(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "item-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "item-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$n, 394, 6, 21923);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(393:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (387:2) <Table id="items" header={header3} repeat>
    function create_default_slot_2$5(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "item-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "item" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "item-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "item-quantity" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "item-weight" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    			t4 = space();
    			create_component(tableitem4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem4_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				tableitem4_changes.$$scope = { dirty, ctx };
    			}

    			tableitem4.$set(tableitem4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(387:2) <Table id=\\\"items\\\" header={header3} repeat>",
    		ctx
    	});

    	return block;
    }

    // (405:2) <Table id="combatload" header={header4}>
    function create_default_slot_1$5(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const field0 = new SheetField({
    			props: {
    				hidden: true,
    				id: "armor-totalweight",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				hidden: true,
    				id: "weapons-totalweight",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const field2 = new SheetField({
    			props: {
    				hidden: true,
    				id: "items-totalweight",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "text", id: "combatload-max" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "combatload-lvl" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "combatload-cur" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			create_component(tableitem0.$$.fragment);
    			t3 = space();
    			create_component(tableitem1.$$.fragment);
    			t4 = space();
    			create_component(tableitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(field2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(field2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(405:2) <Table id=\\\"combatload\\\" header={header4}>",
    		ctx
    	});

    	return block;
    }

    // (307:0) <Box id="equipped" label="Equipped items" boxed hasToggle>
    function create_default_slot$9(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const table0 = new SheetTable({
    			props: {
    				id: "armor",
    				header: /*header1*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table1 = new SheetTable({
    			props: {
    				id: "weapons",
    				header: /*header2*/ ctx[1],
    				repeat: true,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table2 = new SheetTable({
    			props: {
    				id: "items",
    				header: /*header3*/ ctx[2],
    				repeat: true,
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table3 = new SheetTable({
    			props: {
    				id: "combatload",
    				header: /*header4*/ ctx[3],
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table0.$$.fragment);
    			t0 = space();
    			create_component(table1.$$.fragment);
    			t1 = space();
    			create_component(table2.$$.fragment);
    			t2 = space();
    			create_component(table3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(table1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(table2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(table3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table0_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				table0_changes.$$scope = { dirty, ctx };
    			}

    			table0.$set(table0_changes);
    			const table1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				table1_changes.$$scope = { dirty, ctx };
    			}

    			table1.$set(table1_changes);
    			const table2_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				table2_changes.$$scope = { dirty, ctx };
    			}

    			table2.$set(table2_changes);
    			const table3_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				table3_changes.$$scope = { dirty, ctx };
    			}

    			table3.$set(table3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table0.$$.fragment, local);
    			transition_in(table1.$$.fragment, local);
    			transition_in(table2.$$.fragment, local);
    			transition_in(table3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table0.$$.fragment, local);
    			transition_out(table1.$$.fragment, local);
    			transition_out(table2.$$.fragment, local);
    			transition_out(table3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(table1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(table2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(table3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(307:0) <Box id=\\\"equipped\\\" label=\\\"Equipped items\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "equipped",
    				label: "Equipped items",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self) {
    	let header1 = [
    		{ type: "toggle" },
    		{ label: "Armor" },
    		{ label: "Location" },
    		{ label: "DR" },
    		{ label: "Lbs." }
    	];

    	let header2 = [
    		{ type: "toggle" },
    		{
    			label: "Weapon",
    			tooltip: "Be sure to select the weapon's type (i.e. 'melee,' or 'ranged') by opening the weapon details section (via the circle icon to the left) and changing the dropdown"
    		},
    		{
    			label: "Damage",
    			tooltip: "Enter the weapon's base damage after minimum ST adjustments. Please include the weapon's damage types (i.e. 'S/P/I') in parenthesis to have the 'damage roll' macro auto-adjust for damge type"
    		},
    		{ label: "Lbs." }
    	];

    	let header3 = [{ type: "toggle" }, { label: "Item" }, { label: "Qty." }, { label: "Lbs." }];

    	let header4 = [
    		{
    			label: "Combat Load",
    			tooltip: "This value is auto-calculated based on ST level. It does not consider advantages you may have, but can be adjusted manually if needed"
    		},
    		{
    			label: "Encumb. Level",
    			tooltip: "This value is auto-calculated based on the 'combat load' and 'weight carried' fields"
    		},
    		{
    			label: "Weight Carried",
    			tooltip: "This value is auto-calculated from the items listed in the 'Equipped Items' table"
    		}
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header1" in $$props) $$invalidate(0, header1 = $$props.header1);
    		if ("header2" in $$props) $$invalidate(1, header2 = $$props.header2);
    		if ("header3" in $$props) $$invalidate(2, header3 = $$props.header3);
    		if ("header4" in $$props) $$invalidate(3, header4 = $$props.header4);
    	};

    	return [header1, header2, header3, header4];
    }

    class SheetEquipped extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetEquipped",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src\layout\section-character\SheetInventory.svelte generated by Svelte v3.16.0 */
    const file$o = "src\\layout\\section-character\\SheetInventory.svelte";

    // (109:4) <TableItem type="drawer">
    function create_default_slot_3$4(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "item-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "item-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$o, 110, 6, 6223);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(109:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (103:2) <Table id="otheritems" header={header1} repeat>
    function create_default_slot_2$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "item-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "item" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "item-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "item-quantity" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "item-weight" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    			t4 = space();
    			create_component(tableitem4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem4_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				tableitem4_changes.$$scope = { dirty, ctx };
    			}

    			tableitem4.$set(tableitem4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$6.name,
    		type: "slot",
    		source: "(103:2) <Table id=\\\"otheritems\\\" header={header1} repeat>",
    		ctx
    	});

    	return block;
    }

    // (121:2) <Table id="travelload" header={header2}>
    function create_default_slot_1$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const field = new SheetField({
    			props: {
    				hidden: true,
    				id: "otheritems-totalweight",
    				value: "0"
    			},
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "text", id: "travelload-max" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "travelload-lvl" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "travelload-cur" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(121:2) <Table id=\\\"travelload\\\" header={header2}>",
    		ctx
    	});

    	return block;
    }

    // (102:0) <Box id="inventory" label="Other items" boxed hasToggle>
    function create_default_slot$a(ctx) {
    	let t;
    	let current;

    	const table0 = new SheetTable({
    			props: {
    				id: "otheritems",
    				header: /*header1*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_2$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table1 = new SheetTable({
    			props: {
    				id: "travelload",
    				header: /*header2*/ ctx[1],
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table0.$$.fragment);
    			t = space();
    			create_component(table1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(table1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				table0_changes.$$scope = { dirty, ctx };
    			}

    			table0.$set(table0_changes);
    			const table1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				table1_changes.$$scope = { dirty, ctx };
    			}

    			table1.$set(table1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table0.$$.fragment, local);
    			transition_in(table1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table0.$$.fragment, local);
    			transition_out(table1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(table1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(102:0) <Box id=\\\"inventory\\\" label=\\\"Other items\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "inventory",
    				label: "Other items",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self) {
    	let header1 = [{ type: "toggle" }, { label: "Item" }, { label: "Qty." }, { label: "Lbs." }];

    	let header2 = [
    		{
    			label: "Travel Load",
    			tooltip: "This value is auto-calculated based on SM level. It does not consider advantages you may have, but can be adjusted manually if needed"
    		},
    		{
    			label: "Encumb. Level",
    			tooltip: "This value is auto-calculated based on the 'travel load' and 'weight carried' fields"
    		},
    		{
    			label: "Weight Carried",
    			tooltip: "This value is auto-calculated from the items listed in both the 'Equipped Items' and 'Other Items' tables"
    		}
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header1" in $$props) $$invalidate(0, header1 = $$props.header1);
    		if ("header2" in $$props) $$invalidate(1, header2 = $$props.header2);
    	};

    	return [header1, header2];
    }

    class SheetInventory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetInventory",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src\layout\section-character\SheetManeuvers.svelte generated by Svelte v3.16.0 */

    // (20:0) <Box id="maneuvers" label="Maneuvers">
    function create_default_slot$b(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current;

    	const maneuverbox0 = new SheetManeuverBox({
    			props: {
    				id: "swing",
    				name: "Swing",
    				type: "attack"
    			},
    			$$inline: true
    		});

    	const maneuverbox1 = new SheetManeuverBox({
    			props: {
    				id: "thrust",
    				name: "Thrust",
    				type: "attack"
    			},
    			$$inline: true
    		});

    	const maneuverbox2 = new SheetManeuverBox({
    			props: {
    				id: "throw",
    				name: "Throw",
    				type: "attack"
    			},
    			$$inline: true
    		});

    	const maneuverbox3 = new SheetManeuverBox({
    			props: {
    				id: "shoot",
    				name: "Shoot",
    				type: "attack"
    			},
    			$$inline: true
    		});

    	const maneuverbox4 = new SheetManeuverBox({
    			props: {
    				id: "parry",
    				name: "Parry",
    				type: "defense"
    			},
    			$$inline: true
    		});

    	const maneuverbox5 = new SheetManeuverBox({
    			props: {
    				id: "block",
    				name: "Block",
    				type: "defense"
    			},
    			$$inline: true
    		});

    	const maneuverbox6 = new SheetManeuverBox({
    			props: {
    				id: "evade",
    				name: "Evade",
    				type: "defense",
    				parent: "SP",
    				disabled: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(maneuverbox0.$$.fragment);
    			t0 = space();
    			create_component(maneuverbox1.$$.fragment);
    			t1 = space();
    			create_component(maneuverbox2.$$.fragment);
    			t2 = space();
    			create_component(maneuverbox3.$$.fragment);
    			t3 = space();
    			create_component(maneuverbox4.$$.fragment);
    			t4 = space();
    			create_component(maneuverbox5.$$.fragment);
    			t5 = space();
    			create_component(maneuverbox6.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(maneuverbox0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(maneuverbox1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(maneuverbox2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(maneuverbox3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(maneuverbox4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(maneuverbox5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(maneuverbox6, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maneuverbox0.$$.fragment, local);
    			transition_in(maneuverbox1.$$.fragment, local);
    			transition_in(maneuverbox2.$$.fragment, local);
    			transition_in(maneuverbox3.$$.fragment, local);
    			transition_in(maneuverbox4.$$.fragment, local);
    			transition_in(maneuverbox5.$$.fragment, local);
    			transition_in(maneuverbox6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maneuverbox0.$$.fragment, local);
    			transition_out(maneuverbox1.$$.fragment, local);
    			transition_out(maneuverbox2.$$.fragment, local);
    			transition_out(maneuverbox3.$$.fragment, local);
    			transition_out(maneuverbox4.$$.fragment, local);
    			transition_out(maneuverbox5.$$.fragment, local);
    			transition_out(maneuverbox6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(maneuverbox0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(maneuverbox1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(maneuverbox2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(maneuverbox3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(maneuverbox4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(maneuverbox5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(maneuverbox6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(20:0) <Box id=\\\"maneuvers\\\" label=\\\"Maneuvers\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "maneuvers",
    				label: "Maneuvers",
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetManeuvers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetManeuvers",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src\layout\section-character\SheetExpLog.svelte generated by Svelte v3.16.0 */
    const file$p = "src\\layout\\section-character\\SheetExpLog.svelte";

    // (87:4) <TableItem type="drawer">
    function create_default_slot_3$5(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "session-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "session-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$p, 88, 6, 5183);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$5.name,
    		type: "slot",
    		source: "(87:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:2) <Table id="sessionlog" header={header1} repeat>
    function create_default_slot_2$7(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "session-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "session" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "session-date" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "session-cap" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_3$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem3_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				tableitem3_changes.$$scope = { dirty, ctx };
    			}

    			tableitem3.$set(tableitem3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$7.name,
    		type: "slot",
    		source: "(82:2) <Table id=\\\"sessionlog\\\" header={header1} repeat>",
    		ctx
    	});

    	return block;
    }

    // (99:2) <Table id="caplog" header={header2}>
    function create_default_slot_1$7(ctx) {
    	let t;
    	let current;

    	const tableitem0 = new SheetTableItem({
    			props: { type: "text", id: "cap-unspent" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "cap-total" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tableitem0.$$.fragment);
    			t = space();
    			create_component(tableitem1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tableitem1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tableitem1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(99:2) <Table id=\\\"caplog\\\" header={header2}>",
    		ctx
    	});

    	return block;
    }

    // (81:0) <Box id="sessionlog" label="Experience" boxed hasToggle>
    function create_default_slot$c(ctx) {
    	let t;
    	let current;

    	const table0 = new SheetTable({
    			props: {
    				id: "sessionlog",
    				header: /*header1*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_2$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const table1 = new SheetTable({
    			props: {
    				id: "caplog",
    				header: /*header2*/ ctx[1],
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table0.$$.fragment);
    			t = space();
    			create_component(table1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(table1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				table0_changes.$$scope = { dirty, ctx };
    			}

    			table0.$set(table0_changes);
    			const table1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				table1_changes.$$scope = { dirty, ctx };
    			}

    			table1.$set(table1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table0.$$.fragment, local);
    			transition_in(table1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table0.$$.fragment, local);
    			transition_out(table1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(table1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(81:0) <Box id=\\\"sessionlog\\\" label=\\\"Experience\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "sessionlog",
    				label: "Experience",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self) {
    	let header1 = [{ type: "toggle" }, { label: "Session Date" }, { label: "CAP" }];
    	let header2 = [{ label: "Unspent CAP" }, { label: "Total CAP" }];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header1" in $$props) $$invalidate(0, header1 = $$props.header1);
    		if ("header2" in $$props) $$invalidate(1, header2 = $$props.header2);
    	};

    	return [header1, header2];
    }

    class SheetExpLog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetExpLog",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src\layout\section-party\PartyDetails.svelte generated by Svelte v3.16.0 */

    // (55:4) <TableItem type="drawer">
    function create_default_slot_2$8(ctx) {
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "party-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$8.name,
    		type: "slot",
    		source: "(55:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (51:2) <Table id="partymembers" header={header1} repeat>
    function create_default_slot_1$8(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "party" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "party-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "party-aka" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tableitem0.$$.fragment);
    			t0 = space();
    			create_component(tableitem1.$$.fragment);
    			t1 = space();
    			create_component(tableitem2.$$.fragment);
    			t2 = space();
    			create_component(tableitem3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem3_changes.$$scope = { dirty, ctx };
    			}

    			tableitem3.$set(tableitem3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$8.name,
    		type: "slot",
    		source: "(51:2) <Table id=\\\"partymembers\\\" header={header1} repeat>",
    		ctx
    	});

    	return block;
    }

    // (47:0) <Box id="partydetails" label="Details" boxed>
    function create_default_slot$d(ctx) {
    	let t0;
    	let t1;
    	let current;

    	const field0 = new SheetField({
    			props: {
    				id: "character-name",
    				label: "Party Name"
    			},
    			$$inline: true
    		});

    	const field1 = new SheetField({
    			props: {
    				id: "character-desc",
    				label: "Description",
    				textarea: true,
    				rows: "5"
    			},
    			$$inline: true
    		});

    	const table = new SheetTable({
    			props: {
    				id: "partymembers",
    				header: /*header1*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(field1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(field1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(47:0) <Box id=\\\"partydetails\\\" label=\\\"Details\\\" boxed>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "partydetails",
    				label: "Details",
    				boxed: true,
    				$$slots: { default: [create_default_slot$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self) {
    	let header1 = [
    		{ type: "toggle" },
    		{ label: "Party Members" },
    		{
    			label: "Played by",
    			tooltip: "Enter player names, discord names, etc."
    		}
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header1" in $$props) $$invalidate(0, header1 = $$props.header1);
    	};

    	return [header1];
    }

    class PartyDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PartyDetails",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src\layout\section-party\PartyAllies.svelte generated by Svelte v3.16.0 */
    const file$q = "src\\layout\\section-party\\PartyAllies.svelte";

    // (73:4) <TableItem type="drawer">
    function create_default_slot_2$9(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "ally-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "ally-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$q, 74, 6, 4184);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$9.name,
    		type: "slot",
    		source: "(73:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:2) <Table id="ally" header={header1} repeat>
    function create_default_slot_1$9(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "ally-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "ally" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "ally-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "ally-relationship" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem3_changes.$$scope = { dirty, ctx };
    			}

    			tableitem3.$set(tableitem3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$9.name,
    		type: "slot",
    		source: "(68:2) <Table id=\\\"ally\\\" header={header1} repeat>",
    		ctx
    	});

    	return block;
    }

    // (67:0) <Box id="allies" label="Known NPCs/Organizations" boxed hasToggle>
    function create_default_slot$e(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "ally",
    				header: /*header1*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(67:0) <Box id=\\\"allies\\\" label=\\\"Known NPCs/Organizations\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "allies",
    				label: "Known NPCs/Organizations",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self) {
    	let header1 = [
    		{ type: "toggle" },
    		{ label: "NPC/Organization Name" },
    		{
    			label: "Relationship",
    			tooltip: "Enter your relationship to the NPC or Organization here — Friendly, Neutral, Enemy, etc."
    		}
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header1" in $$props) $$invalidate(0, header1 = $$props.header1);
    	};

    	return [header1];
    }

    class PartyAllies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PartyAllies",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src\layout\section-party\PartyQuests.svelte generated by Svelte v3.16.0 */
    const file$r = "src\\layout\\section-party\\PartyQuests.svelte";

    // (73:4) <TableItem type="drawer">
    function create_default_slot_2$a(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "quest-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "quest-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$r, 74, 6, 4136);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$a.name,
    		type: "slot",
    		source: "(73:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (68:2) <Table id="quest" header={header1} repeat>
    function create_default_slot_1$a(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "quest-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "quest" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "quest-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "quest-status" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem3_changes.$$scope = { dirty, ctx };
    			}

    			tableitem3.$set(tableitem3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$a.name,
    		type: "slot",
    		source: "(68:2) <Table id=\\\"quest\\\" header={header1} repeat>",
    		ctx
    	});

    	return block;
    }

    // (67:0) <Box id="quests" label="Quests" boxed hasToggle>
    function create_default_slot$f(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "quest",
    				header: /*header1*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$f.name,
    		type: "slot",
    		source: "(67:0) <Box id=\\\"quests\\\" label=\\\"Quests\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "quests",
    				label: "Quests",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$f] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self) {
    	let header1 = [
    		{ type: "toggle" },
    		{ label: "Quest Name" },
    		{
    			label: "Status",
    			tooltip: "Enter your overall progress on the quest here — Received, Started, Completed, etc."
    		}
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header1" in $$props) $$invalidate(0, header1 = $$props.header1);
    	};

    	return [header1];
    }

    class PartyQuests extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PartyQuests",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src\layout\section-party\PartyNotes.svelte generated by Svelte v3.16.0 */
    const file$s = "src\\layout\\section-party\\PartyNotes.svelte";

    // (52:4) <TableItem type="drawer">
    function create_default_slot_2$b(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "note-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "note-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$s, 53, 6, 3171);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$b.name,
    		type: "slot",
    		source: "(52:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (48:2) <Table id="note" {header} repeat>
    function create_default_slot_1$b(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "note-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "note" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "note-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem2_changes.$$scope = { dirty, ctx };
    			}

    			tableitem2.$set(tableitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$b.name,
    		type: "slot",
    		source: "(48:2) <Table id=\\\"note\\\" {header} repeat>",
    		ctx
    	});

    	return block;
    }

    // (47:0) <Box id="notes" label="Other Notes" boxed hasToggle>
    function create_default_slot$g(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "note",
    				header: /*header*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$g.name,
    		type: "slot",
    		source: "(47:0) <Box id=\\\"notes\\\" label=\\\"Other Notes\\\" boxed hasToggle>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "notes",
    				label: "Other Notes",
    				boxed: true,
    				hasToggle: true,
    				$$slots: { default: [create_default_slot$g] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self) {
    	let header = [{ type: "toggle" }, { label: "Note" }];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	return [header];
    }

    class PartyNotes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PartyNotes",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    /* src\layout\section-party\PartyInventory.svelte generated by Svelte v3.16.0 */
    const file$t = "src\\layout\\section-party\\PartyInventory.svelte";

    // (73:4) <TableItem type="drawer">
    function create_default_slot_2$c(ctx) {
    	let t;
    	let ul;
    	let current;

    	const field = new SheetField({
    			props: {
    				textarea: true,
    				id: "item-desc",
    				rows: "3"
    			},
    			$$inline: true
    		});

    	const toggle = new SheetToggle({
    			props: {
    				id: "partyitems-header",
    				label: "Mark as header",
    				style: "small",
    				wrap: "li"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    			t = space();
    			ul = element("ul");
    			create_component(toggle.$$.fragment);
    			add_location(ul, file$t, 74, 6, 4866);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);
    			mount_component(toggle, ul, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(toggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_component(toggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$c.name,
    		type: "slot",
    		source: "(73:4) <TableItem type=\\\"drawer\\\">",
    		ctx
    	});

    	return block;
    }

    // (67:2) <Table id="partyitems" header={header1} repeat>
    function create_default_slot_1$c(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const toggle = new SheetToggle({
    			props: { hidden: true, id: "partyitems-header" },
    			$$inline: true
    		});

    	const tableitem0 = new SheetTableItem({
    			props: { type: "toggle", id: "item" },
    			$$inline: true
    		});

    	const tableitem1 = new SheetTableItem({
    			props: { type: "text", id: "item-name" },
    			$$inline: true
    		});

    	const tableitem2 = new SheetTableItem({
    			props: { type: "text", id: "item-quantity" },
    			$$inline: true
    		});

    	const tableitem3 = new SheetTableItem({
    			props: { type: "text", id: "item-weight" },
    			$$inline: true
    		});

    	const tableitem4 = new SheetTableItem({
    			props: {
    				type: "drawer",
    				$$slots: { default: [create_default_slot_2$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toggle.$$.fragment);
    			t0 = space();
    			create_component(tableitem0.$$.fragment);
    			t1 = space();
    			create_component(tableitem1.$$.fragment);
    			t2 = space();
    			create_component(tableitem2.$$.fragment);
    			t3 = space();
    			create_component(tableitem3.$$.fragment);
    			t4 = space();
    			create_component(tableitem4.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tableitem0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tableitem1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tableitem2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tableitem3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(tableitem4, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tableitem4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				tableitem4_changes.$$scope = { dirty, ctx };
    			}

    			tableitem4.$set(tableitem4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(tableitem0.$$.fragment, local);
    			transition_in(tableitem1.$$.fragment, local);
    			transition_in(tableitem2.$$.fragment, local);
    			transition_in(tableitem3.$$.fragment, local);
    			transition_in(tableitem4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(tableitem0.$$.fragment, local);
    			transition_out(tableitem1.$$.fragment, local);
    			transition_out(tableitem2.$$.fragment, local);
    			transition_out(tableitem3.$$.fragment, local);
    			transition_out(tableitem4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tableitem0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tableitem1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tableitem2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tableitem3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(tableitem4, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$c.name,
    		type: "slot",
    		source: "(67:2) <Table id=\\\"partyitems\\\" header={header1} repeat>",
    		ctx
    	});

    	return block;
    }

    // (66:0) <Box id="partyinventory" label="Inventory" boxed>
    function create_default_slot$h(ctx) {
    	let current;

    	const table = new SheetTable({
    			props: {
    				id: "partyitems",
    				header: /*header1*/ ctx[0],
    				repeat: true,
    				$$slots: { default: [create_default_slot_1$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$h.name,
    		type: "slot",
    		source: "(66:0) <Box id=\\\"partyinventory\\\" label=\\\"Inventory\\\" boxed>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let current;

    	const box = new SheetBox({
    			props: {
    				id: "partyinventory",
    				label: "Inventory",
    				boxed: true,
    				$$slots: { default: [create_default_slot$h] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self) {
    	let header1 = [{ type: "toggle" }, { label: "Item" }, { label: "Qty." }, { label: "Lbs." }];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header1" in $$props) $$invalidate(0, header1 = $$props.header1);
    	};

    	return [header1];
    }

    class PartyInventory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PartyInventory",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src\layout\SheetRoot.svelte generated by Svelte v3.16.0 */

    const file$u = "src\\layout\\SheetRoot.svelte";

    // (169:4) <Section id="details">
    function create_default_slot_4$1(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const advantages = new SheetAdvantages({ $$inline: true });
    	const skills = new SheetSkills({ $$inline: true });
    	const notes = new SheetNotes({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(advantages.$$.fragment);
    			t0 = space();
    			create_component(skills.$$.fragment);
    			t1 = space();
    			create_component(notes.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(advantages, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(skills, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(notes, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(advantages.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			transition_in(notes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(advantages.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			transition_out(notes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(advantages, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(skills, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(notes, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(169:4) <Section id=\\\"details\\\">",
    		ctx
    	});

    	return block;
    }

    // (175:4) <Section id="moves">
    function create_default_slot_3$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const techniques = new SheetTechniques({ $$inline: true });
    	const prayers = new SheetPrayers({ $$inline: true });
    	const equipped = new SheetEquipped({ $$inline: true });
    	const inventory = new SheetInventory({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(techniques.$$.fragment);
    			t0 = space();
    			create_component(prayers.$$.fragment);
    			t1 = space();
    			create_component(equipped.$$.fragment);
    			t2 = space();
    			create_component(inventory.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(techniques, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(prayers, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(equipped, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(inventory, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(techniques.$$.fragment, local);
    			transition_in(prayers.$$.fragment, local);
    			transition_in(equipped.$$.fragment, local);
    			transition_in(inventory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(techniques.$$.fragment, local);
    			transition_out(prayers.$$.fragment, local);
    			transition_out(equipped.$$.fragment, local);
    			transition_out(inventory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(techniques, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(prayers, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(equipped, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(inventory, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$6.name,
    		type: "slot",
    		source: "(175:4) <Section id=\\\"moves\\\">",
    		ctx
    	});

    	return block;
    }

    // (164:2) <ModeContent mode="character">
    function create_default_slot_2$d(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	const attributes = new SheetAttributes({ $$inline: true });
    	const pools = new SheetPools({ $$inline: true });
    	const details = new SheetDetails({ $$inline: true });

    	const section0 = new SheetSection({
    			props: {
    				id: "details",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const section1 = new SheetSection({
    			props: {
    				id: "moves",
    				$$slots: { default: [create_default_slot_3$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const maneuvers = new SheetManeuvers({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(attributes.$$.fragment);
    			t0 = space();
    			create_component(pools.$$.fragment);
    			t1 = space();
    			create_component(details.$$.fragment);
    			t2 = space();
    			create_component(section0.$$.fragment);
    			t3 = space();
    			create_component(section1.$$.fragment);
    			t4 = space();
    			create_component(maneuvers.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(attributes, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(pools, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(details, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(maneuvers, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(attributes.$$.fragment, local);
    			transition_in(pools.$$.fragment, local);
    			transition_in(details.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(maneuvers.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(attributes.$$.fragment, local);
    			transition_out(pools.$$.fragment, local);
    			transition_out(details.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(maneuvers.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(attributes, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(pools, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(details, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(maneuvers, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$d.name,
    		type: "slot",
    		source: "(164:2) <ModeContent mode=\\\"character\\\">",
    		ctx
    	});

    	return block;
    }

    // (187:4) <Section id="notes">
    function create_default_slot_1$d(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const partyallies = new PartyAllies({ $$inline: true });
    	const partyquests = new PartyQuests({ $$inline: true });
    	const partynotes = new PartyNotes({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(partyallies.$$.fragment);
    			t0 = space();
    			create_component(partyquests.$$.fragment);
    			t1 = space();
    			create_component(partynotes.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(partyallies, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(partyquests, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(partynotes, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(partyallies.$$.fragment, local);
    			transition_in(partyquests.$$.fragment, local);
    			transition_in(partynotes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(partyallies.$$.fragment, local);
    			transition_out(partyquests.$$.fragment, local);
    			transition_out(partynotes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(partyallies, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(partyquests, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(partynotes, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$d.name,
    		type: "slot",
    		source: "(187:4) <Section id=\\\"notes\\\">",
    		ctx
    	});

    	return block;
    }

    // (185:2) <ModeContent mode="party">
    function create_default_slot$i(ctx) {
    	let t0;
    	let t1;
    	let current;
    	const partydetails = new PartyDetails({ $$inline: true });

    	const section = new SheetSection({
    			props: {
    				id: "notes",
    				$$slots: { default: [create_default_slot_1$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const partyinventory = new PartyInventory({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(partydetails.$$.fragment);
    			t0 = space();
    			create_component(section.$$.fragment);
    			t1 = space();
    			create_component(partyinventory.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(partydetails, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(section, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(partyinventory, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(partydetails.$$.fragment, local);
    			transition_in(section.$$.fragment, local);
    			transition_in(partyinventory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(partydetails.$$.fragment, local);
    			transition_out(section.$$.fragment, local);
    			transition_out(partyinventory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(partydetails, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(section, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(partyinventory, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$i.name,
    		type: "slot",
    		source: "(185:2) <ModeContent mode=\\\"party\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const field = new SheetField({
    			props: {
    				hidden: true,
    				id: "sheet_mode",
    				value: "character"
    			},
    			$$inline: true
    		});

    	const header = new SheetHeader({ $$inline: true });

    	const modecontent0 = new SheetModeContent({
    			props: {
    				mode: "character",
    				$$slots: { default: [create_default_slot_2$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modecontent1 = new SheetModeContent({
    			props: {
    				mode: "party",
    				$$slots: { default: [create_default_slot$i] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(field.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(modecontent0.$$.fragment);
    			t2 = space();
    			create_component(modecontent1.$$.fragment);
    			attr_dev(div, "class", "sheet-root");
    			add_location(div, file$u, 159, 0, 8712);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(field, div, null);
    			append_dev(div, t0);
    			mount_component(header, div, null);
    			append_dev(div, t1);
    			mount_component(modecontent0, div, null);
    			append_dev(div, t2);
    			mount_component(modecontent1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modecontent0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modecontent0_changes.$$scope = { dirty, ctx };
    			}

    			modecontent0.$set(modecontent0_changes);
    			const modecontent1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modecontent1_changes.$$scope = { dirty, ctx };
    			}

    			modecontent1.$set(modecontent1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(modecontent0.$$.fragment, local);
    			transition_in(modecontent1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(modecontent0.$$.fragment, local);
    			transition_out(modecontent1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(field);
    			destroy_component(header);
    			destroy_component(modecontent0);
    			destroy_component(modecontent1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SheetRoot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SheetRoot",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    // import Sheet from "./templates/TemplatesRoot.svelte";

    var main = new SheetRoot({
      target: document.querySelector(".charactersheet")
    });

    return main;

}());
//# sourceMappingURL=bundle.generated.js.map
