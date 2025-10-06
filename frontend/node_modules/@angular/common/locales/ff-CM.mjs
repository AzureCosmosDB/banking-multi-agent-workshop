/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// **Note**: Locale files are generated through Bazel and never part of the sources. This is an
// exception for backwards compatibility. With the Gulp setup we never deleted old locale files
// when updating CLDR, so older locale files which have been removed, or renamed in the CLDR
// data remained in the repository. We keep these files checked-in until the next major to avoid
// potential breaking changes. It's worth noting that the locale data for such files is outdated
// anyway. e.g. the data is missing the directionality, throwing off the indices.
const u = undefined;
function plural(n) {
    let i = Math.floor(Math.abs(n));
    if (i === 0 || i === 1)
        return 1;
    return 5;
}
export default [
    'ff-CM',
    [['subaka', 'kikiiɗe'], u, u],
    u,
    [
        ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
        ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
        ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
        ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
    ],
    u,
    [
        ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
        ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
        [
            'siilo',
            'colte',
            'mbooy',
            'seeɗto',
            'duujal',
            'korse',
            'morso',
            'juko',
            'siilto',
            'yarkomaa',
            'jolal',
            'bowte',
        ],
    ],
    u,
    [['H-I', 'C-I'], u, ['Hade Iisa', 'Caggal Iisa']],
    1,
    [6, 0],
    ['d/M/y', 'd MMM, y', 'd MMMM y', 'EEEE d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'FCFA',
    'Mbuuɗi Seefaa BEAC',
    { 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'] },
    plural,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmYtQ00uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9mZi1DTS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCwrRkFBK0Y7QUFDL0YsK0ZBQStGO0FBQy9GLDRGQUE0RjtBQUM1RixnR0FBZ0c7QUFDaEcsZ0dBQWdHO0FBQ2hHLGlGQUFpRjtBQUVqRixNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7QUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztJQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxlQUFlO0lBQ2IsT0FBTztJQUNQLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0Q7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUNuQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNqRCxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQztRQUNoRixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztLQUNsRDtJQUNELENBQUM7SUFDRDtRQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDNUQsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNwRjtZQUNFLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLFFBQVE7WUFDUixRQUFRO1lBQ1IsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sUUFBUTtZQUNSLFVBQVU7WUFDVixPQUFPO1lBQ1AsT0FBTztTQUNSO0tBQ0Y7SUFDRCxDQUFDO0lBQ0QsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNOLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO0lBQ2xELENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDO0lBQ3BELENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7SUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUM7SUFDNUMsTUFBTTtJQUNOLG9CQUFvQjtJQUNwQixFQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUM7SUFDMUMsTUFBTTtDQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbi8vICoqTm90ZSoqOiBMb2NhbGUgZmlsZXMgYXJlIGdlbmVyYXRlZCB0aHJvdWdoIEJhemVsIGFuZCBuZXZlciBwYXJ0IG9mIHRoZSBzb3VyY2VzLiBUaGlzIGlzIGFuXG4vLyBleGNlcHRpb24gZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LiBXaXRoIHRoZSBHdWxwIHNldHVwIHdlIG5ldmVyIGRlbGV0ZWQgb2xkIGxvY2FsZSBmaWxlc1xuLy8gd2hlbiB1cGRhdGluZyBDTERSLCBzbyBvbGRlciBsb2NhbGUgZmlsZXMgd2hpY2ggaGF2ZSBiZWVuIHJlbW92ZWQsIG9yIHJlbmFtZWQgaW4gdGhlIENMRFJcbi8vIGRhdGEgcmVtYWluZWQgaW4gdGhlIHJlcG9zaXRvcnkuIFdlIGtlZXAgdGhlc2UgZmlsZXMgY2hlY2tlZC1pbiB1bnRpbCB0aGUgbmV4dCBtYWpvciB0byBhdm9pZFxuLy8gcG90ZW50aWFsIGJyZWFraW5nIGNoYW5nZXMuIEl0J3Mgd29ydGggbm90aW5nIHRoYXQgdGhlIGxvY2FsZSBkYXRhIGZvciBzdWNoIGZpbGVzIGlzIG91dGRhdGVkXG4vLyBhbnl3YXkuIGUuZy4gdGhlIGRhdGEgaXMgbWlzc2luZyB0aGUgZGlyZWN0aW9uYWxpdHksIHRocm93aW5nIG9mZiB0aGUgaW5kaWNlcy5cblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IGkgPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnZmYtQ00nLFxuICBbWydzdWJha2EnLCAna2lraWnJl2UnXSwgdSwgdV0sXG4gIHUsXG4gIFtcbiAgICBbJ2QnLCAnYScsICdtJywgJ24nLCAnbicsICdtJywgJ2gnXSxcbiAgICBbJ2RldycsICdhYcmTJywgJ21hdycsICduamUnLCAnbmFhJywgJ213ZCcsICdoYmknXSxcbiAgICBbJ2Rld28nLCAnYWHJk25kZScsICdtYXdiYWFyZScsICduamVzbGFhcmUnLCAnbmFhc2FhbmRlJywgJ21hd25kZScsICdob29yZS1iaWlyJ10sXG4gICAgWydkZXcnLCAnYWHJkycsICdtYXcnLCAnbmplJywgJ25hYScsICdtd2QnLCAnaGJpJ10sXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ3MnLCAnYycsICdtJywgJ3MnLCAnZCcsICdrJywgJ20nLCAnaicsICdzJywgJ3knLCAnaicsICdiJ10sXG4gICAgWydzaWknLCAnY29sJywgJ21ibycsICdzZWUnLCAnZHV1JywgJ2tvcicsICdtb3InLCAnanVrJywgJ3NsdCcsICd5YXInLCAnam9sJywgJ2JvdyddLFxuICAgIFtcbiAgICAgICdzaWlsbycsXG4gICAgICAnY29sdGUnLFxuICAgICAgJ21ib295JyxcbiAgICAgICdzZWXJl3RvJyxcbiAgICAgICdkdXVqYWwnLFxuICAgICAgJ2tvcnNlJyxcbiAgICAgICdtb3JzbycsXG4gICAgICAnanVrbycsXG4gICAgICAnc2lpbHRvJyxcbiAgICAgICd5YXJrb21hYScsXG4gICAgICAnam9sYWwnLFxuICAgICAgJ2Jvd3RlJyxcbiAgICBdLFxuICBdLFxuICB1LFxuICBbWydILUknLCAnQy1JJ10sIHUsIFsnSGFkZSBJaXNhJywgJ0NhZ2dhbCBJaXNhJ11dLFxuICAxLFxuICBbNiwgMF0sXG4gIFsnZC9NL3knLCAnZCBNTU0sIHknLCAnZCBNTU1NIHknLCAnRUVFRSBkIE1NTU0geSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLFxuICBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycsJywgJ8KgJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdGQ0ZBJyxcbiAgJ01idXXJl2kgU2VlZmFhIEJFQUMnLFxuICB7J0pQWSc6IFsnSlDCpScsICfCpSddLCAnVVNEJzogWydVUyQnLCAnJCddfSxcbiAgcGx1cmFsLFxuXTtcbiJdfQ==