# Blujay Bootstrap

Public, non-secret bootstrap scripts for new Blujay fleet Macs.

These scripts are intentionally minimal. They should only do enough to make a
new Mac reachable over SSH so heavier private setup can happen from an admin
machine or private repo.

## Mac Mini Bootstrap

Run on a new fleet Mac after macOS is installed, Remote Login is enabled, and
Tailscale is installed/signed in:

```bash
/bin/bash -c "$(curl -fsSL https://setup.blujay.io/mini)"
```

The script:

- installs the Blujay admin SSH public key;
- fixes SSH file permissions;
- creates a temporary passwordless sudo handoff for the current setup session;
- applies the Tailscale operator persistence command when Tailscale is present;
- prints hostname, macOS version, username, and Tailscale IP.

No secrets, tokens, passwords, or private deploy keys belong in this repo.

Remove the temporary sudo handoff after setup:

```bash
sudo rm /etc/sudoers.d/blujay-bootstrap
```
