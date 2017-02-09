'use strict';

const cp = require('child_process');
const pkg = require('../package.json');

[`git checkout -b daily/${pkg.version}`,
`git add .`,
`git commit -m "temp: release ${pkg.version}"`,
`git push origin daily/${pkg.version}`,
`git tag publish/${pkg.version}`,
`git push origin publish/${pkg.version}`,
`git checkout master`,
`git pull`].forEach(cmd => {
    cp.execSync(cmd);
})

