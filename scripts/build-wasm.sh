#!/usr/bin/env bash
# Builds the Rust WebAssembly modules into public/wasm.
# Needs: rustup target add wasm32-unknown-unknown
set -euo pipefail
cd "$(dirname "$0")/../rust"
mkdir -p ../public/wasm
for crate in boids signature; do
  (cd "$crate" && cargo build --release --target wasm32-unknown-unknown)
  cp "$crate/target/wasm32-unknown-unknown/release/$crate.wasm" "../public/wasm/$crate.wasm"
  ls -l "../public/wasm/$crate.wasm"
done
