import execa from 'execa';
import { writeFile } from 'fs/promises';

const { stdout } = await execa('git', ['rev-parse', '--short', 'HEAD']);
await writeFile('public/gitCommitId.json', JSON.stringify(stdout));
