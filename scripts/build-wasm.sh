#!/usr/bin/env bash
# Builds the Rust WebAssembly modules into public/wasm.
# Needs: rustup target add wasm32-unknown-unknown
set -euo pipefail
cd "$(dirname "$0")/../rust/boids"
cargo build --release --target wasm32-unknown-unknown
mkdir -p ../../public/wasm
cp target/wasm32-unknown-unknown/release/boids.wasm ../../public/wasm/boids.wasm
ls -l ../../public/wasm/boids.wasm
