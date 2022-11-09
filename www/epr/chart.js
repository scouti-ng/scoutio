var TimeChart = function(t, e, s, i) {
    "use strict";

    function n(e) {
        const s = t.rgb(e);
        return [s.r / 255, s.g / 255, s.b / 255, s.opacity]
    }
    class o {
        constructor(t, e, s) {
            this.options = e;
            const i = document.createElement("canvas"),
                o = i.style;
            o.position = "absolute", o.width = o.height = "100%", o.left = o.right = o.top = o.bottom = "0", t.shadowRoot.appendChild(i), this.gl = function(t, e) {
                if (!e) {
                    const e = t.getContext("webgl2");
                    if (e) return e
                }
                const s = t.getContext("webgl");
                if (s) return s;
                throw new Error("Unable to initialize WebGL. Your browser or machine may not support it.")
            }(i, e.forceWebGL1);
            const a = n(e.backgroundColor);
            this.gl.clearColor(...a), this.canvas = i, s.updated.on((() => this.clear())), s.resized.on(((t, e) => this.onResize(t, e))), s.disposing.on((() => {
                t.shadowRoot.removeChild(i), i.width = 0, i.height = 0;
                const e = this.gl.getExtension("WEBGL_lose_context");
                e && e.loseContext()
            }))
        }
        onResize(t, e) {
            const s = this.canvas,
                i = this.options.pixelRatio;
            s.width = t * i, s.height = e * i, this.gl.viewport(0, 0, s.width, s.height)
        }
        clear() {
            const t = this.gl;
            t.clear(t.COLOR_BUFFER_BIT)
        }
    }
    class a {
        constructor(t, e, s) {
            this.node = document.createElement("div"), this.node.style.position = "absolute", this.node.style.left = `${s.paddingLeft}px`, this.node.style.right = `${s.paddingRight}px`, this.node.style.top = `${s.paddingTop}px`, this.node.style.bottom = `${s.paddingBottom}px`, t.shadowRoot.appendChild(this.node), e.disposing.on((() => {
                t.shadowRoot.removeChild(this.node)
            }))
        }
    }

    function r(t, e, s, i, n) {
        if (e >= s) return e;
        if (i <= n(t[e])) return e;
        if (i > n(t[s - 1])) return s;
        for (s -= 1; e + 1 < s;) {
            const o = n(t[e]),
                a = n(t[s]),
                r = a <= o ? 0 : (i - o) / (a - o);
            let l = Math.ceil(e + r * (s - e));
            l === s ? l-- : l === e && l++;
            n(t[l]) < i ? e = l : s = l
        }
        return s
    }
    class l {
        constructor() {
            this.callbacks = []
        }
        on(t) {
            this.callbacks.push(t)
        }
        dispatch(...t) {
            for (const e of this.callbacks) e(...t)
        }
    }
    class h {
        constructor(t, e, s, i) {
            this.canvas = t, this.model = e, this.options = s, this.points = new Map, this.qpoints = new Map, this.lastX = null, this.updated = new l, i.node.addEventListener("mousemove", (e => {
                const s = t.canvas.getBoundingClientRect();
                this.lastX = e.clientX - s.left, this.adjustPoints()
            })), i.node.addEventListener("mouseleave", (t => {
                this.lastX = null, this.adjustPoints()
            })), e.updated.on((() => this.adjustPoints()))
        }
        adjustPoints() {
            if (null === this.lastX) this.points.clear();
            else {
                const t = this.model.xScale.invert(this.lastX);
                for (const e of this.options.series) {
                    if (0 == e.data.length || !e.visible) {
                        this.points.delete(e);
                        this.qpoints.delete(e);
                        continue
                    }
                    const s = r(e.data, 0, e.data.length, t, (t => t.x)),
                        i = [];
                    s > 0 && i.push(e.data[s - 1]), s < e.data.length && i.push(e.data[s]);
                    const n = e => Math.abs(e.x - t);
                    i.sort(((t, e) => n(t) - n(e)));

                    const o = this.model.pxPoint(i[0]),
                        a = this.canvas.canvas.clientWidth,
                        l = this.canvas.canvas.clientHeight;
                    if (o.x <= a && o.x >= 0 && o.y <= l && o.y >= 0) { 
                        this.points.set(e, o);
                        this.qpoints.set(e, i[0]);

                    } else { 
                        this.points.delete(e) 
                        this.qpoints.delete(e)
                    }
                }
            }
            this.updated.dispatch()
        }
    }
    class c {
        constructor(t) {
            this.options = t, this.xScale = e.scaleLinear(), this.yScale = e.scaleLinear(), this.xRange = null, this.yRange = null, this.seriesInfo = new Map, this.resized = new l, this.updated = new l, this.disposing = new l, this.disposed = !1, this.redrawRequested = !1, "auto" !== t.xRange && t.xRange && this.xScale.domain([t.xRange.min, t.xRange.max]), "auto" !== t.yRange && t.yRange && this.yScale.domain([t.yRange.min, t.yRange.max])
        }
        resize(t, e) {
            const s = this.options;
            this.xScale.range([s.paddingLeft, t - s.paddingRight]), this.yScale.range([e - s.paddingBottom, s.paddingTop]), this.resized.dispatch(t, e), this.requestRedraw()
        }
        dispose() {
            this.disposed || (this.disposing.dispatch(), this.disposed = !0)
        }
        update() {
            this.updateModel(), this.updated.dispatch()
        }
        updateModel() {
            for (const t of this.options.series) this.seriesInfo.has(t) || this.seriesInfo.set(t, {
                yRangeUpdatedIndex: 0
            });
            const t = this.options.series.filter((t => t.data.length > 0));
            if (0 === t.length) return;
            const e = this.options.xRange,
                s = this.options.yRange; {
                const s = Math.max(...t.map((t => t.data[t.data.length - 1].x))),
                    i = this.xRange?.min ?? Math.min(...t.map((t => t.data[0].x)));
                if (this.xRange = {
                        max: s,
                        min: i
                    }, this.options.realTime || "auto" === e)
                    if (this.options.realTime) {
                        const t = this.xScale.domain(),
                            e = t[1] - t[0];
                        this.xScale.domain([s - e, s])
                    } else this.xScale.domain([i, s]);
                else e && this.xScale.domain([e.min, e.max])
            } {
                const e = t.map((t => function(t) {
                    let e = -1 / 0,
                        s = 1 / 0;
                    for (const i of t) i > e && (e = i), i < s && (s = i);
                    return {
                        max: e,
                        min: s
                    }
                }(t.data.slice(this.seriesInfo.get(t).yRangeUpdatedIndex).map((t => t.y)))));
                this.yRange && e.push(this.yRange);
                const i = Math.min(...e.map((t => t.min))),
                    n = Math.max(...e.map((t => t.max)));
                if (this.yRange = {
                        max: n,
                        min: i
                    }, "auto" === s) {
                    this.yScale.domain([i, n]).nice();
                    for (const e of t) this.seriesInfo.get(e).yRangeUpdatedIndex = e.data.length
                } else s && this.yScale.domain([s.min, s.max])
            }
        }
        requestRedraw() {
            this.redrawRequested || (this.redrawRequested = !0, requestAnimationFrame((t => {
                this.redrawRequested = !1, this.disposed || this.update()
            })))
        }
        pxPoint(t) {
            return {
                x: this.xScale(t.x),
                y: this.yScale(t.y)
            }
        }
    }
    class d {
        constructor(t, e) {
            this.svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            const s = this.svgNode.style;
            s.position = "absolute", s.width = s.height = "100%", s.left = s.right = s.top = s.bottom = "0", t.shadowRoot.appendChild(this.svgNode), e.disposing.on((() => {
                t.shadowRoot.removeChild(this.svgNode)
            }))
        }
    }
    const p = {
            pixelRatio: window.devicePixelRatio,
            lineWidth: 1,
            backgroundColor: t.rgb(0, 0, 0, 0),
            paddingTop: 10,
            paddingRight: 10,
            paddingLeft: 45,
            paddingBottom: 20,
            xRange: "auto",
            yRange: "auto",
            realTime: !1,
            baseTime: 0,
            xScaleType: e.scaleTime,
            debugWebGL: !1,
            forceWebGL1: !1,
            legend: !0
        },
        u = {
            name: "",
            visible: !0
        };
    class m {
        constructor(t, e) {
            this.el = t, this.disposed = !1;
            const s = e ?? {
                    series: void 0,
                    plugins: void 0
                },
                i = s.series?.map((t => this.completeSeriesOptions(t))) ?? [],
                n = {
                    ...p,
                    ...e,
                    series: i
                };
            this.model = new c(n);
            const r = t.shadowRoot ?? t.attachShadow({
                    mode: "open"
                }),
                l = document.createElement("style");
            l.innerText = "\n:host {\n    contain: size layout paint style;\n    position: relative;\n}", r.appendChild(l), this.canvasLayer = new o(t, n, this.model), this.svgLayer = new d(t, this.model), this.contentBoxDetector = new a(t, this.model, n), this.nearestPoint = new h(this.canvasLayer, this.model, n, this.contentBoxDetector), this._options = n, void 0 === s.plugins ? this.plugins = {} : this.plugins = Object.fromEntries(Object.entries(s.plugins).map((([t, e]) => [t, e.apply(this)]))), this.onResize();
            const u = () => this.onResize();
            window.addEventListener("resize", u), this.model.disposing.on((() => {
                window.removeEventListener("resize", u), r.removeChild(l)
            }))
        }
        get options() {
            return this._options
        }
        completeSeriesOptions(t) {
            return {
                data: [],
                ...u,
                color: getComputedStyle(this.el).getPropertyValue("color"),
                ...t,
                _complete: !0
            }
        }
        onResize() {
            this.model.resize(this.el.clientWidth, this.el.clientHeight)
        }
        update() {
            if (this.disposed) throw new Error("Cannot update after dispose.");
            for (let t = 0; t < this.options.series.length; t++) {
                const e = this.options.series[t];
                e._complete || (this.options.series[t] = this.completeSeriesOptions(e))
            }
            this.model.requestRedraw()
        }
        dispose() {
            this.model.dispose(), this.disposed = !0
        }
    }
    var g;

    function f(t) {
        return [{
            dir: g.X,
            op: t.x
        }, {
            dir: g.Y,
            op: t.y
        }].filter((t => void 0 !== t.op))
    }

    function v(t) {
        const e = t.domain(),
            s = t.range();
        return (e[1] - e[0]) / (s[1] - s[0])
    }

    function x(t, e) {
        const s = e[1] - e[0],
            i = t.scale.domain();
        if ((i[1] - i[0]) * s <= 0) return !1;
        const n = Math.min(t.maxDomainExtent, t.maxDomain - t.minDomain, Math.max(t.minDomainExtent, s)),
            o = (n - s) / 2;
        e[0] -= o, e[1] += o;
        const a = Math.min(Math.max(t.minDomain - e[0], 0), t.maxDomain - e[1]);
        e[0] += a, e[1] += a;
        const r = 1e-6 * n;
        return t.scale.domain(e), !! function(...t) {
            return [...t[0]].map(((e, s) => t.map((t => t[s]))))
        }(e, i).some((([t, e]) => Math.abs(t - e) > r))
    }

    function y(t, e, s) {
        return t > s ? s : t < e ? e : t
    }! function(t) {
        t[t.UNKNOWN = 0] = "UNKNOWN", t[t.X = 1] = "X", t[t.Y = 2] = "Y"
    }(g || (g = {}));
    class w {
        constructor(t, e) {
            this.el = t, this.options = e, this.scaleUpdated = new l, this.previousPoint = null, t.style.userSelect = "none", t.addEventListener("pointerdown", (t => this.onMouseDown(t))), t.addEventListener("pointerup", (t => this.onMouseUp(t))), t.addEventListener("pointermove", (t => this.onMouseMove(t)))
        }
        point(t) {
            const e = this.el.getBoundingClientRect();
            return {
                [g.X]: t.clientX - e.left,
                [g.Y]: t.clientY - e.top
            }
        }
        onMouseMove(t) {
            if (t.pointerType != 'mouse' || t.button == 1) {
                if (null === this.previousPoint) return;
                const e = this.point(t);
                let s = !1;
                for (const {
                        dir: t,
                        op: i
                    } of f(this.options)) {
                    const n = e[t] - this.previousPoint[t],
                        o = v(i.scale),
                        a = i.scale.domain();
                    x(i, a.map((t => t - o * n))) && (s = !0)
                }
                this.previousPoint = e, s && this.scaleUpdated.dispatch()
            }
        }
        onMouseDown(t) {
            if (t.pointerType != 'mouse' || t.button == 1) {
                "mouse" === t.pointerType && (this.el.setPointerCapture(t.pointerId), this.previousPoint = this.point(t), this.el.style.cursor = "grabbing")
            }
        }
        onMouseUp(t) {
            if (t.pointerType != 'mouse' || t.button == 1) {
                null !== this.previousPoint && (this.previousPoint = null, this.el.releasePointerCapture(t.pointerId), this.el.style.cursor = "")
            }
        }
    }
    class b {
        constructor(t, e) {
            this.el = t, this.options = e, this.scaleUpdated = new l, this.majorDirection = g.UNKNOWN, this.previousPoints = new Map, this.enabled = {
                [g.X]: !1,
                [g.Y]: !1
            }, t.addEventListener("touchstart", (t => this.onTouchStart(t)), {
                passive: !0
            }), t.addEventListener("touchend", (t => this.onTouchEnd(t)), {
                passive: !0
            }), t.addEventListener("touchcancel", (t => this.onTouchEnd(t)), {
                passive: !0
            }), t.addEventListener("touchmove", (t => this.onTouchMove(t)), {
                passive: !0
            }), this.update()
        }
        update() {
            this.syncEnabled(), this.syncTouchAction()
        }
        syncEnabled() {
            for (const {
                    dir: t,
                    op: e
                } of f(this.options))
                if (e) {
                    const s = e.scale.domain().sort();
                    this.enabled[t] = e.minDomain < s[0] && s[1] < e.maxDomain
                } else this.enabled[t] = !1
        }
        syncTouchAction() {
            const t = [];
            this.enabled[g.X] || t.push("pan-x"), this.enabled[g.Y] || t.push("pan-y"), 0 === t.length && t.push("none"), this.el.style.touchAction = t.join(" ")
        }
        calcKB(t, e, s) {
            if (t === this.majorDirection && s.length >= 2) {
                const t = e.scale.domain(),
                    i = t[1] - t[0];
                if (function(t) {
                        const e = t.reduce(((t, e) => t + e)) / t.length;
                        return t.map((t => (t - e) ** 2)).reduce(((t, e) => t + e)) / t.length
                    }(s.map((t => t.domain))) > 1e-4 * i * i) return function(t) {
                    let e = 0,
                        s = 0,
                        i = 0,
                        n = 0;
                    const o = t.length;
                    for (const o of t) e += o.x, s += o.y, i += o.x * o.y, n += o.x * o.x;
                    const a = o * n - e * e,
                        r = 0 === a ? 0 : (o * i - e * s) / a;
                    return {
                        k: r,
                        b: (s - r * e) / o
                    }
                }(s.map((t => ({
                    x: t.current,
                    y: t.domain
                }))))
            }
            const i = v(e.scale),
                n = s.map((t => t.domain - i * t.current)).reduce(((t, e) => t + e)) / s.length;
            return {
                k: i,
                b: n
            }
        }
        touchPoints(t) {
            const e = this.el.getBoundingClientRect(),
                s = new Map([...t].map((t => [t.identifier, {
                    [g.X]: t.clientX - e.left,
                    [g.Y]: t.clientY - e.top
                }])));
            let i = !1;
            for (const {
                    dir: t,
                    op: e
                } of f(this.options)) {
                const n = e.scale,
                    o = [...s.entries()].map((([e, s]) => ({
                        current: s[t],
                        previousPoint: this.previousPoints.get(e)
                    }))).filter((t => void 0 !== t.previousPoint)).map((({
                        current: e,
                        previousPoint: s
                    }) => ({
                        current: e,
                        domain: n.invert(s[t])
                    })));
                if (0 === o.length) continue;
                const {
                    k: a,
                    b: r
                } = this.calcKB(t, e, o);
                x(e, n.range().map((t => r + a * t))) && (i = !0)
            }
            return this.previousPoints = s, i && this.scaleUpdated.dispatch(), i
        }
        dirOptions(t) {
            return {
                [g.X]: this.options.x,
                [g.Y]: this.options.y
            } [t]
        }
        onTouchStart(t) {
            if (this.majorDirection === g.UNKNOWN && t.touches.length >= 2) {
                const s = [...t.touches];

                function e(t) {
                    const e = t.reduce(((t, e) => t + e)) / t.length;
                    return t.map((t => (t - e) ** 2)).reduce(((t, e) => t + e))
                }
                const i = e(s.map((t => t.clientX))),
                    n = e(s.map((t => t.clientY)));
                this.majorDirection = i > n ? g.X : g.Y, void 0 === this.dirOptions(this.majorDirection) && (this.majorDirection = g.UNKNOWN)
            }
            this.touchPoints(t.touches)
        }
        onTouchEnd(t) {
            t.touches.length < 2 && (this.majorDirection = g.UNKNOWN), this.touchPoints(t.touches)
        }
        onTouchMove(t) {
            this.touchPoints(t.touches)
        }
    }
    class E {
        constructor(t, e) {
            this.el = t, this.options = e, this.scaleUpdated = new l, t.addEventListener("wheel", (t => this.onWheel(t)))
        }
        onWheel(t) {
            t.preventDefault();
            let e = t.deltaX,
                s = t.deltaY;
            switch (t.deltaMode) {
                case 1:
                    e *= 30, s *= 30;
                    break;
                case 2:
                    e *= 400, s *= 400
            }
            const i = {
                [g.X]: {
                    translate: 0,
                    zoom: 0
                },
                [g.Y]: {
                    translate: 0,
                    zoom: 0
                }
            };
            t.ctrlKey ? t.altKey ? (i[g.X].zoom = e, i[g.Y].zoom = s) : i[g.X].zoom = e + s : t.altKey ? (i[g.X].translate = e, i[g.Y].translate = s) : i[g.X].translate = e + s;
            const n = this.el.getBoundingClientRect(),
                o = {
                    [g.X]: t.clientX - n.left,
                    [g.Y]: t.clientY - n.top
                };
            let a = !1;
            for (const {
                    dir: e,
                    op: s
                } of f(this.options)) {
                const n = s.scale.domain(),
                    r = v(s.scale),
                    l = i[e],
                    h = s.scale.invert(o[e]);
                l.translate *= r, l.zoom *= .002, t.shiftKey && (l.translate *= 5, l.zoom *= 5);
                const c = .4 * (n[1] - n[0]);
                l.translate = y(l.translate, -c, c);
                const d = .5;
                l.zoom = y(l.zoom, -d, d);
                x(s, n.map((t => t + l.translate + (t - h) * l.zoom))) && (a = !0)
            }
            a && this.scaleUpdated.dispatch()
        }
    }
    const S = {
        minDomain: -1 / 0,
        maxDomain: 1 / 0,
        minDomainExtent: 0,
        maxDomainExtent: 1 / 0
    };
    class R {
        constructor(t, e) {
            this.scaleUpdated = new l, e = e ?? {}, this.options = {
                x: e.x && {
                    ...S,
                    ...e.x
                },
                y: e.y && {
                    ...S,
                    ...e.y
                }
            }, this.touch = new b(t, this.options), this.mouse = new w(t, this.options), this.wheel = new E(t, this.options);
            const s = () => this.scaleUpdated.dispatch();
            this.touch.scaleUpdated.on(s), this.mouse.scaleUpdated.on(s), this.wheel.scaleUpdated.on(s)
        }
        onScaleUpdated(t) {
            this.scaleUpdated.on(t)
        }
        update() {
            this.touch.update()
        }
    }
    class P {
        constructor(t, e) {
            this.options = this.registerZoom(t, e)
        }
        applyAutoRange(t, e) {
            if (!t || !t.autoRange) return;
            let [s, i] = t.scale.domain();
            e && (s = Math.min(s, e.min), i = Math.max(i, e.max)), t.minDomain = s, t.maxDomain = i
        }
        registerZoom(t, e) {
            const s = new R(t.contentBoxDetector.node, {
                    x: e.x && {
                        ...e.x,
                        scale: t.model.xScale
                    },
                    y: e.y && {
                        ...e.y,
                        scale: t.model.yScale
                    }
                }),
                i = s.options;
            return t.model.updated.on((() => {
                this.applyAutoRange(i.x, t.model.xRange), this.applyAutoRange(i.y, t.model.yRange), s.update()
            })), s.onScaleUpdated((() => {
                t.options.xRange = null, t.options.yRange = null, t.options.realTime = !1, t.update()
            })), i
        }
    }
    class L {
        constructor(t) {
            this.o = t
        }
        apply(t) {
            return new P(t, this.o)
        }
    }
    const T = {
            apply(t) {
                const e = function(t, e) {
                        const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        return s.classList.add("content-box"), s.x.baseVal.value = e.paddingLeft, s.y.baseVal.value = e.paddingRight, t.resized.on(((t, i) => {
                            s.width.baseVal.value = t - e.paddingRight - e.paddingLeft, s.height.baseVal.value = i - e.paddingTop - e.paddingBottom
                        })), s
                    }(t.model, t.options),
                    s = e.createSVGTransform();
                s.setTranslate(0, 0);
                const i = document.createElementNS("http://www.w3.org/2000/svg", "style");
                i.textContent = "\n.timechart-crosshair {\n    stroke: currentColor;\n    stroke-width: 1;\n    stroke-dasharray: 2 1;\n    visibility: hidden;\n}";
                const n = document.createElementNS("http://www.w3.org/2000/svg", "line");
                n.transform.baseVal.initialize(s), n.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 100);
                const o = document.createElementNS("http://www.w3.org/2000/svg", "line");
                o.transform.baseVal.initialize(s), o.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 100);
                const a = document.createElementNS("http://www.w3.org/2000/svg", "g");
                a.classList.add("timechart-crosshair");
                for (const t of [i, n, o]) a.appendChild(t);
                const r = t.contentBoxDetector;
                r.node.addEventListener("mousemove", (t => {
                    const s = e.getBoundingClientRect();
                    n.transform.baseVal.getItem(0).setTranslate(0, t.clientY - s.y), o.transform.baseVal.getItem(0).setTranslate(t.clientX - s.x, 0)
                })), r.node.addEventListener("mouseenter", (t => a.style.visibility = "visible")), r.node.addEventListener("mouseleave", (t => a.style.visibility = "hidden")), e.appendChild(a), t.svgLayer.svgNode.appendChild(e)
            }
        },
        C = {
            apply(t) {
                const e = i.select(t.svgLayer.svgNode),
                    n = e.append("g"),
                    o = e.append("g"),
                    a = s.axisBottom(t.model.xScale),
                    r = s.axisLeft(t.model.yScale);

                function l() {
                    const e = t.model.xScale,
                        s = t.options.xScaleType().domain(e.domain().map((e => e + t.options.baseTime))).range(e.range());
                    a.scale(s), n.call(a), r.scale(t.model.yScale), o.call(r)
                }
                t.model.updated.on(l), t.model.resized.on(((e, s) => {
                    const i = t.options;
                    n.attr("transform", `translate(0, ${s-i.paddingBottom})`), o.attr("transform", `translate(${i.paddingLeft}, 0)`), l()
                }))
            }
        };
    class A {
        constructor(t, e, s) {
            this.el = t, this.model = e, this.options = s, this.items = new Map, this.legend = document.createElement("chart-legend");
            const i = this.legend.style;
            i.position = "absolute", i.right = `${s.paddingRight}px`, i.top = `${s.paddingTop}px`;
            const n = this.legend.attachShadow({
                    mode: "open"
                }),
                o = document.createElement("style");
            o.textContent = "\n:host {\n    background: var(--background-overlay, white);\n    border: 1px solid hsl(0, 0%, 80%);\n    border-radius: 3px;\n    padding: 5px 10px;\n}\n.item {\n    display: flex;\n    flex-flow: row nowrap;\n    align-items: center;\n    user-select: none;\n}\n.item:not(.visible) {\n    color: gray;\n    text-decoration: line-through;\n}\n.item .example {\n    width: 50px;\n    margin-right: 10px;\n    max-height: 1em;\n}", n.appendChild(o), this.itemContainer = n, this.update();
            const a = t.shadowRoot;
            a.appendChild(this.legend), e.updated.on((() => this.update())), e.disposing.on((() => {
                a.removeChild(this.legend)
            }))
        }
        update() {
            if (this.legend.style.display = this.options.legend ? "" : "none", this.options.legend)
                for (const t of this.options.series) {
                    if (!this.items.has(t)) {
                        const e = document.createElement("div");
                        e.className = "item";
                        const s = document.createElement("div");
                        s.className = "example", e.appendChild(s);
                        const i = document.createElement("label");
                        i.textContent = t.name, e.appendChild(i), this.itemContainer.appendChild(e), e.addEventListener("click", (e => {
                            t.visible = !t.visible, this.model.update()
                        })), this.items.set(t, {
                            item: e,
                            example: s
                        })
                    }
                    const e = this.items.get(t);
                    e.item.classList.toggle("visible", t.visible), e.example.style.height = `${t.lineWidth??this.options.lineWidth}px`, e.example.style.backgroundColor = t.color.toString()
                }
        }
    }
    const M = {
        apply: t => new A(t.el, t.model, t.options)
    };
    var D = "undefined" != typeof Float32Array ? Float32Array : Array;

    function N() {
        var t = new D(2);
        return D != Float32Array && (t[0] = 0, t[1] = 0), t
    }
    Math.hypot || (Math.hypot = function() {
        for (var t = 0, e = arguments.length; e--;) t += arguments[e] * arguments[e];
        return Math.sqrt(t)
    }), N();

    function B(t, e, s, i) {
        const n = z(t.createShader(e));
        if (t.shaderSource(n, s), t.compileShader(n), i) {
            if (!t.getShaderParameter(n, t.COMPILE_STATUS)) {
                const e = t.getShaderInfoLog(n) ?? "Unknown Error.";
                throw t.deleteShader(n), new Error(e)
            }
        }
        return n
    }

    function z(t) {
        if (!t) throw new Error("value must not be falsy");
        return t
    }
    class U extends class {
        constructor(t, e, s, i) {
            this.gl = t, this.debug = i;
            const n = z(t.createProgram());
            t.attachShader(n, z(B(t, t.VERTEX_SHADER, e, i))), t.attachShader(n, z(B(t, t.FRAGMENT_SHADER, s, i))), this.program = n
        }
        link() {
            const t = this.gl,
                e = this.program;
            if (t.linkProgram(e), this.debug) {
                if (!t.getProgramParameter(e, t.LINK_STATUS)) {
                    const s = t.getProgramInfoLog(e) ?? "Unknown Error.";
                    throw t.deleteProgram(e), new Error(s)
                }
            }
        }
        use() {
            this.gl.useProgram(this.program)
        }
    } {
        constructor(t, e) {
            super(t, function(t) {
                const e = "\nuniform vec2 uModelScale;\nuniform vec2 uModelTranslation;\nuniform vec2 uProjectionScale;\nuniform float uLineWidth;\n\nvoid main() {\n    vec2 cssPose = uModelScale * aDataPoint + uModelTranslation;\n    vec2 dir = uModelScale * aDir;\n    dir = normalize(dir);\n    vec2 pos2d = uProjectionScale * (cssPose + vec2(-dir.y, dir.x) * uLineWidth);\n    gl_Position = vec4(pos2d, 0, 1);\n}";
                return t instanceof WebGLRenderingContext ? `\nattribute vec2 aDataPoint;\nattribute vec2 aDir;\n${e}` : `#version 300 es\nlayout (location = 0) in vec2 aDataPoint;\nlayout (location = 1) in vec2 aDir;\n${e}`
            }(t), function(t) {
                return t instanceof WebGLRenderingContext ? "\nprecision lowp float;\nuniform vec4 uColor;\nvoid main() {\n    gl_FragColor = uColor;\n}" : "#version 300 es\nprecision lowp float;\nuniform vec4 uColor;\nout vec4 outColor;\nvoid main() {\n    outColor = uColor;\n}"
            }(t), e), t instanceof WebGLRenderingContext && (t.bindAttribLocation(this.program, 0, "aDataPoint"), t.bindAttribLocation(this.program, 1, "aDir")), this.link();
            const s = e => z(t.getUniformLocation(this.program, e));
            this.locations = {
                uModelScale: s("uModelScale"),
                uModelTranslation: s("uModelTranslation"),
                uProjectionScale: s("uProjectionScale"),
                uLineWidth: s("uLineWidth"),
                uColor: s("uColor")
            }
        }
    }
    const V = 4 * Float32Array.BYTES_PER_ELEMENT,
        W = 131072;
    class _ {
        constructor(t) {
            this.gl = t, this.vao = z(t.createVertexArray()), this.bind()
        }
        bind() {
            this.gl.bindVertexArray(this.vao)
        }
        clear() {
            this.gl.deleteVertexArray(this.vao)
        }
    }
    class Y {
        constructor(t) {
            this.vaoExt = t, this.vao = z(t.createVertexArrayOES()), this.bind()
        }
        bind() {
            this.vaoExt.bindVertexArrayOES(this.vao)
        }
        clear() {
            this.vaoExt.deleteVertexArrayOES(this.vao)
        }
    }
    class I {
        constructor(t) {
            this.bindFunc = t
        }
        bind() {
            this.bindFunc()
        }
        clear() {}
    }
    class X {
        constructor(t, e, s) {
            this.gl = t, this.dataPoints = e, this.firstDataPointIndex = s, this.length = 0, this.dataBuffer = z(t.createBuffer());
            const i = () => {
                t.bindBuffer(t.ARRAY_BUFFER, this.dataBuffer), t.enableVertexAttribArray(0), t.vertexAttribPointer(0, 2, t.FLOAT, !1, V, 0), t.enableVertexAttribArray(1), t.vertexAttribPointer(1, 2, t.FLOAT, !1, V, 2 * Float32Array.BYTES_PER_ELEMENT)
            };
            if (t instanceof WebGLRenderingContext) {
                const e = t.getExtension("OES_vertex_array_object");
                this.vao = e ? new Y(e) : new I(i)
            } else this.vao = new _(t);
            i(), t.bufferData(t.ARRAY_BUFFER, 2097160 * Float32Array.BYTES_PER_ELEMENT, t.DYNAMIC_DRAW)
        }
        clear() {
            this.length = 0
        }
        delete() {
            this.clear(), this.gl.deleteBuffer(this.dataBuffer), this.vao.clear()
        }
        addDataPoints() {
            const t = this.dataPoints,
                e = this.firstDataPointIndex + this.length,
                s = W - this.length,
                i = t.length - e,
                n = s < i,
                o = n ? s : i;
            let a = 16 * o;
            n && (a += 8);
            const r = new Float32Array(a);
            let l = 0;
            const h = N(),
                c = N(),
                d = N(),
                p = N();

            function u(t, e) {
                var s, i, n;
                h[0] = t.x, h[1] = t.y, c[0] = e.x, c[1] = e.y, i = h, n = c, (s = d)[0] = i[0] - n[0], s[1] = i[1] - n[1],
                    function(t, e) {
                        var s = e[0],
                            i = e[1],
                            n = s * s + i * i;
                        n > 0 && (n = 1 / Math.sqrt(n)), t[0] = e[0] * n, t[1] = e[1] * n
                    }(d, d),
                    function(t, e) {
                        t[0] = -e[0], t[1] = -e[1]
                    }(p, d)
            }

            function m(t) {
                r[l] = t[0], r[l + 1] = t[1], l += 2
            }
            let g = t[e - 1];
            for (let s = 0; s < o; s++) {
                const i = t[e + s];
                u(i, g), g = i;
                for (const t of [c, h])
                    for (const e of [d, p]) m(t), m(e)
            }
            if (n) {
                u(t[e + o], g);
                for (const t of [d, p]) m(c), m(t)
            }
            const f = this.gl;
            return f.bindBuffer(f.ARRAY_BUFFER, this.dataBuffer), f.bufferSubData(f.ARRAY_BUFFER, 4 * V * this.length, r), this.length += o, e + o
        }
        draw(t) {
            const e = Math.max(0, t.min - this.firstDataPointIndex),
                s = Math.min(this.length, t.max - this.firstDataPointIndex) - e,
                i = this.gl;
            this.vao.bind(), i.drawArrays(i.TRIANGLE_STRIP, 4 * e, 4 * s)
        }
    }
    class F {
        constructor(t, e) {
            this.gl = t, this.series = e, this.vertexArrays = []
        }
        syncBuffer() {
            let t, e = 1;
            const s = () => {
                t = new X(this.gl, this.series.data, e), this.vertexArrays.push(t)
            };
            if (this.vertexArrays.length > 0) {
                const s = this.vertexArrays[this.vertexArrays.length - 1];
                if (e = s.firstDataPointIndex + s.length, e > this.series.data.length) throw new Error("remove data unsupported.");
                if (e === this.series.data.length) return;
                t = s
            } else {
                if (!(this.series.data.length >= 2)) return;
                s(), t = t
            }
            for (;;) {
                if (e = t.addDataPoints(), e >= this.series.data.length) {
                    if (e > this.series.data.length) throw Error("Assertion failed.");
                    break
                }
                s()
            }
        }
        draw(t) {
            const e = this.series.data;
            if (0 === this.vertexArrays.length || e[0].x > t.max || e[e.length - 1].x < t.min) return;
            const s = t => t.x,
                i = r(e, 1, e.length, t.min, s),
                n = r(e, i, e.length - 1, t.max, s) + 1,
                o = Math.floor((i - 1) / W),
                a = Math.ceil((n - 1) / W),
                l = {
                    min: i,
                    max: n
                };
            for (let t = o; t < a; t++) this.vertexArrays[t].draw(l)
        }
    }
    class k {
        constructor(t, e, s) {
            this.model = t, this.gl = e, this.options = s, this.program = new U(this.gl, this.options.debugWebGL), this.arrays = new Map, this.height = 0, this.width = 0, this.program.use(), t.updated.on((() => this.drawFrame())), t.resized.on(((t, e) => this.onResize(t, e)))
        }
        syncBuffer() {
            for (const t of this.options.series) {
                let e = this.arrays.get(t);
                e || (e = new F(this.gl, t), this.arrays.set(t, e)), e.syncBuffer()
            }
        }
        onResize(t, e) {
            this.height = e, this.width = t;
            const s = (i = t, n = e, (o = new D(2))[0] = i, o[1] = n, o);
            var i, n, o;
            ! function(t, e, s) {
                t[0] = e[0] / s[0], t[1] = e[1] / s[1]
            }(s, s, [2, 2]),
            function(t, e) {
                t[0] = 1 / e[0], t[1] = 1 / e[1]
            }(s, s);
            this.gl.uniform2fv(this.program.locations.uProjectionScale, s)
        }
        drawFrame() {
            this.syncBuffer(), this.syncDomain();
            const t = this.gl;
            for (const [e, s] of this.arrays) {
                if (!e.visible) continue;
                const i = n(e.color);
                t.uniform4fv(this.program.locations.uColor, i);
                const o = e.lineWidth ?? this.options.lineWidth;
                t.uniform1f(this.program.locations.uLineWidth, o / 2);
                const a = {
                    min: this.model.xScale.invert(-o / 2),
                    max: this.model.xScale.invert(this.width + o / 2)
                };
                s.draw(a)
            }
            if (this.options.debugWebGL) {
                const e = t.getError();
                if (e != t.NO_ERROR) throw new Error(`WebGL error ${e}`)
            }
        }
        ySvgToView(t) {
            return -t + this.height / 2
        }
        xSvgToView(t) {
            return t - this.width / 2
        }
        syncDomain() {
            const t = this.model,
                e = this.gl,
                s = [this.xSvgToView(t.xScale(0)), this.ySvgToView(t.yScale(0))],
                i = [this.xSvgToView(t.xScale(1)), this.ySvgToView(t.yScale(1))],
                n = [i[0] - s[0], i[1] - s[1]];
            e.uniform2fv(this.program.locations.uModelScale, n), e.uniform2fv(this.program.locations.uModelTranslation, s)
        }
    }
    const G = {
        apply: t => new k(t.model, t.canvasLayer.gl, t.options)
    };
    class O {
        constructor(t, e, s) {
            this.svg = t, this.options = e, this.pModel = s, this.intersectPoints = new Map;
            t.svgNode.createSVGTransform().setTranslate(0, 0);
            const i = document.createElementNS("http://www.w3.org/2000/svg", "style");
            i.textContent = "\n.timechart-crosshair-intersect {\n    fill: var(--background-overlay, white);\n    visibility: hidden;\n}\n.timechart-crosshair-intersect circle {\n    r: 3px;\n}";
            const n = document.createElementNS("http://www.w3.org/2000/svg", "g");
            n.classList.add("timechart-crosshair-intersect"), n.appendChild(i), this.container = n, this.adjustIntersectPoints(), t.svgNode.appendChild(n), s.updated.on((() => this.adjustIntersectPoints()))
        }
        adjustIntersectPoints() {
            const t = this.svg.svgNode.createSVGTransform();
            t.setTranslate(0, 0);
            for (const e of this.options.series) {
                if (!this.intersectPoints.has(e)) {
                    const s = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    s.style.stroke = e.color.toString(), s.style.strokeWidth = `${e.lineWidth??this.options.lineWidth}px`, s.transform.baseVal.initialize(t), this.container.appendChild(s), this.intersectPoints.set(e, s)
                }
                const s = this.intersectPoints.get(e),
                    i = this.pModel.points.get(e);
                i ? (s.style.visibility = "visible", s.transform.baseVal.getItem(0).setTranslate(i.x, i.y)) : s.style.visibility = "hidden"
            }
        }
    }
    const j = {
        apply: t => new O(t.svgLayer, t.options, t.nearestPoint)
    };
    class K extends m {
        constructor(t, e) {
            super(t, function(t) {
                const e = t ?? {
                    plugins: void 0,
                    zoom: void 0
                };
                return {
                    ...t,
                    plugins: {
                        ...e.plugins ?? {},
                        lineChart: G,
                        d3Axis: C,
                        crosshair: T,
                        nearestPoint: j,
                        legend: M,
                        zoom: new L(e.zoom ?? {})
                    }
                }
            }(e)), this.el = t;
            const s = this.plugins.zoom;
            this._options = Object.assign(super.options, {
                zoom: s.options
            })
        }
        get options() {
            return this._options
        }
    }
    return K.core = m, K.plugins = {
        lineChart: G,
        d3Axis: C,
        crosshair: T,
        nearestPoint: j,
        legend: M,
        TimeChartZoomPlugin: L
    }, K
}(d3, d3, d3, d3);
this.TimeChart = this.TimeChart || {}, this.TimeChart.plugins_extra = function(t, e) {
    "use strict";
    return t.EventsPlugin = class {
        constructor(t) {
            this.data = t ?? []
        }
        apply(t) {
            const a = e.select(t.svgLayer.svgNode).append("svg");
            return a.append("style").text("\n.timechart-event-line {\n    stroke: currentColor;\n    stroke-width: 1;\n    stroke-dasharray: 2 1;\n    opacity: 0.7;\n}"), t.model.resized.on(((e, n) => {
                a.attr("height", n - t.options.paddingBottom)
            })), t.model.updated.on((() => {
                const e = a.selectAll("g").data(this.data);
                e.exit().remove();
                const n = e.enter().append("g");
                n.append("line").attr("y2", "100%").attr("class", "timechart-event-line"), n.append("text").attr("x", 5).attr("y", t.options.paddingTop).attr("dy", "0.8em");
                const r = e.merge(n);
                r.attr("transform", (e => `translate(${t.model.xScale(e.x)}, 0)`)), r.select("text").text((t => t.name))
            })), this
        }
    }, Object.defineProperty(t, "__esModule", {
        value: !0
    }), t
}({}, d3);