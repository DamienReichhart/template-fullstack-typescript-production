import { spawn } from 'node:child_process';

/** How much of a failed command's stderr ends up in its error: the end, where ffmpeg says why. */
const STDERR_TAIL_BYTES = 4096;

/** The command ran and failed; `stderr` holds the end of what it said. */
export class ProcessExitError extends Error {
  constructor(
    readonly command: string,
    readonly exit: number | string,
    readonly stderr: string,
  ) {
    super(`${command} exited with ${exit}: ${stderr}`);
    this.name = 'ProcessExitError';
  }
}

/**
 * Runs `command` to completion and resolves with its stdout. Rejects with `ProcessExitError`
 * when it fails, or with the spawn error when it cannot start (a missing binary).
 */
export function runProcess(command: string, args: readonly string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout: Buffer[] = [];
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = (stderr + chunk.toString()).slice(-STDERR_TAIL_BYTES);
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve(Buffer.concat(stdout).toString());
      else reject(new ProcessExitError(command, signal ?? code ?? 'unknown', stderr.trim()));
    });
  });
}
