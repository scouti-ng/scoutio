// https://d3js.org/d3-scale/ v3.3.0 Copyright 2021 Mike Bostock
!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("d3-array"),require("d3-interpolate"),require("d3-format"),require("d3-time"),require("d3-time-format")):"function"==typeof define&&define.amd?define(["exports","d3-array","d3-interpolate","d3-format","d3-time","d3-time-format"],t):t((n="undefined"!=typeof globalThis?globalThis:n||self).d3=n.d3||{},n.d3,n.d3,n.d3,n.d3,n.d3)}(this,(function(n,t,r,e,u,i){"use strict";function o(n,t){switch(arguments.length){case 0:break;case 1:this.range(n);break;default:this.range(t).domain(n)}return this}function a(n,t){switch(arguments.length){case 0:break;case 1:"function"==typeof n?this.interpolator(n):this.range(n);break;default:this.domain(n),"function"==typeof t?this.interpolator(t):this.range(t)}return this}const c=Symbol("implicit");function l(){var n=new Map,t=[],r=[],e=c;function u(u){var i=u+"",o=n.get(i);if(!o){if(e!==c)return e;n.set(i,o=t.push(u))}return r[(o-1)%r.length]}return u.domain=function(r){if(!arguments.length)return t.slice();t=[],n=new Map;for(const e of r){const r=e+"";n.has(r)||n.set(r,t.push(e))}return u},u.range=function(n){return arguments.length?(r=Array.from(n),u):r.slice()},u.unknown=function(n){return arguments.length?(e=n,u):e},u.copy=function(){return l(t,r).unknown(e)},o.apply(u,arguments),u}function f(){var n,r,e=l().unknown(void 0),u=e.domain,i=e.range,a=0,c=1,p=!1,s=0,h=0,g=.5;function m(){var e=u().length,o=c<a,l=o?c:a,f=o?a:c;n=(f-l)/Math.max(1,e-s+2*h),p&&(n=Math.floor(n)),l+=(f-l-n*(e-s))*g,r=n*(1-s),p&&(l=Math.round(l),r=Math.round(r));var m=t.range(e).map((function(t){return l+n*t}));return i(o?m.reverse():m)}return delete e.unknown,e.domain=function(n){return arguments.length?(u(n),m()):u()},e.range=function(n){return arguments.length?([a,c]=n,a=+a,c=+c,m()):[a,c]},e.rangeRound=function(n){return[a,c]=n,a=+a,c=+c,p=!0,m()},e.bandwidth=function(){return r},e.step=function(){return n},e.round=function(n){return arguments.length?(p=!!n,m()):p},e.padding=function(n){return arguments.length?(s=Math.min(1,h=+n),m()):s},e.paddingInner=function(n){return arguments.length?(s=Math.min(1,n),m()):s},e.paddingOuter=function(n){return arguments.length?(h=+n,m()):h},e.align=function(n){return arguments.length?(g=Math.max(0,Math.min(1,n)),m()):g},e.copy=function(){return f(u(),[a,c]).round(p).paddingInner(s).paddingOuter(h).align(g)},o.apply(m(),arguments)}function p(n){var t=n.copy;return n.padding=n.paddingOuter,delete n.paddingInner,delete n.paddingOuter,n.copy=function(){return p(t())},n}function s(n){return+n}var h=[0,1];function g(n){return n}function m(n,t){return(t-=n=+n)?function(r){return(r-n)/t}:(r=isNaN(t)?NaN:.5,function(){return r});var r}function d(n,t,r){var e=n[0],u=n[1],i=t[0],o=t[1];return u<e?(e=m(u,e),i=r(o,i)):(e=m(e,u),i=r(i,o)),function(n){return i(e(n))}}function y(n,r,e){var u=Math.min(n.length,r.length)-1,i=new Array(u),o=new Array(u),a=-1;for(n[u]<n[0]&&(n=n.slice().reverse(),r=r.slice().reverse());++a<u;)i[a]=m(n[a],n[a+1]),o[a]=e(r[a],r[a+1]);return function(r){var e=t.bisect(n,r,1,u)-1;return o[e](i[e](r))}}function v(n,t){return t.domain(n.domain()).range(n.range()).interpolate(n.interpolate()).clamp(n.clamp()).unknown(n.unknown())}function M(){var n,t,e,u,i,o,a=h,c=h,l=r.interpolate,f=g;function p(){var n,t,r,e=Math.min(a.length,c.length);return f!==g&&(n=a[0],t=a[e-1],n>t&&(r=n,n=t,t=r),f=function(r){return Math.max(n,Math.min(t,r))}),u=e>2?y:d,i=o=null,m}function m(t){return null==t||isNaN(t=+t)?e:(i||(i=u(a.map(n),c,l)))(n(f(t)))}return m.invert=function(e){return f(t((o||(o=u(c,a.map(n),r.interpolateNumber)))(e)))},m.domain=function(n){return arguments.length?(a=Array.from(n,s),p()):a.slice()},m.range=function(n){return arguments.length?(c=Array.from(n),p()):c.slice()},m.rangeRound=function(n){return c=Array.from(n),l=r.interpolateRound,p()},m.clamp=function(n){return arguments.length?(f=!!n||g,p()):f!==g},m.interpolate=function(n){return arguments.length?(l=n,p()):l},m.unknown=function(n){return arguments.length?(e=n,m):e},function(r,e){return n=r,t=e,p()}}function k(){return M()(g,g)}function w(n,r,u,i){var o,a=t.tickStep(n,r,u);switch((i=e.formatSpecifier(null==i?",f":i)).type){case"s":var c=Math.max(Math.abs(n),Math.abs(r));return null!=i.precision||isNaN(o=e.precisionPrefix(a,c))||(i.precision=o),e.formatPrefix(i,c);case"":case"e":case"g":case"p":case"r":null!=i.precision||isNaN(o=e.precisionRound(a,Math.max(Math.abs(n),Math.abs(r))))||(i.precision=o-("e"===i.type));break;case"f":case"%":null!=i.precision||isNaN(o=e.precisionFixed(a))||(i.precision=o-2*("%"===i.type))}return e.format(i)}function N(n){var r=n.domain;return n.ticks=function(n){var e=r();return t.ticks(e[0],e[e.length-1],null==n?10:n)},n.tickFormat=function(n,t){var e=r();return w(e[0],e[e.length-1],null==n?10:n,t)},n.nice=function(e){null==e&&(e=10);var u,i,o=r(),a=0,c=o.length-1,l=o[a],f=o[c],p=10;for(f<l&&(i=l,l=f,f=i,i=a,a=c,c=i);p-- >0;){if((i=t.tickIncrement(l,f,e))===u)return o[a]=l,o[c]=f,r(o);if(i>0)l=Math.floor(l/i)*i,f=Math.ceil(f/i)*i;else{if(!(i<0))break;l=Math.ceil(l*i)/i,f=Math.floor(f*i)/i}u=i}return n},n}function b(n,t){var r,e=0,u=(n=n.slice()).length-1,i=n[e],o=n[u];return o<i&&(r=e,e=u,u=r,r=i,i=o,o=r),n[e]=t.floor(i),n[u]=t.ceil(o),n}function x(n){return Math.log(n)}function q(n){return Math.exp(n)}function S(n){return-Math.log(-n)}function A(n){return-Math.exp(-n)}function D(n){return isFinite(n)?+("1e"+n):n<0?0:n}function I(n){return function(t){return-n(-t)}}function R(n){var r,u,i=n(x,q),o=i.domain,a=10;function c(){return r=function(n){return n===Math.E?Math.log:10===n&&Math.log10||2===n&&Math.log2||(n=Math.log(n),function(t){return Math.log(t)/n})}(a),u=function(n){return 10===n?D:n===Math.E?Math.exp:function(t){return Math.pow(n,t)}}(a),o()[0]<0?(r=I(r),u=I(u),n(S,A)):n(x,q),i}return i.base=function(n){return arguments.length?(a=+n,c()):a},i.domain=function(n){return arguments.length?(o(n),c()):o()},i.ticks=function(n){var e,i=o(),c=i[0],l=i[i.length-1];(e=l<c)&&(h=c,c=l,l=h);var f,p,s,h=r(c),g=r(l),m=null==n?10:+n,d=[];if(!(a%1)&&g-h<m){if(h=Math.floor(h),g=Math.ceil(g),c>0){for(;h<=g;++h)for(p=1,f=u(h);p<a;++p)if(!((s=f*p)<c)){if(s>l)break;d.push(s)}}else for(;h<=g;++h)for(p=a-1,f=u(h);p>=1;--p)if(!((s=f*p)<c)){if(s>l)break;d.push(s)}2*d.length<m&&(d=t.ticks(c,l,m))}else d=t.ticks(h,g,Math.min(g-h,m)).map(u);return e?d.reverse():d},i.tickFormat=function(n,t){if(null==t&&(t=10===a?".0e":","),"function"!=typeof t&&(t=e.format(t)),n===1/0)return t;null==n&&(n=10);var o=Math.max(1,a*n/i.ticks().length);return function(n){var e=n/u(Math.round(r(n)));return e*a<a-.5&&(e*=a),e<=o?t(n):""}},i.nice=function(){return o(b(o(),{floor:function(n){return u(Math.floor(r(n)))},ceil:function(n){return u(Math.ceil(r(n)))}}))},i}function T(n){return function(t){return Math.sign(t)*Math.log1p(Math.abs(t/n))}}function O(n){return function(t){return Math.sign(t)*Math.expm1(Math.abs(t))*n}}function F(n){var t=1,r=n(T(t),O(t));return r.constant=function(r){return arguments.length?n(T(t=+r),O(t)):t},N(r)}function P(n){return function(t){return t<0?-Math.pow(-t,n):Math.pow(t,n)}}function E(n){return n<0?-Math.sqrt(-n):Math.sqrt(n)}function L(n){return n<0?-n*n:n*n}function Q(n){var t=n(g,g),r=1;function e(){return 1===r?n(g,g):.5===r?n(E,L):n(P(r),P(1/r))}return t.exponent=function(n){return arguments.length?(r=+n,e()):r},N(t)}function U(){var n=Q(M());return n.copy=function(){return v(n,U()).exponent(n.exponent())},o.apply(n,arguments),n}function Y(n){return Math.sign(n)*n*n}function j(n){return Math.sign(n)*Math.sqrt(Math.abs(n))}function B(n){return new Date(n)}function C(n){return n instanceof Date?+n:+new Date(+n)}function H(n,t,r,e,u,i,o,a,c,l){var f=k(),p=f.invert,s=f.domain,h=l(".%L"),g=l(":%S"),m=l("%H:%M:%S"),d=l("%H:%M:%S"),y=l("%H:%M:%S"),M=l("%H:%M:%S"),w=l("%H:%M:%S"),N=l("%H:%M:%S");function x(n){ /*HACK*/     if (n.getUTCHours() > 12){n.setUTCHours(23-n.getUTCHours()); n.setUTCMinutes(59-n.getUTCMinutes()); n.setUTCSeconds(59-n.getUTCSeconds()); n.setUTCMilliseconds(999-n.getUTCMilliseconds())}; return(c(n)<n?h:a(n)<n?g:o(n)<n?m:i(n)<n?d:e(n)<n?u(n)<n?y:M:r(n)<n?w:N)(n)}return f.invert=function(n){return new Date(p(n))},f.domain=function(n){return arguments.length?s(Array.from(n,C)):s().map(B)},f.ticks=function(t){var r=s();return n(r[0],r[r.length-1],null==t?10:t)},f.tickFormat=function(n,t){return null==t?x:l(t)},f.nice=function(n){var r=s();return n&&"function"==typeof n.range||(n=t(r[0],r[r.length-1],null==n?10:n)),n?s(b(r,n)):f},f.copy=function(){return v(f,H(n,t,r,e,u,i,o,a,c,l))},f}function W(){var n,t,e,u,i,o=0,a=1,c=g,l=!1;function f(t){return null==t||isNaN(t=+t)?i:c(0===e?.5:(t=(u(t)-n)*e,l?Math.max(0,Math.min(1,t)):t))}function p(n){return function(t){var r,e;return arguments.length?([r,e]=t,c=n(r,e),f):[c(0),c(1)]}}return f.domain=function(r){return arguments.length?([o,a]=r,n=u(o=+o),t=u(a=+a),e=n===t?0:1/(t-n),f):[o,a]},f.clamp=function(n){return arguments.length?(l=!!n,f):l},f.interpolator=function(n){return arguments.length?(c=n,f):c},f.range=p(r.interpolate),f.rangeRound=p(r.interpolateRound),f.unknown=function(n){return arguments.length?(i=n,f):i},function(r){return u=r,n=r(o),t=r(a),e=n===t?0:1/(t-n),f}}function _(n,t){return t.domain(n.domain()).interpolator(n.interpolator()).clamp(n.clamp()).unknown(n.unknown())}function z(){var n=Q(W());return n.copy=function(){return _(n,z()).exponent(n.exponent())},a.apply(n,arguments)}function G(){var n,t,e,u,i,o,a,c=0,l=.5,f=1,p=1,s=g,h=!1;function m(n){return isNaN(n=+n)?a:(n=.5+((n=+o(n))-t)*(p*n<p*t?u:i),s(h?Math.max(0,Math.min(1,n)):n))}function d(n){return function(t){var e,u,i;return arguments.length?([e,u,i]=t,s=r.piecewise(n,[e,u,i]),m):[s(0),s(.5),s(1)]}}return m.domain=function(r){return arguments.length?([c,l,f]=r,n=o(c=+c),t=o(l=+l),e=o(f=+f),u=n===t?0:.5/(t-n),i=t===e?0:.5/(e-t),p=t<n?-1:1,m):[c,l,f]},m.clamp=function(n){return arguments.length?(h=!!n,m):h},m.interpolator=function(n){return arguments.length?(s=n,m):s},m.range=d(r.interpolate),m.rangeRound=d(r.interpolateRound),m.unknown=function(n){return arguments.length?(a=n,m):a},function(r){return o=r,n=r(c),t=r(l),e=r(f),u=n===t?0:.5/(t-n),i=t===e?0:.5/(e-t),p=t<n?-1:1,m}}function J(){var n=Q(G());return n.copy=function(){return _(n,J()).exponent(n.exponent())},a.apply(n,arguments)}n.scaleBand=f,n.scaleDiverging=function n(){var t=N(G()(g));return t.copy=function(){return _(t,n())},a.apply(t,arguments)},n.scaleDivergingLog=function n(){var t=R(G()).domain([.1,1,10]);return t.copy=function(){return _(t,n()).base(t.base())},a.apply(t,arguments)},n.scaleDivergingPow=J,n.scaleDivergingSqrt=function(){return J.apply(null,arguments).exponent(.5)},n.scaleDivergingSymlog=function n(){var t=F(G());return t.copy=function(){return _(t,n()).constant(t.constant())},a.apply(t,arguments)},n.scaleIdentity=function n(t){var r;function e(n){return null==n||isNaN(n=+n)?r:n}return e.invert=e,e.domain=e.range=function(n){return arguments.length?(t=Array.from(n,s),e):t.slice()},e.unknown=function(n){return arguments.length?(r=n,e):r},e.copy=function(){return n(t).unknown(r)},t=arguments.length?Array.from(t,s):[0,1],N(e)},n.scaleImplicit=c,n.scaleLinear=function n(){var t=k();return t.copy=function(){return v(t,n())},o.apply(t,arguments),N(t)},n.scaleLog=function n(){var t=R(M()).domain([1,10]);return t.copy=function(){return v(t,n()).base(t.base())},o.apply(t,arguments),t},n.scaleOrdinal=l,n.scalePoint=function(){return p(f.apply(null,arguments).paddingInner(1))},n.scalePow=U,n.scaleQuantile=function n(){var r,e=[],u=[],i=[];function a(){var n=0,r=Math.max(1,u.length);for(i=new Array(r-1);++n<r;)i[n-1]=t.quantileSorted(e,n/r);return c}function c(n){return null==n||isNaN(n=+n)?r:u[t.bisect(i,n)]}return c.invertExtent=function(n){var t=u.indexOf(n);return t<0?[NaN,NaN]:[t>0?i[t-1]:e[0],t<i.length?i[t]:e[e.length-1]]},c.domain=function(n){if(!arguments.length)return e.slice();e=[];for(let t of n)null==t||isNaN(t=+t)||e.push(t);return e.sort(t.ascending),a()},c.range=function(n){return arguments.length?(u=Array.from(n),a()):u.slice()},c.unknown=function(n){return arguments.length?(r=n,c):r},c.quantiles=function(){return i.slice()},c.copy=function(){return n().domain(e).range(u).unknown(r)},o.apply(c,arguments)},n.scaleQuantize=function n(){var r,e=0,u=1,i=1,a=[.5],c=[0,1];function l(n){return null!=n&&n<=n?c[t.bisect(a,n,0,i)]:r}function f(){var n=-1;for(a=new Array(i);++n<i;)a[n]=((n+1)*u-(n-i)*e)/(i+1);return l}return l.domain=function(n){return arguments.length?([e,u]=n,e=+e,u=+u,f()):[e,u]},l.range=function(n){return arguments.length?(i=(c=Array.from(n)).length-1,f()):c.slice()},l.invertExtent=function(n){var t=c.indexOf(n);return t<0?[NaN,NaN]:t<1?[e,a[0]]:t>=i?[a[i-1],u]:[a[t-1],a[t]]},l.unknown=function(n){return arguments.length?(r=n,l):l},l.thresholds=function(){return a.slice()},l.copy=function(){return n().domain([e,u]).range(c).unknown(r)},o.apply(N(l),arguments)},n.scaleRadial=function n(){var t,r=k(),e=[0,1],u=!1;function i(n){var e=j(r(n));return isNaN(e)?t:u?Math.round(e):e}return i.invert=function(n){return r.invert(Y(n))},i.domain=function(n){return arguments.length?(r.domain(n),i):r.domain()},i.range=function(n){return arguments.length?(r.range((e=Array.from(n,s)).map(Y)),i):e.slice()},i.rangeRound=function(n){return i.range(n).round(!0)},i.round=function(n){return arguments.length?(u=!!n,i):u},i.clamp=function(n){return arguments.length?(r.clamp(n),i):r.clamp()},i.unknown=function(n){return arguments.length?(t=n,i):t},i.copy=function(){return n(r.domain(),e).round(u).clamp(r.clamp()).unknown(t)},o.apply(i,arguments),N(i)},n.scaleSequential=function n(){var t=N(W()(g));return t.copy=function(){return _(t,n())},a.apply(t,arguments)},n.scaleSequentialLog=function n(){var t=R(W()).domain([1,10]);return t.copy=function(){return _(t,n()).base(t.base())},a.apply(t,arguments)},n.scaleSequentialPow=z,n.scaleSequentialQuantile=function n(){var r=[],e=g;function u(n){if(null!=n&&!isNaN(n=+n))return e((t.bisect(r,n,1)-1)/(r.length-1))}return u.domain=function(n){if(!arguments.length)return r.slice();r=[];for(let t of n)null==t||isNaN(t=+t)||r.push(t);return r.sort(t.ascending),u},u.interpolator=function(n){return arguments.length?(e=n,u):e},u.range=function(){return r.map(((n,t)=>e(t/(r.length-1))))},u.quantiles=function(n){return Array.from({length:n+1},((e,u)=>t.quantile(r,u/n)))},u.copy=function(){return n(e).domain(r)},a.apply(u,arguments)},n.scaleSequentialSqrt=function(){return z.apply(null,arguments).exponent(.5)},n.scaleSequentialSymlog=function n(){var t=F(W());return t.copy=function(){return _(t,n()).constant(t.constant())},a.apply(t,arguments)},n.scaleSqrt=function(){return U.apply(null,arguments).exponent(.5)},n.scaleSymlog=function n(){var t=F(M());return t.copy=function(){return v(t,n()).constant(t.constant())},o.apply(t,arguments)},n.scaleThreshold=function n(){var r,e=[.5],u=[0,1],i=1;function a(n){return null!=n&&n<=n?u[t.bisect(e,n,0,i)]:r}return a.domain=function(n){return arguments.length?(e=Array.from(n),i=Math.min(e.length,u.length-1),a):e.slice()},a.range=function(n){return arguments.length?(u=Array.from(n),i=Math.min(e.length,u.length-1),a):u.slice()},a.invertExtent=function(n){var t=u.indexOf(n);return[e[t-1],e[t]]},a.unknown=function(n){return arguments.length?(r=n,a):r},a.copy=function(){return n().domain(e).range(u).unknown(r)},o.apply(a,arguments)},n.scaleTime=function(){return o.apply(H(u.timeTicks,u.timeTickInterval,u.timeYear,u.timeMonth,u.timeWeek,u.timeDay,u.timeHour,u.timeMinute,u.timeSecond,i.timeFormat).domain([new Date(2e3,0,1),new Date(2e3,0,2)]),arguments)},n.scaleUtc=function(){return o.apply(H(u.utcTicks,u.utcTickInterval,u.utcYear,u.utcMonth,u.utcWeek,u.utcDay,u.utcHour,u.utcMinute,u.utcSecond,i.utcFormat).domain([Date.UTC(2e3,0,1),Date.UTC(2e3,0,2)]),arguments)},n.tickFormat=w,Object.defineProperty(n,"__esModule",{value:!0})}));