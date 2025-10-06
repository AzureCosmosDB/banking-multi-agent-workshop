/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, group, query, animateChild, } from '@angular/animations';
export const DEFAULT_HORIZONTAL_ANIMATION_DURATION = '500ms';
export const DEFAULT_VERTICAL_ANIMATION_DURATION = '225ms';
/**
 * Animations used by the Material steppers.
 * @docs-private
 */
export const matStepperAnimations = {
    /** Animation that transitions the step along the X axis in a horizontal stepper. */
    horizontalStepTransition: trigger('horizontalStepTransition', [
        state('previous', style({ transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden' })),
        // Transition to `inherit`, rather than `visible`,
        // because visibility on a child element the one from the parent,
        // making this element focusable inside of a `hidden` element.
        state('current', style({ transform: 'none', visibility: 'inherit' })),
        state('next', style({ transform: 'translate3d(100%, 0, 0)', visibility: 'hidden' })),
        transition('* => *', group([
            animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)'),
            query('@*', animateChild(), { optional: true }),
        ]), {
            params: { 'animationDuration': DEFAULT_HORIZONTAL_ANIMATION_DURATION },
        }),
    ]),
    /** Animation that transitions the step along the Y axis in a vertical stepper. */
    verticalStepTransition: trigger('verticalStepTransition', [
        state('previous', style({ height: '0px', visibility: 'hidden' })),
        state('next', style({ height: '0px', visibility: 'hidden' })),
        // Transition to `inherit`, rather than `visible`,
        // because visibility on a child element the one from the parent,
        // making this element focusable inside of a `hidden` element.
        state('current', style({ height: '*', visibility: 'inherit' })),
        transition('* <=> current', group([
            animate('{{animationDuration}} cubic-bezier(0.4, 0.0, 0.2, 1)'),
            query('@*', animateChild(), { optional: true }),
        ]), {
            params: { 'animationDuration': DEFAULT_VERTICAL_ANIMATION_DURATION },
        }),
    ]),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1hbmltYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3N0ZXBwZXIvc3RlcHBlci1hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFDTCxPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBQ1YsT0FBTyxFQUVQLEtBQUssRUFDTCxLQUFLLEVBQ0wsWUFBWSxHQUNiLE1BQU0scUJBQXFCLENBQUM7QUFFN0IsTUFBTSxDQUFDLE1BQU0scUNBQXFDLEdBQUcsT0FBTyxDQUFDO0FBQzdELE1BQU0sQ0FBQyxNQUFNLG1DQUFtQyxHQUFHLE9BQU8sQ0FBQztBQUUzRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FHN0I7SUFDRixvRkFBb0Y7SUFDcEYsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLDBCQUEwQixFQUFFO1FBQzVELEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLDBCQUEwQixFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZGLGtEQUFrRDtRQUNsRCxpRUFBaUU7UUFDakUsOERBQThEO1FBQzlELEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztRQUNuRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSx5QkFBeUIsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNsRixVQUFVLENBQ1IsUUFBUSxFQUNSLEtBQUssQ0FBQztZQUNKLE9BQU8sQ0FBQyxzREFBc0QsQ0FBQztZQUMvRCxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDO1NBQzlDLENBQUMsRUFDRjtZQUNFLE1BQU0sRUFBRSxFQUFDLG1CQUFtQixFQUFFLHFDQUFxQyxFQUFDO1NBQ3JFLENBQ0Y7S0FDRixDQUFDO0lBRUYsa0ZBQWtGO0lBQ2xGLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRTtRQUN4RCxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFDL0QsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQzNELGtEQUFrRDtRQUNsRCxpRUFBaUU7UUFDakUsOERBQThEO1FBQzlELEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztRQUM3RCxVQUFVLENBQ1IsZUFBZSxFQUNmLEtBQUssQ0FBQztZQUNKLE9BQU8sQ0FBQyxzREFBc0QsQ0FBQztZQUMvRCxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDO1NBQzlDLENBQUMsRUFDRjtZQUNFLE1BQU0sRUFBRSxFQUFDLG1CQUFtQixFQUFFLG1DQUFtQyxFQUFDO1NBQ25FLENBQ0Y7S0FDRixDQUFDO0NBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgYW5pbWF0ZSxcbiAgc3RhdGUsXG4gIHN0eWxlLFxuICB0cmFuc2l0aW9uLFxuICB0cmlnZ2VyLFxuICBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEsXG4gIGdyb3VwLFxuICBxdWVyeSxcbiAgYW5pbWF0ZUNoaWxkLFxufSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfSE9SSVpPTlRBTF9BTklNQVRJT05fRFVSQVRJT04gPSAnNTAwbXMnO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfVkVSVElDQUxfQU5JTUFUSU9OX0RVUkFUSU9OID0gJzIyNW1zJztcblxuLyoqXG4gKiBBbmltYXRpb25zIHVzZWQgYnkgdGhlIE1hdGVyaWFsIHN0ZXBwZXJzLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgbWF0U3RlcHBlckFuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgaG9yaXpvbnRhbFN0ZXBUcmFuc2l0aW9uOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGE7XG4gIHJlYWRvbmx5IHZlcnRpY2FsU3RlcFRyYW5zaXRpb246IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbn0gPSB7XG4gIC8qKiBBbmltYXRpb24gdGhhdCB0cmFuc2l0aW9ucyB0aGUgc3RlcCBhbG9uZyB0aGUgWCBheGlzIGluIGEgaG9yaXpvbnRhbCBzdGVwcGVyLiAqL1xuICBob3Jpem9udGFsU3RlcFRyYW5zaXRpb246IHRyaWdnZXIoJ2hvcml6b250YWxTdGVwVHJhbnNpdGlvbicsIFtcbiAgICBzdGF0ZSgncHJldmlvdXMnLCBzdHlsZSh7dHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoLTEwMCUsIDAsIDApJywgdmlzaWJpbGl0eTogJ2hpZGRlbid9KSksXG4gICAgLy8gVHJhbnNpdGlvbiB0byBgaW5oZXJpdGAsIHJhdGhlciB0aGFuIGB2aXNpYmxlYCxcbiAgICAvLyBiZWNhdXNlIHZpc2liaWxpdHkgb24gYSBjaGlsZCBlbGVtZW50IHRoZSBvbmUgZnJvbSB0aGUgcGFyZW50LFxuICAgIC8vIG1ha2luZyB0aGlzIGVsZW1lbnQgZm9jdXNhYmxlIGluc2lkZSBvZiBhIGBoaWRkZW5gIGVsZW1lbnQuXG4gICAgc3RhdGUoJ2N1cnJlbnQnLCBzdHlsZSh7dHJhbnNmb3JtOiAnbm9uZScsIHZpc2liaWxpdHk6ICdpbmhlcml0J30pKSxcbiAgICBzdGF0ZSgnbmV4dCcsIHN0eWxlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgxMDAlLCAwLCAwKScsIHZpc2liaWxpdHk6ICdoaWRkZW4nfSkpLFxuICAgIHRyYW5zaXRpb24oXG4gICAgICAnKiA9PiAqJyxcbiAgICAgIGdyb3VwKFtcbiAgICAgICAgYW5pbWF0ZSgne3thbmltYXRpb25EdXJhdGlvbn19IGN1YmljLWJlemllcigwLjM1LCAwLCAwLjI1LCAxKScpLFxuICAgICAgICBxdWVyeSgnQConLCBhbmltYXRlQ2hpbGQoKSwge29wdGlvbmFsOiB0cnVlfSksXG4gICAgICBdKSxcbiAgICAgIHtcbiAgICAgICAgcGFyYW1zOiB7J2FuaW1hdGlvbkR1cmF0aW9uJzogREVGQVVMVF9IT1JJWk9OVEFMX0FOSU1BVElPTl9EVVJBVElPTn0sXG4gICAgICB9LFxuICAgICksXG4gIF0pLFxuXG4gIC8qKiBBbmltYXRpb24gdGhhdCB0cmFuc2l0aW9ucyB0aGUgc3RlcCBhbG9uZyB0aGUgWSBheGlzIGluIGEgdmVydGljYWwgc3RlcHBlci4gKi9cbiAgdmVydGljYWxTdGVwVHJhbnNpdGlvbjogdHJpZ2dlcigndmVydGljYWxTdGVwVHJhbnNpdGlvbicsIFtcbiAgICBzdGF0ZSgncHJldmlvdXMnLCBzdHlsZSh7aGVpZ2h0OiAnMHB4JywgdmlzaWJpbGl0eTogJ2hpZGRlbid9KSksXG4gICAgc3RhdGUoJ25leHQnLCBzdHlsZSh7aGVpZ2h0OiAnMHB4JywgdmlzaWJpbGl0eTogJ2hpZGRlbid9KSksXG4gICAgLy8gVHJhbnNpdGlvbiB0byBgaW5oZXJpdGAsIHJhdGhlciB0aGFuIGB2aXNpYmxlYCxcbiAgICAvLyBiZWNhdXNlIHZpc2liaWxpdHkgb24gYSBjaGlsZCBlbGVtZW50IHRoZSBvbmUgZnJvbSB0aGUgcGFyZW50LFxuICAgIC8vIG1ha2luZyB0aGlzIGVsZW1lbnQgZm9jdXNhYmxlIGluc2lkZSBvZiBhIGBoaWRkZW5gIGVsZW1lbnQuXG4gICAgc3RhdGUoJ2N1cnJlbnQnLCBzdHlsZSh7aGVpZ2h0OiAnKicsIHZpc2liaWxpdHk6ICdpbmhlcml0J30pKSxcbiAgICB0cmFuc2l0aW9uKFxuICAgICAgJyogPD0+IGN1cnJlbnQnLFxuICAgICAgZ3JvdXAoW1xuICAgICAgICBhbmltYXRlKCd7e2FuaW1hdGlvbkR1cmF0aW9ufX0gY3ViaWMtYmV6aWVyKDAuNCwgMC4wLCAwLjIsIDEpJyksXG4gICAgICAgIHF1ZXJ5KCdAKicsIGFuaW1hdGVDaGlsZCgpLCB7b3B0aW9uYWw6IHRydWV9KSxcbiAgICAgIF0pLFxuICAgICAge1xuICAgICAgICBwYXJhbXM6IHsnYW5pbWF0aW9uRHVyYXRpb24nOiBERUZBVUxUX1ZFUlRJQ0FMX0FOSU1BVElPTl9EVVJBVElPTn0sXG4gICAgICB9LFxuICAgICksXG4gIF0pLFxufTtcbiJdfQ==