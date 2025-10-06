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
    'ff-MR',
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
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'UM',
    'Ugiyya Muritani',
    { 'JPY': ['JP¥', '¥'], 'MRU': ['UM'], 'USD': ['US$', '$'] },
    plural,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmYtTVIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9mZi1NUi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCwrRkFBK0Y7QUFDL0YsK0ZBQStGO0FBQy9GLDRGQUE0RjtBQUM1RixnR0FBZ0c7QUFDaEcsZ0dBQWdHO0FBQ2hHLGlGQUFpRjtBQUVqRixNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7QUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztJQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxlQUFlO0lBQ2IsT0FBTztJQUNQLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0Q7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUNuQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNqRCxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQztRQUNoRixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztLQUNsRDtJQUNELENBQUM7SUFDRDtRQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDNUQsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNwRjtZQUNFLE9BQU87WUFDUCxPQUFPO1lBQ1AsT0FBTztZQUNQLFFBQVE7WUFDUixRQUFRO1lBQ1IsT0FBTztZQUNQLE9BQU87WUFDUCxNQUFNO1lBQ04sUUFBUTtZQUNSLFVBQVU7WUFDVixPQUFPO1lBQ1AsT0FBTztTQUNSO0tBQ0Y7SUFDRCxDQUFDO0lBQ0QsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNOLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO0lBQ2xELENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUM7SUFDeEQsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztJQUM5RCxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztJQUM1QyxJQUFJO0lBQ0osaUJBQWlCO0lBQ2pCLEVBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBQztJQUN6RCxNQUFNO0NBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLy8gKipOb3RlKio6IExvY2FsZSBmaWxlcyBhcmUgZ2VuZXJhdGVkIHRocm91Z2ggQmF6ZWwgYW5kIG5ldmVyIHBhcnQgb2YgdGhlIHNvdXJjZXMuIFRoaXMgaXMgYW5cbi8vIGV4Y2VwdGlvbiBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIFdpdGggdGhlIEd1bHAgc2V0dXAgd2UgbmV2ZXIgZGVsZXRlZCBvbGQgbG9jYWxlIGZpbGVzXG4vLyB3aGVuIHVwZGF0aW5nIENMRFIsIHNvIG9sZGVyIGxvY2FsZSBmaWxlcyB3aGljaCBoYXZlIGJlZW4gcmVtb3ZlZCwgb3IgcmVuYW1lZCBpbiB0aGUgQ0xEUlxuLy8gZGF0YSByZW1haW5lZCBpbiB0aGUgcmVwb3NpdG9yeS4gV2Uga2VlcCB0aGVzZSBmaWxlcyBjaGVja2VkLWluIHVudGlsIHRoZSBuZXh0IG1ham9yIHRvIGF2b2lkXG4vLyBwb3RlbnRpYWwgYnJlYWtpbmcgY2hhbmdlcy4gSXQncyB3b3J0aCBub3RpbmcgdGhhdCB0aGUgbG9jYWxlIGRhdGEgZm9yIHN1Y2ggZmlsZXMgaXMgb3V0ZGF0ZWRcbi8vIGFueXdheS4gZS5nLiB0aGUgZGF0YSBpcyBtaXNzaW5nIHRoZSBkaXJlY3Rpb25hbGl0eSwgdGhyb3dpbmcgb2ZmIHRoZSBpbmRpY2VzLlxuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcbiAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSkgcmV0dXJuIDE7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdmZi1NUicsXG4gIFtbJ3N1YmFrYScsICdraWtpacmXZSddLCB1LCB1XSxcbiAgdSxcbiAgW1xuICAgIFsnZCcsICdhJywgJ20nLCAnbicsICduJywgJ20nLCAnaCddLFxuICAgIFsnZGV3JywgJ2FhyZMnLCAnbWF3JywgJ25qZScsICduYWEnLCAnbXdkJywgJ2hiaSddLFxuICAgIFsnZGV3bycsICdhYcmTbmRlJywgJ21hd2JhYXJlJywgJ25qZXNsYWFyZScsICduYWFzYWFuZGUnLCAnbWF3bmRlJywgJ2hvb3JlLWJpaXInXSxcbiAgICBbJ2RldycsICdhYcmTJywgJ21hdycsICduamUnLCAnbmFhJywgJ213ZCcsICdoYmknXSxcbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsncycsICdjJywgJ20nLCAncycsICdkJywgJ2snLCAnbScsICdqJywgJ3MnLCAneScsICdqJywgJ2InXSxcbiAgICBbJ3NpaScsICdjb2wnLCAnbWJvJywgJ3NlZScsICdkdXUnLCAna29yJywgJ21vcicsICdqdWsnLCAnc2x0JywgJ3lhcicsICdqb2wnLCAnYm93J10sXG4gICAgW1xuICAgICAgJ3NpaWxvJyxcbiAgICAgICdjb2x0ZScsXG4gICAgICAnbWJvb3knLFxuICAgICAgJ3NlZcmXdG8nLFxuICAgICAgJ2R1dWphbCcsXG4gICAgICAna29yc2UnLFxuICAgICAgJ21vcnNvJyxcbiAgICAgICdqdWtvJyxcbiAgICAgICdzaWlsdG8nLFxuICAgICAgJ3lhcmtvbWFhJyxcbiAgICAgICdqb2xhbCcsXG4gICAgICAnYm93dGUnLFxuICAgIF0sXG4gIF0sXG4gIHUsXG4gIFtbJ0gtSScsICdDLUknXSwgdSwgWydIYWRlIElpc2EnLCAnQ2FnZ2FsIElpc2EnXV0sXG4gIDEsXG4gIFs2LCAwXSxcbiAgWydkL00veScsICdkIE1NTSwgeScsICdkIE1NTU0geScsICdFRUVFIGQgTU1NTSB5J10sXG4gIFsnaDptbSBhJywgJ2g6bW06c3MgYScsICdoOm1tOnNzIGEgeicsICdoOm1tOnNzIGEgenp6eiddLFxuICBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycsJywgJ8KgJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdVTScsXG4gICdVZ2l5eWEgTXVyaXRhbmknLFxuICB7J0pQWSc6IFsnSlDCpScsICfCpSddLCAnTVJVJzogWydVTSddLCAnVVNEJzogWydVUyQnLCAnJCddfSxcbiAgcGx1cmFsLFxuXTtcbiJdfQ==