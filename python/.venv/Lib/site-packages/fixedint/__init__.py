#!/usr/bin/env python
# -*- coding: utf-8 -*-

from fixedint.base import FixedInt, MutableFixedInt
from fixedint.aliases import *

def test(verbosity=1, repeat=1):
    from fixedint import test_fixedint
    return test_fixedint.run(verbosity, repeat)
