---
title: ModuleIntializer in CSharp
description: 介绍 C# 9 的 ModuleInitializer 特性，并展示如何在模块初始化时执行自定义代码。
top: false
cover: false
toc: true
mathjax: true
date: 2023-01-19 07:00:04
pubDate: 2023-01-19 07:00:04
password:
summary:
tags: [CSharp]
categories: [Dev]
---

Refer to [Module Initializer](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/proposals/csharp-9.0/module-initializers) documentation, the `ModuleInitializer` is a useful attribute, which enable your program run something as it initialized.

Usage of this attribute is very simple, just have a class, and a parameterless static method that returns void, and simply give it an attribute.

```cs
using System.Runtime.CompilerServices;

namespace LanguageLab;

public class ToBeInitialized
{
    [ModuleInitializer]
    public static void SayHello()
    {
        Console.WriteLine("Hello!");
    }
}
```

And then when you run your application, even if there's no any code in `Main` method, but the string `Hello!` will be still printed.
