"use strict";
(function(module) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], function(exports)  {
            module(exports);
        });
    } else if (typeof exports === 'object' && exports !== null && typeof exports.nodeName !== 'string') {
        module(exports);
    } else {
        module(typeof self !== 'undefined' ? self : this);
}
}(function($rt_exports) {
let $rt_seed = 2463534242,
$rt_nextId = () => {
    let x = $rt_seed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    $rt_seed = x;
    return x;
},
$rt_wrapFunction0 = f => function() {
    return f(this);
},
$rt_wrapFunction1 = f => function(p1) {
    return f(this, p1);
},
$rt_wrapFunction3 = f => function(p1, p2, p3) {
    return f(this, p1, p2, p3, p3);
},
$rt_mainStarter = f => (args, callback) => {
    if (!args) {
        args = [];
    }
    let javaArgs = $rt_createArray($rt_objcls(), args.length);
    for (let i = 0;i < args.length;++i) {
        javaArgs.data[i] = $rt_str(args[i]);
    }
    $rt_startThread(() => {
        f.call(null, javaArgs);
    }, callback);
},
$rt_eraseClinit = target => target.$clinit = () => {
},
$dbg_class = obj => {
    let cls = obj.constructor;
    let arrayDegree = 0;
    while (cls.$meta && cls.$meta.item) {
        ++arrayDegree;
        cls = cls.$meta.item;
    }
    let clsName = "";
    if (cls.$meta.primitive) {
        clsName = cls.$meta.name;
    } else {
        clsName = cls.$meta ? cls.$meta.name || "a/" + cls.name : "@" + cls.name;
    }
    while (arrayDegree-- > 0) {
        clsName += "[]";
    }
    return clsName;
},
$rt_classWithoutFields = superclass => {
    if (superclass === 0) {
        return function() {
        };
    }
    if (superclass === void 0) {
        superclass = $rt_objcls();
    }
    return function() {
        superclass.call(this);
    };
},
$rt_cls = cls => jl_Class_getClass(cls),
$rt_objcls = () => jl_Object,
$rt_createcls = () => {
    return { $array : null, classObject : null, $meta : { supertypes : [], superclass : null } };
},
$rt_createPrimitiveCls = (name, binaryName) => {
    let cls = $rt_createcls();
    cls.$meta.primitive = true;
    cls.$meta.name = name;
    cls.$meta.binaryName = binaryName;
    cls.$meta.enum = false;
    cls.$meta.item = null;
    cls.$meta.simpleName = null;
    cls.$meta.declaringClass = null;
    cls.$meta.enclosingClass = null;
    return cls;
},
$rt_charcls = $rt_createPrimitiveCls("char", "C"),
$rt_intcls = $rt_createPrimitiveCls("int", "I"),
$rt_voidcls = $rt_createPrimitiveCls("void", "V");
if (typeof BigInt !== 'function') {
} else if (typeof BigInt64Array !== 'function') {
} else {
}
let $rt_compare = (a, b) => a > b ? 1 : a < b ?  -1 : a === b ? 0 : 1,
$rt_imul = Math.imul || function(a, b) {
    let ah = a >>> 16 & 0xFFFF;
    let al = a & 0xFFFF;
    let bh = b >>> 16 & 0xFFFF;
    let bl = b & 0xFFFF;
    return al * bl + (ah * bl + al * bh << 16 >>> 0) | 0;
},
$rt_udiv = (a, b) => (a >>> 0) / (b >>> 0) >>> 0,
$rt_umod = (a, b) => (a >>> 0) % (b >>> 0) >>> 0,
$rt_ucmp = (a, b) => {
    a >>>= 0;
    b >>>= 0;
    return a < b ?  -1 : a > b ? 1 : 0;
};
function Long(lo, hi) {
    this.lo = lo | 0;
    this.hi = hi | 0;
}
if (typeof BigInt !== "function") {
} else {
}
if (typeof BigInt !== 'function') {
    function LongInt(lo, hi, sup) {
        this.lo = lo;
        this.hi = hi;
        this.sup = sup;
    }
} else {
}
let $rt_createArray = (cls, sz) => {
    let data = new Array(sz);
    data.fill(null);
    return new ($rt_arraycls(cls))(data);
};
if (typeof BigInt64Array !== 'function') {
} else {
}
let $rt_createCharArray = sz => new $rt_charArrayCls(new Uint16Array(sz)),
$rt_createIntArray = sz => new $rt_intArrayCls(new Int32Array(sz)),
$rt_arraycls = cls => {
    let result = cls.$array;
    if (result === null) {
        function JavaArray(data) {
            ($rt_objcls()).call(this);
            this.data = data;
        }
        JavaArray.prototype = Object.create(($rt_objcls()).prototype);
        JavaArray.prototype.type = cls;
        JavaArray.prototype.constructor = JavaArray;
        JavaArray.prototype.toString = function() {
            let str = "[";
            for (let i = 0;i < this.data.length;++i) {
                if (i > 0) {
                    str += ", ";
                }
                str += this.data[i].toString();
            }
            str += "]";
            return str;
        };
        JavaArray.prototype.$clone = function() {
            let dataCopy;
            if ('slice' in this.data) {
                dataCopy = this.data.slice();
            } else {
                dataCopy = new this.data.constructor(this.data.length);
                for (let i = 0;i < dataCopy.length;++i) {
                    dataCopy[i] = this.data[i];
                }
            }
            return new ($rt_arraycls(this.type))(dataCopy);
        };
        let name = "[" + cls.$meta.binaryName;
        JavaArray.$meta = { item : cls, supertypes : [$rt_objcls()], primitive : false, superclass : $rt_objcls(), name : name, binaryName : name, enum : false, simpleName : null, declaringClass : null, enclosingClass : null };
        JavaArray.classObject = null;
        JavaArray.$array = null;
        result = JavaArray;
        cls.$array = JavaArray;
    }
    return result;
},
$rt_stringPool_instance,
$rt_stringPool = strings => {
    $rt_stringClassInit();
    $rt_stringPool_instance = new Array(strings.length);
    for (let i = 0;i < strings.length;++i) {
        $rt_stringPool_instance[i] = $rt_intern($rt_str(strings[i]));
    }
},
$rt_s = index => $rt_stringPool_instance[index],
$rt_charArrayToString = (array, offset, count) => {
    let result = "";
    let limit = offset + count;
    for (let i = offset;i < limit;i = i + 1024 | 0) {
        let next = Math.min(limit, i + 1024 | 0);
        result += String.fromCharCode.apply(null, array.subarray(i, next));
    }
    return result;
},
$rt_str = str => str === null ? null : jl_String__init_(str),
$rt_ustr = str => str === null ? null : str.$nativeString,
$rt_stringClassInit = () => (() => {})(),
$rt_intern;
{
    $rt_intern = str => str;
}
let $rt_throw = ex => {
    throw $rt_exception(ex);
},
$rt_javaExceptionProp = Symbol("javaException"),
$rt_exception = ex => {
    let err = ex.$jsException;
    if (!err) {
        let javaCause = $rt_throwableCause(ex);
        let jsCause = javaCause !== null ? javaCause.$jsException : void 0;
        let cause = typeof jsCause === "object" ? { cause : jsCause } : void 0;
        err = new JavaError("Java exception thrown", cause);
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(err);
        }
        err[$rt_javaExceptionProp] = ex;
        ex.$jsException = err;
        $rt_fillStack(err, ex);
    }
    return err;
},
$rt_fillStack = (err, ex) => {
    if (typeof $rt_decodeStack === "function" && err.stack) {
        let stack = $rt_decodeStack(err.stack);
        let javaStack = $rt_createArray($rt_stecls(), stack.length);
        let elem;
        let noStack = false;
        for (let i = 0;i < stack.length;++i) {
            let element = stack[i];
            elem = $rt_createStackElement($rt_str(element.className), $rt_str(element.methodName), $rt_str(element.fileName), element.lineNumber);
            if (elem == null) {
                noStack = true;
                break;
            }
            javaStack.data[i] = elem;
        }
        if (!noStack) {
            $rt_setStack(ex, javaStack);
        }
    }
},
JavaError;
if (typeof Reflect === 'object') {
    let defaultMessage = Symbol("defaultMessage");
    JavaError = function JavaError(message, cause) {
        let self = Reflect.construct(Error, [void 0, cause], JavaError);
        Object.setPrototypeOf(self, JavaError.prototype);
        self[defaultMessage] = message;
        return self;
    }
    ;
    JavaError.prototype = Object.create(Error.prototype, { constructor : { configurable : true, writable : true, value : JavaError }, message : { get() {
        try {
            let javaException = this[$rt_javaExceptionProp];
            if (typeof javaException === 'object') {
                let javaMessage = $rt_throwableMessage(javaException);
                if (typeof javaMessage === "object") {
                    return javaMessage !== null ? javaMessage.toString() : null;
                }
            }
            return this[defaultMessage];
        } catch (e){
            return "Exception occurred trying to extract Java exception message: " + e;
        }
    } } });
} else {
    JavaError = Error;
}
let $rt_javaException = e => e instanceof Error && typeof e[$rt_javaExceptionProp] === 'object' ? e[$rt_javaExceptionProp] : null,
$rt_wrapException = err => {
    let ex = err[$rt_javaExceptionProp];
    if (!ex) {
        ex = $rt_createException($rt_str("(JavaScript) " + err.toString()));
        err[$rt_javaExceptionProp] = ex;
        ex.$jsException = err;
        $rt_fillStack(err, ex);
    }
    return ex;
},
$rt_createException = message => jl_RuntimeException__init_1(message),
$rt_throwableMessage = t => jl_Throwable_getMessage(t),
$rt_throwableCause = t => jl_Throwable_getCause(t),
$rt_stecls = () => $rt_objcls(),
$rt_createStackElement = (className, methodName, fileName, lineNumber) => {
    {
        return null;
    }
},
$rt_setStack = (e, stack) => {
},
$rt_packageData = null,
$rt_packages = data => {
    let i = 0;
    let packages = new Array(data.length);
    for (let j = 0;j < data.length;++j) {
        let prefixIndex = data[i++];
        let prefix = prefixIndex >= 0 ? packages[prefixIndex] : "";
        packages[j] = prefix + data[i++] + ".";
    }
    $rt_packageData = packages;
},
$rt_metadata = data => {
    let packages = $rt_packageData;
    let i = 0;
    while (i < data.length) {
        let cls = data[i++];
        cls.$meta = {  };
        let m = cls.$meta;
        let className = data[i++];
        m.name = className !== 0 ? className : null;
        if (m.name !== null) {
            let packageIndex = data[i++];
            if (packageIndex >= 0) {
                m.name = packages[packageIndex] + m.name;
            }
        }
        m.binaryName = "L" + m.name + ";";
        let superclass = data[i++];
        m.superclass = superclass !== 0 ? superclass : null;
        m.supertypes = data[i++];
        if (m.superclass) {
            m.supertypes.push(m.superclass);
            cls.prototype = Object.create(m.superclass.prototype);
        } else {
            cls.prototype = {  };
        }
        let flags = data[i++];
        m.enum = (flags & 8) !== 0;
        m.flags = flags;
        m.primitive = false;
        m.item = null;
        cls.prototype.constructor = cls;
        cls.classObject = null;
        m.accessLevel = data[i++];
        let innerClassInfo = data[i++];
        if (innerClassInfo === 0) {
            m.simpleName = null;
            m.declaringClass = null;
            m.enclosingClass = null;
        } else {
            let enclosingClass = innerClassInfo[0];
            m.enclosingClass = enclosingClass !== 0 ? enclosingClass : null;
            let declaringClass = innerClassInfo[1];
            m.declaringClass = declaringClass !== 0 ? declaringClass : null;
            let simpleName = innerClassInfo[2];
            m.simpleName = simpleName !== 0 ? simpleName : null;
        }
        let clinit = data[i++];
        cls.$clinit = clinit !== 0 ? clinit : function() {
        };
        let virtualMethods = data[i++];
        if (virtualMethods !== 0) {
            for (let j = 0;j < virtualMethods.length;j += 2) {
                let name = virtualMethods[j];
                let func = virtualMethods[j + 1];
                if (typeof name === 'string') {
                    name = [name];
                }
                for (let k = 0;k < name.length;++k) {
                    cls.prototype[name[k]] = func;
                }
            }
        }
        cls.$array = null;
    }
},
$rt_startThread = (runner, callback) => {
    let result;
    try {
        result = runner();
    } catch (e){
        result = e;
    }
    if (typeof callback !== 'undefined') {
        callback(result);
    } else if (result instanceof Error) {
        throw result;
    }
};
function jl_Object() {
    this.$id$ = 0;
}
let jl_Object_getClass = $this => {
    return jl_Class_getClass($this.constructor);
},
jl_Object_toString = $this => {
    let var$1, var$2, var$3, var$4, var$5, var$6, var$7, var$8, var$9, var$10;
    var$1 = jl_Object_getClass($this);
    if (var$1.$name === null)
        var$1.$name = $rt_str(var$1.$platformClass.$meta.name);
    var$2 = var$1.$name;
    var$1 = $this;
    if (!var$1.$id$)
        var$1.$id$ = $rt_nextId();
    var$3 = $this.$id$;
    if (!var$3)
        var$4 = $rt_s(0);
    else {
        if (!var$3)
            var$5 = 32;
        else {
            var$6 = 0;
            var$5 = var$3 >>> 16 | 0;
            if (var$5)
                var$6 = 16;
            else
                var$5 = var$3;
            var$7 = var$5 >>> 8 | 0;
            if (!var$7)
                var$7 = var$5;
            else
                var$6 = var$6 | 8;
            var$5 = var$7 >>> 4 | 0;
            if (!var$5)
                var$5 = var$7;
            else
                var$6 = var$6 | 4;
            var$7 = var$5 >>> 2 | 0;
            if (!var$7)
                var$7 = var$5;
            else
                var$6 = var$6 | 2;
            if (var$7 >>> 1 | 0)
                var$6 = var$6 | 1;
            var$5 = (32 - var$6 | 0) - 1 | 0;
        }
        var$5 = (((32 - var$5 | 0) + 4 | 0) - 1 | 0) / 4 | 0;
        var$8 = $rt_createCharArray(var$5);
        var$9 = var$8.data;
        var$6 = (var$5 - 1 | 0) * 4 | 0;
        var$7 = 0;
        while (var$6 >= 0) {
            var$10 = var$7 + 1 | 0;
            var$9[var$7] = jl_Character_forDigit((var$3 >>> var$6 | 0) & 15, 16);
            var$6 = var$6 - 4 | 0;
            var$7 = var$10;
        }
        var$4 = jl_String__init_1(var$8);
    }
    var$1 = jl_StringBuilder__init_();
    jl_StringBuilder_append(jl_StringBuilder_append0(jl_StringBuilder_append(var$1, var$2), 64), var$4);
    return jl_StringBuilder_toString(var$1);
},
p_PxemMain = $rt_classWithoutFields(),
p_PxemMain_$callClinit = () => {
    p_PxemMain_$callClinit = $rt_eraseClinit(p_PxemMain);
    p_PxemMain__clinit_();
},
p_PxemMain_main = $args => {
    p_PxemMain_$callClinit();
    window.pxemJavaRun = otji_JS_function(new p_PxemMain$main$lambda$_2_0, "call");
},
p_PxemMain__clinit_ = () => {
    jl_String__clinit_();
    jl_Integer__clinit_();
    jl_Character__clinit_();
},
jlr_AnnotatedElement = $rt_classWithoutFields(0),
jlr_Type = $rt_classWithoutFields(0);
function jl_Class() {
    let a = this; jl_Object.call(a);
    a.$name = null;
    a.$platformClass = null;
}
let jl_Class_getClass = $cls => {
    let $result;
    if ($cls === null)
        return null;
    $result = $cls.classObject;
    if ($result === null) {
        $result = new jl_Class;
        $result.$platformClass = $cls;
        $cls.classObject = $result;
    }
    return $result;
},
jl_Class_getComponentType = $this => {
    return jl_Class_getClass($this.$platformClass.$meta.item);
},
otji_JS = $rt_classWithoutFields(),
otji_JS_function = (var$1, var$2) => {
    let name = 'jso$functor$' + var$2;
    let result = var$1[name];
    if (typeof result !== 'function') {
        let fn = function() {
            return var$1[var$2].apply(var$1, arguments);
        };
        result = () => fn;
        var$1[name] = result;
    }
    return result();
},
otp_Platform = $rt_classWithoutFields();
function jl_Throwable() {
    let a = this; jl_Object.call(a);
    a.$message = null;
    a.$cause = null;
    a.$suppressionEnabled = 0;
    a.$writableStackTrace = 0;
}
let jl_Throwable_fillInStackTrace = $this => {
    return $this;
},
jl_Throwable_getMessage = $this => {
    return $this.$message;
},
jl_Throwable_getCause = $this => {
    let var$1;
    var$1 = $this.$cause;
    if (var$1 === $this)
        var$1 = null;
    return var$1;
},
jl_Exception = $rt_classWithoutFields(jl_Throwable),
jl_RuntimeException = $rt_classWithoutFields(jl_Exception),
jl_RuntimeException__init_ = $this => {
    $this.$suppressionEnabled = 1;
    $this.$writableStackTrace = 1;
},
jl_RuntimeException__init_2 = () => {
    let var_0 = new jl_RuntimeException();
    jl_RuntimeException__init_(var_0);
    return var_0;
},
jl_RuntimeException__init_0 = ($this, $message) => {
    $this.$suppressionEnabled = 1;
    $this.$writableStackTrace = 1;
    $this.$message = $message;
},
jl_RuntimeException__init_1 = var_0 => {
    let var_1 = new jl_RuntimeException();
    jl_RuntimeException__init_0(var_1, var_0);
    return var_1;
},
jl_ClassCastException = $rt_classWithoutFields(jl_RuntimeException),
ji_Serializable = $rt_classWithoutFields(0),
jl_Comparable = $rt_classWithoutFields(0),
jl_CharSequence = $rt_classWithoutFields(0),
jl_String = $rt_classWithoutFields(),
jl_String_EMPTY_CHARS = null,
jl_String_EMPTY = null,
jl_String_CASE_INSENSITIVE_ORDER = null,
jl_String__init_0 = ($this, $characters) => {
    $this.$nativeString = $rt_charArrayToString($characters.data, 0, $characters.data.length);
},
jl_String__init_1 = var_0 => {
    let var_1 = new jl_String();
    jl_String__init_0(var_1, var_0);
    return var_1;
},
jl_String__init_2 = (var$0, var$1) => {
    var$0.$nativeString = var$1;
},
jl_String__init_ = var_0 => {
    let var_1 = new jl_String();
    jl_String__init_2(var_1, var_0);
    return var_1;
},
jl_String_charAt = (var$0, var$1) => {
    let var$2;
    if (var$1 >= 0 && var$1 < var$0.$nativeString.length)
        return var$0.$nativeString.charCodeAt(var$1);
    var$2 = new jl_StringIndexOutOfBoundsException;
    jl_RuntimeException__init_(var$2);
    $rt_throw(var$2);
},
jl_String_isEmpty = $this => {
    return $this.$nativeString.length ? 0 : 1;
},
jl_String_substring = ($this, $beginIndex, $endIndex) => {
    let $length, var$4, var$5;
    $length = $this.$nativeString.length;
    var$4 = $rt_compare($beginIndex, $endIndex);
    if (!var$4)
        return jl_String_EMPTY;
    if (!$beginIndex && $endIndex == $length)
        return $this;
    if ($beginIndex >= 0 && var$4 <= 0 && $endIndex <= $length)
        return jl_String__init_($this.$nativeString.substring($beginIndex, $endIndex));
    var$5 = new jl_StringIndexOutOfBoundsException;
    jl_RuntimeException__init_(var$5);
    $rt_throw(var$5);
},
jl_String_codePoints = $this => {
    let var$1;
    var$1 = new jusi_StringCodePointsStream;
    var$1.$string = $this;
    return var$1;
},
jl_String__clinit_ = () => {
    let var$1;
    jl_String_EMPTY_CHARS = $rt_createCharArray(0);
    var$1 = new jl_String;
    var$1.$nativeString = "";
    jl_String_EMPTY = var$1;
    jl_String_CASE_INSENSITIVE_ORDER = new jl_String$_clinit_$lambda$_115_0;
},
jl_Number = $rt_classWithoutFields();
function jl_Integer() {
    jl_Number.call(this);
    this.$value = 0;
}
let jl_Integer_TYPE = null,
jl_Integer_integerCache = null,
jl_Integer__init_0 = ($this, $value) => {
    $this.$value = $value;
},
jl_Integer__init_ = var_0 => {
    let var_1 = new jl_Integer();
    jl_Integer__init_0(var_1, var_0);
    return var_1;
},
jl_Integer_valueOf = $i => {
    let var$2, var$3;
    if ($i >= (-128) && $i <= 127) {
        a: {
            if (jl_Integer_integerCache === null) {
                jl_Integer_integerCache = $rt_createArray(jl_Integer, 256);
                var$2 = 0;
                while (true) {
                    var$3 = jl_Integer_integerCache.data;
                    if (var$2 >= var$3.length)
                        break a;
                    var$3[var$2] = jl_Integer__init_(var$2 - 128 | 0);
                    var$2 = var$2 + 1 | 0;
                }
            }
        }
        return jl_Integer_integerCache.data[$i + 128 | 0];
    }
    return jl_Integer__init_($i);
},
jl_Integer_intValue = $this => {
    return $this.$value;
},
jl_Integer_hashCode = $this => {
    return $this.$value;
},
jl_Integer_equals = ($this, $other) => {
    if ($this === $other)
        return 1;
    return $other instanceof jl_Integer && $other.$value == $this.$value ? 1 : 0;
},
jl_Integer__clinit_ = () => {
    jl_Integer_TYPE = $rt_cls($rt_intcls);
};
function jl_AbstractStringBuilder() {
    let a = this; jl_Object.call(a);
    a.$buffer = null;
    a.$length = 0;
}
let jl_AbstractStringBuilder_append = ($this, $value) => {
    let var$2, var$3, var$4, var$5, var$6, var$7, var$8, var$9;
    var$2 = $this.$length;
    var$3 = 1;
    if ($value < 0) {
        var$3 = 0;
        $value =  -$value | 0;
    }
    a: {
        if ($rt_ucmp($value, 10) < 0) {
            if (var$3)
                jl_AbstractStringBuilder_insertSpace($this, var$2, var$2 + 1 | 0);
            else {
                jl_AbstractStringBuilder_insertSpace($this, var$2, var$2 + 2 | 0);
                var$4 = $this.$buffer.data;
                var$5 = var$2 + 1 | 0;
                var$4[var$2] = 45;
                var$2 = var$5;
            }
            $this.$buffer.data[var$2] = jl_Character_forDigit($value, 10);
        } else {
            var$6 = 1;
            var$7 = 1;
            var$5 = $rt_udiv((-1), 10);
            b: {
                while (true) {
                    var$8 = var$6 * 10 | 0;
                    if ($rt_ucmp(var$8, $value) > 0) {
                        var$8 = var$6;
                        break b;
                    }
                    var$7 = var$7 + 1 | 0;
                    if ($rt_ucmp(var$8, var$5) > 0)
                        break;
                    var$6 = var$8;
                }
            }
            if (!var$3)
                var$7 = var$7 + 1 | 0;
            jl_AbstractStringBuilder_insertSpace($this, var$2, var$2 + var$7 | 0);
            if (var$3)
                var$5 = var$2;
            else {
                var$4 = $this.$buffer.data;
                var$5 = var$2 + 1 | 0;
                var$4[var$2] = 45;
            }
            while (true) {
                if (!var$8)
                    break a;
                var$4 = $this.$buffer.data;
                var$9 = var$5 + 1 | 0;
                var$4[var$5] = jl_Character_forDigit($rt_udiv($value, var$8), 10);
                $value = $rt_umod($value, var$8);
                var$8 = $rt_udiv(var$8, 10);
                var$5 = var$9;
            }
        }
    }
    return $this;
},
jl_AbstractStringBuilder_insertSpace = ($this, $start, $end) => {
    let var$3, $sz, $i, var$6;
    var$3 = $this.$length;
    $sz = var$3 - $start | 0;
    jl_StringBuilder_ensureCapacity($this, (var$3 + $end | 0) - $start | 0);
    $i = $sz - 1 | 0;
    while ($i >= 0) {
        var$6 = $this.$buffer.data;
        var$6[$end + $i | 0] = var$6[$start + $i | 0];
        $i = $i + (-1) | 0;
    }
    $this.$length = $this.$length + ($end - $start | 0) | 0;
},
jl_Appendable = $rt_classWithoutFields(0),
jl_StringBuilder = $rt_classWithoutFields(jl_AbstractStringBuilder),
jl_StringBuilder__init_0 = $this => {
    $this.$buffer = $rt_createCharArray(16);
},
jl_StringBuilder__init_ = () => {
    let var_0 = new jl_StringBuilder();
    jl_StringBuilder__init_0(var_0);
    return var_0;
},
jl_StringBuilder_append = ($this, $obj) => {
    let var$2, var$3, var$4, var$5, var$6;
    var$2 = $this.$length;
    if ($obj === null)
        $obj = $rt_s(1);
    if (var$2 >= 0 && var$2 <= var$2) {
        if (!jl_String_isEmpty($obj)) {
            jl_StringBuilder_ensureCapacity($this, $this.$length + $obj.$nativeString.length | 0);
            var$3 = $this.$length - 1 | 0;
            while (var$3 >= var$2) {
                $this.$buffer.data[var$3 + $obj.$nativeString.length | 0] = $this.$buffer.data[var$3];
                var$3 = var$3 + (-1) | 0;
            }
            $this.$length = $this.$length + $obj.$nativeString.length | 0;
            var$4 = 0;
            while (var$4 < $obj.$nativeString.length) {
                var$5 = $this.$buffer.data;
                var$6 = var$2 + 1 | 0;
                var$5[var$2] = jl_String_charAt($obj, var$4);
                var$4 = var$4 + 1 | 0;
                var$2 = var$6;
            }
        }
        return $this;
    }
    $obj = new jl_StringIndexOutOfBoundsException;
    jl_IndexOutOfBoundsException__init_($obj);
    $rt_throw($obj);
},
jl_StringBuilder_append0 = ($this, $c) => {
    let var$2;
    var$2 = $this.$length;
    jl_AbstractStringBuilder_insertSpace($this, var$2, var$2 + 1 | 0);
    $this.$buffer.data[var$2] = $c;
    return $this;
},
jl_StringBuilder_appendCodePoint = ($this, $codePoint) => {
    let var$2, var$3, var$4;
    if ($codePoint < 65536)
        jl_StringBuilder_append0($this, $codePoint & 65535);
    else {
        jl_StringBuilder_ensureCapacity($this, $this.$length + 2 | 0);
        var$2 = $this.$buffer.data;
        var$3 = $this.$length;
        var$4 = var$3 + 1 | 0;
        $this.$length = var$4;
        var$2[var$3] = (55296 | ($codePoint - 65536 | 0) >> 10 & 1023) & 65535;
        $this.$length = var$4 + 1 | 0;
        var$2[var$4] = (56320 | $codePoint & 1023) & 65535;
    }
    return $this;
},
jl_StringBuilder_toString = $this => {
    let var$1, var$2, var$3, var$4, var$5;
    var$1 = new jl_String;
    var$2 = $this.$buffer;
    var$3 = var$2.data;
    var$4 = $this.$length;
    var$5 = var$3.length;
    if (var$4 >= 0 && var$4 <= (var$5 - 0 | 0)) {
        var$1.$nativeString = $rt_charArrayToString(var$2.data, 0, var$4);
        return var$1;
    }
    var$1 = new jl_IndexOutOfBoundsException;
    jl_RuntimeException__init_(var$1);
    $rt_throw(var$1);
},
jl_StringBuilder_ensureCapacity = ($this, var$1) => {
    let var$2, var$3, var$4, var$5;
    var$2 = $this.$buffer.data.length;
    if (var$2 < var$1) {
        var$1 = var$2 >= 1073741823 ? 2147483647 : jl_Math_max(var$1, jl_Math_max(var$2 * 2 | 0, 5));
        var$3 = $this.$buffer.data;
        var$4 = $rt_createCharArray(var$1);
        var$5 = var$4.data;
        var$1 = jl_Math_min(var$1, var$3.length);
        var$2 = 0;
        while (var$2 < var$1) {
            var$5[var$2] = var$3[var$2];
            var$2 = var$2 + 1 | 0;
        }
        $this.$buffer = var$4;
    }
},
otj_JSObject = $rt_classWithoutFields(0),
p_PxemMain$RunFn = $rt_classWithoutFields(0),
p_PxemMain$main$lambda$_2_0 = $rt_classWithoutFields(),
p_PxemMain$main$lambda$_2_0_call$exported$0 = (var$0, var$1, var$2, var$3) => {
    let $$je;
    var$1 = $rt_str(var$1);
    var$2 = $rt_str(var$2);
    var$3 = $rt_str(var$3);
    p_PxemMain_$callClinit();
    a: {
        b: {
            try {
                var$1 = p_PxemInterpreter_run(p_PxemInterpreter__init_0(var$1, var$2, var$3));
                break a;
            } catch ($$e) {
                $$je = $rt_wrapException($$e);
                if ($$je instanceof p_PxemException) {
                    var$1 = $$je;
                } else if ($$je instanceof jl_Exception) {
                    var$1 = $$je;
                    break b;
                } else {
                    throw $$e;
                }
            }
            var$3 = var$1.$message;
            var$1 = jl_StringBuilder__init_();
            jl_StringBuilder_append(jl_StringBuilder_append(var$1, $rt_s(2)), var$3);
            var$1 = jl_StringBuilder_toString(var$1);
            break a;
        }
        var$3 = var$1.$message;
        var$1 = jl_StringBuilder__init_();
        jl_StringBuilder_append(jl_StringBuilder_append(var$1, $rt_s(3)), var$3);
        var$1 = jl_StringBuilder_toString(var$1);
    }
    return $rt_ustr(var$1);
},
otci_IntegerUtil = $rt_classWithoutFields(),
ju_Comparator = $rt_classWithoutFields(0),
jl_String$_clinit_$lambda$_115_0 = $rt_classWithoutFields();
function jl_Character() {
    jl_Object.call(this);
    this.$value0 = 0;
}
let jl_Character_TYPE = null,
jl_Character_lowerCaseMapping = null,
jl_Character_characterCache = null,
jl_Character_$$metadata$$0 = null,
jl_Character__init_0 = ($this, $value) => {
    $this.$value0 = $value;
},
jl_Character__init_ = var_0 => {
    let var_1 = new jl_Character();
    jl_Character__init_0(var_1, var_0);
    return var_1;
},
jl_Character_valueOf = $value => {
    let var$2, $result;
    var$2 = jl_Character_characterCache.data;
    if ($value >= var$2.length)
        return jl_Character__init_($value);
    $result = var$2[$value];
    if ($result === null) {
        $result = jl_Character__init_($value);
        jl_Character_characterCache.data[$value] = $result;
    }
    return $result;
},
jl_Character_equals = ($this, $other) => {
    if ($this === $other)
        return 1;
    return $other instanceof jl_Character && $other.$value0 == $this.$value0 ? 1 : 0;
},
jl_Character_hashCode = $this => {
    return $this.$value0;
},
jl_Character_mapChar = ($table, $codePoint) => {
    let $binSearchTable, var$4, var$5, var$6, $index, var$8;
    $binSearchTable = $table.$fastTable.data;
    if ($codePoint < $binSearchTable.length)
        return $codePoint + $binSearchTable[$codePoint] | 0;
    $binSearchTable = $table.$binarySearchTable.data;
    var$4 = 0;
    var$5 = $binSearchTable.length;
    var$6 = (var$5 / 2 | 0) - 1 | 0;
    a: {
        while (true) {
            $index = (var$4 + var$6 | 0) / 2 | 0;
            var$8 = $rt_compare($binSearchTable[$index * 2 | 0], $codePoint);
            if (!var$8)
                break;
            if (var$8 <= 0) {
                var$4 = $index + 1 | 0;
                if (var$4 > var$6)
                    break a;
            } else {
                $index = $index - 1 | 0;
                if ($index < var$4)
                    break a;
                var$6 = $index;
            }
        }
    }
    if ($index >= 0) {
        $index = $index * 2 | 0;
        if ($index < var$5)
            return $codePoint + $binSearchTable[$index + 1 | 0] | 0;
    }
    return 0;
},
jl_Character_forDigit = ($digit, $radix) => {
    if ($radix >= 2 && $radix <= 36 && $digit >= 0 && $digit < $radix)
        return $digit < 10 ? (48 + $digit | 0) & 65535 : ((97 + $digit | 0) - 10 | 0) & 65535;
    return 0;
},
jl_Character__clinit_ = () => {
    jl_Character_TYPE = $rt_cls($rt_charcls);
    jl_Character_characterCache = $rt_createArray(jl_Character, 128);
},
jl_Character_acquireLowerCaseMapping$$create = () => {
    return {"value" : ">W  H#F#U 4%F#O #F#/ d%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #a1# #%# #%# #%# %%# #%# #%# #%# #%# #%# #%# #%# %%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #<+#%# #%# #%# \'.3#%# #%# #{1#%# #w1%%# %J\'#k1#o1#%# #w1#!3# #23#*3#%# \'23#:3# #>3#%# #%# #%# #N3#%# #N3# %%# #N3#%# #J3%%# #%# #R3#%# \'%# /)#%# #)#%# #)#%# #%# #%# #%# #%# #%# #%# #%# #%# %%# #%# #%# #%# #%# #%# #%# #%# #%# %)#%# #%# #8)#L%#%# #%# #%# #"
    + "%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #a+# #%# #%# #%# #%# #%# #%# #%# #%# #%# /B45#%# #,/#645# %%# #P1#!\'#*\'#%# #%# #%# #%# #%# <-%# #%# \'%# 1&++ %_## #Z#)k%%g%% #F#W hA# 1%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# +]%# %%# #?#%# %a+\'N\'AF#b &#%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# 3%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #^#%# #%# #%# #%# #%# #%# #%# %%# #%# #%# #%# #%# #%# #%# #%"
    + "# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# %*%r iB#oq-&# _?gejg#A1 o$#mo%&# {-%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# 3,4/# #%# #%# #%"
    + "# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# 3C1 1C1 1C1 1C1 1C1 3C/ 1C1 QC1 1C1 1C1 1C%8\'%G# 7i\')G# 7C%D)\' 7C%u)%?# 7X+%P+%G# L-q*/# \'Pw/#8m/# -6## |bA G%# kC.#U !r*%&# &#%# #,05#qX\'#H.5# %%# #%# #%# #e25#D05#q25#m25# #%# %%# 1865%%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# "
    + "#%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# 1%# #%# )%# (a=%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# G%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# y%%# #%# #%# #%# #%# #%# #%# \'%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #%# 5%# #%# #4Fd#%# #%# #%# #%# #%# )%# #<{p# %%# #%# \'%# #%# #%# #%# #%# #%# #%# #%# #%# #%# #P}p#}}p#m}p#D}p#P}p# #@yp#D{p#Lyp#Br#%# #%# #%# #%"
    + "# #%# #%# #%# #%# #,%#L}p#LJd#%# #%# -%# +%# #%# Y%# ,T5F#U TUg#r {%g#r >\'c#p Lnk%F# *J#F#b o@5F#b Jo=N#f "};
},
ju_Objects = $rt_classWithoutFields(),
ju_Objects_requireNonNull = $obj => {
    if ($obj !== null)
        return $obj;
    $obj = new jl_NullPointerException;
    jl_RuntimeException__init_0($obj, $rt_s(4));
    $rt_throw($obj);
},
jl_IndexOutOfBoundsException = $rt_classWithoutFields(jl_RuntimeException),
jl_IndexOutOfBoundsException__init_ = $this => {
    jl_RuntimeException__init_($this);
},
jl_IndexOutOfBoundsException__init_0 = () => {
    let var_0 = new jl_IndexOutOfBoundsException();
    jl_IndexOutOfBoundsException__init_(var_0);
    return var_0;
};
function p_PxemInterpreter() {
    let a = this; jl_Object.call(a);
    a.$name0 = null;
    a.$body = null;
    a.$stdinArr = null;
    a.$stdinPos = 0;
    a.$stack = null;
    a.$temp = null;
    a.$output = null;
    a.$steps = 0;
}
let p_PxemInterpreter_LOOP_STARTS = null,
p_PxemInterpreter_LOOP_ENDS = null,
p_PxemInterpreter_$callClinit = () => {
    p_PxemInterpreter_$callClinit = $rt_eraseClinit(p_PxemInterpreter);
    p_PxemInterpreter__clinit_();
},
p_PxemInterpreter__init_ = ($this, $name, $body, $stdin) => {
    p_PxemInterpreter_$callClinit();
    if ($name === null)
        $name = $rt_s(4);
    $this.$name0 = $name;
    if ($body === null)
        $body = $rt_s(4);
    $this.$body = $body;
    if ($stdin === null)
        $stdin = $rt_s(4);
    $this.$stdinArr = jusi_SimpleIntStreamImpl_toArray(jl_String_codePoints($stdin));
    $this.$stdinPos = 0;
    $this.$stack = ju_ArrayDeque__init_();
    $this.$temp = null;
    $this.$output = jl_StringBuilder__init_();
    $this.$steps = 0;
},
p_PxemInterpreter__init_0 = (var_0, var_1, var_2) => {
    let var_3 = new p_PxemInterpreter();
    p_PxemInterpreter__init_(var_3, var_0, var_1, var_2);
    return var_3;
},
p_PxemInterpreter_run = $this => {
    p_PxemInterpreter_execute($this, $this.$name0, 0);
    return jl_StringBuilder_toString($this.$output);
},
p_PxemInterpreter_execute = ($this, $code, $isBody) => {
    let $tokens, var$4, $ti, var$6, $brackets, var$8, var$9, $token, var$11;
    $tokens = ju_ArrayList__init_();
    var$4 = 0;
    $ti = 0;
    while ($ti < $code.$nativeString.length) {
        if (jl_String_charAt($code, $ti) != 46)
            var$6 = $ti;
        else {
            var$6 = $ti + 1 | 0;
            if (var$6 >= $code.$nativeString.length)
                var$6 = $ti;
            else {
                ju_ArrayList_add($tokens, p_PxemInterpreter$Token__init_(jl_String_substring($code, var$4, $ti), jl_Character_valueOf(jl_String_charAt($code, var$6))));
                var$4 = $ti + 2 | 0;
            }
        }
        $ti = var$6 + 1 | 0;
    }
    $code = jl_String_substring($code, var$4, $code.$nativeString.length);
    if (!jl_String_isEmpty($code))
        ju_ArrayList_add($tokens, p_PxemInterpreter$Token__init_($code, null));
    $brackets = new p_PxemInterpreter$Brackets;
    $brackets.$fwd = ju_HashMap__init_0();
    $brackets.$bwd = ju_HashMap__init_0();
    var$8 = ju_ArrayDeque__init_();
    var$6 = 0;
    while (var$6 < $tokens.$size0) {
        $code = (ju_ArrayList_get($tokens, var$6)).$cmd;
        if ($code !== null) {
            p_PxemInterpreter_$callClinit();
            if (ju_HashSet_contains(p_PxemInterpreter_LOOP_STARTS, $code))
                ju_ArrayDeque_push(var$8, jl_Integer_valueOf(var$6));
            else if (ju_HashSet_contains(p_PxemInterpreter_LOOP_ENDS, $code) && !ju_ArrayDeque_isEmpty(var$8)) {
                $ti = (ju_ArrayDeque_pop(var$8)).$value;
                ju_HashMap_put($brackets.$fwd, jl_Integer_valueOf($ti), jl_Integer_valueOf(var$6 + 1 | 0));
                ju_HashMap_put($brackets.$bwd, jl_Integer_valueOf(var$6), jl_Integer_valueOf($ti));
            }
        }
        var$6 = var$6 + 1 | 0;
    }
    $ti = 0;
    a: {
        while (true) {
            if ($ti >= $tokens.$size0)
                break a;
            var$9 = $this.$steps + 1 | 0;
            $this.$steps = var$9;
            if (var$9 > 1000000) {
                $code = new p_PxemException;
                jl_RuntimeException__init_0($code, $rt_s(5));
                $rt_throw($code);
            }
            if ($this.$output.$length > 100000) {
                $code = new p_PxemException;
                jl_RuntimeException__init_0($code, $rt_s(6));
                $rt_throw($code);
            }
            $token = ju_ArrayList_get($tokens, $ti);
            $code = $token.$text;
            if ($code !== null && !jl_String_isEmpty($code)) {
                var$11 = (jusi_SimpleIntStreamImpl_toArray(jl_String_codePoints($code))).data;
                var$9 = var$11.length - 1 | 0;
                while (var$9 >= 0) {
                    ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf(var$11[var$9]));
                    var$9 = var$9 + (-1) | 0;
                }
            }
            $code = $token.$cmd;
            if ($code === null)
                break a;
            $ti = p_PxemInterpreter_execCmd($this, $code.$value0, $brackets, $ti, $isBody);
            if ($ti == (-1))
                break;
        }
    }
},
p_PxemInterpreter_execCmd = ($this, $cmd, $brackets, $ti, $isBody) => {
    let $b, $a, $big, $small, $dest, $savedStack, $savedTemp, $subStack, $subArr, $i, $cp;
    if (jl_Character_lowerCaseMapping === null) {
        if (jl_Character_$$metadata$$0 === null)
            jl_Character_$$metadata$$0 = jl_Character_acquireLowerCaseMapping$$create();
        jl_Character_lowerCaseMapping = otciu_UnicodeHelper_createCharMapping(otciu_UnicodeHelper_decodeCaseMapping((jl_Character_$$metadata$$0.value !== null ? $rt_str(jl_Character_$$metadata$$0.value) : null)));
    }
    a: {
        switch (jl_Character_mapChar(jl_Character_lowerCaseMapping, $cmd) & 65535) {
            case 33:
                $b = p_PxemInterpreter_pop($this);
                $a = p_PxemInterpreter_pop($this);
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($rt_imul($a, $b)));
                return $ti + 1 | 0;
            case 34:
            case 35:
            case 38:
            case 39:
            case 40:
            case 41:
            case 42:
            case 44:
            case 46:
            case 47:
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
            case 58:
            case 59:
            case 60:
            case 61:
            case 62:
            case 63:
            case 64:
            case 65:
            case 66:
            case 67:
            case 68:
            case 69:
            case 70:
            case 71:
            case 72:
            case 73:
            case 74:
            case 75:
            case 76:
            case 77:
            case 78:
            case 79:
            case 80:
            case 81:
            case 82:
            case 83:
            case 84:
            case 85:
            case 86:
            case 87:
            case 88:
            case 89:
            case 90:
            case 91:
            case 92:
            case 93:
            case 94:
            case 95:
            case 96:
            case 98:
            case 102:
            case 103:
            case 104:
            case 106:
            case 107:
            case 108:
            case 111:
            case 113:
            case 117:
            case 118:
                break a;
            case 36:
                $b = p_PxemInterpreter_pop($this);
                $a = p_PxemInterpreter_pop($this);
                $big = jl_Math_max($a, $b);
                $small = jl_Math_min($a, $b);
                if (!$small)
                    $rt_throw(p_PxemException__init_($rt_s(7)));
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($big / $small | 0));
                return $ti + 1 | 0;
            case 37:
                $b = p_PxemInterpreter_pop($this);
                $a = p_PxemInterpreter_pop($this);
                $big = jl_Math_max($a, $b);
                $small = jl_Math_min($a, $b);
                if (!$small)
                    $rt_throw(p_PxemException__init_($rt_s(8)));
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($big % $small | 0));
                return $ti + 1 | 0;
            case 43:
                $b = p_PxemInterpreter_pop($this);
                $a = p_PxemInterpreter_pop($this);
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($a + $b | 0));
                return $ti + 1 | 0;
            case 45:
                $b = p_PxemInterpreter_pop($this);
                $a = p_PxemInterpreter_pop($this);
                $brackets = $this.$stack;
                $cmd = $a - $b | 0;
                if ($cmd < 0)
                    $cmd =  -$cmd | 0;
                ju_ArrayDeque_push($brackets, jl_Integer_valueOf($cmd));
                return $ti + 1 | 0;
            case 97:
                $dest = ju_HashMap_get($brackets.$bwd, jl_Integer_valueOf($ti));
                return $dest !== null ? jl_Integer_intValue($dest) : $ti + 1 | 0;
            case 99:
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf(p_PxemInterpreter_peek($this)));
                return $ti + 1 | 0;
            case 100:
                break;
            case 101:
                b: {
                    if (!$isBody && !jl_String_isEmpty($this.$body)) {
                        $savedStack = ju_ArrayDeque__init_2($this.$stack);
                        $savedTemp = $this.$temp;
                        $this.$temp = null;
                        p_PxemInterpreter_execute($this, $this.$body, 1);
                        $subStack = $this.$stack;
                        $this.$stack = $savedStack;
                        $this.$temp = $savedTemp;
                        $subArr = (ju_AbstractCollection_toArray($subStack, $rt_createArray(jl_Integer, 0))).data;
                        $i = $subArr.length - 1 | 0;
                        while (true) {
                            if ($i < 0)
                                break b;
                            ju_ArrayDeque_push($this.$stack, $subArr[$i]);
                            $i = $i + (-1) | 0;
                        }
                    }
                }
                return $ti + 1 | 0;
            case 105:
                $isBody = $this.$stdinPos;
                $subArr = $this.$stdinArr.data;
                if ($isBody >= $subArr.length)
                    $cp = 0;
                else {
                    $this.$stdinPos = $isBody + 1 | 0;
                    $cp = $subArr[$isBody];
                }
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($cp));
                return $ti + 1 | 0;
            case 109:
                $this.$temp = jl_Integer_valueOf(p_PxemInterpreter_pop($this));
                return $ti + 1 | 0;
            case 110:
                jl_AbstractStringBuilder_append($this.$output, p_PxemInterpreter_pop($this));
                return $ti + 1 | 0;
            case 112:
                while (!ju_ArrayDeque_isEmpty($this.$stack)) {
                    jl_StringBuilder_appendCodePoint($this.$output, p_PxemInterpreter_pop($this));
                }
                return $ti + 1 | 0;
            case 114:
                $a = p_PxemInterpreter_pop($this);
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($a <= 0 ? 0 : jl_Math_random() * $a | 0));
                return $ti + 1 | 0;
            case 115:
                $b = p_PxemInterpreter_pop($this);
                $a = p_PxemInterpreter_pop($this);
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($b));
                ju_ArrayDeque_push($this.$stack, jl_Integer_valueOf($a));
                return $ti + 1 | 0;
            case 116:
                $brackets = $this.$temp;
                if ($brackets !== null)
                    ju_ArrayDeque_push($this.$stack, $brackets);
                return $ti + 1 | 0;
            case 119:
                if (ju_ArrayDeque_isEmpty($this.$stack))
                    return $ti + 1 | 0;
                if (p_PxemInterpreter_pop($this))
                    return $ti + 1 | 0;
                $dest = ju_HashMap_get($brackets.$fwd, jl_Integer_valueOf($ti));
                return $dest !== null ? jl_Integer_intValue($dest) : $ti + 1 | 0;
            case 120:
                if (ju_ArrayDeque_size($this.$stack) < 2)
                    return $ti + 1 | 0;
                if (p_PxemInterpreter_pop($this) < p_PxemInterpreter_pop($this))
                    return $ti + 1 | 0;
                $dest = ju_HashMap_get($brackets.$fwd, jl_Integer_valueOf($ti));
                return $dest !== null ? jl_Integer_intValue($dest) : $ti + 1 | 0;
            case 121:
                if (ju_ArrayDeque_size($this.$stack) < 2)
                    return $ti + 1 | 0;
                if (p_PxemInterpreter_pop($this) > p_PxemInterpreter_pop($this))
                    return $ti + 1 | 0;
                $dest = ju_HashMap_get($brackets.$fwd, jl_Integer_valueOf($ti));
                return $dest !== null ? jl_Integer_intValue($dest) : $ti + 1 | 0;
            case 122:
                if (ju_ArrayDeque_size($this.$stack) < 2)
                    return $ti + 1 | 0;
                if (p_PxemInterpreter_pop($this) != p_PxemInterpreter_pop($this))
                    return $ti + 1 | 0;
                $dest = ju_HashMap_get($brackets.$fwd, jl_Integer_valueOf($ti));
                return $dest !== null ? jl_Integer_intValue($dest) : $ti + 1 | 0;
            default:
                break a;
        }
        return (-1);
    }
    return $ti + 1 | 0;
},
p_PxemInterpreter_pop = $this => {
    let var$1;
    if (ju_ArrayDeque_isEmpty($this.$stack)) {
        var$1 = new p_PxemException;
        jl_RuntimeException__init_0(var$1, $rt_s(9));
        $rt_throw(var$1);
    }
    return (ju_ArrayDeque_pop($this.$stack)).$value;
},
p_PxemInterpreter_peek = $this => {
    let var$1, var$2;
    if (ju_ArrayDeque_isEmpty($this.$stack)) {
        var$1 = new p_PxemException;
        jl_RuntimeException__init_0(var$1, $rt_s(10));
        $rt_throw(var$1);
    }
    var$2 = $this.$stack;
    return (ju_ArrayDeque_isEmpty(var$2) ? null : var$2.$array.data[var$2.$head]).$value;
},
p_PxemInterpreter__clinit_ = () => {
    let var$1, var$2, var$3;
    var$1 = new ju_HashSet;
    var$2 = $rt_createArray(jl_Character, 8);
    var$3 = var$2.data;
    var$3[0] = jl_Character_valueOf(119);
    var$3[1] = jl_Character_valueOf(87);
    var$3[2] = jl_Character_valueOf(120);
    var$3[3] = jl_Character_valueOf(88);
    var$3[4] = jl_Character_valueOf(121);
    var$3[5] = jl_Character_valueOf(89);
    var$3[6] = jl_Character_valueOf(122);
    var$3[7] = jl_Character_valueOf(90);
    ju_HashSet__init_(var$1, ju_Arrays_asList(var$2));
    p_PxemInterpreter_LOOP_STARTS = var$1;
    var$1 = new ju_HashSet;
    var$2 = $rt_createArray(jl_Character, 2);
    var$3 = var$2.data;
    var$3[0] = jl_Character_valueOf(97);
    var$3[1] = jl_Character_valueOf(65);
    ju_HashSet__init_(var$1, ju_Arrays_asList(var$2));
    p_PxemInterpreter_LOOP_ENDS = var$1;
},
p_PxemException = $rt_classWithoutFields(jl_RuntimeException),
p_PxemException__init_0 = ($this, $message) => {
    jl_RuntimeException__init_0($this, $message);
},
p_PxemException__init_ = var_0 => {
    let var_1 = new p_PxemException();
    p_PxemException__init_0(var_1, var_0);
    return var_1;
},
jl_Iterable = $rt_classWithoutFields(0),
ju_Collection = $rt_classWithoutFields(0),
ju_AbstractCollection = $rt_classWithoutFields(),
ju_AbstractCollection_toArray = ($this, $a) => {
    let var$2, $i, var$4, $iter, var$6;
    var$2 = $a.data;
    $i = ju_ArrayDeque_size($this);
    var$4 = var$2.length;
    if (var$4 < $i)
        $a = jlr_Array_newInstance(jl_Class_getComponentType(jl_Object_getClass($a)), $i);
    else
        while ($i < var$4) {
            var$2[$i] = null;
            $i = $i + 1 | 0;
        }
    $i = 0;
    $iter = ju_ArrayDeque_iterator($this);
    while (ju_ArrayDeque$1_hasNext($iter)) {
        var$6 = $a.data;
        var$4 = $i + 1 | 0;
        var$6[$i] = ju_ArrayDeque$1_next($iter);
        $i = var$4;
    }
    return $a;
},
ju_Queue = $rt_classWithoutFields(0),
ju_SequencedCollection = $rt_classWithoutFields(0),
ju_Deque = $rt_classWithoutFields(0),
jl_Cloneable = $rt_classWithoutFields(0);
function ju_ArrayDeque() {
    let a = this; ju_AbstractCollection.call(a);
    a.$version = 0;
    a.$array = null;
    a.$head = 0;
    a.$tail = 0;
}
let ju_ArrayDeque__init_1 = $this => {
    $this.$array = $rt_createArray(jl_Object, 9);
},
ju_ArrayDeque__init_ = () => {
    let var_0 = new ju_ArrayDeque();
    ju_ArrayDeque__init_1(var_0);
    return var_0;
},
ju_ArrayDeque__init_0 = ($this, $c) => {
    let $index, $it, var$4, var$5;
    if (ju_ArrayDeque_isEmpty($c))
        $this.$array = $rt_createArray(jl_Object, 8);
    else {
        $this.$array = $rt_createArray(jl_Object, ju_ArrayDeque_size($c) + 1 | 0);
        $index = 0;
        $it = ju_ArrayDeque_iterator($c);
        while (ju_ArrayDeque$1_hasNext($it)) {
            var$4 = $this.$array.data;
            var$5 = $index + 1 | 0;
            var$4[$index] = ju_ArrayDeque$1_next($it);
            $index = var$5;
        }
        $this.$tail = $this.$array.data.length - 1 | 0;
    }
},
ju_ArrayDeque__init_2 = var_0 => {
    let var_1 = new ju_ArrayDeque();
    ju_ArrayDeque__init_0(var_1, var_0);
    return var_1;
},
ju_ArrayDeque_push = ($this, $e) => {
    let var$2, var$3, var$4, var$5, var$6, var$7, var$8;
    ju_Objects_requireNonNull($e);
    var$2 = ju_ArrayDeque_size($this) + 1 | 0;
    var$3 = $this.$array.data.length;
    if (var$2 >= var$3) {
        var$2 = jl_Math_max(var$3 * 2 | 0, ((var$2 * 3 | 0) / 2 | 0) + 1 | 0);
        if (var$2 < 1)
            var$2 = 2147483647;
        var$4 = $rt_createArray(jl_Object, var$2);
        var$2 = 0;
        var$5 = $this.$head;
        var$3 = $this.$tail;
        if (var$5 <= var$3) {
            var$6 = var$4.data;
            while (var$5 < var$3) {
                var$7 = var$2 + 1 | 0;
                var$6[var$2] = $this.$array.data[var$5];
                var$5 = var$5 + 1 | 0;
                var$2 = var$7;
            }
        } else {
            var$6 = var$4.data;
            while (true) {
                var$8 = $this.$array.data;
                if (var$5 >= var$8.length)
                    break;
                var$7 = var$2 + 1 | 0;
                var$6[var$2] = var$8[var$5];
                var$5 = var$5 + 1 | 0;
                var$2 = var$7;
            }
            var$5 = 0;
            while (var$5 < var$3) {
                var$7 = var$2 + 1 | 0;
                var$6[var$2] = var$8[var$5];
                var$5 = var$5 + 1 | 0;
                var$2 = var$7;
            }
        }
        $this.$head = 0;
        $this.$tail = var$2;
        $this.$array = var$4;
    }
    var$2 = $this.$head;
    var$4 = $this.$array.data;
    var$5 = var$4.length;
    var$3 = var$2 + (-1) | 0;
    if (var$3 == (-1))
        var$3 = var$5 - 1 | 0;
    $this.$head = var$3;
    var$4[var$3] = $e;
    $this.$version = $this.$version + 1 | 0;
},
ju_ArrayDeque_pop = $this => {
    let var$1, var$2, var$3;
    var$1 = $this.$head;
    if (var$1 == $this.$tail)
        var$2 = null;
    else {
        var$3 = $this.$array.data;
        var$2 = var$3[var$1];
        var$3[var$1] = null;
        $this.$head = ju_ArrayDeque_modInc(var$1, var$3.length);
        $this.$version = $this.$version + 1 | 0;
    }
    if (var$2 !== null)
        return var$2;
    var$2 = new ju_NoSuchElementException;
    jl_RuntimeException__init_(var$2);
    $rt_throw(var$2);
},
ju_ArrayDeque_size = $this => {
    let var$1, var$2;
    var$1 = $this.$tail;
    var$2 = $this.$head;
    return var$1 >= var$2 ? var$1 - var$2 | 0 : ($this.$array.data.length - var$2 | 0) + var$1 | 0;
},
ju_ArrayDeque_isEmpty = $this => {
    return $this.$head != $this.$tail ? 0 : 1;
},
ju_ArrayDeque_modInc = ($i, $mod) => {
    $i = $i + 1 | 0;
    if ($i == $mod)
        $i = 0;
    return $i;
},
ju_ArrayDeque_iterator = $this => {
    let var$1;
    var$1 = new ju_ArrayDeque$1;
    var$1.$this$0 = $this;
    var$1.$refVersion = $this.$version;
    var$1.$index0 = $this.$head;
    var$1.$lastIndex = (-1);
    var$1.$left = ju_ArrayDeque_size($this);
    return var$1;
},
ju_Set = $rt_classWithoutFields(0),
ju_AbstractSet = $rt_classWithoutFields(ju_AbstractCollection);
function ju_HashSet() {
    ju_AbstractSet.call(this);
    this.$backingMap = null;
}
let ju_HashSet__init_ = ($this, $collection) => {
    let $iter$index, var$3, var$4, $iter$index_0, var$6;
    $this.$backingMap = ju_HashMap__init_2(ju_Arrays$ArrayAsList_size($collection) < 6 ? 11 : ju_Arrays$ArrayAsList_size($collection) * 2 | 0);
    $iter$index = 0;
    var$3 = $collection.$modCount0;
    var$4 = ju_Arrays$ArrayAsList_size($collection);
    while ($iter$index >= var$4 ? 0 : 1) {
        if (var$3 < $collection.$modCount0) {
            $collection = new ju_ConcurrentModificationException;
            jl_RuntimeException__init_($collection);
            $rt_throw($collection);
        }
        $iter$index_0 = $iter$index + 1 | 0;
        var$6 = $collection.$array1.data[$iter$index];
        ju_HashMap_put($this.$backingMap, var$6, $this);
        $iter$index = $iter$index_0;
    }
},
ju_HashSet__init_0 = var_0 => {
    let var_1 = new ju_HashSet();
    ju_HashSet__init_(var_1, var_0);
    return var_1;
},
ju_HashSet_contains = ($this, $object) => {
    return ju_HashMap_entryByKey($this.$backingMap, $object) === null ? 0 : 1;
},
ju_Arrays = $rt_classWithoutFields(),
ju_Arrays_asList = $a => {
    let var$2;
    ju_Objects_requireNonNull($a);
    var$2 = new ju_Arrays$ArrayAsList;
    var$2.$array1 = $a;
    return var$2;
},
ju_List = $rt_classWithoutFields(0);
function ju_AbstractList() {
    ju_AbstractCollection.call(this);
    this.$modCount0 = 0;
}
let ju_RandomAccess = $rt_classWithoutFields(0);
function ju_Arrays$ArrayAsList() {
    ju_AbstractList.call(this);
    this.$array1 = null;
}
let ju_Arrays$ArrayAsList_size = $this => {
    return $this.$array1.data.length;
},
ju_Map = $rt_classWithoutFields(0),
ju_AbstractMap = $rt_classWithoutFields();
function ju_HashMap() {
    let a = this; ju_AbstractMap.call(a);
    a.$elementCount = 0;
    a.$elementData = null;
    a.$modCount = 0;
    a.$loadFactor = 0.0;
    a.$threshold = 0;
}
let ju_HashMap__init_1 = $this => {
    ju_HashMap__init_($this, 16);
},
ju_HashMap__init_0 = () => {
    let var_0 = new ju_HashMap();
    ju_HashMap__init_1(var_0);
    return var_0;
},
ju_HashMap__init_ = ($this, $capacity) => {
    let var$2;
    if ($capacity < 0) {
        var$2 = new jl_IllegalArgumentException;
        jl_RuntimeException__init_(var$2);
        $rt_throw(var$2);
    }
    $capacity = ju_HashMap_calculateCapacity($capacity);
    $this.$elementCount = 0;
    $this.$elementData = $rt_createArray(ju_HashMap$HashEntry, $capacity);
    $this.$loadFactor = 0.75;
    ju_HashMap_computeThreshold($this);
},
ju_HashMap__init_2 = var_0 => {
    let var_1 = new ju_HashMap();
    ju_HashMap__init_(var_1, var_0);
    return var_1;
},
ju_HashMap_calculateCapacity = $x => {
    let var$2;
    if ($x >= 1073741824)
        return 1073741824;
    if (!$x)
        return 16;
    var$2 = $x - 1 | 0;
    $x = var$2 | var$2 >> 1;
    $x = $x | $x >> 2;
    $x = $x | $x >> 4;
    $x = $x | $x >> 8;
    return ($x | $x >> 16) + 1 | 0;
},
ju_HashMap_computeThreshold = $this => {
    $this.$threshold = $this.$elementData.data.length * $this.$loadFactor | 0;
},
ju_HashMap_get = ($this, $key) => {
    let $m;
    $m = ju_HashMap_entryByKey($this, $key);
    if ($m === null)
        return null;
    return $m.$value1;
},
ju_HashMap_entryByKey = ($this, $key) => {
    let $m, $hash;
    if ($key === null)
        $m = ju_HashMap_findNullKeyEntry($this);
    else {
        $hash = $key.$hashCode();
        $m = ju_HashMap_findNonNullKeyEntry($this, $key, $hash & ($this.$elementData.data.length - 1 | 0), $hash);
    }
    return $m;
},
ju_HashMap_findNonNullKeyEntry = ($this, $key, $index, $keyHash) => {
    let $m, var$5;
    $m = $this.$elementData.data[$index];
    while ($m !== null) {
        if ($m.$origKeyHash == $keyHash) {
            var$5 = $m.$key;
            if ($key !== var$5 && !$key.$equals(var$5) ? 0 : 1)
                break;
        }
        $m = $m.$next1;
    }
    return $m;
},
ju_HashMap_findNullKeyEntry = $this => {
    let $m;
    $m = $this.$elementData.data[0];
    while ($m !== null && $m.$key !== null) {
        $m = $m.$next1;
    }
    return $m;
},
ju_HashMap_put = ($this, $key, $value) => {
    let var$3, var$4, var$5;
    if ($key === null) {
        var$3 = ju_HashMap_findNullKeyEntry($this);
        if (var$3 === null) {
            $this.$modCount = $this.$modCount + 1 | 0;
            var$3 = ju_HashMap_createHashedEntry($this, null, 0, 0);
            var$4 = $this.$elementCount + 1 | 0;
            $this.$elementCount = var$4;
            if (var$4 > $this.$threshold)
                ju_HashMap_rehash($this);
        }
    } else {
        var$4 = $key.$hashCode();
        var$5 = var$4 & ($this.$elementData.data.length - 1 | 0);
        var$3 = ju_HashMap_findNonNullKeyEntry($this, $key, var$5, var$4);
        if (var$3 === null) {
            $this.$modCount = $this.$modCount + 1 | 0;
            var$3 = ju_HashMap_createHashedEntry($this, $key, var$5, var$4);
            var$4 = $this.$elementCount + 1 | 0;
            $this.$elementCount = var$4;
            if (var$4 > $this.$threshold)
                ju_HashMap_rehash($this);
        }
    }
    $key = var$3.$value1;
    var$3.$value1 = $value;
    return $key;
},
ju_HashMap_createHashedEntry = ($this, $key, $index, $hash) => {
    let $entry, var$5, var$6;
    $entry = new ju_HashMap$HashEntry;
    var$5 = null;
    $entry.$key = $key;
    $entry.$value1 = var$5;
    $entry.$origKeyHash = $hash;
    var$6 = $this.$elementData.data;
    $entry.$next1 = var$6[$index];
    var$6[$index] = $entry;
    return $entry;
},
ju_HashMap_rehash = $this => {
    let var$1, var$2, var$3, var$4, var$5, var$6, var$7, var$8;
    var$1 = $this.$elementData.data.length;
    var$1 = ju_HashMap_calculateCapacity(!var$1 ? 1 : var$1 << 1);
    var$2 = $rt_createArray(ju_HashMap$HashEntry, var$1);
    var$3 = var$2.data;
    var$4 = 0;
    var$5 = var$1 - 1 | 0;
    while (true) {
        var$6 = $this.$elementData.data;
        if (var$4 >= var$6.length)
            break;
        var$7 = var$6[var$4];
        var$6[var$4] = null;
        while (var$7 !== null) {
            var$1 = var$7.$origKeyHash & var$5;
            var$8 = var$7.$next1;
            var$7.$next1 = var$3[var$1];
            var$3[var$1] = var$7;
            var$7 = var$8;
        }
        var$4 = var$4 + 1 | 0;
    }
    $this.$elementData = var$2;
    ju_HashMap_computeThreshold($this);
},
jl_NullPointerException = $rt_classWithoutFields(jl_RuntimeException),
jl_IllegalArgumentException = $rt_classWithoutFields(jl_RuntimeException),
ju_Iterator = $rt_classWithoutFields(0);
function ju_AbstractList$1() {
    let a = this; jl_Object.call(a);
    a.$index2 = 0;
    a.$modCount1 = 0;
    a.$size1 = 0;
    a.$removeIndex = 0;
    a.$this$00 = null;
}
let jl_AutoCloseable = $rt_classWithoutFields(0),
jus_BaseStream = $rt_classWithoutFields(0),
jus_IntStream = $rt_classWithoutFields(0),
jusi_SimpleIntStreamImpl = $rt_classWithoutFields(),
jusi_SimpleIntStreamImpl_toArray = $this => {
    let $i, $list, $consumer, $array, var$5, var$6, var$7;
    $i = $this.$string.$nativeString.length;
    if ($i < 0) {
        $list = ju_ArrayList__init_();
        while (true) {
            ju_Objects_requireNonNull($list);
            $consumer = new jusi_SimpleIntStreamImpl$toArray$lambda$_16_0;
            $consumer.$_0 = $list;
            if (!jusi_StringCodePointsStream_next($this, $consumer))
                break;
        }
        $array = $rt_createIntArray($list.$size0);
        var$5 = $array.data;
        $i = 0;
        var$6 = var$5.length;
        while ($i < var$6) {
            var$5[$i] = (ju_ArrayList_get($list, $i)).$value;
            $i = $i + 1 | 0;
        }
        return $array;
    }
    $array = $rt_createIntArray($i);
    $consumer = new jusi_SimpleIntStreamImpl$ArrayFillingConsumer;
    $consumer.$array2 = $array;
    while (jusi_StringCodePointsStream_next($this, $consumer)) {
    }
    var$5 = $array.data;
    $i = $consumer.$index1;
    var$6 = var$5.length;
    if ($i < var$6) {
        $array = $rt_createIntArray($i);
        var$7 = $array.data;
        $i = jl_Math_min($i, var$6);
        var$6 = 0;
        while (var$6 < $i) {
            var$7[var$6] = var$5[var$6];
            var$6 = var$6 + 1 | 0;
        }
    }
    return $array;
};
function jusi_StringCodePointsStream() {
    let a = this; jusi_SimpleIntStreamImpl.call(a);
    a.$string = null;
    a.$index = 0;
}
let jusi_StringCodePointsStream_next = ($this, $consumer) => {
    let var$2, var$3, $hi, $lo;
    a: {
        b: while (true) {
            if ($this.$index >= $this.$string.$nativeString.length)
                break a;
            var$2 = $this.$string;
            var$3 = $this.$index;
            $this.$index = var$3 + 1 | 0;
            $hi = jl_String_charAt(var$2, var$3);
            var$3 = ($hi & 64512) != 55296 ? 0 : 1;
            c: {
                if (var$3 && $this.$index < $this.$string.$nativeString.length) {
                    $lo = jl_String_charAt($this.$string, $this.$index);
                    if (($lo & 64512) != 56320 ? 0 : 1)
                        break c;
                }
                if (!$consumer.$test($hi))
                    break b;
                continue b;
            }
            $this.$index = $this.$index + 1 | 0;
            if ($consumer.$test((($hi & 1023) << 10 | $lo & 1023) + 65536 | 0))
                continue;
            else
                break a;
        }
    }
    return $this.$index >= $this.$string.$nativeString.length ? 0 : 1;
},
ju_Map$Entry = $rt_classWithoutFields(0);
function ju_MapEntry() {
    let a = this; jl_Object.call(a);
    a.$key = null;
    a.$value1 = null;
}
function ju_HashMap$HashEntry() {
    let a = this; ju_MapEntry.call(a);
    a.$origKeyHash = 0;
    a.$next1 = null;
}
function p_PxemInterpreter$Token() {
    let a = this; jl_Object.call(a);
    a.$text = null;
    a.$cmd = null;
}
let p_PxemInterpreter$Token__init_0 = ($this, $text, $cmd) => {
    $this.$text = $text;
    $this.$cmd = $cmd;
},
p_PxemInterpreter$Token__init_ = (var_0, var_1) => {
    let var_2 = new p_PxemInterpreter$Token();
    p_PxemInterpreter$Token__init_0(var_2, var_0, var_1);
    return var_2;
};
function ju_ArrayList() {
    let a = this; ju_AbstractList.call(a);
    a.$array0 = null;
    a.$size0 = 0;
}
let ju_ArrayList__init_0 = $this => {
    $this.$array0 = $rt_createArray(jl_Object, 10);
},
ju_ArrayList__init_ = () => {
    let var_0 = new ju_ArrayList();
    ju_ArrayList__init_0(var_0);
    return var_0;
},
ju_ArrayList_get = ($this, $index) => {
    let var$2;
    if ($index >= 0 && $index < $this.$size0)
        return $this.$array0.data[$index];
    var$2 = new jl_IndexOutOfBoundsException;
    jl_RuntimeException__init_(var$2);
    $rt_throw(var$2);
},
ju_ArrayList_add = ($this, $element) => {
    let var$2, var$3, var$4, var$5, var$6, var$7;
    var$2 = $this.$size0 + 1 | 0;
    var$3 = $this.$array0.data.length;
    if (var$3 < var$2) {
        var$2 = var$3 >= 1073741823 ? 2147483647 : jl_Math_max(var$2, jl_Math_max(var$3 * 2 | 0, 5));
        var$4 = $this.$array0;
        var$5 = var$4.data;
        var$6 = jlr_Array_newInstance(jl_Class_getComponentType(jl_Object_getClass(var$4)), var$2);
        var$7 = jl_Math_min(var$2, var$5.length);
        var$3 = 0;
        while (var$3 < var$7) {
            var$6.data[var$3] = var$5[var$3];
            var$3 = var$3 + 1 | 0;
        }
        $this.$array0 = var$6;
    }
    var$4 = $this.$array0.data;
    var$7 = $this.$size0;
    $this.$size0 = var$7 + 1 | 0;
    var$4[var$7] = $element;
    $this.$modCount0 = $this.$modCount0 + 1 | 0;
    return 1;
};
function p_PxemInterpreter$Brackets() {
    let a = this; jl_Object.call(a);
    a.$fwd = null;
    a.$bwd = null;
}
let jl_Math = $rt_classWithoutFields(),
jl_Math_random = () => {
    return jl_Math_randomImpl();
},
jl_Math_randomImpl = () => {
    return Math.random();
},
jl_Math_min = ($a, $b) => {
    if ($a < $b)
        $b = $a;
    return $b;
},
jl_Math_max = ($a, $b) => {
    if ($a > $b)
        $b = $a;
    return $b;
},
otpp_ResourceAccessor = $rt_classWithoutFields(),
otciu_UnicodeHelper = $rt_classWithoutFields(),
otciu_UnicodeHelper_decodeCaseMapping = $text => {
    let $flow, $data, var$4, $sz, var$6, $last, $i, var$9, var$10, var$11;
    $flow = new otci_CharFlow;
    $data = $rt_createCharArray($text.$nativeString.length);
    var$4 = $data.data;
    $sz = 0;
    var$6 = var$4.length;
    while ($sz < var$6) {
        var$4[$sz] = jl_String_charAt($text, $sz);
        $sz = $sz + 1 | 0;
    }
    $flow.$characters = $data;
    $sz = otci_Base46_decodeUnsigned($flow);
    $data = $rt_createIntArray($sz * 2 | 0);
    var$4 = $data.data;
    $last = 0;
    $i = 0;
    while ($i < $sz) {
        $last = $last + otci_Base46_decodeUnsigned($flow) | 0;
        var$6 = $i * 2 | 0;
        var$4[var$6] = $last;
        var$9 = var$6 + 1 | 0;
        var$10 = otci_Base46_decodeUnsigned($flow);
        var$11 = var$10 / 2 | 0;
        if (var$10 % 2 | 0)
            var$11 =  -var$11 | 0;
        var$4[var$9] = var$11;
        $i = $i + 1 | 0;
    }
    return $data;
},
otciu_UnicodeHelper_createCharMapping = $data => {
    let $result, var$3, $last, $lastValue, $i, var$7, $key, $value, var$10, var$11, var$12;
    $result = $rt_createIntArray(65536);
    var$3 = $result.data;
    $last = 0;
    $lastValue = 0;
    $i = 0;
    a: {
        while (true) {
            var$7 = $data.data;
            if ($i >= var$7.length)
                break a;
            $key = var$7[$i];
            $value = var$7[$i + 1 | 0];
            var$10 = var$3.length;
            if ($key < var$10)
                var$10 = $key;
            else if ($key == $last)
                break a;
            if ($last > var$10)
                break;
            while ($last < var$10) {
                var$11 = $last + 1 | 0;
                var$3[$last] = $lastValue;
                $last = var$11;
            }
            $i = $i + 2 | 0;
            $last = var$10;
            $lastValue = $value;
        }
        var$12 = new jl_IllegalArgumentException;
        jl_RuntimeException__init_(var$12);
        $rt_throw(var$12);
    }
    var$12 = new otciu_CharMapping;
    var$12.$binarySearchTable = $data;
    var$12.$fastTable = $result;
    return var$12;
};
function otciu_CharMapping() {
    let a = this; jl_Object.call(a);
    a.$binarySearchTable = null;
    a.$fastTable = null;
}
function otci_CharFlow() {
    let a = this; jl_Object.call(a);
    a.$characters = null;
    a.$pointer = 0;
}
let otci_Base46 = $rt_classWithoutFields(),
otci_Base46_decodeUnsigned = $seq => {
    let $number, $pos, var$4, $hasMore, $digit;
    $number = 0;
    $pos = 1;
    while (true) {
        var$4 = $seq.$characters.data;
        $hasMore = $seq.$pointer;
        $seq.$pointer = $hasMore + 1 | 0;
        $digit = var$4[$hasMore];
        $digit = $digit < 34 ? $digit - 32 | 0 : $digit >= 92 ? ($digit - 32 | 0) - 2 | 0 : ($digit - 32 | 0) - 1 | 0;
        $hasMore = ($digit % 2 | 0) != 1 ? 0 : 1;
        $number = $number + $rt_imul($pos, $digit / 2 | 0) | 0;
        $pos = $pos * 46 | 0;
        if (!$hasMore)
            break;
    }
    return $number;
},
juf_IntPredicate = $rt_classWithoutFields(0);
function jusi_SimpleIntStreamImpl$ArrayFillingConsumer() {
    let a = this; jl_Object.call(a);
    a.$array2 = null;
    a.$index1 = 0;
}
let jusi_SimpleIntStreamImpl$ArrayFillingConsumer_test = ($this, $t) => {
    let var$2, var$3;
    var$2 = $this.$array2.data;
    var$3 = $this.$index1;
    $this.$index1 = var$3 + 1 | 0;
    var$2[var$3] = $t;
    return 1;
};
function jusi_SimpleIntStreamImpl$toArray$lambda$_16_0() {
    jl_Object.call(this);
    this.$_0 = null;
}
let jusi_SimpleIntStreamImpl$toArray$lambda$_16_0_test = (var$0, var$1) => {
    return ju_ArrayList_add(var$0.$_0, jl_Integer_valueOf(var$1));
},
jl_StringIndexOutOfBoundsException = $rt_classWithoutFields(jl_IndexOutOfBoundsException),
jlr_Array = $rt_classWithoutFields(),
jlr_Array_newInstance = ($componentType, $length) => {
    if ($componentType === null) {
        $componentType = new jl_NullPointerException;
        jl_RuntimeException__init_($componentType);
        $rt_throw($componentType);
    }
    if ($componentType === $rt_cls($rt_voidcls)) {
        $componentType = new jl_IllegalArgumentException;
        jl_RuntimeException__init_($componentType);
        $rt_throw($componentType);
    }
    if ($length >= 0)
        return jlr_Array_newInstanceImpl($componentType.$platformClass, $length);
    $componentType = new jl_NegativeArraySizeException;
    jl_RuntimeException__init_($componentType);
    $rt_throw($componentType);
},
jlr_Array_newInstanceImpl = (var$1, var$2) => {
    if (var$1.$meta.primitive) {
        switch (var$1) {
        }
        ;
    }
    return $rt_createArray(var$1, var$2);
};
function ju_ArrayDeque$1() {
    let a = this; jl_Object.call(a);
    a.$refVersion = 0;
    a.$index0 = 0;
    a.$lastIndex = 0;
    a.$left = 0;
    a.$this$0 = null;
}
let ju_ArrayDeque$1_hasNext = $this => {
    return $this.$left <= 0 ? 0 : 1;
},
ju_ArrayDeque$1_next = $this => {
    let var$1, $result, var$3;
    var$1 = $this.$left - 1 | 0;
    $this.$left = var$1;
    if (var$1 < 0) {
        $result = new ju_NoSuchElementException;
        jl_RuntimeException__init_($result);
        $rt_throw($result);
    }
    $result = $this.$this$0;
    if ($result.$version > $this.$refVersion) {
        $result = new ju_ConcurrentModificationException;
        jl_RuntimeException__init_($result);
        $rt_throw($result);
    }
    var$1 = $this.$index0;
    $this.$lastIndex = var$1;
    var$3 = $result.$array.data;
    $result = var$3[var$1];
    $this.$index0 = ju_ArrayDeque_modInc(var$1, var$3.length);
    return $result;
},
ju_ConcurrentModificationException = $rt_classWithoutFields(jl_RuntimeException),
jl_NegativeArraySizeException = $rt_classWithoutFields(jl_RuntimeException),
ju_NoSuchElementException = $rt_classWithoutFields(jl_RuntimeException);
$rt_packages([-1, "java", 0, "lang"
]);
$rt_metadata([jl_Object, "Object", 1, 0, [], 0, 3, 0, 0, 0,
p_PxemMain, 0, jl_Object, [], 0, 3, 0, p_PxemMain_$callClinit, 0,
jlr_AnnotatedElement, 0, jl_Object, [], 3, 3, 0, 0, 0,
jlr_Type, 0, jl_Object, [], 3, 3, 0, 0, 0,
jl_Class, 0, jl_Object, [jlr_AnnotatedElement, jlr_Type], 0, 3, 0, 0, 0,
otji_JS, 0, jl_Object, [], 4, 0, 0, 0, 0,
otp_Platform, 0, jl_Object, [], 4, 3, 0, 0, 0,
jl_Throwable, 0, jl_Object, [], 0, 3, 0, 0, 0,
jl_Exception, 0, jl_Throwable, [], 0, 3, 0, 0, 0,
jl_RuntimeException, 0, jl_Exception, [], 0, 3, 0, 0, 0,
jl_ClassCastException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0,
ji_Serializable, 0, jl_Object, [], 3, 3, 0, 0, 0,
jl_Comparable, 0, jl_Object, [], 3, 3, 0, 0, 0,
jl_CharSequence, 0, jl_Object, [], 3, 3, 0, 0, 0,
jl_String, 0, jl_Object, [ji_Serializable, jl_Comparable, jl_CharSequence], 0, 3, 0, 0, 0,
jl_Number, 0, jl_Object, [ji_Serializable], 1, 3, 0, 0, 0,
jl_Integer, 0, jl_Number, [jl_Comparable], 0, 3, 0, 0, ["$hashCode", $rt_wrapFunction0(jl_Integer_hashCode), "$equals", $rt_wrapFunction1(jl_Integer_equals)],
jl_AbstractStringBuilder, 0, jl_Object, [ji_Serializable, jl_CharSequence], 0, 0, 0, 0, 0,
jl_Appendable, 0, jl_Object, [], 3, 3, 0, 0, 0,
jl_StringBuilder, 0, jl_AbstractStringBuilder, [jl_Appendable], 0, 3, 0, 0, 0,
otj_JSObject, 0, jl_Object, [], 3, 3, 0, 0, 0,
p_PxemMain$RunFn, 0, jl_Object, [otj_JSObject], 3, 3, 0, 0, 0,
p_PxemMain$main$lambda$_2_0, 0, jl_Object, [p_PxemMain$RunFn], 0, 3, 0, 0, ["$call$exported$0", $rt_wrapFunction3(p_PxemMain$main$lambda$_2_0_call$exported$0)],
otci_IntegerUtil, 0, jl_Object, [], 4, 3, 0, 0, 0,
ju_Comparator, 0, jl_Object, [], 3, 3, 0, 0, 0,
jl_String$_clinit_$lambda$_115_0, 0, jl_Object, [ju_Comparator], 0, 3, 0, 0, 0,
jl_Character, 0, jl_Object, [jl_Comparable], 0, 3, 0, 0, ["$equals", $rt_wrapFunction1(jl_Character_equals), "$hashCode", $rt_wrapFunction0(jl_Character_hashCode)],
ju_Objects, 0, jl_Object, [], 4, 3, 0, 0, 0,
jl_IndexOutOfBoundsException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0,
p_PxemInterpreter, 0, jl_Object, [], 0, 3, 0, p_PxemInterpreter_$callClinit, 0,
p_PxemException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0,
jl_Iterable, 0, jl_Object, [], 3, 3, 0, 0, 0,
ju_Collection, 0, jl_Object, [jl_Iterable], 3, 3, 0, 0, 0,
ju_AbstractCollection, 0, jl_Object, [ju_Collection], 1, 3, 0, 0, 0,
ju_Queue, 0, jl_Object, [ju_Collection], 3, 3, 0, 0, 0,
ju_SequencedCollection, 0, jl_Object, [ju_Collection], 3, 3, 0, 0, 0,
ju_Deque, 0, jl_Object, [ju_Queue, ju_SequencedCollection], 3, 3, 0, 0, 0,
jl_Cloneable, 0, jl_Object, [], 3, 3, 0, 0, 0,
ju_ArrayDeque, 0, ju_AbstractCollection, [ju_Deque, jl_Cloneable, ji_Serializable], 0, 3, 0, 0, 0,
ju_Set, 0, jl_Object, [ju_Collection], 3, 3, 0, 0, 0,
ju_AbstractSet, 0, ju_AbstractCollection, [ju_Set], 1, 3, 0, 0, 0,
ju_HashSet, 0, ju_AbstractSet, [jl_Cloneable, ji_Serializable], 0, 3, 0, 0, 0,
ju_Arrays, 0, jl_Object, [], 0, 3, 0, 0, 0,
ju_List, 0, jl_Object, [ju_SequencedCollection], 3, 3, 0, 0, 0,
ju_AbstractList, 0, ju_AbstractCollection, [ju_List], 1, 3, 0, 0, 0,
ju_RandomAccess, 0, jl_Object, [], 3, 3, 0, 0, 0,
ju_Arrays$ArrayAsList, 0, ju_AbstractList, [ju_RandomAccess], 0, 0, 0, 0, 0,
ju_Map, 0, jl_Object, [], 3, 3, 0, 0, 0,
ju_AbstractMap, 0, jl_Object, [ju_Map], 1, 3, 0, 0, 0,
ju_HashMap, 0, ju_AbstractMap, [jl_Cloneable, ji_Serializable], 0, 3, 0, 0, 0]);
$rt_metadata([jl_NullPointerException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0,
jl_IllegalArgumentException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0,
ju_Iterator, 0, jl_Object, [], 3, 3, 0, 0, 0,
ju_AbstractList$1, 0, jl_Object, [ju_Iterator], 0, 0, 0, 0, 0,
jl_AutoCloseable, 0, jl_Object, [], 3, 3, 0, 0, 0,
jus_BaseStream, 0, jl_Object, [jl_AutoCloseable], 3, 3, 0, 0, 0,
jus_IntStream, 0, jl_Object, [jus_BaseStream], 3, 3, 0, 0, 0,
jusi_SimpleIntStreamImpl, 0, jl_Object, [jus_IntStream], 1, 3, 0, 0, 0,
jusi_StringCodePointsStream, 0, jusi_SimpleIntStreamImpl, [], 0, 3, 0, 0, 0,
ju_Map$Entry, 0, jl_Object, [], 3, 3, 0, 0, 0,
ju_MapEntry, 0, jl_Object, [ju_Map$Entry, jl_Cloneable], 0, 0, 0, 0, 0,
ju_HashMap$HashEntry, 0, ju_MapEntry, [], 0, 0, 0, 0, 0,
p_PxemInterpreter$Token, 0, jl_Object, [], 4, 0, 0, 0, 0,
ju_ArrayList, 0, ju_AbstractList, [jl_Cloneable, ji_Serializable, ju_RandomAccess], 0, 3, 0, 0, 0,
p_PxemInterpreter$Brackets, 0, jl_Object, [], 4, 0, 0, 0, 0,
jl_Math, 0, jl_Object, [], 4, 3, 0, 0, 0,
otpp_ResourceAccessor, 0, jl_Object, [], 4, 0, 0, 0, 0,
otciu_UnicodeHelper, 0, jl_Object, [], 4, 3, 0, 0, 0,
otciu_CharMapping, 0, jl_Object, [], 0, 3, 0, 0, 0,
otci_CharFlow, 0, jl_Object, [], 0, 3, 0, 0, 0,
otci_Base46, 0, jl_Object, [], 4, 3, 0, 0, 0,
juf_IntPredicate, 0, jl_Object, [], 3, 3, 0, 0, 0,
jusi_SimpleIntStreamImpl$ArrayFillingConsumer, 0, jl_Object, [juf_IntPredicate], 0, 0, 0, 0, ["$test", $rt_wrapFunction1(jusi_SimpleIntStreamImpl$ArrayFillingConsumer_test)],
jusi_SimpleIntStreamImpl$toArray$lambda$_16_0, 0, jl_Object, [juf_IntPredicate], 0, 3, 0, 0, ["$test", $rt_wrapFunction1(jusi_SimpleIntStreamImpl$toArray$lambda$_16_0_test)],
jl_StringIndexOutOfBoundsException, 0, jl_IndexOutOfBoundsException, [], 0, 3, 0, 0, 0,
jlr_Array, 0, jl_Object, [], 4, 3, 0, 0, 0,
ju_ArrayDeque$1, 0, jl_Object, [ju_Iterator], 0, 0, 0, 0, 0,
ju_ConcurrentModificationException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0,
jl_NegativeArraySizeException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0,
ju_NoSuchElementException, 0, jl_RuntimeException, [], 0, 3, 0, 0, 0]);
let $rt_charArrayCls = $rt_arraycls($rt_charcls),
$rt_intArrayCls = $rt_arraycls($rt_intcls);
$rt_stringPool(["0", "null", "ERROR:", "ERROR:内部エラー: ", "", "ステップ数上限 (1000000) を超えました（無限ループの可能性）", "出力文字数上限 (100000) を超えました", "ゼロ除算エラー (.$)", "ゼロ除算エラー (.%)", "スタックアンダーフロー", "スタックアンダーフロー (peek)"]);
jl_String.prototype.toString = function() {
    return $rt_ustr(this);
};
jl_String.prototype.valueOf = jl_String.prototype.toString;
jl_Object.prototype.toString = function() {
    return $rt_ustr(jl_Object_toString(this));
};
jl_Object.prototype.__teavm_class__ = function() {
    return $dbg_class(this);
};
let $rt_export_main = $rt_mainStarter(p_PxemMain_main);
$rt_export_main.javaException = $rt_javaException;
let $rt_jso_marker = Symbol('jsoClass');
(() => {
    let c;
    c = p_PxemMain$main$lambda$_2_0.prototype;
    c[$rt_jso_marker] = true;
    c.call = c.$call$exported$0;
})();
$rt_exports.main = $rt_export_main;
}));
