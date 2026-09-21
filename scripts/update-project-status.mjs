import fs from 'node:fs/promises';

const config = JSON.parse(await fs.readFile('project-status.config.json', 'utf8'));
const outputPath = 'assets/project-status.json';
const token = process.env.PROFILE_REPOS_TOKEN || process.env.GITHUB_TOKEN || '';
let previous = { projects: {} };
try { previous = JSON.parse(await fs.readFile(outputPath, 'utf8')); } catch {}

async function github(path) {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return response.json();
}

function findPath(tree, expected) {
  const prefix = expected.replace(/\/$/, '');
  return tree.some(item => item.path === prefix || item.path.startsWith(`${prefix}/`));
}

function displayDate(value) {
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

const projects = {};
const statusLabels = { ACTIVE_BUILD: 'Active build', MVP_LIVE: 'MVP live' };
for (const item of config.projects) {
  try {
    const repo = await github(`/repos/${config.owner}/${item.repo}`);
    const [tree, commits] = await Promise.all([
      github(`/repos/${config.owner}/${item.repo}/git/trees/${repo.default_branch}?recursive=1`),
      github(`/repos/${config.owner}/${item.repo}/commits?per_page=1`)
    ]);
    const completed = item.milestones.filter(path => findPath(tree.tree || [], path));
    projects[item.repo] = {
      label: item.label,
      status: item.defaultStatus,
      progress: Math.round((completed.length / item.milestones.length) * 100),
      completedMilestones: completed,
      totalMilestones: item.milestones.length,
      updatedAt: repo.pushed_at,
      latestCommit: commits[0]?.commit?.message || '',
      visibility: repo.private ? 'private' : 'public',
      url: repo.private ? null : repo.html_url
    };
  } catch (error) {
    if (previous.projects?.[item.repo]) projects[item.repo] = previous.projects[item.repo];
    else console.warn(`Skipping ${item.repo}: ${error.message}`);
  }
}

const payload = { generatedAt: new Date().toISOString(), methodology: 'Progress equals completed configured repository milestones.', projects };
await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

const rows = config.projects.map(item => {
  const data = projects[item.repo];
  if (!data) return `| ${item.label} | Status unavailable | — | — |`;
  const status = statusLabels[data.status] || data.status.toLowerCase().replaceAll('_', ' ').replace(/^./, c => c.toUpperCase());
  return `| ${item.label} | ${status} | ${data.progress}% | ${displayDate(data.updatedAt)} |`;
}).join('\n');
const readme = await fs.readFile('README.md', 'utf8');
const block = `<!-- PROJECT_STATUS:START -->\n| Project | Status | Progress | Last repository update |\n|:--|:--|--:|:--|\n${rows}\n<!-- PROJECT_STATUS:END -->`;
const updated = readme.replace(/<!-- PROJECT_STATUS:START -->[\s\S]*?<!-- PROJECT_STATUS:END -->/, block);
await fs.writeFile('README.md', updated);
