---
title: 'How to Build a document site by Vuepress'
description: 'Step-by-step guide to building and deploying a documentation website with VuePress on Windows.'
date: 2021-08-27 22:00:00
pubDate: 2021-08-27 22:00:00
tags: ["VuePress", "文档"]
categories: ["技术"]
---

# How to Build a document site by Vuepress

Before the beginning, I'd like to answer a question: **Why you write this tutorial?**

Yeah, there's too many others article like this, but most of them assume that you have already learned Vue.js and had some knowledge of website building and deploying. So that's why I make this article: for people who don't know what is vue.js and never had a website. Anyway, it's not a zero-basic tutorial, at least, you should know about some things like *what is GitHub?* *why should I write a document?* 

## Environments

This tutorial based on Windows 10 platform, and all the examples are under the windows-style.

### Node.Js

Access the official website of [Node.js](https://nodejs.org), as you can see, there are 2 green buttons, we should click the left one: LTS version of Node.js

![image-20210605211258441](https://i.loli.net/2021/06/05/hNWkjnRq8rXSywi.png)

When it finished, you can see a *.msi* file like this one:

![image-20210605211512722](https://i.loli.net/2021/06/05/zTfSIvnOCYbAHh2.png)

Double click to open it, and keep clicking the **Next** button until the install wizard shows a **Finish** button. Since then, we installed node.js.

### Yarn

Although *npm*(node package manager) provides all the features, according to the document of the vuepress, *yarn* would be a better choice than *npm*.

Let's access [yarn installation site](https://classic.yarnpkg.com/en/docs/install/#windows-stable), expand the **Alternatives** section:

![image-20210605212346019](https://i.loli.net/2021/06/05/UcS8RCezKZHkanJ.png)

Click the *Download Installer Button*, after the progress running over, you can get a *.msi* file, install it like node.js installer.

### Git (Optional)

This step is optional, but if you do this, your work will be much easier.

Access [git official website](https://git-scm.com/download/win), you can see the interface like this:

![image-20210605213126512](https://i.loli.net/2021/06/05/FN4Xftdeyh8aZqm.png)

Click the button that I marked with a red box, the download will be starting, after then, you will get a git installer executable file, start it and just keep the default configuration.

If install succeeds, you will see 2 git menu in any context menu of windows explorer:

![image-20210605213804014](https://i.loli.net/2021/06/05/EHxXiDYlqVOWtZw.png)

As you can see, I marked *Git Bash*, which is the command terminal we need to instead of windows cmd or Powershell.

## Setup Vuepress

Now, we had node.js and yarn, we are ready to start building a vuepress site!

### Create a Github repo for deploying Vuepress

I won't show how to create a GitHub repo, but I would notice you are:

![image-20210605214554406](https://i.loli.net/2021/06/05/AyLHD6hFcGeCtgw.png)

You should choose the .gitignore template to Node, it will be more convenient for you.

Clone the repo that we just created to the local disk, enter the directory that you contains your repo, and open git bash for it.

### Install Vuepress

Before work starts, input the command below:

```shell
yarn init -y
```

This command means we created a node package with the default configuration. Then we can add vuepress to dependencies of our package:

```shell
yarn add -D vuepress
```

This command needs about 2 minutes to complete, keep your patience.

![image-20210605215211625](https://i.loli.net/2021/06/05/oZF7Q9v5gTNtzfE.png)

Since then, we installed the vuepress local.

### Basic configuration for vuepress

After you installed the vuepress, the structure of your local files should be like this:

![image-20210605215450501](https://i.loli.net/2021/06/05/oA8GD2cR6k7FJzE.png)

Open the *package.json*, add these lines in this JSON file and append ```.temp``` in the .gitignore file

```json
"scripts": {
	"dev": "vuepress dev docs --temp .temp",
	"build": "vuepress build docs"
}
```

This step is also optional, but if you do this, your progress will be more convenient. In fact, you don't even need to know what these commands used for, just follow the steps.

Now we created a folder that must named *docs*,

![image-20210605220029939](https://i.loli.net/2021/06/05/HqYn5SAC9Zu84mE.png)

Then we created a file named README.md (just like index.html if you have any website knowledge), write any content you want inside.

![image-20210605220202704](https://i.loli.net/2021/06/05/zL6pC4QEfsiNA2Z.png)

Since here, we could serve a local server for our document side, just input this command:

```shell
yarn dev
```

When this interface displayed, your local document server has been created.

![image-20210605220517338](https://i.loli.net/2021/06/05/oNmGHzTL5dMZh6t.png)

Access *http://localhost:8080*, you can see an empty vuepress side now:

![image-20210605220600598](https://i.loli.net/2021/06/05/te1lTOjEhz3SHrY.png)

### config.js

Create a folder named *.vuepress* in */doc*:

![image-20210605220743591](https://i.loli.net/2021/06/05/dgnJRQbjkKvzYWP.png)

Create a javacript file in */.vuepress*:

![image-20210605220912318](https://i.loli.net/2021/06/05/jnIrx1uJit5l7M8.png)

Add these lines inside:

```javascript
module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around',
  base: "/Vuepress4Beginner/"
}
```

There's a point you should be noticed, the *base* key should appear when you trying to deploy your document site on a sub-directory like *http://www.xxxx.com/xxxx*, the slash symbol should be beginning, and the end.

Restart your local server, you will see the host had appended your *base* value

![image-20210605221808225](https://i.loli.net/2021/06/05/X49JSvZCfmzWjoG.png)

And you will see the effect of the config.js, a title element displayed in the top-left corner

![image-20210605221900646](https://i.loli.net/2021/06/05/kWA6l2rLoGCsuyT.png)

### root README.md

Add these lines at the top of *root README.md*:

```YAML
---
home: true
herImage: /hero.png
heroText: Hero 标题
tagline: Hero 副标题
actionText: 快速上手 →
actionLink: /guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
---
```

You can change the element content as you want, the *hereImage* key should be removed if you don't need it. And if you need a big logo on your document home page, you should know some basic knowledge about [vuepress asset](https://vuepress.vuejs.org/guide/assets.html#relative-urls).

The content below the [YAML font matter](https://jekyllrb.com/docs/front-matter/) will be display as normal markdown content.

Now, I'll tell you what is ever YAML font matter key-value pair used for:

+ home: this page is used for the home page or not
+ heroImage: the main logo displayed in the center of the home page
+ heroText: the main title displayed in the center of the home page
+ tagline: the subtitle under the heroText
+ actionText: the text for the central button
+ actionLink: the jump target for central button
+ features: some feature under the central button
  + title: feature title
  + details: feature description
+ footer: the text display in the footer of the site

![image-20210605223618117](https://i.loli.net/2021/06/05/IHVN6rb1lGD3y7Q.png)

### Add navigate links

Open *config.js*, and add these lines:

```javascript
themeConfig: {
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
    { text: 'External', link: 'https://google.com' },
  ]
}
```

As you can see, there's an array named *nav*, you can add its member like:

```javascript
{ text: 'Home', link: '/' }
```

+ text: the text display in navigate bar
+ link: the link for navigating, you can use a relative or absolute URL

If you would like to know about the navigation bar, you can visit [navbar links](https://vuepress.vuejs.org/theme/default-theme-config.html#navbar-links) in vuepress document.

### Start writing

After all of these configurations, now you can start to write documents via markdown.

Create a folder named *guide* in /docs:

![image-20210605223831721](https://i.loli.net/2021/06/05/Y2htFld3NbVpXJr.png)

Create a README.me in /docs/guide

![image-20210605223942377](https://i.loli.net/2021/06/05/Vo4z3FyeCYpvW7O.png)

Add this YAML font matter at the top of this README.md:

```yaml
---
sidebar: auto
---
```

Enjoy!

![image-20210605224226895](https://i.loli.net/2021/06/05/IszYhVKlRygdTH6.png)

### Summary

This is how the document site looks like after the above configurations, 

![image-20210605225004660](https://i.loli.net/2021/06/05/qO9lp3JhBR7Ew58.png)

I'll list some point that you maybe didn't know:

+ REAME.md equals to index.html in website building
+ The local file structure of our example:
  + .temp
  + docs
    + .vuepress
      + config.js
    + guide
      + README.md
    + README.md
  + node_modules
  + .gitignore
  + package.json
  + yarn.lock

## Deploy

After all the work above, now we can deploy our document site to GitHub pages, maybe you would like to try another deployment, so you can check out [vuepress document](https://vuepress.vuejs.org/guide/deploy.html#github-pages).

### Create deploy script

Create a .sh file named deploy.sh in the root directory

```shell
#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd docs/.vuepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```

I'd like to recommend that you shouldn't just push the static pages to your master branch, your master branch should be storage your development environment. So you can just push them to another branch.

Since then, you should add this line in the config.js:

```
"deploy": "bash deploy.sh"
```

And then config.js should look like:

![image-20210605231251492](https://i.loli.net/2021/06/05/zXGdl3vxDHA8oCK.png)

As you can see, we are using the windows operating system, but there's a ```bash``` command that's didn't exist in windows. How to solve this? The answer is: we don't even need to solve because we are using git bash. That's why I recommended you to choose git bash but not the windows cmd or Powershell.

Now, just run

```
yarn deploy
```

Then, turn to GitHub, open the repo for hosting the vuepress document, turn to the *Setting* page:

![image-20210605231615793](https://i.loli.net/2021/06/05/OuDRpXc6NbEkF9o.png)

And go to the Pages section, set the source branch to gh:pages, click save. Just wait for moments, then access your page.

![image-20210605231713557](https://i.loli.net/2021/06/05/1kPFQTShXsvGf8r.png)

Congratulations! You've done all the work!
