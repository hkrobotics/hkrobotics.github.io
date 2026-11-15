---
title: Steal my zsh config
summary: The shell setup I use every day — fzf, zoxide, bat, eza, delta and Ghostty — with every line explained, so you can copy just the parts you want.
date: 2026-11-15
tags: zsh, terminal, macos, dotfiles
---

A few weeks ago I ran an `rm -rf` in the wrong place and lost most of my home folder. My shell came back in about five minutes, because it lived in a dotfiles repo and not only in `~`.

So here it is: the whole setup, section by section, with a note on why each line is there. Take what you like. Everything is for macOS with Homebrew, but most of it works on Linux too.

## What you get

- **Fuzzy everything.** <kbd>Ctrl</kbd>+<kbd>T</kbd> finds files, <kbd>Ctrl</kbd>+<kbd>R</kbd> searches history, <kbd>⌥</kbd>+<kbd>C</kbd> jumps into folders, all with live previews.
- **A `cd` that learns.** Type `cd proj` and land in `~/Projects`, from anywhere.
- **Better defaults.** `ls`, `cat`, `grep` and `find` swapped for faster, nicer tools.
- **Readable git diffs**, side by side with syntax highlighting.
- **One theme everywhere.** Tokyo Night in the terminal, `bat`, and the previews.

## Install the tools

Everything comes from Homebrew. Put this in a `Brewfile` and run `brew bundle`:

```ruby title="Brewfile"
brew "bat"                      # cat with syntax highlighting
brew "btop"                     # a nicer top
brew "eza"                      # ls with icons, git status and trees
brew "fd"                       # fast find
brew "fzf"                      # fuzzy finder
brew "git-delta"                # pretty git diffs
brew "ripgrep"                  # fast grep
brew "tlrc"                     # tldr: man pages with examples
brew "zoxide"                   # cd that remembers
brew "zsh-autosuggestions"
brew "zsh-syntax-highlighting"
cask "ghostty"
```

Then two things Homebrew doesn't cover, oh-my-zsh and fzf-git:

```zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone https://github.com/junegunn/fzf-git.sh.git ~/fzf-git.sh
```

## The base

```zsh title=".zprofile"
eval "$(/opt/homebrew/bin/brew shellenv)"
```

This goes in `.zprofile`, not `.zshrc`, so login shells get Homebrew's `PATH` once. It also sets `$HOMEBREW_PREFIX`, which the plugin lines further down rely on.

```zsh title=".zshrc"
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="robbyrussell"
plugins=(git)
source $ZSH/oh-my-zsh.sh

export LANG=en_US.UTF-8
```

I keep oh-my-zsh deliberately thin: the default theme and the `git` plugin, for aliases like `gst` and `gco`. Every extra plugin costs startup time, so the rest of the setup uses standalone tools instead.

`LANG` matters more than it looks. CocoaPods errors out without a UTF-8 locale, which you'll hit quickly if you build iOS apps.

## Navigation: zoxide

```zsh title=".zshrc"
eval "$(zoxide init zsh)"

alias cd="z"
alias ci="zi"
alias ..="cd .."
alias ...="cd ../.."
```

zoxide remembers the folders you visit and ranks them by how often and how recently you went there. After a day, `cd portfolio` takes you to `~/Projects/my-portfolio` from anywhere. Normal paths still work, so aliasing `cd` to `z` costs nothing.

`ci` opens the same list in fzf when you don't remember the name.

## Fuzzy finding: fzf

This is the part I'd keep if I could only keep one.

```zsh title=".zshrc"
# Use fd instead of find: faster, respects .gitignore, shows dotfiles
export FZF_DEFAULT_COMMAND="fd --hidden --strip-cwd-prefix --exclude .git"
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_ALT_C_COMMAND="fd --type=d --hidden --strip-cwd-prefix --exclude .git"

# Previews: file contents for Ctrl-T, a folder tree for Alt-C
export FZF_CTRL_T_OPTS="--preview 'bat -n --color=always --line-range :500 {}'"
export FZF_ALT_C_OPTS="--preview 'eza --tree --color=always {} | head -200'"

source <(fzf --zsh)
```

That gives you three shortcuts:

| Key | What it does |
|---|---|
| <kbd>Ctrl</kbd>+<kbd>T</kbd> | Pick a file and paste its path into the command you're typing |
| <kbd>Ctrl</kbd>+<kbd>R</kbd> | Search your shell history |
| <kbd>⌥</kbd>+<kbd>C</kbd> | Pick a folder and `cd` into it |

<kbd>⌥</kbd>+<kbd>C</kbd> types `ç` on a Mac unless your terminal treats Option as Alt. The Ghostty section below fixes that.

fzf also hooks into tab completion. Type `**` and press <kbd>Tab</kbd>:

```zsh title=".zshrc"
_fzf_compgen_path() { fd --hidden --follow --exclude ".git" . "$1"; }
_fzf_compgen_dir()  { fd --type d --hidden --follow --exclude ".git" . "$1"; }

# A different preview depending on the command
_fzf_comprun() {
  local command=$1
  shift
  case "$command" in
    cd)           fzf --preview 'eza --tree --color=always {} | head -200' "$@" ;;
    export|unset) fzf --preview "eval 'echo \$'{}" "$@" ;;
    ssh)          fzf --preview 'dig {}' "$@" ;;
    *)            fzf --preview 'bat -n --color=always --line-range :500 {}' "$@" ;;
  esac
}
```

Now `cd **<Tab>` shows folder trees, `export **<Tab>` shows each variable's value, `ssh **<Tab>` resolves the host, and anything else (`vim **<Tab>`) previews the file.

Last, [fzf-git](https://github.com/junegunn/fzf-git.sh) adds pickers for branches, commits, tags and changed files. <kbd>Ctrl</kbd>+<kbd>G</kbd> then <kbd>Ctrl</kbd>+<kbd>B</kbd> lists branches, for example:

```zsh title=".zshrc"
source ~/fzf-git.sh/fzf-git.sh
```

## Better defaults

```zsh title=".zshrc"
# eza
alias ls="eza --grid --color=auto --icons=auto --group-directories-first"
alias ll="eza -l --header --git --octal-permissions"
alias la="eza -l --all --header --git --group-directories-first"
alias lt="eza --tree --long --git --level=2"
alias l1="eza -1 --color=auto"

# swaps
alias cat="bat"
alias grep="rg"
alias find="fd"
alias htop="btop"

# small things
alias c="clear"
alias gshort="git shortlog -s -n | bat"   # commits per author

mkcd() { mkdir -p "$1" && cd "$1"; }
```

`ll` and `la` show each file's git status next to it, which I use more than I expected. `lt` is a two-level tree, handy for a first look at an unfamiliar repo.

A warning about the swaps: `rg` and `fd` don't take the same flags as `grep` and `find`. Aliases only apply in your interactive shell, so scripts are safe, but commands pasted from Stack Overflow can surprise you. Run `command grep` or `\grep` when you need the real one.

## Syntax highlighting with bat

`bat` and the fzf previews use Tokyo Night. bat doesn't ship that theme, so download it and rebuild bat's cache:

```zsh
mkdir -p "$(bat --config-dir)/themes"
curl -fL -o "$(bat --config-dir)/themes/tokyonight_night.tmTheme" \
  https://raw.githubusercontent.com/folke/tokyonight.nvim/main/extras/sublime/tokyonight_night.tmTheme
bat cache --build
```

```zsh title=".zshrc"
export BAT_THEME="tokyonight_night"
```

Keep the theme file in your dotfiles repo as well. bat only reads its compiled cache, so if you lose the file, nothing changes until the next `bat cache --build`. Then the theme quietly falls back to the default.

## History

oh-my-zsh already sets sensible history defaults: a 50,000-line history, `share_history` across tabs, `hist_verify`, and skipping commands that start with a space. I only add de-duplication on top:

```zsh title=".zshrc"
HISTFILE="$HOME/.zhistory"

setopt hist_ignore_all_dups   # re-running a command removes its older copy
setopt hist_save_no_dups      # don't write duplicates to the file
setopt hist_find_no_dups      # Ctrl-R and up-arrow skip duplicates
setopt hist_reduce_blanks     # tidy extra spaces
```

With these, <kbd>Ctrl</kbd>+<kbd>R</kbd> shows each command once, at its most recent position, so finding the command from yesterday doesn't mean scrolling past it ten times.

If you also set `HISTSIZE` or `SAVEHIST`, do it in a way that doesn't lower oh-my-zsh's numbers. A line like `HISTSIZE=5000` after oh-my-zsh loads quietly shrinks your history to a tenth.

The oh-my-zsh default I like most is `hist_verify`. `sudo !!` shows you the expanded command first, so you can check it before pressing <kbd>Enter</kbd>.

## Plugins go last

```zsh title=".zshrc"
source $HOMEBREW_PREFIX/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source $HOMEBREW_PREFIX/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

Autosuggestions show the rest of a command from your history in grey; <kbd>→</kbd> accepts it. Syntax highlighting turns a command red before you run it if it doesn't exist.

Order matters here: zsh-syntax-highlighting has to be sourced at the very end of `.zshrc`, after anything else that changes the line editor.

## React Native extras

If you build Android apps, React Native needs JDK 17 and the Android SDK on your `PATH`:

```zsh title=".zshrc"
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

alias studio='open -a "Android Studio"'
```

The JDK comes from `brew install --cask zulu@17`, which is the one the React Native docs recommend.

## The terminal: Ghostty

```ini title="~/.config/ghostty/config"
theme = TokyoNight
font-family = "JetBrains Mono"
font-size = 16
window-padding-x = 12
window-padding-y = 12
background-opacity = 0.96
background-blur = 1
shell-integration-features = sudo,ssh-env

# Left Option acts as Alt (for fzf's Alt-C); right Option still types ç, € and friends
macos-option-as-alt = left
```

Ghostty is fast and native, and its defaults are good enough that this is the whole file. Three of these lines do real work:

- **`macos-option-as-alt = left`** makes <kbd>⌥</kbd>+<kbd>C</kbd> work. Using only the left key keeps the right one free for typing special characters.
- **JetBrains Mono ships inside Ghostty**, along with Nerd Font icons, so eza's file icons work without installing a patched font. If you pick another font, check its exact name with `ghostty +list-fonts`. Ghostty quietly falls back to its built-in font when it can't find yours.
- **`ssh-env`** reports a standard terminal type over SSH, so servers that have never heard of Ghostty don't break `clear` or `htop`.

## Git diffs: delta

```ini title="~/.gitconfig"
[core]
    pager = delta

[interactive]
    diffFilter = delta --color-only

[delta]
    navigate = true      # n / N jump between diff sections
    side-by-side = true

[merge]
    conflictstyle = diff3

[diff]
    colorMoved = default
```

`git diff`, `git show` and `git log -p` all become side-by-side and syntax-highlighted. `diff3` adds the original version to merge conflicts, so you can see what both sides changed, not just where they ended up.

## Keep it in a repo

This is the lesson from that `rm -rf`. Keep these files in a git repo and symlink them into `~`:

```zsh
~/dotfiles/
  .zshrc  .zprofile  .gitconfig  Brewfile
  .config/ghostty/config
  .config/bat/themes/tokyonight_night.tmTheme
```

A twenty-line script that runs `ln -s` for each file is enough; you don't need a framework. On a new Mac you clone the repo, run the script and `brew bundle`, and your shell is back.

## Credit

Most of the CLI tool setup started from Josean Martinez's [7 Amazing CLI Tools](https://www.youtube.com/watch?v=mmqDYw9C30I) video, which is worth watching if you want to see these tools in action. The aliases, history settings and the rest are my own.
