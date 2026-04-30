const MINI_SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

ADMIN_KEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHun6XDSd2LoKiac3pXRSdpTlvx7Fyfk1yz5azM1sNmm jakestewart@MacBook-Pro.local'

log() {
  printf '[blujay-bootstrap] %s\\n' "$*"
}

find_tailscale() {
  if command -v tailscale >/dev/null 2>&1; then
    command -v tailscale
    return 0
  fi

  if [[ -x /Applications/Tailscale.app/Contents/MacOS/Tailscale ]]; then
    printf '%s\\n' /Applications/Tailscale.app/Contents/MacOS/Tailscale
    return 0
  fi

  return 1
}

log "Installing Blujay admin SSH key for user: \${USER}"
install -d -m 700 "\${HOME}/.ssh"
touch "\${HOME}/.ssh/authorized_keys"
chmod 600 "\${HOME}/.ssh/authorized_keys"

if ! grep -qxF "\${ADMIN_KEY}" "\${HOME}/.ssh/authorized_keys"; then
  printf '%s\\n' "\${ADMIN_KEY}" >> "\${HOME}/.ssh/authorized_keys"
  log "Added admin SSH key."
else
  log "Admin SSH key already present."
fi

chmod 700 "\${HOME}/.ssh"
chmod 600 "\${HOME}/.ssh/authorized_keys"

log "Creating temporary passwordless sudo handoff for setup."
log "This will ask for the local admin password once."
printf '%s ALL=(ALL) NOPASSWD: ALL\\n' "\${USER}" | sudo tee /etc/sudoers.d/blujay-bootstrap >/dev/null
sudo chmod 440 /etc/sudoers.d/blujay-bootstrap
sudo visudo -cf /etc/sudoers.d/blujay-bootstrap >/dev/null
log "Temporary sudoers handoff installed at /etc/sudoers.d/blujay-bootstrap."
log "Codex/admin should remove it after setup: sudo rm /etc/sudoers.d/blujay-bootstrap"

if TS_BIN="$(find_tailscale)"; then
  log "Found Tailscale at: \${TS_BIN}"
  log "Applying Tailscale operator persistence for user: \${USER}"
  sudo "\${TS_BIN}" set --operator="\${USER}"
  sudo "\${TS_BIN}" up --operator="\${USER}" --reset
else
  log "Tailscale binary not found. Install/sign into Tailscale, then rerun this script."
fi

TAILSCALE_IP=""
if [[ -n "\${TS_BIN:-}" ]]; then
  TAILSCALE_IP="$("\${TS_BIN}" ip -4 2>/dev/null | head -n 1 || true)"
fi

log "Summary"
printf 'username=%s\\n' "\${USER}"
printf 'hostname=%s\\n' "$(hostname)"
sw_vers
if [[ -n "\${TAILSCALE_IP}" ]]; then
  printf 'tailscale_ip=%s\\n' "\${TAILSCALE_IP}"
else
  printf 'tailscale_ip=<not detected>\\n'
fi

log "Done. Give Codex: username, hostname, macOS version, and tailscale_ip."
`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/mini") {
      return new Response("Not found\n", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    return new Response(MINI_SCRIPT, {
      status: 200,
      headers: {
        "content-type": "text/x-shellscript; charset=utf-8",
        "cache-control": "public, max-age=60",
      },
    });
  },
};
