import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useVault } from '../state/VaultContext';
import { CoinLogo } from './CoinLogo';
import { PassphraseInput } from './components';

/**
 * Passphrase gate shown whenever the vault is locked. Doubles as first-run setup
 * (create a passphrase) and subsequent unlocks.
 */
export function LockScreen() {
  const {
    initialized,
    busy,
    error,
    initialize,
    unlock,
    backToLanding,
    data,
    installed,
    biometricEnabled,
    unlockBiometric,
  } = useVault();
  const pwId = useId();
  const confirmId = useId();
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const creating = !initialized;

  // Installed app + biometrics set up → prompt Face ID / fingerprint straight
  // away (once), so unlocking is one tap. Silent if the platform blocks the
  // auto-attempt (needs a gesture) — the button below still works.
  const autoTried = useRef(false);
  useEffect(() => {
    if (autoTried.current || !installed || creating || !biometricEnabled) return;
    autoTried.current = true;
    void unlockBiometric({ silent: true });
  }, [installed, creating, biometricEnabled, unlockBiometric]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (creating) {
      if (passphrase.length < 10) {
        setLocalError('Use at least 10 characters — a few random words works well.');
        return;
      }
      if (passphrase !== confirm) {
        setLocalError('Passphrases do not match.');
        return;
      }
      await initialize(passphrase);
    } else {
      await unlock(passphrase);
    }
  }

  const shownError = localError ?? error;
  const longEnough = passphrase.length >= 10;

  return (
    <main className="weave-bg flex min-h-dvh items-center justify-center p-6 text-ink">
      <form
        onSubmit={onSubmit}
        className="silk-panel kain-edge animate-fade-up w-full max-w-sm rounded-2xl p-7"
        aria-labelledby="lock-title"
      >
        <button
          type="button"
          onClick={backToLanding}
          className="mb-3 text-sm text-ink-faint transition hover:text-gold"
        >
          ← Back
        </button>
        <div className="mb-4 flex justify-center">
          <CoinLogo size={64} detail="full" />
        </div>
        <h1 id="lock-title" className="font-display text-2xl font-semibold tracking-tight">
          {creating ? 'Create your passphrase' : 'Unlock Finance Guru'}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {creating
            ? 'Your data is encrypted on this device with this passphrase. There is no recovery if you lose it.'
            : 'Enter your passphrase to decrypt your data.'}
        </p>
        {creating && data && (data.pay.grossSen > 0 || data.fixedCosts.length > 0) && (
          <p className="mt-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary">
            Your current entries will be encrypted and saved.
          </p>
        )}

        {!creating && biometricEnabled && (
          <>
            <button
              type="button"
              onClick={() => void unlockBiometric()}
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/20 disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 11c-1.1 0-2 .9-2 2v1m0 3v.5M7.5 4.7a8 8 0 0 1 9 0M5 8a10.5 10.5 0 0 1 14 0M8.5 11.2a5 5 0 0 1 7 0M12 14v3.5" />
              </svg>
              Unlock with Face ID / fingerprint
            </button>
            <div className="my-4 flex items-center gap-3 text-[11px] text-ink-faint">
              <span className="h-px flex-1 bg-line" />
              or use your passphrase
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        <div className={creating || !biometricEnabled ? 'mt-5' : ''}>
          <label htmlFor={pwId} className="mb-1 block text-sm font-medium text-ink-soft">
            Passphrase
          </label>
          <PassphraseInput
            id={pwId}
            autoComplete={creating ? 'new-password' : 'current-password'}
            autoFocus={creating || !biometricEnabled}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            required
          />
          {creating && (
            <p className={`mt-1 text-xs ${longEnough ? 'text-positive' : 'text-ink-faint'}`} aria-live="polite">
              {longEnough
                ? '✓ Long enough'
                : `At least 10 characters — ${10 - passphrase.length} to go. A few random words works well.`}
            </p>
          )}
        </div>

        {creating && (
          <div className="mt-3">
            <label htmlFor={confirmId} className="mb-1 block text-sm font-medium text-ink-soft">
              Confirm passphrase
            </label>
            <PassphraseInput
              id={confirmId}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm.length > 0 && (
              <p
                className={`mt-1 text-xs ${confirm === passphrase ? 'text-positive' : 'text-ink-faint'}`}
                aria-live="polite"
              >
                {confirm === passphrase ? '✓ Passphrases match' : 'Passphrases don’t match yet'}
              </p>
            )}
          </div>
        )}

        {shownError && (
          <p role="alert" className="mt-3 text-sm text-negative">
            {shownError}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-60"
        >
          {busy ? 'Working…' : creating ? 'Create & unlock' : 'Unlock'}
        </button>

        <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
          Estimates only — not financial or tax advice. Data stays on this device; nothing is sent
          anywhere.
        </p>
      </form>
    </main>
  );
}
