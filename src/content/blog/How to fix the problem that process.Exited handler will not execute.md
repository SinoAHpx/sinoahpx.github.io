---
title: 'How to fix the problem that process.Exited handler will not execute'
description: 'Investigating why a C# Process.Exited event handler never fires and how to fix it.'
date: 2021-08-27 22:22:00
pubDate: 2021-08-27 22:22:00
tags: CSharp
categories: dev
---

As the code below:

```cs
var path = @"xxx.exe";

var process = new Process
{
    StartInfo = new ProcessStartInfo
    {
        FileName = path
    }
};

process.Start();
```

If there's a scenario that we need to detect if this process exited and execute handler, how would you like to implement it?

Let's add a event handler for `process.Exited` event:

```cs
process.Exited += (_, _) =>
{
    Console.WriteLine($"`Process exit with code {process.ExitCode}`");
;
```

Run our application, and the question is: the code above didn't work properly, when the process that we started to exit, the `process.Exited` event handler didn't execute.

So you will check the [Document](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.process.exited?view=net-5.0), they say: `It raises the Exited event when the process exits because the EnableRaisingEvents property was set when the process was created. The Exited event handler displays process information.` So what if we set EnableRaisingEvents to *true*?

```cs
var process = new Process
{
    StartInfo = new ProcessStartInfo
    {
        FileName = path
    },
    EnableRaisingEvents = true
};
```

In the code above, we've set EnableRaisingEvents to *true*, but if we run the application again, the ```process.Exited``` event handler didn't execute either, what we gonna do now?

If you care enough, you will find that when the executable file that we specified started success, our application end tho. On purpose to make our application won't exit until the executable exited, we need to append the code below after the executable file started:

```cs
process.WaitForExit()
```

We just run the application again, the console output `Process exit with code {process.ExitCode}` is displayed successfully now.
