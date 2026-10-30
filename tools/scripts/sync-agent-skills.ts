/**
 * Vendors Matt Pocock's agent skills (github.com/mattpocock/skills) into .claude/skills/.
 *
 * The upstream Claude Code plugin updates itself, but a cloud session never installs the plugins a
 * repository enables; skills committed under .claude/skills/ reach every session, local or cloud.
 * This script is their update path, and the weekly `Agent skills` workflow runs it:
 *  - it takes the newest `vX.Y.Z` release tagged at least a week ago, the cooldown Dependabot
 *    applies to every other dependency, and never one older than the locked release (`--tag`
 *    picks one by hand, older or newer);
 *  - it copies the skills that release's plugin manifest lists, replacing ours whole, and removes
 *    the ones it no longer lists;
 *  - .claude/skills.lock.json records the release and the folders it owns. A skill of our own
 *    beside them is never touched, and one that collides with an upstream name fails the run.
 *
 * Edit a vendored skill and the next sync reverts it: adapt a skill through the files it reads
 * (docs/agents/), or copy it under a new name.
 *
 * Run: bun run skills:sync [--tag vX.Y.Z]
 */
import { $ } from 'bun';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const SKILLS_DIR = join(ROOT, '.claude', 'skills');
const LOCK_FILE = join(ROOT, '.claude', 'skills.lock.json');
const REPOSITORY = 'https://github.com/mattpocock/skills.git';
const COOLDOWN_DAYS = 7;
const RELEASE = /^v\d+\.\d+\.\d+$/;
const SKILL_NAME = /^[a-z0-9][a-z0-9-]*$/;

interface Lock {
  repository: string;
  tag: string;
  commit: string;
  skills: string[];
}

function usage(): never {
  console.error('Usage: bun tools/scripts/sync-agent-skills.ts [--tag vX.Y.Z]');
  process.exit(2);
}

const args = process.argv.slice(2);
const pinned = args[0] === '--tag' ? args[1] : undefined;
if (args.length > 0 && (!pinned || !RELEASE.test(pinned) || args.length > 2)) usage();

const previous: Lock | undefined = existsSync(LOCK_FILE)
  ? (JSON.parse(readFileSync(LOCK_FILE, 'utf8')) as Lock)
  : undefined;

// Trees only: the blobs of the one release we check out are fetched on demand.
const clone = mkdtempSync(join(tmpdir(), 'agent-skills-'));
try {
  await $`git clone --quiet --filter=blob:none --no-checkout ${REPOSITORY} ${clone}`;

  const refs =
    await $`git -C ${clone} for-each-ref --format=${'%(refname:short) %(creatordate:unix)'} refs/tags`.text();
  const cutoff = Date.now() / 1000 - COOLDOWN_DAYS * 86_400;
  const releases = refs
    .trim()
    .split('\n')
    .map((line) => line.split(' '))
    .filter(([tag]) => tag !== undefined && RELEASE.test(tag))
    .map(([tag, created]) => ({ tag: tag as string, created: Number(created) }))
    .sort((a, b) => Bun.semver.order(b.tag.slice(1), a.tag.slice(1)));

  // A release picked by hand may still be in its cooldown: the scheduled run never moves back.
  const release = pinned
    ? releases.find(({ tag }) => tag === pinned)
    : releases.find(
        ({ tag, created }) =>
          created <= cutoff ||
          (previous !== undefined && Bun.semver.order(tag.slice(1), previous.tag.slice(1)) <= 0),
      );
  if (!release) {
    console.error(
      pinned
        ? `✘ ${pinned} is not a release of ${REPOSITORY}`
        : `✘ no release of ${REPOSITORY} is older than ${COOLDOWN_DAYS} days`,
    );
    process.exit(1);
  }

  await $`git -C ${clone} -c advice.detachedHead=false checkout --quiet ${release.tag}`;
  const commit = (await $`git -C ${clone} rev-parse HEAD`.text()).trim();

  const manifest = JSON.parse(
    readFileSync(join(clone, '.claude-plugin', 'plugin.json'), 'utf8'),
  ) as { skills?: string[] };
  const sources = (manifest.skills ?? []).map((path) => join(clone, path));
  const skills = sources.map((source) => basename(source));

  const invalid = skills.filter((name) => !SKILL_NAME.test(name));
  if (skills.length === 0 || invalid.length > 0) {
    console.error(`✘ ${release.tag} lists no usable skills (${invalid.join(', ') || 'none'})`);
    process.exit(1);
  }
  const owned = new Set(previous?.skills ?? []);
  const collisions = skills.filter(
    (name) => !owned.has(name) && existsSync(join(SKILLS_DIR, name)),
  );
  if (collisions.length > 0) {
    console.error(
      `✘ .claude/skills/ already holds a skill of our own named ${collisions.join(', ')}: rename it`,
    );
    process.exit(1);
  }

  const removed = [...owned].filter((name) => !skills.includes(name));
  for (const name of [...owned, ...skills]) {
    rmSync(join(SKILLS_DIR, name), { recursive: true, force: true });
  }
  for (const [index, source] of sources.entries()) {
    if (!existsSync(join(source, 'SKILL.md'))) {
      console.error(`✘ ${manifest.skills?.[index]} in ${release.tag} has no SKILL.md`);
      process.exit(1);
    }
    cpSync(source, join(SKILLS_DIR, skills[index] as string), { recursive: true });
  }

  const lock: Lock = { repository: REPOSITORY, tag: release.tag, commit, skills: skills.sort() };
  writeFileSync(LOCK_FILE, `${JSON.stringify(lock, null, 2)}\n`);

  const from = previous ? `${previous.tag} → ` : '';
  console.log(`✔ ${skills.length} skills at ${from}${release.tag} (${commit.slice(0, 7)})`);
  if (removed.length > 0) console.log(`  removed: ${removed.join(', ')}`);
} finally {
  rmSync(clone, { recursive: true, force: true });
}
