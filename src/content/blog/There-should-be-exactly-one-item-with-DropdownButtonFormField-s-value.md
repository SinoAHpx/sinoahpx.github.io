---
title: "Solving: There should be exactly one item with [DropdownButtonFormField]'s value"
description: "Fixing Flutter error 'There should be exactly one item with [DropdownButtonFormField]'s value' by handling dropdown state correctly."
top: false
cover: false
toc: true
mathjax: true
date: 2022-06-06 16:18:28
pubDate: 2022-06-06 16:18:28
password:
summary: There should be exactly one item with [DropdownButtonFormField]''s value blah blah
tags: [flutter, dart, ui]
categories: Dev
---

## Scenario

Coding a app with a two `DropdownButtonFormField`, which choose certain value from the first one, and represent specified items in the second one. Some of these value won't be the same, this is how's the problem come from.

## Demonstration

Here is an abstract model of my actual code:

```dart
class DemoState extends State<Demo> {
  var asia = ["Singapore", "Korea", "China", "Japan", "India"];
  var europe = ["UK", "Franch", "German", "Russia", "Minecraft"];

  String? selectedContry;
  bool isChina = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            DropdownButton(
              //notice this
              value: selectedContry,
              items: (isChina ? asia : europe)
                  .map((e) => DropdownMenuItem(
                        child: Text(e),
                        value: e,
                      ))
                  .toList(),
              onChanged: (String? value) {
                setState(() {
                  selectedContry = value;
                  if (value == "China") {
                    isChina = true;
                  } else {
                    isChina = false;
                  }
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

If you trying to run it, there's an exception thrown like this:

```
Exception has occurred.
_AssertionError ('package:flutter/src/material/dropdown.dart': Failed assertion: line 882 pos 15: 'items == null || items.isEmpty || value == null ||
              items.where((DropdownMenuItem<T> item) {
                return item.value == value;
              }).length == 1': There should be exactly one item with [DropdownButton]'s value: Japan.
Either zero or 2 or more [DropdownMenuItem]s were detected with the same value)
```

## Analysis

In this case, what is we expected is that when user click the item `China`, the dropdown won't change otherwise the dropdown will be populated with other list: `europe`. Actually, when you choose `China`, nothing goes wrong, but for other country, the exception will be thrown.

Let's put it simple: this error is thrown because the code above trying to give a value that don't exist in the list `europe`. which is illegal in flutter.

What should you do is simply populating the value that also exist in the new list.

## Solution

Just check if old value also exists in the new items, if false, just insert an surely-exist value, otherwise use the old value.

```dart
onChanged: (String? value) {
  setState(() {
    if (value == "China") {
      isChina = true;
      selectedContry = value;
    } else {
      isChina = false;
      if (europe.contains(value)) {
        selectedContry = value;
      } else {
        selectedContry = europe[0];
      }
    }
  });
},
```
