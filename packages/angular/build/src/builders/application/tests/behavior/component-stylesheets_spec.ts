/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { buildApplication } from '../../index';
import { APPLICATION_BUILDER_INFO, BASE_OPTIONS, describeBuilder } from '../setup';

describeBuilder(buildApplication, APPLICATION_BUILDER_INFO, (harness) => {
  describe('Behavior: "Component Stylesheets"', () => {
    it('should successfuly compile with an empty inline style', async () => {
      await harness.modifyFile('src/app/app.component.ts', (content) => {
        return content.replace('styleUrls', 'styles').replace('./app.component.css', '');
      });

      harness.useTarget('build', {
        ...BASE_OPTIONS,
      });

      const { result } = await harness.executeOnce();
      expect(result?.success).toBeTrue();
    });

    it('should maintain optimized empty Sass stylesheet when original has content', async () => {
      await harness.modifyFile('src/app/app.component.ts', (content) => {
        return content.replace('./app.component.css', './app.component.scss');
      });
      await harness.removeFile('src/app/app.component.css');
      await harness.writeFile('src/app/app.component.scss', '@import "variables";');
      await harness.writeFile('src/app/_variables.scss', '$value: blue;');

      harness.useTarget('build', {
        ...BASE_OPTIONS,
        optimization: {
          styles: true,
        },
      });

      const { result } = await harness.executeOnce();
      expect(result?.success).toBeTrue();

      harness.expectFile('dist/browser/main.js').content.not.toContain('variables');
    });
  });
});
