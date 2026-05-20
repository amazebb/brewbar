# Homebrew Packages

This document organizes all packages from the Brewfile by category.

## Contents

- [Taps (Repositories)](#taps-repositories)
- [Formulas](#formulas)
  - [Shells & Terminal](#shells--terminal)
  - [Version Control](#version-control)
  - [Programming Languages & Runtimes](#programming-languages--runtimes)
  - [Language Servers & IDE Support](#language-servers--ide-support)
  - [Build Systems & Compilers](#build-systems--compilers)
  - [Code Quality & Linting](#code-quality--linting)
  - [Media Processing](#media-processing)
  - [Document & Text Processing](#document--text-processing)
  - [Data Processing & Analysis](#data-processing--analysis)
  - [File & Archive Tools](#file--archive-tools)
  - [Metadata & File Information](#metadata--file-information)
  - [Network Tools](#network-tools)
  - [Search & Text Processing](#search--text-processing)
  - [System Utilities](#system-utilities)
  - [Python Tools](#python-tools)
  - [Lua Ecosystem](#lua-ecosystem)
  - [Development Libraries](#development-libraries)
  - [Reverse Engineering](#reverse-engineering)
  - [Hardware & Embedded](#hardware--embedded)
  - [Miscellaneous / Uncategorized](#miscellaneous--uncategorized)
- [Casks (GUI Applications)](#casks-gui-applications)
  - [Media Players & Editors](#media-players--editors)
  - [E-book & Media Management](#e-book--media-management)
  - [Audio Utilities](#audio-utilities)
  - [Development Tools](#development-tools)
  - [System Utilities (Casks)](#system-utilities-casks)
  - [Quick Look Plugins](#quick-look-plugins)
  - [Fonts](#fonts)
  - [Virtualization](#virtualization)

---

## Taps (Repositories)

<details>
<summary>5 taps</summary>

| Tap | Description |
|-----|-------------|
| `alhadis/troff` | Troff-related tools |
| `homebrew/bundle` | Bundler for Homebrew |
| `homebrew/services` | Manage background services |
| `martido/graph` | Graph-related tools |
| `oven-sh/bun` | Bun JavaScript runtime |

</details>

---

## Formulas

### Shells & Terminal

<details>
<summary>10 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `bash` | Bourne-Again SHell | `fish`, `nushell` |
| `bat` | Cat clone with syntax highlighting | |
| `btop` | Resource monitor | |
| `coreutils` | GNU core utilities | `uutils-coreutils` |
| `eza` | Modern replacement for ls | |
| `fd` | Simple, fast alternative to find | |
| `fzf` | Fuzzy finder | `skim` |
| `tmux` | Terminal multiplexer | `zellij` |
| `tree` | Directory listing as a tree | `broot` |
| `zoxide` | Smarter cd command | |

</details>

### Version Control

<details>
<summary>7 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `gh` | GitHub CLI | |
| `git` | Distributed version control | `jj` |
| `git-filter-repo` | Rewrite git history | |
| `git-lfs` | Git Large File Storage | |
| `git-svn` | Bidirectional Git/SVN bridge | |
| `gitea` | Self-hosted Git service | `forgejo` |
| `gitea-mcp-server` | MCP server for Gitea | |

</details>

### Programming Languages & Runtimes

<details>
<summary>6 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `chapel` | Parallel programming language | |
| `fennel` | Lisp dialect for Lua | |
| `lua` | Scripting language | `luajit` |
| `node` | JavaScript runtime | `deno` |
| `oven-sh/bun/bun` | Fast JavaScript runtime | |
| `perl` | Practical extraction and report language | |

</details>

### Language Servers & IDE Support

<details>
<summary>10 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `basedpyright` | Python type checker | |
| `bash-language-server` | LSP for Bash | |
| `fennel-ls` | LSP for Fennel | |
| `gopls` | LSP for Go | |
| `jdtls` | LSP for Java | |
| `lua-language-server` | LSP for Lua | |
| `sql-language-server` | LSP for SQL | |
| `typescript-language-server` | LSP for TypeScript/JavaScript | |
| `vscode-langservers-extracted` | HTML/CSS/JSON/ESLint LSPs | |
| `yaml-language-server` | LSP for YAML | |

</details>

### Build Systems & Compilers

<details>
<summary>7 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `cmake` | Cross-platform build system | `meson` |
| `cmake-docs` | CMake documentation | |
| `gradle` | Build automation for Java | |
| `llvm` | Compiler infrastructure | |
| `make` | GNU make | `just` |
| `ninja` | Small build system | |
| `pkgconf` | Package compiler and linker metadata | |

</details>

### Code Quality & Linting

<details>
<summary>4 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `ruff` | Fast Python linter/formatter | |
| `shellcheck` | Shell script analysis tool | |
| `shfmt` | Shell script formatter | |
| `swiftlint` | Swift style and conventions | |

</details>

### Media Processing

<details>
<summary>14 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `chafa` | Image to terminal graphics | |
| `ffmpeg` | Audio/video transcoding | |
| `fluid-synth` | Software MIDI synthesizer | |
| `gmic` | Image processing framework | |
| `graphicsmagick` | Image processing tools | `vips` |
| `imagemagick` | Image manipulation tools | `vips` |
| `libcaca` | ASCII art graphics library | |
| `libheif` | HEIF/HEIC image format | |
| `little-cms2` | Color management system | |
| `mpv` | Media player | |
| `openjpeg` | JPEG 2000 codec | |
| `portmidi` | MIDI I/O library | |
| `sdl2` | Multimedia library | `sdl3` |
| `sox` | Sound processing tool | |
| `yt-dlp` | Video downloader | |

</details>

### Document & Text Processing

<details>
<summary>6 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `djvulibre` | DjVu document format | |
| `epubcheck` | EPUB validator | |
| `pandoc` | Universal document converter | `typst` |
| `qpdf` | PDF transformation tool | |
| `texinfo` | GNU documentation system | |
| `utftex` | Unicode TeX rendering | |

</details>

### Data Processing & Analysis

<details>
<summary>8 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `cjson` | JSON parser in C | |
| `duckdb` | Analytical SQL database | |
| `jq` | JSON processor | `jaq` |
| `json-glib` | JSON parser for GLib | |
| `qsv` | CSV data wrangling toolkit | |
| `tidy-viewer` | CSV pretty printer | `csvlens` |
| `visidata` | Terminal data exploration | |
| `xan` | CSV toolkit | |

</details>

### File & Archive Tools

<details>
<summary>7 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `atool` | Archive file manager | |
| `cabextract` | Microsoft cabinet extractor | |
| `cdrtools` | CD/DVD/Blu-ray tools | |
| `libdvdcss` | DVD decryption library | |
| `librsync` | Remote delta algorithm library | |
| `p7zip` | 7-Zip file archiver | `sevenzip` |
| `rsync` | Fast file synchronization | |

</details>

### Metadata & File Information

<details>
<summary>3 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `exiftool` | Read/write file metadata | |
| `exiv2` | Image metadata library | |
| `media-info` | Media file information | |

</details>

### Network Tools

<details>
<summary>3 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `curl` | Data transfer tool | |
| `sniffnet` | Network traffic monitor | |
| `wget` | File retrieval tool | `aria2` |

</details>

### Search & Text Processing

<details>
<summary>4 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `gawk` | GNU awk | |
| `gnu-sed` | GNU stream editor | `sd` |
| `mawk` | Fast awk implementation | |
| `ripgrep` | Fast recursive grep | |

</details>

### System Utilities

<details>
<summary>7 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `gperftools` | Performance analysis tools | |
| `hyperfine` | Command-line benchmarking | |
| `mac-cleanup-go` | macOS cleanup utility | |
| `mactop` | macOS system monitor | |
| `parallel` | Execute jobs in parallel | |
| `smartmontools` | Disk health monitoring | |
| `tldr` | Simplified man pages | `tealdeer` |

</details>

### Python Tools

<details>
<summary>3 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `ipython` | Interactive Python shell | `ptpython` |
| `pygments` | Syntax highlighting | |
| `uv` | Fast Python package installer | |

</details>

### Lua Ecosystem

<details>
<summary>1 formula</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `luarocks` | Lua package manager | |

</details>

### Development Libraries

<details>
<summary>7 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `gettext` | Internationalization library | |
| `graphviz` | Graph visualization | |
| `gsl` | GNU Scientific Library | |
| `libcerf` | Complex error functions | |
| `libomp` | OpenMP runtime | |
| `qt@5` | Cross-platform UI framework | `qt` |
| `tree-sitter-cli` | Parser generator tool | |

</details>

### Reverse Engineering

<details>
<summary>1 formula</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `rizin` | Reverse engineering framework | `radare2` |

</details>

### Hardware & Embedded

<details>
<summary>1 formula</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `arduino-cli` | Arduino command-line tool | |

</details>

### Miscellaneous / Uncategorized

<details>
<summary>2 formulas</summary>

| Formula | Description | Alternatives |
|---------|-------------|--------------|
| `iso-codes` | ISO language/country codes | |
| `pastel` | Color manipulation CLI | |

</details>

---

## Casks (GUI Applications)

### Media Players & Editors

<details>
<summary>4 casks</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `audacity` | Audio editor | `ocenaudio` |
| `blender` | 3D creation suite | |
| `iina` | Modern media player | |
| `makemkv` | DVD/Blu-ray ripper | `handbrake` |

</details>

### E-book & Media Management

<details>
<summary>2 casks</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `calibre` | E-book manager | |
| `kid3` | Audio file tag editor | |

</details>

### Audio Utilities

<details>
<summary>2 casks</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `blackhole-16ch` | Virtual audio driver (16 channel) | |
| `blackhole-2ch` | Virtual audio driver (2 channel) | |

</details>

### Development Tools

<details>
<summary>5 casks</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `basictex` | Minimal TeX distribution | |
| `dbeaver-community` | Database management tool | `tableplus` |
| `gitup-app` | Git GUI client | `fork` |
| `jdk-mission-control` | JVM monitoring and profiling | |
| `kitty` | GPU-accelerated terminal | `ghostty`, `wezterm` |

</details>

### System Utilities (Casks)

<details>
<summary>6 casks</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `appcleaner` | Application uninstaller | `pearcleaner` |
| `disk-inventory-x` | Disk usage visualizer | `grandperspective` |
| `grandperspective` | Disk usage analyzer | |
| `keka` | File archiver | |
| `stats` | System monitor in menu bar | |
| `suspicious-package` | Package inspector | |

</details>

### Quick Look Plugins

<details>
<summary>2 casks</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `qlmarkdown` | Preview Markdown files | |
| `syntax-highlight` | Preview source code files | |

</details>

### Fonts

<details>
<summary>2 casks</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `font-fira-mono-nerd-font` | Fira Mono with Nerd Font icons | |
| `font-symbols-only-nerd-font` | Nerd Font symbols only | |

</details>

### Virtualization

<details>
<summary>1 cask</summary>

| Cask | Description | Alternatives |
|------|-------------|--------------|
| `utm` | Virtual machines for macOS | |

</details>

---

## All Packages

> **Note:** The dropdown filters below require JavaScript. They work when viewing this file locally in a browser or in markdown renderers that allow scripts. On GitHub, the table renders without filtering.
>
> **[View interactive version with filtering](docs/packages.html)** (via GitHub Pages)

