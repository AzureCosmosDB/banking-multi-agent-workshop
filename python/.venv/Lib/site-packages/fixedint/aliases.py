from fixedint.base import FixedInt, MutableFixedInt

__all__ = []

for i in [8,16,32,64]:
    for s in [True, False]:
        for m in [True, False]:
            cls = FixedInt(i, signed=s, mutable=m)
            cls.__module__ = __name__
            __all__ += [cls.__name__]
            globals()[cls.__name__] = cls
