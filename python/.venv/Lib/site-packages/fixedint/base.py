# -*- coding: utf-8 -*-

import sys
from fixedint.compat import *
from weakref import WeakValueDictionary

class FixedProperty(object):
    def __init__(self, val, doc):
        self.val = val
        self.__doc__ = doc
    def __get__(self, obj, type=None):
        return self.val
    def __set__(self, obj, value):
        raise AttributeError("property is read-only")

class FixedMetaProperty(object):
    def __init__(self, name, doc):
        self.name = name
        self.__doc__ = doc
    def __get__(self, obj, type=None):
        if self.name not in obj.__dict__:
            # this should only happen when trying to access FixedInt.prop, which help() does
            raise AttributeError("Attribute %s not defined on base class" % self.name)
        prop = obj.__dict__[self.name]
        return prop.__get__(obj)
    def __set__(self, obj, value):
        raise AttributeError("property %s is read-only" % self.name)

if not PY3K:
    # While it'd be nice to put machine-sized integers into Python 2.x "int"s,
    # it turns out that the int methods occasionally freak out when given longs.
    # So, we use arbitrary-precision ints for all Pythons.
    int = long

_class_cache = WeakValueDictionary()

_doc_width = "Bit width of this integer, including the sign bit."
_doc_signed = "True if this integer is a twos-complement signed type."
_doc_mutable = "True if this integer is mutable (modifiable in-place)."
_doc_minval = "Minimum representable value of this integer type"
_doc_maxval = "Maximum representable value of this integer type"

_subclass_token = object()
class _FixedIntBaseMeta(type):
    def __new__(cls, name, bases, dict):
        if dict.get('_subclass_enable', None) == _subclass_token:
            del dict['_subclass_enable']
            return type.__new__(cls, name, bases, dict)

        for base in bases:
            if issubclass(base, FixedInt):
                basename = base.__name__
                raise Exception("Cannot subclass %s; use the %s constructor to produce new subclasses." % (basename, basename))
        raise Exception("Cannot subclass this class.")

    def __call__(self, width, signed=True, mutable=None):
        signed = bool(signed)
        if mutable is None:
            # Take mutable from constructor used (FixedInt or MutableFixedInt)
            mutable = (self == MutableFixedInt)

        cachekey = (width, signed, mutable)
        try:
            return _class_cache[cachekey]
        except KeyError:
            pass
            
        if signed:
            min = -1<<(width-1)
            max = (1<<(width-1))-1
        else:
            min = 0
            max = (1<<width)-1

        if mutable:
            bases = (MutableFixedInt,)
        else:
            bases = (FixedInt, int)

        dict = {}
        dict['width'] = FixedProperty(width, doc=_doc_width)
        dict['signed'] = FixedProperty(signed, doc=_doc_signed)
        dict['mutable'] = FixedProperty(mutable, doc=_doc_mutable)
        dict['minval'] = FixedProperty(min, doc=_doc_minval)
        dict['maxval'] = FixedProperty(max, doc=_doc_maxval)

        if signed:
            _mask1 = (1<<(width-1)) - 1
            _mask2 = 1<<(width-1)
            def _rectify(val):
                return (val & _mask1) - (val & _mask2)
        else:
            _mask = (1<<width) - 1
            def _rectify(val):
                return val & _mask
        dict['_rectify'] = staticmethod(_rectify)

        if not mutable:
            intbase = bases[1]
            def _newfunc(cls, val=0):
                ''' Convert an integer into a fixed-width integer. '''
                return intbase.__new__(cls, _rectify(int(val)))
            _newfunc.__name__ = '__new__'
            dict['__new__'] = _newfunc

        name = ''.join(['Mutable'*mutable, 'U'*(not signed), 'Int', str(width)])

        cls = _FixedIntMeta(name, bases, dict)
        _class_cache[cachekey] = cls
        return cls

    width = FixedMetaProperty('width', doc=_doc_width)
    signed = FixedMetaProperty('signed', doc=_doc_signed)
    mutable = FixedMetaProperty('mutable', doc=_doc_mutable)
    minval = FixedMetaProperty('minval', doc=_doc_minval)
    maxval = FixedMetaProperty('maxval', doc=_doc_maxval)

class _FixedIntMeta(_FixedIntBaseMeta):
    __new__ = type.__new__
    __call__ = type.__call__


def int_method(f):
    if isinstance(f, str):
        def wrapper(f2):
            f2.__name__ = f
            return int_method(f2)
        return wrapper
    else:
        f.__doc__ = getattr(int, f.__name__).__doc__
        return f

class FixedInt:
    __slots__ = ()
    _subclass_enable = _subclass_token

    # width, signed, mutable, minval, maxval defined in metaclass
    # _rectify defined in metaclass
    # __new__ defined in metaclass

    if not PY3K:
        @int_method
        def __hex__(self):
            return '%#x' % int(self)
        def __oct__(self):
            return '%#o' % int(self)

    @int_method
    def __pow__(self, other, modulo=None):
        # Jython can't handle int.__pow__(x, y, None)
        if modulo is None:
            return type(self)(int.__pow__(int(self), int(other)))
        return type(self)(int.__pow__(int(self), int(other), modulo))

    @int_method
    def __rpow__(self, other):
        return type(other)(int.__rpow__(int(self), int(other)))

    @int_method
    def __repr__(self):
        return '%s(%s)' % (type(self).__name__, self)

    @int_method
    def __str__(self):
        return str(int(self))

    @classmethod
    def _canonicalize_index(cls, idx):
        if idx < 0:
            idx += cls.width
        return idx

    @classmethod
    def _canonicalize_slice(cls, slice):
        start = slice.start
        stop = slice.stop

        if slice.step is not None:
            raise ValueError("slice step unsupported")

        if start is None:
            start = 0
        else:
            start = cls._canonicalize_index(start)

        if stop is None:
            stop = cls.width
        elif isinstance(stop, complex):
            if stop.real:
                raise ValueError("invalid slice stop: must be integer or pure-imaginary complex number")
            stop = int(stop.imag) + start
        else:
            stop = cls._canonicalize_index(stop)

        if 0 <= start < stop <= cls.width:
            return (start, stop)
        else:
            raise IndexError("invalid slice %d:%d" % (start, stop))

    def __getitem__(self, item):
        ''' Slice the bits of an integer.

        x[a] gets a single bit at position a, returning a bool.
        x[a:b] gets a range of bits as a FixedInt.

        For slice notation, b may be of the form 'bj' (a complex number) to treat it
        as a length rather than a stop index.
        The result will be of the type UIntX, where X is the number of bits in the range.

        Examples:
        x[0]: equal to (x & 1)
        x[1:5] or x[1:4j]: equal to (x & 31) >> 1
        x[:5]: equal to (x & 31)
        '''

        if isinstance(item, slice):
            start, stop = self._canonicalize_slice(item)
            return FixedInt(stop - start, signed=False)(int(self) >> start)
        else:
            item = self._canonicalize_index(item)
            if 0 <= item < self.width:
                return bool(int(self) & (1 << item))
            else:
                raise IndexError("index %d out of range" % item)

    def to_bytes(self, length=None, byteorder=sys.byteorder):
        if length is None:
            length = (self.width + 7) // 8
        try:
            return int(self).to_bytes(length, byteorder=byteorder, signed=self.signed)
        except (OverflowError, AttributeError):
            pass

        val = int(self) & ((1 << (length * 8)) - 1)
        out = []
        while length > 0:
            out.append(val & 0xff)
            val >>= 8
            length -= 1
        if byteorder == 'big':
            out = reversed(out)
        if PY3K:
            return bytes(out)
        else:
            return ''.join(map(chr, out))

    @classmethod
    def from_bytes(cls, bytes, byteorder=sys.byteorder, signed=None):
        if cls in (FixedInt, MutableFixedInt):
            if signed is None:
                signed = False
        elif signed is None:
                signed = cls.signed
        else:
            raise ValueError("can't set signed with a concrete FixedInt")

        blen = len(bytes)
        try:
            val = int.from_bytes(bytes, byteorder=byteorder, signed=signed)
        except AttributeError:
            val = 0
            if byteorder == 'big':
                bytes = reversed(bytes)
            if PY3K:
                for i,c in enumerate(bytes):
                    val |= c << (8 * i)
            else:
                for i,c in enumerate(bytes):
                    val |= ord(c) << (8 * i)

        if cls in (FixedInt, MutableFixedInt):
            return cls(blen*8, signed=signed)(val)
        else:
            return cls(val)

    if PY3K:
        @int_method
        def __round__(self, n=0):
            return int(self)

    # Inherited methods which are fine as-is:
    # complex, int, long, float, index
    # truediv, rtruediv, divmod, rdivmod, rlshift, rrshift
    # format

FixedInt = add_metaclass(_FixedIntBaseMeta)(FixedInt)


class MutableFixedInt(FixedInt):
    _subclass_enable = _subclass_token

    def __init__(self, val=0, base=None):
        ''' Convert an integer into a fixed-width integer. '''
        if base is None:
            val = int(val)
        else:
            val = int(val, base)

        self._val = self._rectify(val)

    if PY3K:
        @int_method
        def __format__(self, format_spec):
            return format(self._val, format_spec)

    def __ipow__(self, other, modulo=None):
        if modulo is None:
            self._val = self._rectify(int.__pow__(int(self), int(other)))
        else:
            self._val = self._rectify(int.__pow__(int(self), int(other), modulo))
        return self

    def __setitem__(self, item, value):
        ''' Modify a slice of an integer.

        x[a]=y sets a single bit at position a.
        x[a:b]=y sets a range of bits from an integer.

        See __getitem__ for more details on the slice notation.
        '''

        value = int(value)
        if isinstance(item, slice):
            start, stop = self._canonicalize_slice(item)
            mask = (1 << (stop - start)) - 1
            self._val = (self._val & ~(mask << start)) | ((value & mask) << start)
        else:
            item = self._canonicalize_index(item)
            if 0 <= item < self.width:
                if value:
                    self._val |= (1 << item)
                else:
                    self._val &= ~(1 << item)
                return bool(int(self) & (1 << item))
            else:
                raise IndexError("index %d out of range" % item)

## Arithmetic methods
def _arith_unary_factory(name, mutable):
    ''' Factory function producing methods for unary operations. '''
    intfunc = getattr(int, name)
    if mutable:
        @int_method(name)
        def _f(self):
            return type(self)(intfunc(self._val))
    else:
        @int_method(name)
        def _f(self):
            return type(self)(intfunc(self))
    return _f

_arith_unary = 'neg pos abs invert'.split()
for f in _arith_unary:
    s = '__%s__' % f
    setattr(FixedInt, s, _arith_unary_factory(s, mutable=False))
    setattr(MutableFixedInt, s, _arith_unary_factory(s, mutable=True))


def _arith_convert(t1, t2):
    if not issubclass(t2, FixedInt):
        return t1

    # Follow C conversion rules (ISO/IEC 9899:TC3 §6.3.1.8)
    if t1.signed == t2.signed:
        # If both are signed or both are unsigned, return the larger type.
        if t1.width >= t2.width:
            return t1
        return t2

    if not t1.signed:
        ut, st = t1, t2
    else:
        ut, st = t2, t1

    if ut.width >= st.width:
        # If the unsigned type has rank >= the signed type, convert the signed type to the unsigned type.
        return ut
    else:
        return st

def _arith_binfunc_factory(name):
    ''' Factory function producing methods for arithmetic operators '''
    intfunc = getattr(int, name)
    @int_method(name)
    def _f(self, other):
        nt = _arith_convert(type(self), type(other))
        return nt(intfunc(int(self), int(other)))
    return _f

# divmod, rdivmod, truediv, rtruediv are considered non-arithmetic since they don't return ints
# pow, rpow, rlshift, and rrshift are special since the LHS and RHS are very different
_arith_binfunc = 'add sub mul floordiv mod lshift rshift and xor or'.split()
_arith_binfunc += 'radd rsub rmul rfloordiv rmod rand rxor ror'.split()
if not PY3K:
    _arith_binfunc += 'div rdiv'.split()

for f in _arith_binfunc:
    s = '__%s__' % f
    setattr(FixedInt, s, _arith_binfunc_factory(s))


## Non-arithmetic methods (Mutable only)
def _nonarith_unary_factory_mutable(name):
    ''' Factory function producing methods for unary operations. '''
    intfunc = getattr(int, name)
    @int_method(name)
    def _f(self):
        return intfunc(self._val)
    return _f

_mutable_unary = 'int float'.split()
if sys.version_info[:2] >= (2,5):
    _mutable_unary += ['index']
if sys.version_info[:2] >= (2,6):
    _mutable_unary += ['trunc']
if PY3K:
    _mutable_unary += 'bool'.split()
else:
    _mutable_unary += 'nonzero long'.split()

for f in _mutable_unary:
    s = '__%s__' % f
    setattr(MutableFixedInt, s, _nonarith_unary_factory_mutable(s))


def _nonarith_binfunc_factory_mutable(name):
    ''' Factory function producing methods for non-arithmetic binary operators on Mutable instances. '''
    intfunc = getattr(int, name)
    @int_method(name)
    def _f(self, other):
        return intfunc(self._val, int(other))
    return _f

_mutable_binfunc = 'truediv rtruediv divmod rdivmod rlshift rrshift'.split()
if hasattr(int, '__cmp__'):
    _mutable_binfunc += ['cmp']
else:
    _mutable_binfunc += 'lt le eq ne gt ge'.split()
for f in _mutable_binfunc:
    s = '__%s__' % f
    setattr(MutableFixedInt, s, _nonarith_binfunc_factory_mutable(s))


## In-place operators
def _inplace_factory_mutable(iname, name, op):
    ''' Factory function producing methods for augmented assignments on Mutable instances. '''
    # This uses compiled operators instead of an int.__X__ function call for speed.
    # Measured improvement is about 15% speed increase.
    exec("""
def _f(self, other):
    self._val = self._rectify(self._val %s int(other))
    return self
globals()['_f'] = _f""" % op)
    _f.__name__ = iname
    doc = list.__iadd__.__doc__
    if doc:
        _f.__doc__ = doc.replace('__iadd__', name).replace('+=', op+'=')
    return _f

# pow is special because it takes three arguments.
_inplace_func = 'add,+ sub,- mul,* truediv,/ floordiv,// mod,% lshift,<< rshift,<< and,& or,| xor,^'.split()
if not PY3K:
    _inplace_func += ['div,/']
for f in _inplace_func:
    fn, op = f.split(',')
    si = '__i%s__' % fn
    so = '__%s__' % fn
    setattr(MutableFixedInt, si, _inplace_factory_mutable(si, so, op))
