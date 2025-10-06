/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, group, state, style, transition, trigger, } from '@angular/animations';
// Animation values come from
// TODO(mmalerba): Ideally find a way to import the values from MDC's code.
export const panelAnimation = trigger('panelAnimation', [
    state('void, hidden', style({
        opacity: 0,
        transform: 'scaleY(0.8)',
    })),
    transition(':enter, hidden => visible', [
        group([
            animate('0.03s linear', style({ opacity: 1 })),
            animate('0.12s cubic-bezier(0, 0, 0.2, 1)', style({ transform: 'scaleY(1)' })),
        ]),
    ]),
    transition(':leave, visible => hidden', [animate('0.075s linear', style({ opacity: 0 }))]),
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9hdXRvY29tcGxldGUvYW5pbWF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsT0FBTyxFQUVQLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFVBQVUsRUFDVixPQUFPLEdBQ1IsTUFBTSxxQkFBcUIsQ0FBQztBQUU3Qiw2QkFBNkI7QUFDN0IsMkVBQTJFO0FBQzNFLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBNkIsT0FBTyxDQUFDLGdCQUFnQixFQUFFO0lBQ2hGLEtBQUssQ0FDSCxjQUFjLEVBQ2QsS0FBSyxDQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixTQUFTLEVBQUUsYUFBYTtLQUN6QixDQUFDLENBQ0g7SUFDRCxVQUFVLENBQUMsMkJBQTJCLEVBQUU7UUFDdEMsS0FBSyxDQUFDO1lBQ0osT0FBTyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUM1QyxPQUFPLENBQUMsa0NBQWtDLEVBQUUsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7U0FDN0UsQ0FBQztLQUNILENBQUM7SUFDRixVQUFVLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6RixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgYW5pbWF0ZSxcbiAgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhLFxuICBncm91cCxcbiAgc3RhdGUsXG4gIHN0eWxlLFxuICB0cmFuc2l0aW9uLFxuICB0cmlnZ2VyLFxufSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuLy8gQW5pbWF0aW9uIHZhbHVlcyBjb21lIGZyb21cbi8vIFRPRE8obW1hbGVyYmEpOiBJZGVhbGx5IGZpbmQgYSB3YXkgdG8gaW1wb3J0IHRoZSB2YWx1ZXMgZnJvbSBNREMncyBjb2RlLlxuZXhwb3J0IGNvbnN0IHBhbmVsQW5pbWF0aW9uOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEgPSB0cmlnZ2VyKCdwYW5lbEFuaW1hdGlvbicsIFtcbiAgc3RhdGUoXG4gICAgJ3ZvaWQsIGhpZGRlbicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3NjYWxlWSgwLjgpJyxcbiAgICB9KSxcbiAgKSxcbiAgdHJhbnNpdGlvbignOmVudGVyLCBoaWRkZW4gPT4gdmlzaWJsZScsIFtcbiAgICBncm91cChbXG4gICAgICBhbmltYXRlKCcwLjAzcyBsaW5lYXInLCBzdHlsZSh7b3BhY2l0eTogMX0pKSxcbiAgICAgIGFuaW1hdGUoJzAuMTJzIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpJywgc3R5bGUoe3RyYW5zZm9ybTogJ3NjYWxlWSgxKSd9KSksXG4gICAgXSksXG4gIF0pLFxuICB0cmFuc2l0aW9uKCc6bGVhdmUsIHZpc2libGUgPT4gaGlkZGVuJywgW2FuaW1hdGUoJzAuMDc1cyBsaW5lYXInLCBzdHlsZSh7b3BhY2l0eTogMH0pKV0pLFxuXSk7XG4iXX0=