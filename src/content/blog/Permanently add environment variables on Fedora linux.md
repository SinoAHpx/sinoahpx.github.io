---
title: 'Permanently add environment variables on Fedora linux'
description: 'How to permanently add environment variables on Fedora Linux so they persist across sessions.'
date: 2022-04-13 23:40:00
pubDate: 2022-04-13 23:40:00
tags: ["Linux", "Fedora"]
categories: ["技术"]
---

# Background

I'm trying to be a Linux-cool guy recently, to be honest, Linux is too much tougher than Windows, but also being honest, Linux is much more interesting than Windows. You faced to problems, you googled it, and the problems are gone... just feel like fabricating a huge LEGO toy, feeling full of sense of accomplishment, it's fascinating!

In this post, I'll introduce how to add environment variables on Fedora linux (other distros may be the same). 

# Go for it

Firstly, you can check your current environment variables via `echo $PATH`, the result will be like:

```
bash: /home/ahpx/.local/bin:/home/ahpx/bin:/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/home/ahpx/.dotnet/tools:/home/ahpx/Softwares/dart-sdk/bin
```

Well, for a Linux noob like me, we don't really care about using zsh or whatever else terminals, we simply use system-built-in one, the bash. So for now, you just open this file: `/etc/profile`.

Use Visual Studio Code will be decent, just open the file in GUI and save it as root mode. If you don't have it, just use `sudo nano /etc/profile`(or vim, whatever you want).

Basically here is what you can see in `profile` file:

```
# /etc/profile

# System wide environment and startup programs, for login setup
# Functions and aliases go in /etc/bashrc

# It's NOT a good idea to change this file unless you know what you
# are doing. It's much better to create a custom.sh shell script in
# /etc/profile.d/ to make custom changes to your environment, as this
# will prevent the need for merging in future updates.

pathmunge () {
    case ":${PATH}:" in
        *:"$1":*)
            ;;
        *)
            if [ "$2" = "after" ] ; then
                PATH=$PATH:$1
            else
                PATH=$1:$PATH
            fi
    esac
}


if [ -x /usr/bin/id ]; then
    if [ -z "$EUID" ]; then
        # ksh workaround
        EUID=`/usr/bin/id -u`
        UID=`/usr/bin/id -ru`
    fi
    USER="`/usr/bin/id -un`"
    LOGNAME=$USER
    MAIL="/var/spool/mail/$USER"
fi

# Path manipulation
if [ "$EUID" = "0" ]; then
    pathmunge /usr/sbin
    pathmunge /usr/local/sbin
else
    pathmunge /usr/local/sbin after
    pathmunge /usr/sbin after
fi

HOSTNAME=$(/usr/bin/hostnamectl --transient 2>/dev/null) || \
HOSTNAME=$(/usr/bin/hostname 2>/dev/null) || \
HOSTNAME=$(/usr/bin/uname -n)

HISTSIZE=1000
if [ "$HISTCONTROL" = "ignorespace" ] ; then
    export HISTCONTROL=ignoreboth
else
    export HISTCONTROL=ignoredups
fi

export PATH USER LOGNAME MAIL HOSTNAME HISTSIZE HISTCONTROL

for i in /etc/profile.d/*.sh /etc/profile.d/sh.local ; do
    if [ -r "$i" ]; then
        if [ "${-#*i}" != "$-" ]; then 
            . "$i"
        else
            . "$i" >/dev/null
        fi
    fi
done

unset i
unset -f pathmunge

# Source global bash config, when interactive but not posix or sh mode
if test "$BASH" &&\
   test -z "$POSIXLY_CORRECT" &&\
   test "${0#-}" != sh &&\
   test -r /etc/bashrc
then
   # Bash login shells run only /etc/profile
   # Bash non-login shells run only /etc/bashrc
   # Check for double sourcing is done in /etc/bashrc.
   . /etc/bashrc
fi

```

Scroll it down to end line, now you can add your environment variables like this:

```bash
export PATH=$PATH:"first":"second"
```

Yeah, quite simple, right? But there's one last thing you should keep in mind: **DON'T MISS THE `$PATH:`**.

# References

+ [Learn How to Set Your $PATH Variables Permanently in Linux](https://www.tecmint.com/set-path-variable-linux-permanently/)
