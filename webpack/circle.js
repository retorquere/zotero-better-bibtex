const child_process = require('child_process');

if (process.env.CIRCLE_SHA1) {
  process.env.CIRCLE_COMMIT_MSG = child_process.execSync(`git log --format=%B -n 1 ${process.env.CIRCLE_SHA1}`).toString().trim();

  try {
    process.env.CIRCLE_TAG = child_process.execSync(`git describe --exact-match ${process.env.CIRCLE_SHA1}`, {stdio: 'pipe' }).toString().trim();
  } catch(err) {
    delete process.env.CIRCLE_TAG;
  }
}
