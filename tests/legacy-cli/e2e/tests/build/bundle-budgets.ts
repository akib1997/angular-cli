/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ng } from '../../utils/process';
import { updateJsonFile } from '../../utils/project';
import { expectToFail } from '../../utils/utils';

export default async function () {
  // Error
  await updateJsonFile('angular.json', (json) => {
    json.projects['test-project'].architect.build.configurations.production.budgets = [
      { type: 'all', maximumError: '100b' },
    ];
  });

  const { message: errorMessage } = await expectToFail(() => ng('build'));
  if (!/Error.+budget/i.test(errorMessage)) {
    throw new Error('Budget error: all, max error.');
  }

  // Warning
  await updateJsonFile('angular.json', (json) => {
    json.projects['test-project'].architect.build.configurations.production.budgets = [
      { type: 'all', minimumWarning: '100mb' },
    ];
  });

  const { stderr } = await ng('build');
  if (!/Warning.+budget/i.test(stderr)) {
    throw new Error('Budget warning: all, min warning');
  }

  // Pass
  await updateJsonFile('angular.json', (json) => {
    json.projects['test-project'].architect.build.configurations.production.budgets = [
      { type: 'allScript', maximumError: '100mb' },
    ];
  });

  const { stderr: stderr2 } = await ng('build');
  if (/(Warning|Error)/i.test(stderr2)) {
    throw new Error('BIG max for all, should not error');
  }
}
