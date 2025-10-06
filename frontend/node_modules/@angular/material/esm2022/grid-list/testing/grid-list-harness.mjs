/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { ɵTileCoordinator as TileCoordinator } from '@angular/material/grid-list';
import { MatGridTileHarness } from './grid-tile-harness';
/** Harness for interacting with a standard `MatGridList` in tests. */
export class MatGridListHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        /**
         * Tile coordinator that is used by the "MatGridList" for computing
         * positions of tiles. We leverage the coordinator to provide an API
         * for retrieving tiles based on visual tile positions.
         */
        this._tileCoordinator = new TileCoordinator();
    }
    /** The selector for the host element of a `MatGridList` instance. */
    static { this.hostSelector = '.mat-grid-list'; }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatGridListHarness`
     * that meets certain criteria.
     * @param options Options for filtering which dialog instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatGridListHarness, options);
    }
    /** Gets all tiles of the grid-list. */
    async getTiles(filters = {}) {
        return await this.locatorForAll(MatGridTileHarness.with(filters))();
    }
    /** Gets the amount of columns of the grid-list. */
    async getColumns() {
        return Number(await (await this.host()).getAttribute('cols'));
    }
    /**
     * Gets a tile of the grid-list that is located at the given location.
     * @param row Zero-based row index.
     * @param column Zero-based column index.
     */
    async getTileAtPosition({ row, column, }) {
        const [tileHarnesses, columns] = await parallel(() => [this.getTiles(), this.getColumns()]);
        const tileSpans = tileHarnesses.map(t => parallel(() => [t.getColspan(), t.getRowspan()]));
        const tiles = (await parallel(() => tileSpans)).map(([colspan, rowspan]) => ({
            colspan,
            rowspan,
        }));
        // Update the tile coordinator to reflect the current column amount and
        // rendered tiles. We update upon every call of this method since we do not
        // know if tiles have been added, removed or updated (in terms of rowspan/colspan).
        this._tileCoordinator.update(columns, tiles);
        // The tile coordinator respects the colspan and rowspan for calculating the positions
        // of tiles, but it does not create multiple position entries if a tile spans over multiple
        // columns or rows. We want to provide an API where developers can retrieve a tile based on
        // any position that lies within the visual tile boundaries. For example: If a tile spans
        // over two columns, then the same tile should be returned for either column indices.
        for (let i = 0; i < this._tileCoordinator.positions.length; i++) {
            const position = this._tileCoordinator.positions[i];
            const { rowspan, colspan } = tiles[i];
            // Return the tile harness if the given position visually resolves to the tile.
            if (column >= position.col &&
                column <= position.col + colspan - 1 &&
                row >= position.row &&
                row <= position.row + rowspan - 1) {
                return tileHarnesses[i];
            }
        }
        throw Error('Could not find tile at given position.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC1saXN0LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZ3JpZC1saXN0L3Rlc3RpbmcvZ3JpZC1saXN0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxnQkFBZ0IsSUFBSSxlQUFlLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUVoRixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUV2RCxzRUFBc0U7QUFDdEUsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGdCQUFnQjtJQUF4RDs7UUFjRTs7OztXQUlHO1FBQ0sscUJBQWdCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztJQXNEbkQsQ0FBQztJQXhFQyxxRUFBcUU7YUFDOUQsaUJBQVksR0FBRyxnQkFBZ0IsQUFBbkIsQ0FBb0I7SUFFdkM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWtDLEVBQUU7UUFDOUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFTRCx1Q0FBdUM7SUFDdkMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFrQyxFQUFFO1FBQ2pELE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDdEUsQ0FBQztJQUVELG1EQUFtRDtJQUNuRCxLQUFLLENBQUMsVUFBVTtRQUNkLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQ3RCLEdBQUcsRUFDSCxNQUFNLEdBSVA7UUFDQyxNQUFNLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUYsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0YsTUFBTSxLQUFLLEdBQUcsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLE9BQU87WUFDUCxPQUFPO1NBQ1IsQ0FBQyxDQUFDLENBQUM7UUFDSix1RUFBdUU7UUFDdkUsMkVBQTJFO1FBQzNFLG1GQUFtRjtRQUNuRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxzRkFBc0Y7UUFDdEYsMkZBQTJGO1FBQzNGLDJGQUEyRjtRQUMzRix5RkFBeUY7UUFDekYscUZBQXFGO1FBQ3JGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEQsTUFBTSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsK0VBQStFO1lBQy9FLElBQ0UsTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHO2dCQUN0QixNQUFNLElBQUksUUFBUSxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsQ0FBQztnQkFDcEMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHO2dCQUNuQixHQUFHLElBQUksUUFBUSxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsQ0FBQyxFQUNqQyxDQUFDO2dCQUNELE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUN4RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7ybVUaWxlQ29vcmRpbmF0b3IgYXMgVGlsZUNvb3JkaW5hdG9yfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9ncmlkLWxpc3QnO1xuaW1wb3J0IHtHcmlkTGlzdEhhcm5lc3NGaWx0ZXJzLCBHcmlkVGlsZUhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2dyaWQtbGlzdC1oYXJuZXNzLWZpbHRlcnMnO1xuaW1wb3J0IHtNYXRHcmlkVGlsZUhhcm5lc3N9IGZyb20gJy4vZ3JpZC10aWxlLWhhcm5lc3MnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIGBNYXRHcmlkTGlzdGAgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0R3JpZExpc3RIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0R3JpZExpc3RgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZ3JpZC1saXN0JztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0R3JpZExpc3RIYXJuZXNzYFxuICAgKiB0aGF0IG1lZXRzIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBkaWFsb2cgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogR3JpZExpc3RIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRHcmlkTGlzdEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0R3JpZExpc3RIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaWxlIGNvb3JkaW5hdG9yIHRoYXQgaXMgdXNlZCBieSB0aGUgXCJNYXRHcmlkTGlzdFwiIGZvciBjb21wdXRpbmdcbiAgICogcG9zaXRpb25zIG9mIHRpbGVzLiBXZSBsZXZlcmFnZSB0aGUgY29vcmRpbmF0b3IgdG8gcHJvdmlkZSBhbiBBUElcbiAgICogZm9yIHJldHJpZXZpbmcgdGlsZXMgYmFzZWQgb24gdmlzdWFsIHRpbGUgcG9zaXRpb25zLlxuICAgKi9cbiAgcHJpdmF0ZSBfdGlsZUNvb3JkaW5hdG9yID0gbmV3IFRpbGVDb29yZGluYXRvcigpO1xuXG4gIC8qKiBHZXRzIGFsbCB0aWxlcyBvZiB0aGUgZ3JpZC1saXN0LiAqL1xuICBhc3luYyBnZXRUaWxlcyhmaWx0ZXJzOiBHcmlkVGlsZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdEdyaWRUaWxlSGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMubG9jYXRvckZvckFsbChNYXRHcmlkVGlsZUhhcm5lc3Mud2l0aChmaWx0ZXJzKSkoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBhbW91bnQgb2YgY29sdW1ucyBvZiB0aGUgZ3JpZC1saXN0LiAqL1xuICBhc3luYyBnZXRDb2x1bW5zKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIE51bWJlcihhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnY29scycpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgdGlsZSBvZiB0aGUgZ3JpZC1saXN0IHRoYXQgaXMgbG9jYXRlZCBhdCB0aGUgZ2l2ZW4gbG9jYXRpb24uXG4gICAqIEBwYXJhbSByb3cgWmVyby1iYXNlZCByb3cgaW5kZXguXG4gICAqIEBwYXJhbSBjb2x1bW4gWmVyby1iYXNlZCBjb2x1bW4gaW5kZXguXG4gICAqL1xuICBhc3luYyBnZXRUaWxlQXRQb3NpdGlvbih7XG4gICAgcm93LFxuICAgIGNvbHVtbixcbiAgfToge1xuICAgIHJvdzogbnVtYmVyO1xuICAgIGNvbHVtbjogbnVtYmVyO1xuICB9KTogUHJvbWlzZTxNYXRHcmlkVGlsZUhhcm5lc3M+IHtcbiAgICBjb25zdCBbdGlsZUhhcm5lc3NlcywgY29sdW1uc10gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbdGhpcy5nZXRUaWxlcygpLCB0aGlzLmdldENvbHVtbnMoKV0pO1xuICAgIGNvbnN0IHRpbGVTcGFucyA9IHRpbGVIYXJuZXNzZXMubWFwKHQgPT4gcGFyYWxsZWwoKCkgPT4gW3QuZ2V0Q29sc3BhbigpLCB0LmdldFJvd3NwYW4oKV0pKTtcbiAgICBjb25zdCB0aWxlcyA9IChhd2FpdCBwYXJhbGxlbCgoKSA9PiB0aWxlU3BhbnMpKS5tYXAoKFtjb2xzcGFuLCByb3dzcGFuXSkgPT4gKHtcbiAgICAgIGNvbHNwYW4sXG4gICAgICByb3dzcGFuLFxuICAgIH0pKTtcbiAgICAvLyBVcGRhdGUgdGhlIHRpbGUgY29vcmRpbmF0b3IgdG8gcmVmbGVjdCB0aGUgY3VycmVudCBjb2x1bW4gYW1vdW50IGFuZFxuICAgIC8vIHJlbmRlcmVkIHRpbGVzLiBXZSB1cGRhdGUgdXBvbiBldmVyeSBjYWxsIG9mIHRoaXMgbWV0aG9kIHNpbmNlIHdlIGRvIG5vdFxuICAgIC8vIGtub3cgaWYgdGlsZXMgaGF2ZSBiZWVuIGFkZGVkLCByZW1vdmVkIG9yIHVwZGF0ZWQgKGluIHRlcm1zIG9mIHJvd3NwYW4vY29sc3BhbikuXG4gICAgdGhpcy5fdGlsZUNvb3JkaW5hdG9yLnVwZGF0ZShjb2x1bW5zLCB0aWxlcyk7XG4gICAgLy8gVGhlIHRpbGUgY29vcmRpbmF0b3IgcmVzcGVjdHMgdGhlIGNvbHNwYW4gYW5kIHJvd3NwYW4gZm9yIGNhbGN1bGF0aW5nIHRoZSBwb3NpdGlvbnNcbiAgICAvLyBvZiB0aWxlcywgYnV0IGl0IGRvZXMgbm90IGNyZWF0ZSBtdWx0aXBsZSBwb3NpdGlvbiBlbnRyaWVzIGlmIGEgdGlsZSBzcGFucyBvdmVyIG11bHRpcGxlXG4gICAgLy8gY29sdW1ucyBvciByb3dzLiBXZSB3YW50IHRvIHByb3ZpZGUgYW4gQVBJIHdoZXJlIGRldmVsb3BlcnMgY2FuIHJldHJpZXZlIGEgdGlsZSBiYXNlZCBvblxuICAgIC8vIGFueSBwb3NpdGlvbiB0aGF0IGxpZXMgd2l0aGluIHRoZSB2aXN1YWwgdGlsZSBib3VuZGFyaWVzLiBGb3IgZXhhbXBsZTogSWYgYSB0aWxlIHNwYW5zXG4gICAgLy8gb3ZlciB0d28gY29sdW1ucywgdGhlbiB0aGUgc2FtZSB0aWxlIHNob3VsZCBiZSByZXR1cm5lZCBmb3IgZWl0aGVyIGNvbHVtbiBpbmRpY2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdGlsZUNvb3JkaW5hdG9yLnBvc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLl90aWxlQ29vcmRpbmF0b3IucG9zaXRpb25zW2ldO1xuICAgICAgY29uc3Qge3Jvd3NwYW4sIGNvbHNwYW59ID0gdGlsZXNbaV07XG4gICAgICAvLyBSZXR1cm4gdGhlIHRpbGUgaGFybmVzcyBpZiB0aGUgZ2l2ZW4gcG9zaXRpb24gdmlzdWFsbHkgcmVzb2x2ZXMgdG8gdGhlIHRpbGUuXG4gICAgICBpZiAoXG4gICAgICAgIGNvbHVtbiA+PSBwb3NpdGlvbi5jb2wgJiZcbiAgICAgICAgY29sdW1uIDw9IHBvc2l0aW9uLmNvbCArIGNvbHNwYW4gLSAxICYmXG4gICAgICAgIHJvdyA+PSBwb3NpdGlvbi5yb3cgJiZcbiAgICAgICAgcm93IDw9IHBvc2l0aW9uLnJvdyArIHJvd3NwYW4gLSAxXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRpbGVIYXJuZXNzZXNbaV07XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCB0aWxlIGF0IGdpdmVuIHBvc2l0aW9uLicpO1xuICB9XG59XG4iXX0=