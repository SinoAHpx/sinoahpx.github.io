---
title: From view of WPF developer - talking something about Flutter (1)
description: An initial look at Flutter from a WPF developer's perspective, comparing Dart-based UI code with XAML and sharing first impressions.
top: false
cover: false
toc: true
mathjax: true
date: 2022-04-16 15:41:00
pubDate: 2022-04-16 15:41:00
tags: ["CSharp", "WPF", "UI", "Flutter"]
categories: dev
---

# Prologue

Recently I have read Dart documentation and have a glance at the Flutter framework, which is a cross-platform UI framework, Windows, macOS, Linux, Android, iOS, even the web. Wow, That was fascinating!

So that's why this (series of) post(s) coming up, I'd like to share my acquasition of Flutter, and combine it with my previous experience of developing WPF applications.

Well, as this post will definitely not be shown in Google results or somewhat else, I don't really care about its quality, I don't mind if it's informative enough, or well-clarified, just write as I like, write in my way.

As you can see, here is a piece of Flutter's build UI code, which is in the same position as `.xaml` in WPF do, but this code is pure Dart, you don't have to learn another markup language to use it. The significant feature in Dart - [Named parameters](https://dart.dev/guides/language/language-tour#parameters), is the who support you to express UI elements that easy.

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.c
        children: <Widget>[
          const Text(
            'The counter still:',
          ),
          TextFormField(
            controller: _controller,
          ),
          OutlinedButton(
            onPressed: _resetCounter,
            child: const Text("Reset"),
          )
        ],
      ),
    ),
    floatingActionButton: FloatingActionButton
      onPressed: _decrementCounter,
      tooltip: 'Decrement',
      child: const Icon(Icons.remove),
    ),
  );
}
```

# Widget

In the flutter, everything is a widget, and there's `StatelessWidget` and `StatefulWidget`. For an example, `StatelessWidge` is essentially equivalent to `App` in the WPF, and `StatefulWidget` is equivalent to another control component in WPF.

So, what is the `State` in Flutter? Well, that was a complex concept, and this is a blog post but a paper. To be straightforward, the `State` is basically like the `ViewModel` in a MVVM patterned WPF application, so the `StatefulWidget`, suppose to be the `View`. You do actions in the `StatefulWidget`, and the actions will be passed to the `State` to be processed, then, your `State` will invoke the top-level function `setState` to notify the widget: data has changed, please refresh. In code, it's simply an invokation to the `build` function in the `StatefulWidget`.

![picture 1](https://i.stack.imgur.com/z6NU2.png)  

# Scaffold

Quite simple and clear, the `Scaffold` is the main widget in the Flutter, it's a container that contains the `AppBar`, `Body`, etc. For a not really suitable metaphor, just like the `UserControl` in the WPF.

# Columns

Not liking the WPF, the `Columns` in Flutter is a separated element, there's no such thing as `Grid` in WPF, just `Column` and `Row`, when representing the vertical and horizontal layout, both of them can contains multiple children.

# References

+ https://docs.flutter.dev/development/ui/layout/tutorial
+ https://stackoverflow.com/a/68895591/12167919
