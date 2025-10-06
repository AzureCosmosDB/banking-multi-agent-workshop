class HexFormattingMixin(object):
    def __str__(self):
        n = int(self)
        width = (self.width + 3) // 4
        if n < 0:
            return '-0x%0*x' % (width, -n)
        else:
            return '0x%0*x' % (width, n)
