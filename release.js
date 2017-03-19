/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const GitHubApi = require("github");
const semver = require('semver')

async function main() {
  const github = new GitHubApi();
  const owner = 'calebegg', repo = 'codewich';

  github.authenticate({
    type: 'basic',
    username: 'calebegg',
    password: process.env.GITHUB_AUTH_TOKEN,
  });

  const latest = await github.repos.getLatestRelease({
    owner, repo,
  });

  let {tag_name} = latest.data;

  tag_name = semver.inc(tag_name, 'minor');

  let newRelease = await github.repos.createRelease({
    owner, repo,
    tag_name,
    name: `Codewich ${tag_name}`,
    body: '_This release was created automatically by a script._',
    draft: true,
  });

  await github.repos.uploadAsset({
    owner, repo,
    id: newRelease.data.id,
    filePath: 'build/codewich.zip',
    name: 'codewich.zip',
  });

  console.log(`Draft release created successfully! ${newRelease.html_url}`);
  console.log('Add some release notes and publish.');
}

main();
