---
title: Automatically deploy nuget package via GitHub Actions
description: Automate publishing a NuGet package using GitHub Actions instead of the NuGet Gallery UI.
top: false
cover: false
toc: true
mathjax: true
date: 2022-07-27 10:17:59
pubDate: 2022-07-27 10:17:59
password:
summary:
tags: ["C#", "NuGet", "GitHub Actions"]
categories: ["技术"]
---

## Background

Recently I have complaint about Nuget gallery's stupid design that you have to re-sign in to upload a new package everytime, so I asked some guys, and to my surprise, they don't even use Nuget gallery website to deploy a new packge, it's too much more elegent and cool way than using stupid nuget gallery, after several attmpts, I'm one of these cool guy now.

## How it works

Basically once you pushed something to the Action branch, the Action will run, and build a package then upload it to nuget (or other sources). Which means, you'll have another branch for updating pushes, and when it ready to release a new package, make a pull request to the default branch so action will go.

## Getting started

Since I have a low proficiency in bash/linux and GitHub Actions, the procedures below may not be decent.

### Grab a Nuget API token

You can grab your Nuget API token here: https://www.nuget.org/account/apikeys

But you'll have to select a valid scope for this key, you can select all the packages you'v uploaded or just some of them. Notably you can only see this key once hence you suppose to store it safely.

In term of using this token, it should be added to `Settings -> Secrets -> Actions -> Repository secrets`, after that you can access this value in workflow by syntax like `${{ secrets.NUGET_KEY  }}`. In this case, I store the Nuget API token as `NUGET_KEY` in the secrets.

### Create a Nuget config file

For some unknown reason (for me), it does work if I directly using `dotnet nuget add source` in workflow to add the nuget publishing source, that's why a compromised way is here: make a file named `NuGet.config` in project source directory.

Content of this file be like:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
  </packageSources>
</configuration>
```

### Create an Action workflow

Simply create the suggested workflows for .NET, or you can create your own, that doesn't matter.

![png 1](https://s2.loli.net/2022/07/27/7tYGZ8JdLHhjCSX.png)  

The initial content of .NET workflow template will look like:

```yml
name: .NET

on:
  push:
    branches: [ "master" ]
  pull_request:
    branches: [ "master" ]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Setup .NET
      uses: actions/setup-dotnet@v2
      with:
        dotnet-version: 6.0.x
    - name: Restore dependencies
      run: dotnet restore
    - name: Build
      run: dotnet build --no-restore
    - name: Test
      run: dotnet test --no-build --verbosity normal

```

We don't discuss detail of this yml file here, what are we gonna do is simply add a step after `Test`, whatever you name it.

```yml
- name: Push package
        run: |
          # Grab some versioning information
          commithash=$(git rev-parse --short HEAD)
          currtime=$(date +%s)
          echo "commit hash is $commithash"
          echo "time is $currtime"

          # Enter project directory
          cd Manganese

          # Build package
          dotnet restore
          dotnet build

          # Pack a nuget package with all the default config
          dotnet pack

          # Enter package output directory
          cd bin/Debug

          # Getting file named with .nupkg extension
          file=""
          cdir=`ls ./*.nupkg`
          for eachfile in $cdir
          do
            file=$eachfile
          done
        
          # Push it to source "nuget"
          dotnet nuget push $file --api-key ${{ secrets.NUGET_KEY  }} --source "nuget"
```

Now you can simply push some stuff to your action branch, the action will run and push your package to nuget gallery.
