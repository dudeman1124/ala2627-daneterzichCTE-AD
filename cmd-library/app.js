const commands = [
  { page: 1, name: 'Get-ComputerInfo', category: 'discover', label: 'System', description: 'Read a broad snapshot of the Windows version, hardware, BIOS, and environment.', command: 'Get-ComputerInfo' },
  { page: 1, name: 'Get-Process', category: 'discover', label: 'Processes', description: 'List running processes, then sort or filter them by CPU, memory, or name.', command: 'Get-Process | Sort-Object CPU -Descending' },
  { page: 1, name: 'Get-Service', category: 'discover', label: 'Services', description: 'See services and their current state. Some service details may be restricted.', command: 'Get-Service | Sort-Object Status, DisplayName' },
  { page: 1, name: 'Get-WinEvent', category: 'discover', label: 'Events', description: 'Read Windows event logs you have permission to access, newest events first.', command: 'Get-WinEvent -LogName System -MaxEvents 20' },
  { page: 1, name: 'Get-CimInstance', category: 'discover', label: 'Inventory', description: 'Query useful management data such as memory, disks, and operating-system details.', command: 'Get-CimInstance Win32_OperatingSystem' },
  { page: 1, name: 'Get-ChildItem', category: 'files', label: 'Files', description: 'List files and folders. The alias dir also works in PowerShell.', command: 'Get-ChildItem -Force' },
  { page: 1, name: 'Get-Content', category: 'files', label: 'Read', description: 'Read a text file without opening a separate editor.', command: 'Get-Content .\\notes.txt -Tail 20' },
  { page: 1, name: 'Select-String', category: 'files', label: 'Search', description: 'Search text inside files with a pattern and return matching lines.', command: 'Select-String -Path .\\*.log -Pattern "error"' },
  { page: 1, name: 'Get-FileHash', category: 'files', label: 'Verify', description: 'Create a SHA-256 fingerprint so you can compare file contents safely.', command: 'Get-FileHash .\\download.zip -Algorithm SHA256' },
  { page: 1, name: 'Get-NetIPConfiguration', category: 'network', label: 'Network', description: 'Inspect adapters, IP addresses, gateways, and DNS settings.', command: 'Get-NetIPConfiguration' },
  { page: 1, name: 'Test-NetConnection', category: 'network', label: 'Test', description: 'Check DNS and whether a host or TCP port can be reached from this PC.', command: 'Test-NetConnection example.com -Port 443' },
  { page: 1, name: 'Resolve-DnsName', category: 'network', label: 'DNS', description: 'Ask configured DNS servers to resolve a hostname or inspect a record.', command: 'Resolve-DnsName example.com' },
  { page: 1, name: 'Get-NetTCPConnection', category: 'network', label: 'Sockets', description: 'View current TCP connections and their owning process IDs.', command: 'Get-NetTCPConnection -State Established' },
  { page: 1, name: 'Get-Location', category: 'automate', label: 'Navigate', description: 'Print the current folder. The alias pwd is familiar to many shell users.', command: 'Get-Location' },
  { page: 1, name: 'Measure-Object', category: 'automate', label: 'Count', description: 'Count files, lines, or values as part of a pipeline.', command: 'Get-ChildItem | Measure-Object' },
  { page: 1, name: 'Export-Csv', category: 'automate', label: 'Export', description: 'Save structured command output as a CSV you can open in Excel.', command: 'Get-Process | Export-Csv .\\processes.csv -NoTypeInformation' },
  { page: 1, name: 'Get-Date', category: 'automate', label: 'Time', description: 'Get the local date and time, or format it for filenames and logs.', command: 'Get-Date -Format "yyyy-MM-dd HH:mm"' },
  { page: 1, name: 'Get-Clipboard', category: 'automate', label: 'Clipboard', description: 'Read the current user clipboard and pipe it into another command.', command: 'Get-Clipboard' },
  { page: 2, name: 'Get-Counter', category: 'discover', label: 'Performance', description: 'Sample Windows performance counters to inspect CPU, memory, disk, or network pressure.', command: 'Get-Counter "\\Processor(_Total)\\% Processor Time" -SampleInterval 2 -MaxSamples 5' },
  { page: 2, name: 'Get-ScheduledTask', category: 'discover', label: 'Tasks', description: 'Review scheduled tasks and their current state without changing them.', command: 'Get-ScheduledTask | Where-Object State -eq "Ready"' },
  { page: 2, name: 'Get-Volume', category: 'discover', label: 'Storage', description: 'Inspect mounted volumes, file systems, health, and available space.', command: 'Get-Volume | Select-Object DriveLetter, FileSystem, SizeRemaining, Size' },
  { page: 2, name: 'Get-Acl', category: 'files', label: 'Permissions', description: 'Read access-control entries on a file or folder to understand its permissions.', command: 'Get-Acl .\\reports | Format-List' },
  { page: 2, name: 'Get-ChildItem', category: 'files', label: 'Inventory', description: 'Build a recursive file inventory and sort it by size for cleanup work.', command: 'Get-ChildItem .\\logs -File -Recurse | Sort-Object Length -Descending' },
  { page: 2, name: 'Get-NetRoute', category: 'network', label: 'Routes', description: 'Inspect the local routing table and identify the path Windows will use.', command: 'Get-NetRoute -AddressFamily IPv4 | Sort-Object RouteMetric' },
  { page: 2, name: 'Get-DnsClientCache', category: 'network', label: 'Cache', description: 'Inspect locally cached DNS records while troubleshooting name resolution.', command: 'Get-DnsClientCache | Sort-Object Entry' },
  { page: 2, name: 'ForEach-Object', category: 'automate', label: 'Pipeline', description: 'Run an operation for each pipeline item and shape the output you need.', command: 'Get-ChildItem -File | ForEach-Object { $_.Name.ToUpper() }' },
  { page: 2, name: 'Where-Object', category: 'automate', label: 'Filter', description: 'Keep only objects matching a property or script condition in a pipeline.', command: 'Get-Process | Where-Object CPU -gt 60 | Sort-Object CPU -Descending' },
  { page: 3, name: 'Invoke-Command', category: 'network', label: 'Remote', description: 'Run a read-only diagnostic command on a permitted remote computer or session.', command: 'Invoke-Command -ComputerName SERVER01 -ScriptBlock { Get-Process }' },
  { page: 3, name: 'Get-WinEvent', category: 'discover', label: 'Query', description: 'Use a structured filter to search large event logs efficiently by provider and ID.', command: 'Get-WinEvent -FilterHashtable @{ LogName="System"; Id=6005,6006 }' },
  { page: 3, name: 'Get-CimAssociatedInstance', category: 'discover', label: 'Relations', description: 'Follow CIM relationships to connect devices, services, and system resources.', command: 'Get-CimInstance Win32_NetworkAdapter | Get-CimAssociatedInstance -ResultClassName Win32_NetworkAdapterConfiguration' },
  { page: 3, name: 'Compare-Object', category: 'files', label: 'Diff', description: 'Compare two command outputs or snapshots and surface what changed.', command: 'Compare-Object (Get-Content .\\before.txt) (Get-Content .\\after.txt)' },
  { page: 3, name: 'Group-Object', category: 'automate', label: 'Aggregate', description: 'Group pipeline results by a property to reveal patterns and outliers.', command: 'Get-WinEvent -LogName System -MaxEvents 100 | Group-Object ProviderName | Sort-Object Count -Descending' },
  { page: 3, name: 'Tee-Object', category: 'automate', label: 'Trace', description: 'Capture intermediate pipeline output while continuing to pass it onward.', command: 'Get-Process | Tee-Object .\\process-snapshot.txt | Sort-Object CPU -Descending' },
  { page: 3, name: 'Measure-Command', category: 'automate', label: 'Benchmark', description: 'Measure how long a command takes so you can compare approaches.', command: 'Measure-Command { Get-ChildItem -File -Recurse | Measure-Object }' }
];

const pythonCommands = [
  { page: 1, name: 'Variables', category: 'foundation', label: 'Foundation', description: 'Store values with clear names and inspect the result.', command: 'name = "Ada"\nprint(name)' },
  { page: 1, name: 'Lists', category: 'foundation', label: 'Foundation', description: 'Keep an ordered collection and access one item by its position.', command: 'colors = ["red", "green", "blue"]\nprint(colors[0])' },
  { page: 1, name: 'Dictionaries', category: 'foundation', label: 'Foundation', description: 'Represent related values with readable key-value pairs.', command: 'user = {"name": "Ada", "active": True}\nprint(user["name"])' },
  { page: 1, name: 'Conditions', category: 'foundation', label: 'Foundation', description: 'Choose a path when a value meets a condition.', command: 'temperature = 72\nif temperature > 70:\n    print("Warm")' },
  { page: 1, name: 'Loops', category: 'foundation', label: 'Foundation', description: 'Repeat an action for every item in a collection.', command: 'for number in range(1, 4):\n    print(number)' },
  { page: 1, name: 'Functions', category: 'foundation', label: 'Foundation', description: 'Package a repeatable action behind a descriptive name.', command: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Ada"))' },
  { page: 2, name: 'List Comprehension', category: 'intermediate', label: 'Intermediate', description: 'Build a transformed list in one readable expression.', command: 'squares = [number ** 2 for number in range(1, 6)]' },
  { page: 2, name: 'Read a File', category: 'intermediate', label: 'Intermediate', description: 'Read text safely and process each line.', command: 'from pathlib import Path\n\ntext = Path("notes.txt").read_text()\nprint(text)' },
  { page: 2, name: 'Handle Errors', category: 'intermediate', label: 'Intermediate', description: 'Catch expected failures and give the caller a useful result.', command: 'try:\n    value = int(input("Number: "))\nexcept ValueError:\n    print("Please enter a whole number.")' },
  { page: 2, name: 'Dataclass', category: 'intermediate', label: 'Intermediate', description: 'Model structured records without writing repetitive initialization code.', command: 'from dataclasses import dataclass\n\n@dataclass\nclass Task:\n    title: str\n    done: bool = False' },
  { page: 2, name: 'JSON Data', category: 'intermediate', label: 'Intermediate', description: 'Convert between Python objects and portable JSON text.', command: 'import json\n\npayload = {"status": "ok"}\ntext = json.dumps(payload)\nprint(json.loads(text)["status"])' },
  { page: 2, name: 'Generator', category: 'intermediate', label: 'Intermediate', description: 'Produce values one at a time to keep iteration lightweight.', command: 'def count_up_to(limit):\n    for number in range(1, limit + 1):\n        yield number' },
  { page: 3, name: 'Async Task', category: 'advanced', label: 'Advanced', description: 'Run waiting work cooperatively with Python async syntax.', command: 'import asyncio\n\nasync def main():\n    await asyncio.sleep(1)\n    print("Finished")\n\nasyncio.run(main())' },
  { page: 3, name: 'SQLite Query', category: 'advanced', label: 'Advanced', description: 'Create a local database table and query rows safely.', command: 'import sqlite3\n\nwith sqlite3.connect("app.db") as db:\n    rows = db.execute("SELECT name FROM users WHERE active = ?", (1,))\n    print(rows.fetchall())' },
  { page: 3, name: 'HTTP Request', category: 'advanced', label: 'Advanced', description: 'Fetch JSON from a service using the standard library.', command: 'from urllib.request import urlopen\nimport json\n\nwith urlopen("https://example.com/data.json") as response:\n    data = json.load(response)' },
  { page: 3, name: 'Context Manager', category: 'advanced', label: 'Advanced', description: 'Guarantee cleanup around resources with a reusable context manager.', command: 'from contextlib import contextmanager\n\n@contextmanager\ndef managed_resource():\n    print("open")\n    yield\n    print("close")' },
  { page: 3, name: 'Type Protocol', category: 'advanced', label: 'Advanced', description: 'Describe the behavior an object must provide without requiring inheritance.', command: 'from typing import Protocol\n\nclass Renderable(Protocol):\n    def render(self) -> str: ...' },
  { page: 3, name: 'Concurrent Work', category: 'advanced', label: 'Advanced', description: 'Schedule independent tasks and collect their results together.', command: 'from concurrent.futures import ThreadPoolExecutor\n\nwith ThreadPoolExecutor() as pool:\n    results = list(pool.map(str.upper, ["one", "two"]))' },
  { page: 1, name: 'Tuples', category: 'foundation', label: 'Foundation', description: 'Group fixed values together and unpack them into named variables.', command: 'point = (4, 9)\nx, y = point' },
  { page: 1, name: 'Slicing', category: 'foundation', label: 'Foundation', description: 'Select a range of items from a sequence without changing the original.', command: 'letters = ["a", "b", "c", "d"]\nprint(letters[1:3])' },
  { page: 1, name: 'Modules', category: 'foundation', label: 'Foundation', description: 'Reuse code from another file with a clear import statement.', command: 'import math\nprint(math.sqrt(81))' },
  { page: 2, name: 'Regular Expression', category: 'intermediate', label: 'Intermediate', description: 'Find structured text patterns with Python\'s regular-expression tools.', command: 'import re\n\nmatch = re.search(r"error: (.+)", log)\nprint(match.group(1))' },
  { page: 2, name: 'Command Line Args', category: 'intermediate', label: 'Intermediate', description: 'Read command-line options so a script can be reused from a terminal.', command: 'import sys\n\nprint(sys.argv[1:])' },
  { page: 2, name: 'Unit Test', category: 'intermediate', label: 'Intermediate', description: 'Express a small expectation and run it as an automated check.', command: 'import unittest\n\nclass TestTotal(unittest.TestCase):\n    def test_total(self):\n        self.assertEqual(sum([2, 3]), 5)' },
  { page: 3, name: 'Multiprocessing', category: 'advanced', label: 'Advanced', description: 'Distribute CPU-heavy work across separate Python processes.', command: 'from multiprocessing import Pool\n\nwith Pool() as pool:\n    results = pool.map(pow, [2, 3, 4], [2, 2, 2])' },
  { page: 3, name: 'AST Walker', category: 'advanced', label: 'Advanced', description: 'Parse Python source into a tree for analysis or transformation.', command: 'import ast\n\ntree = ast.parse("total = price * quantity")\nprint(ast.dump(tree))' },
  { page: 3, name: 'Descriptor', category: 'advanced', label: 'Advanced', description: 'Control attribute access with Python\'s descriptor protocol.', command: 'class Positive:\n    def __get__(self, obj, owner):\n        return obj._value\n\n    def __set__(self, obj, value):\n        obj._value = max(0, value)' },
  { page: 4, name: 'Metaclass', category: 'hell', label: 'Hell', description: 'Customize class creation before the class object reaches the rest of the program.', command: 'class Registry(type):\n    items = {}\n\n    def __new__(meta, name, bases, namespace):\n        cls = super().__new__(meta, name, bases, namespace)\n        meta.items[name] = cls\n        return cls' },
  { page: 4, name: 'Coroutine Control', category: 'hell', label: 'Hell', description: 'Coordinate coroutines directly with send, throw, and yield from.', command: 'def pipeline():\n    value = yield\n    while True:\n        value = yield value * 2' },
  { page: 4, name: 'Import Hook', category: 'hell', label: 'Hell', description: 'Intercept module loading with a custom finder on the import path.', command: 'import sys\n\nclass Finder:\n    def find_spec(self, fullname, path, target=None):\n        return None\n\nsys.meta_path.insert(0, Finder())' },
  { page: 4, name: 'Bytecode Inspect', category: 'hell', label: 'Hell', description: 'Disassemble a function to study the instructions behind Python syntax.', command: 'import dis\n\n dis.dis(lambda value: value * 2)' },
  { page: 4, name: 'Memory View', category: 'hell', label: 'Hell', description: 'Read and manipulate a buffer through Python\'s low-level memory interface.', command: 'buffer = bytearray(b"ABC")\nview = memoryview(buffer)\nview[0] = 90' },
  { page: 4, name: 'Pattern Matching', category: 'hell', label: 'Hell', description: 'Route structured values through nested structural pattern matches.', command: 'match packet:\n    case {"kind": "error", "code": code}:\n        print(code)\n    case _:\n        pass' },
  { page: 4, name: 'Async Generator', category: 'hell', label: 'Hell', description: 'Yield values asynchronously while preserving cooperative scheduling.', command: 'async def events(source):\n    async for event in source:\n        yield event.payload' },
  { page: 4, name: 'Frame Inspection', category: 'hell', label: 'Hell', description: 'Inspect the live execution frame and its local namespace.', command: 'import inspect\n\nframe = inspect.currentframe()\nprint(frame.f_locals)' },
  { page: 4, name: 'Walrus Pipeline', category: 'hell', label: 'Hell', description: 'Bind intermediate values inside an expression-driven filtering pipeline.', command: 'if (size := len(payload)) > 1024:\n    print(f"Large: {size}")' },
  { page: 5, name: 'C Extension Boundary', category: 'uberhell', label: 'UBERHELL', description: 'Declare a native function boundary for code implemented outside Python.', command: 'from ctypes import CDLL, c_int\n\nlib = CDLL("libmath.so")\nlib.add.argtypes = [c_int, c_int]' },
  { page: 5, name: 'Vectorized Kernel', category: 'uberhell', label: 'UBERHELL', description: 'Describe a numerical kernel that can be compiled for array-wide execution.', command: 'from numba import njit\n\n@njit\ndef dot(left, right):\n    return sum(a * b for a, b in zip(left, right))' },
  { page: 5, name: 'Async Context', category: 'uberhell', label: 'UBERHELL', description: 'Build a context manager that performs asynchronous setup and cleanup.', command: 'from contextlib import asynccontextmanager\n\n@asynccontextmanager\nasync def session():\n    yield await connect()' },
  { page: 5, name: 'Custom Awaitable', category: 'uberhell', label: 'UBERHELL', description: 'Make a class awaitable by implementing the await protocol yourself.', command: 'class Ready:\n    def __await__(self):\n        yield\n        return "done"' },
  { page: 5, name: 'AST Rewrite', category: 'uberhell', label: 'UBERHELL', description: 'Transform syntax trees before compiling the resulting Python code.', command: 'tree = ast.parse(source)\ntree = Transformer().visit(tree)\ncode = compile(tree, "<generated>", "exec")' },
  { page: 5, name: 'Tracing Hook', category: 'uberhell', label: 'UBERHELL', description: 'Observe every executed line by installing a process-wide tracing function.', command: 'import sys\n\ndef trace(frame, event, arg):\n    return trace\n\nsys.settrace(trace)' },
  { page: 5, name: 'Weak References', category: 'uberhell', label: 'UBERHELL', description: 'Track objects without keeping them alive and receive cleanup callbacks.', command: 'import weakref\n\ncache = weakref.WeakValueDictionary()\ncache["item"] = object()' },
  { page: 5, name: 'Pattern Compiler', category: 'uberhell', label: 'UBERHELL', description: 'Compile a declarative pattern into a reusable matching function.', command: 'from functools import singledispatch\n\n@singledispatch\ndef render(value):\n    return str(value)' },
  { page: 5, name: 'Interpreter Frame', category: 'uberhell', label: 'UBERHELL', description: 'Use frame objects to reason about execution state at the interpreter boundary.', command: 'import sys\n\nframe = sys._getframe()\nprint(frame.f_code.co_name)' }
];

const javascriptCommands = [
  { page: 1, name: 'Variables', category: 'foundation', label: 'Foundation', description: 'Store values with clear names using modern JavaScript declarations.', command: 'const name = "Ada";\nconsole.log(name);' },
  { page: 1, name: 'Arrays', category: 'foundation', label: 'Foundation', description: 'Keep an ordered collection and access one item by its position.', command: 'const colors = ["red", "green", "blue"];\nconsole.log(colors[0]);' },
  { page: 1, name: 'Objects', category: 'foundation', label: 'Foundation', description: 'Represent related values with readable key-value pairs.', command: 'const user = { name: "Ada", active: true };\nconsole.log(user.name);' },
  { page: 1, name: 'Conditions', category: 'foundation', label: 'Foundation', description: 'Choose a path when a value meets a condition.', command: 'const temperature = 72;\nif (temperature > 70) console.log("Warm");' },
  { page: 1, name: 'Loops', category: 'foundation', label: 'Foundation', description: 'Repeat an action for every item in a collection.', command: 'for (const number of [1, 2, 3]) {\n  console.log(number);\n}' },
  { page: 1, name: 'Functions', category: 'foundation', label: 'Foundation', description: 'Package a repeatable action behind a descriptive name.', command: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Ada"));' },
  { page: 2, name: 'Array Mapping', category: 'intermediate', label: 'Intermediate', description: 'Build a transformed array with a readable expression.', command: 'const squares = [1, 2, 3, 4, 5].map(number => number ** 2);' },
  { page: 2, name: 'Fetch Data', category: 'intermediate', label: 'Intermediate', description: 'Request JSON data from a web service with the Fetch API.', command: 'const response = await fetch("https://example.com/data.json");\nconst data = await response.json();' },
  { page: 2, name: 'Handle Errors', category: 'intermediate', label: 'Intermediate', description: 'Catch expected failures and give the caller a useful result.', command: 'try {\n  JSON.parse(input);\n} catch (error) {\n  console.error("Invalid JSON", error);\n}' },
  { page: 2, name: 'Classes', category: 'intermediate', label: 'Intermediate', description: 'Model structured records with reusable behavior.', command: 'class Task {\n  constructor(title) {\n    this.title = title;\n    this.done = false;\n  }\n}' },
  { page: 2, name: 'JSON Data', category: 'intermediate', label: 'Intermediate', description: 'Convert between JavaScript objects and portable JSON text.', command: 'const payload = { status: "ok" };\nconst text = JSON.stringify(payload);\nconsole.log(JSON.parse(text).status);' },
  { page: 2, name: 'Filter Items', category: 'intermediate', label: 'Intermediate', description: 'Keep only collection items that match a condition.', command: 'const activeUsers = users.filter(user => user.active);' },
  { page: 3, name: 'Async Task', category: 'advanced', label: 'Advanced', description: 'Run waiting work cooperatively with async JavaScript syntax.', command: 'async function main() {\n  await new Promise(resolve => setTimeout(resolve, 1000));\n  console.log("Finished");\n}\n\nmain();' },
  { page: 3, name: 'Read a File', category: 'advanced', label: 'Advanced', description: 'Read text from a file with the Node.js standard library.', command: 'import { readFile } from "node:fs/promises";\n\nconst text = await readFile("notes.txt", "utf8");' },
  { page: 3, name: 'Web Server', category: 'advanced', label: 'Advanced', description: 'Create a small HTTP server with the Node.js runtime.', command: 'import { createServer } from "node:http";\n\ncreateServer((request, response) => {\n  response.end("Hello");\n}).listen(3000);' },
  { page: 3, name: 'Map Values', category: 'advanced', label: 'Advanced', description: 'Associate keys with values when an object is not enough.', command: 'const visits = new Map();\nvisits.set("home", 3);\nconsole.log(visits.get("home"));' },
  { page: 3, name: 'Promise Work', category: 'advanced', label: 'Advanced', description: 'Run independent asynchronous operations together.', command: 'const [users, posts] = await Promise.all([\n  fetch("/users").then(response => response.json()),\n  fetch("/posts").then(response => response.json())\n]);' },
  { page: 3, name: 'Regular Expression', category: 'advanced', label: 'Advanced', description: 'Find and validate text patterns with a reusable expression.', command: 'const emailPattern = /^[^@]+@[^@]+\\.[^@]+$/;\nconsole.log(emailPattern.test("ada@example.com"));' },
  { page: 1, name: 'Destructuring', category: 'foundation', label: 'Foundation', description: 'Unpack object properties into clearly named variables.', command: 'const { name, active } = user;\nconsole.log(name, active);' },
  { page: 1, name: 'Template Strings', category: 'foundation', label: 'Foundation', description: 'Compose readable strings with embedded expressions.', command: 'const message = `Hello, ${name}!`;\nconsole.log(message);' },
  { page: 1, name: 'DOM Query', category: 'foundation', label: 'Foundation', description: 'Find an element in the browser document before changing it.', command: 'const heading = document.querySelector("h1");\nheading.textContent = "Ready";' },
  { page: 2, name: 'Reduce Values', category: 'intermediate', label: 'Intermediate', description: 'Fold a collection into one result with an accumulator.', command: 'const total = prices.reduce((sum, price) => sum + price, 0);' },
  { page: 2, name: 'Event Listener', category: 'intermediate', label: 'Intermediate', description: 'Respond to browser events without mixing behavior into markup.', command: 'button.addEventListener("click", () => {\n  console.log("Clicked");\n});' },
  { page: 2, name: 'Modules', category: 'intermediate', label: 'Intermediate', description: 'Share named values across files with modern module syntax.', command: 'export function formatName(name) {\n  return name.trim();\n}\n\nimport { formatName } from "./names.js";' },
  { page: 3, name: 'Abortable Fetch', category: 'advanced', label: 'Advanced', description: 'Cancel a request when a timeout or user action makes it unnecessary.', command: 'const controller = new AbortController();\nsetTimeout(() => controller.abort(), 3000);\nawait fetch(url, { signal: controller.signal });' },
  { page: 3, name: 'Streams', category: 'advanced', label: 'Advanced', description: 'Process response chunks as they arrive instead of waiting for the full body.', command: 'const reader = response.body.getReader();\nconst { value, done } = await reader.read();' },
  { page: 3, name: 'URL Parser', category: 'advanced', label: 'Advanced', description: 'Parse and modify URLs with the standard URL API.', command: 'const target = new URL("https://example.com/search?q=js");\ntarget.searchParams.set("page", "2");' },
  { page: 4, name: 'Proxy Trap', category: 'hell', label: 'Hell', description: 'Intercept object behavior and enforce rules at runtime.', command: 'const guarded = new Proxy({}, {\n  set(target, key, value) {\n    if (typeof value !== "number") throw new TypeError("Numbers only");\n    target[key] = value;\n    return true;\n  }\n});' },
  { page: 4, name: 'Generator Pipeline', category: 'hell', label: 'Hell', description: 'Build a lazy data pipeline that transforms values only when consumed.', command: 'function* double(values) {\n  for (const value of values) yield value * 2;\n}\n\nconsole.log([...double([1, 2, 3])]);' },
  { page: 4, name: 'Custom Iterator', category: 'hell', label: 'Hell', description: 'Teach an object how to participate in JavaScript iteration protocols.', command: 'const countdown = {\n  *[Symbol.iterator]() {\n    for (let value = 3; value > 0; value -= 1) yield value;\n  }\n};' },
  { page: 4, name: 'WeakMap Cache', category: 'hell', label: 'Hell', description: 'Attach metadata to objects without preventing garbage collection.', command: 'const metadata = new WeakMap();\nmetadata.set(element, { measured: true });' },
  { page: 4, name: 'Event Loop Trace', category: 'hell', label: 'Hell', description: 'Observe the ordering between synchronous work, microtasks, and timers.', command: 'console.log("sync");\nqueueMicrotask(() => console.log("microtask"));\nsetTimeout(() => console.log("timer"));' },
  { page: 4, name: 'Custom Promise', category: 'hell', label: 'Hell', description: 'Construct a promise that resolves only after a callback-driven operation finishes.', command: 'const result = new Promise((resolve, reject) => {\n  legacyApi((error, value) => error ? reject(error) : resolve(value));\n});' },
  { page: 4, name: 'Tagged Parser', category: 'hell', label: 'Hell', description: 'Interpret template literal pieces with a custom tag function.', command: 'function highlight(strings, ...values) {\n  return strings.raw.reduce((out, text, i) => out + text + (values[i] ?? ""), "");\n}' },
  { page: 4, name: 'Reflect API', category: 'hell', label: 'Hell', description: 'Perform metaprogramming operations through the standard reflection API.', command: 'Reflect.defineProperty(target, "ready", { value: true });\nconsole.log(Reflect.get(target, "ready"));' },
  { page: 4, name: 'Realm Boundary', category: 'hell', label: 'Hell', description: 'Recognize that values crossing execution contexts may have different prototypes.', command: 'const foreignArray = iframe.contentWindow.Array;\nconsole.log(value instanceof foreignArray);' },
  { page: 5, name: 'Worker Threads', category: 'uberhell', label: 'UBERHELL', description: 'Move CPU-heavy work off the main thread with a Node.js worker.', command: 'import { Worker } from "node:worker_threads";\n\nconst worker = new Worker(new URL("./worker.js", import.meta.url));\nworker.on("message", console.log);' },
  { page: 5, name: 'Async Iterator', category: 'uberhell', label: 'UBERHELL', description: 'Consume an asynchronous stream one result at a time with backpressure.', command: 'for await (const chunk of response.body) {\n  process.stdout.write(chunk);\n}' },
  { page: 5, name: 'Tagged Template', category: 'uberhell', label: 'UBERHELL', description: 'Parse template literals with a custom function before producing output.', command: 'function sql(strings, ...values) {\n  return strings.reduce((query, text, index) =>\n    `${query}${text}${values[index] ?? ""}`, "");\n}' },
  { page: 5, name: 'Reflective Metaprogramming', category: 'uberhell', label: 'UBERHELL', description: 'Combine reflection and proxies to create a fully instrumented API surface.', command: 'const traced = new Proxy(api, {\n  get(target, key, receiver) {\n    console.log("read", String(key));\n    return Reflect.get(target, key, receiver);\n  }\n});' },
  { page: 5, name: 'Shared Memory', category: 'uberhell', label: 'UBERHELL', description: 'Coordinate workers through a shared buffer and atomic operations.', command: 'const shared = new SharedArrayBuffer(16);\nconst cells = new Int32Array(shared);\nAtomics.add(cells, 0, 1);' },
  { page: 5, name: 'WebAssembly Link', category: 'uberhell', label: 'UBERHELL', description: 'Load a compiled WebAssembly module and call an exported low-level function.', command: 'const { instance } = await WebAssembly.instantiate(bytes);\nconsole.log(instance.exports.add(2, 3));' },
  { page: 5, name: 'Async Generator', category: 'uberhell', label: 'UBERHELL', description: 'Build a pull-based asynchronous stream with custom yield timing.', command: 'async function* pages() {\n  for (const page of urls) yield fetch(page);\n}\n\nfor await (const response of pages()) console.log(response.status);' },
  { page: 5, name: 'Proxy Membrane', category: 'uberhell', label: 'UBERHELL', description: 'Wrap an object graph to control every value crossing an API boundary.', command: 'const membrane = value => value && typeof value === "object"\n  ? new Proxy(value, { get: (target, key) => membrane(target[key]) })\n  : value;' },
  { page: 5, name: 'Module Loader', category: 'uberhell', label: 'UBERHELL', description: 'Customize how a runtime resolves and loads JavaScript modules.', command: 'const loader = {\n  async resolve(specifier, context, nextResolve) {\n    return nextResolve(specifier, context);\n  }\n};' }
];

const assemblyCommands = [
  { page: 1, name: 'Move Data', category: 'foundation', label: 'Foundation', description: 'Copy an immediate value into a register, the basic move of assembly programming.', command: 'mov eax, 42\nmov ebx, eax' },
  { page: 1, name: 'Add Values', category: 'foundation', label: 'Foundation', description: 'Add two register values and keep the result in the destination register.', command: 'mov eax, 7\nadd eax, 5' },
  { page: 1, name: 'Compare', category: 'foundation', label: 'Foundation', description: 'Compare values so a later jump can choose a different path.', command: 'cmp eax, ebx\nje values_equal' },
  { page: 1, name: 'Stack Basics', category: 'foundation', label: 'Foundation', description: 'Save and restore register values with the call stack.', command: 'push rax\ncall do_work\npop rax' },
  { page: 1, name: 'Labels', category: 'foundation', label: 'Foundation', description: 'Name an instruction address and jump back to it for a loop.', command: 'loop_start:\n  dec ecx\n  jnz loop_start' },
  { page: 1, name: 'Return Value', category: 'foundation', label: 'Foundation', description: 'Return a small integer from a function using the platform calling convention.', command: 'mov eax, 0\nret' },
  { page: 2, name: 'Function Call', category: 'intermediate', label: 'Intermediate', description: 'Set up a call frame and preserve registers across a reusable routine.', command: 'push rbp\nmov rbp, rsp\ncall calculate\nleave\nret' },
  { page: 2, name: 'Memory Access', category: 'intermediate', label: 'Intermediate', description: 'Read and write values through a pointer stored in a register.', command: 'mov rax, [rdi]\nadd rax, 1\nmov [rdi], rax' },
  { page: 2, name: 'Array Loop', category: 'intermediate', label: 'Intermediate', description: 'Walk through an array one element at a time with indexed addressing.', command: 'xor ecx, ecx\n.next:\n  mov eax, [rdi + rcx * 4]\n  inc ecx\n  cmp ecx, esi\n  jl .next' },
  { page: 2, name: 'Bit Mask', category: 'intermediate', label: 'Intermediate', description: 'Use bitwise operations to inspect and change individual flags.', command: 'test eax, 1\njnz odd_number\nor eax, 0x80' },
  { page: 2, name: 'System Call', category: 'intermediate', label: 'Intermediate', description: 'Request a kernel service directly through the Linux x86-64 syscall interface.', command: 'mov eax, 60\nxor edi, edi\nsyscall' },
  { page: 2, name: 'Struct Fields', category: 'intermediate', label: 'Intermediate', description: 'Reach fields inside a packed record by adding known byte offsets.', command: 'mov rax, [rdi + 8]\nmov word [rdi + 16], 1' },
  { page: 3, name: 'Calling Convention', category: 'advanced', label: 'Advanced', description: 'Pass arguments in registers and return a result without unnecessary memory traffic.', command: 'mov rax, rdi\nadd rax, rsi\nret' },
  { page: 3, name: 'SIMD Addition', category: 'advanced', label: 'Advanced', description: 'Process multiple numeric values at once with vector registers.', command: 'movups xmm0, [rdi]\naddps xmm0, [rsi]\nmovups [rdx], xmm0' },
  { page: 3, name: 'Atomic Increment', category: 'advanced', label: 'Advanced', description: 'Update shared memory safely when multiple threads can touch the same counter.', command: 'lock inc dword [counter]\nret' },
  { page: 3, name: 'Position Independent', category: 'advanced', label: 'Advanced', description: 'Reference nearby data without hard-coding an absolute address.', command: 'lea rdi, [rip + message]\ncall puts' },
  { page: 3, name: 'Inline Assembly', category: 'advanced', label: 'Advanced', description: 'Expose a precise machine instruction inside a higher-level program.', command: '__asm__ volatile ("rdtsc" : "=a" (low), "=d" (high));' },
  { page: 3, name: 'Interrupt Table', category: 'advanced', label: 'Advanced', description: 'Understand the low-level entry point used to route processor exceptions.', command: 'lidt [idtr]\nsti\nret' },
  { page: 1, name: 'Zero Register', category: 'foundation', label: 'Foundation', description: 'Clear a register using the compact XOR idiom.', command: 'xor eax, eax' },
  { page: 1, name: 'Load Address', category: 'foundation', label: 'Foundation', description: 'Place the address of a label into a register without reading its contents.', command: 'lea rdi, [message]' },
  { page: 1, name: 'Conditional Jump', category: 'foundation', label: 'Foundation', description: 'Branch when a comparison sets the requested processor flag.', command: 'cmp eax, 0\nje is_zero' },
  { page: 2, name: 'Register Save', category: 'intermediate', label: 'Intermediate', description: 'Preserve a callee-saved register across a function call.', command: 'push rbx\ncall worker\npop rbx' },
  { page: 2, name: 'Pointer Offset', category: 'intermediate', label: 'Intermediate', description: 'Address a field by combining a base pointer with a byte offset.', command: 'mov eax, [rdi + 12]' },
  { page: 2, name: 'Signed Branch', category: 'intermediate', label: 'Intermediate', description: 'Use signed comparison flags to choose a branch for integer values.', command: 'cmp eax, ebx\n jl less_than' },
  { page: 3, name: 'Jump Table', category: 'advanced', label: 'Advanced', description: 'Dispatch to one of several code paths through an indexed table.', command: 'movsxd rax, dword [table + rdi * 4]\nadd rax, table\njmp rax' },
  { page: 3, name: 'Cache Hint', category: 'advanced', label: 'Advanced', description: 'Give the processor a hint about a memory line that will be used soon.', command: 'prefetchnta [rdi + 64]' },
  { page: 3, name: 'Rotate Bits', category: 'advanced', label: 'Advanced', description: 'Rotate bits through a register for compact hashing or bit mixing.', command: 'rol rax, 13\nxor rax, rbx' },
  { page: 4, name: 'Descriptor Table', category: 'hell', label: 'Hell', description: 'Load a protected-mode descriptor table used by the processor.', command: 'lgdt [gdt_descriptor]\nmov eax, cr0\nor eax, 1\nmov cr0, eax' },
  { page: 4, name: 'Stack Unwind', category: 'hell', label: 'Hell', description: 'Read frame metadata to reconstruct a call chain during debugging.', command: 'mov rbp, [rbp]\nmov rax, [rbp + 8]' },
  { page: 4, name: 'Self Modifying Code', category: 'hell', label: 'Hell', description: 'Rewrite executable bytes and synchronize instruction fetch deliberately.', command: 'mov byte [patch_site], 0xC3\nclflush [patch_site]' },
  { page: 4, name: 'Page Permissions', category: 'hell', label: 'Hell', description: 'Change virtual-memory permissions before executing generated bytes.', command: 'mov eax, 10\nsyscall\n; mprotect(page, size, PROT_READ | PROT_EXEC)' },
  { page: 4, name: 'Hardware Breakpoint', category: 'hell', label: 'Hell', description: 'Configure a debug register to trap access to a watched address.', command: 'mov dr0, rax\nmov dr7, 1' },
  { page: 4, name: 'Control Register', category: 'hell', label: 'Hell', description: 'Inspect privileged processor state from a kernel or hypervisor context.', command: 'mov rax, cr3\nmov [saved_page_table], rax' },
  { page: 4, name: 'Atomic Compare', category: 'hell', label: 'Hell', description: 'Implement a lock-free update with compare-and-exchange.', command: 'mov rax, expected\nlock cmpxchg [address], rbx\njnz retry' },
  { page: 4, name: 'TLB Invalidate', category: 'hell', label: 'Hell', description: 'Invalidate a translated address after changing page-table state.', command: 'invlpg [rdi]' },
  { page: 4, name: 'Interrupt Return', category: 'hell', label: 'Hell', description: 'Return from a low-level interrupt after restoring processor state.', command: 'pop rax\npop rcx\npop rflags\niretq' },
  { page: 5, name: 'Context Switch', category: 'uberhell', label: 'UBERHELL', description: 'Save one execution context and restore another during a scheduler switch.', command: 'fxsave [old_state]\nfxrstor [new_state]\nmov rsp, [next_stack]' },
  { page: 5, name: 'Virtual Machine Exit', category: 'uberhell', label: 'UBERHELL', description: 'Enter and handle a hardware virtualization transition.', command: 'vmrun\nvmexit_handler:\n  vmread rax, VM_EXIT_REASON' },
  { page: 5, name: 'Page Table Walk', category: 'uberhell', label: 'UBERHELL', description: 'Translate a virtual address by manually walking x86-64 page-table levels.', command: 'mov rax, cr3\nshr rdi, 39\nand rdi, 0x1ff\nmov rax, [rax + rdi * 8]' },
  { page: 5, name: 'APIC Interrupt', category: 'uberhell', label: 'UBERHELL', description: 'Program a local interrupt controller to signal another processor core.', command: 'mov dword [lapic_base + ICR_LOW], 0x4000\nmov dword [lapic_base + ICR_HIGH], edi' },
  { page: 5, name: 'Speculation Barrier', category: 'uberhell', label: 'UBERHELL', description: 'Prevent later instructions from passing a security-sensitive branch.', command: 'cmp rax, limit\njae denied\nlfence\nmov rbx, [base + rax]' },
  { page: 5, name: 'Ring Transition', category: 'uberhell', label: 'UBERHELL', description: 'Understand the stack and segment transition involved in entering a kernel.', command: 'syscall\n; kernel entry saves RCX and R11\nsysretq' },
  { page: 5, name: 'Lock-Free Queue', category: 'uberhell', label: 'UBERHELL', description: 'Coordinate producers and consumers with atomic ring-buffer indexes.', command: 'mov eax, [tail]\nlock cmpxchg [tail], ebx\njnz retry_enqueue' },
  { page: 5, name: 'Vector Reduction', category: 'uberhell', label: 'UBERHELL', description: 'Reduce packed vector lanes into one scalar result with SIMD instructions.', command: 'vaddps ymm0, ymm0, ymm1\nvextractf128 xmm1, ymm0, 1\naddps xmm0, xmm1' },
  { page: 5, name: 'Boot Entry', category: 'uberhell', label: 'UBERHELL', description: 'Start execution at the earliest handoff point of a tiny boot environment.', command: 'bits 16\ncli\nxor ax, ax\nmov ds, ax\njmp protected_mode' }
];

const cssCommands = [
  { page: 1, name: 'Color', category: 'foundation', label: 'Foundation', description: 'Set a readable foreground color on an element.', command: 'color: #caff54;' },
  { page: 1, name: 'Background', category: 'foundation', label: 'Foundation', description: 'Give a component a solid background color.', command: 'background-color: #05060a;' },
  { page: 1, name: 'Font Size', category: 'foundation', label: 'Foundation', description: 'Control how large text appears in a component.', command: 'font-size: 1rem;' },
  { page: 1, name: 'Spacing', category: 'foundation', label: 'Foundation', description: 'Add consistent inner space around content.', command: 'padding: 1.25rem;' },
  { page: 1, name: 'Border', category: 'foundation', label: 'Foundation', description: 'Draw a visible edge around a panel.', command: 'border: 1px solid #46f6ff;' },
  { page: 1, name: 'Selector', category: 'foundation', label: 'Foundation', description: 'Target every button inside a toolbar.', command: '.toolbar button {\n  cursor: pointer;\n}' },
  { page: 1, name: 'Hover State', category: 'foundation', label: 'Foundation', description: 'Change a link when a pointer moves over it.', command: 'a:hover {\n  color: hotpink;\n}' },
  { page: 1, name: 'Inheritance', category: 'foundation', label: 'Foundation', description: 'Set a text rule that child elements can inherit.', command: 'body {\n  font-family: monospace;\n}' },
  { page: 1, name: 'Custom Property', category: 'foundation', label: 'Foundation', description: 'Store a reusable design value on the root element.', command: ':root {\n  --accent: #46f6ff;\n}' },
  { page: 2, name: 'Flex Row', category: 'intermediate', label: 'Intermediate', description: 'Place items in a row and distribute the available space.', command: '.nav {\n  display: flex;\n  justify-content: space-between;\n}' },
  { page: 2, name: 'Grid Columns', category: 'intermediate', label: 'Intermediate', description: 'Create equal responsive tracks for repeated content.', command: '.cards {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}' },
  { page: 2, name: 'Media Query', category: 'intermediate', label: 'Intermediate', description: 'Change layout rules when the viewport becomes narrow.', command: '@media (max-width: 40rem) {\n  .cards { grid-template-columns: 1fr; }\n}' },
  { page: 2, name: 'Positioning', category: 'intermediate', label: 'Intermediate', description: 'Anchor a badge to the corner of a positioned card.', command: '.card { position: relative; }\n.badge { position: absolute; inset: 1rem 1rem auto auto; }' },
  { page: 2, name: 'Object Fit', category: 'intermediate', label: 'Intermediate', description: 'Keep an image inside its box without distorting it.', command: 'img {\n  width: 100%;\n  object-fit: cover;\n}' },
  { page: 2, name: 'Transition', category: 'intermediate', label: 'Intermediate', description: 'Smooth a color change between interactive states.', command: 'button {\n  transition: background-color 180ms ease;\n}' },
  { page: 2, name: 'Focus Ring', category: 'intermediate', label: 'Intermediate', description: 'Make keyboard focus visible without removing browser access cues.', command: ':focus-visible {\n  outline: 2px solid var(--accent);\n  outline-offset: 3px;\n}' },
  { page: 2, name: 'Clamp Size', category: 'intermediate', label: 'Intermediate', description: 'Keep a value fluid while enforcing useful minimum and maximum bounds.', command: 'font-size: clamp(1.2rem, 4vw, 3rem);' },
  { page: 2, name: 'Aspect Ratio', category: 'intermediate', label: 'Intermediate', description: 'Reserve a stable shape for a responsive media tile.', command: '.preview {\n  aspect-ratio: 16 / 9;\n}' },
  { page: 3, name: 'Grid Area', category: 'advanced', label: 'Advanced', description: 'Name grid regions so the layout reads like a page map.', command: '.layout {\n  grid-template-areas: "nav main" "nav aside";\n}' },
  { page: 3, name: 'Container Query', category: 'advanced', label: 'Advanced', description: 'Adapt a component to its container instead of the whole viewport.', command: '.card-list { container-type: inline-size; }\n@container (min-width: 30rem) { .card { grid-column: span 2; } }' },
  { page: 3, name: 'Subgrid', category: 'advanced', label: 'Advanced', description: 'Align nested cards to the track sizing of their parent grid.', command: '.card {\n  display: grid;\n  grid-template-rows: subgrid;\n}' },
  { page: 3, name: 'Layer', category: 'advanced', label: 'Advanced', description: 'Control cascade precedence with an explicit style layer.', command: '@layer reset, components, utilities;\n@layer components { .button { color: white; } }' },
  { page: 3, name: 'Color Mix', category: 'advanced', label: 'Advanced', description: 'Blend an accent with transparency using modern color functions.', command: 'background: color-mix(in srgb, var(--accent) 20%, transparent);' },
  { page: 3, name: 'Scroll Snap', category: 'advanced', label: 'Advanced', description: 'Make a horizontal scroller settle cleanly on each item.', command: '.rail {\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n}\n.rail > * { scroll-snap-align: start; }' },
  { page: 3, name: 'Mask', category: 'advanced', label: 'Advanced', description: 'Reveal a shape by masking part of an element.', command: '.glow {\n  mask-image: linear-gradient(90deg, black, transparent);\n}' },
  { page: 3, name: 'Motion Preference', category: 'advanced', label: 'Advanced', description: 'Reduce animation for users who request less motion.', command: '@media (prefers-reduced-motion: reduce) {\n  *, *::before { animation-duration: .01ms; }\n}' },
  { page: 3, name: 'Logical Properties', category: 'advanced', label: 'Advanced', description: 'Write direction-aware spacing rules that work in different writing modes.', command: '.panel {\n  margin-inline: auto;\n  padding-block: 1rem;\n}' },
  { page: 4, name: 'Has Selector', category: 'hell', label: 'Hell', description: 'Style a parent based on whether it contains a matching descendant.', command: '.card:has(.warning) {\n  border-color: red;\n}' },
  { page: 4, name: 'Cascade Scope', category: 'hell', label: 'Hell', description: 'Limit a component rule to a controlled subtree.', command: '@scope (.profile) {\n  :scope .name { font-weight: 700; }\n}' },
  { page: 4, name: 'Custom Counter', category: 'hell', label: 'Hell', description: 'Generate numbered UI labels from CSS counters.', command: '.steps { counter-reset: step; }\n.step::before { counter-increment: step; content: counter(step); }' },
  { page: 4, name: 'Anchor Position', category: 'hell', label: 'Hell', description: 'Position a floating element relative to an anchor without script measurements.', command: '.trigger { anchor-name: --trigger; }\n.popover { position-anchor: --trigger; position-area: block-end; }' },
  { page: 4, name: 'Scroll Timeline', category: 'hell', label: 'Hell', description: 'Drive an animation from scroll progress instead of elapsed time.', command: '.page { scroll-timeline-name: --page-scroll; }\n.progress { animation-timeline: --page-scroll; }' },
  { page: 4, name: 'View Transition', category: 'hell', label: 'Hell', description: 'Assign a shared transition name for browser-rendered page changes.', command: '.avatar { view-transition-name: avatar; }\n::view-transition-old(avatar) { animation: fade-out .2s; }' },
  { page: 4, name: 'Registered Property', category: 'hell', label: 'Hell', description: 'Register a custom property so the browser can interpolate it correctly.', command: '@property --progress {\n  syntax: "<number>";\n  initial-value: 0;\n  inherits: false;\n}' },
  { page: 4, name: 'Blend Mode', category: 'hell', label: 'Hell', description: 'Blend a foreground layer with the pixels behind it.', command: '.scanline {\n  mix-blend-mode: screen;\n}' },
  { page: 4, name: 'Perspective', category: 'hell', label: 'Hell', description: 'Create a three-dimensional transform context for nested elements.', command: '.scene {\n  perspective: 800px;\n}\n.card { transform: rotateY(18deg); }' },
  { page: 5, name: 'Typed OM', category: 'uberhell', label: 'UBERHELL', description: 'Use the browser\'s typed CSS object model for structured style values.', command: 'const width = CSS.px(240);\nelement.attributeStyleMap.set("width", width);' },
  { page: 5, name: 'Houdini Paint', category: 'uberhell', label: 'UBERHELL', description: 'Register a custom paint worklet that draws into a CSS background.', command: 'CSS.paintWorklet.addModule("paint.js");\n.card { background-image: paint(noise); }' },
  { page: 5, name: 'Style Query', category: 'uberhell', label: 'UBERHELL', description: 'Use container style queries to respond to custom property state.', command: '.panel { container-type: style; }\n@container style(--mode: compact) { .label { display: none; } }' },
  { page: 5, name: 'Scroll Driven View', category: 'uberhell', label: 'UBERHELL', description: 'Tie a visual effect to an element entering and leaving the viewport.', command: '.hero {\n  animation: reveal linear both;\n  animation-timeline: view();\n}' },
  { page: 5, name: '3D Preserve', category: 'uberhell', label: 'UBERHELL', description: 'Keep transformed descendants in a shared three-dimensional space.', command: '.cube {\n  transform-style: preserve-3d;\n  transform: rotateX(30deg) rotateY(45deg);\n}' },
  { page: 5, name: 'Backdrop Filter', category: 'uberhell', label: 'UBERHELL', description: 'Process the pixels behind a translucent interface surface.', command: '.glass {\n  background: rgb(0 0 0 / 30%);\n  backdrop-filter: blur(18px) saturate(140%);\n}' },
  { page: 5, name: 'Variable Font Axes', category: 'uberhell', label: 'UBERHELL', description: 'Drive a variable font axis directly from a custom CSS value.', command: '.headline {\n  font-variation-settings: "wght" 720, "wdth" 90;\n}' },
  { page: 5, name: 'Cascade Debug', category: 'uberhell', label: 'UBERHELL', description: 'Combine layers, scope, and importance deliberately when the cascade gets hostile.', command: '@layer reset, base, components, utilities;\n@layer utilities { .force { color: red !important; } }' },
  { page: 5, name: 'Layout Containment', category: 'uberhell', label: 'UBERHELL', description: 'Isolate layout and paint effects so a component can render independently.', command: '.widget {\n  contain: layout paint;\n  content-visibility: auto;\n}' }
];

const grid = document.querySelector('#command-grid');
const search = document.querySelector('#command-search');
const filters = document.querySelector('#filters');
const emptyState = document.querySelector('#empty-state');
const resultCount = document.querySelector('#result-count');
const pageNote = document.querySelector('#page-note');
const pageButtons = document.querySelector('#page-buttons');
const libraryTitle = document.querySelector('#library-title');
const cmdMode = document.querySelector('#cmd-mode');
const pythonMode = document.querySelector('#python-mode');
const javascriptMode = document.querySelector('#javascript-mode');
const assemblyMode = document.querySelector('#assembly-mode');
const cssMode = document.querySelector('#css-mode');
const toolkitOptions = document.querySelector('#toolkit-options');
const toolkitToggle = document.querySelector('#toolkit-toggle');
const themeOptions = document.querySelector('#theme-options');
const themeToggle = document.querySelector('#theme-toggle');
const silverAudio = document.querySelector('#silver-audio');
const silverSurferPlayer = document.querySelector('#silver-surfer-player');
const matrixCanvas = document.querySelector('#matrix-rain');
const matrixContext = matrixCanvas.getContext('2d');
const glitchCanvas = document.querySelector('#glitch-background');
const glitchContext = glitchCanvas.getContext('2d');
const humanoidHitTarget = document.querySelector('#humanoid-hit-target');
const jojoThemeButton = document.querySelector('#jojo-theme-button');
const mahoragaThemeButton = document.querySelector('#mahoraga-theme-button');
const mahoragaEvent = document.querySelector('#mahoraga-event');
const rickStream = document.querySelector('#rick-stream');
const futureCity = document.querySelector('#future-city');
let activeFilter = 'all';
let activePage = 1;
let activeMode = 'cmd';
const pageNames = {
  1: 'Foundations / everyday inspection',
  2: 'Operator / diagnostics and pipelines',
  3: 'Advanced / remote and analytical work'
};
const pythonPageNames = {
  1: 'Beginner / syntax and data',
  2: 'Intermediate / reusable programs',
  3: 'Advanced / automation and systems',
  4: 'Hell / runtime wizardry',
  5: 'UBERHELL / language machinery'
};
const javascriptPageNames = {
  1: 'Beginner / syntax and data',
  2: 'Intermediate / reusable programs',
  3: 'Advanced / automation and systems',
  4: 'Hell / runtime wizardry',
  5: 'UBERHELL / language machinery'
};
const assemblyPageNames = {
  1: 'Beginner / registers and control flow',
  2: 'Intermediate / memory and functions',
  3: 'Advanced / systems and performance',
  4: 'Hell / privileged instructions',
  5: 'UBERHELL / processor architecture'
};
const cssPageNames = {
  1: 'Beginner / selectors and styling',
  2: 'Intermediate / layout and responsive design',
  3: 'Advanced / modern CSS systems',
  4: 'Hell / browser sorcery',
  5: 'UBERHELL / rendering machinery'
};
const filterNames = {
  cmd: { all: 'All', discover: 'Discover', files: 'Files', network: 'Network', automate: 'Automate' },
  python: { all: 'All', foundation: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', hell: 'Hell', uberhell: 'UBERHELL' },
  javascript: { all: 'All', foundation: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', hell: 'Hell', uberhell: 'UBERHELL' },
  assembly: { all: 'All', foundation: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', hell: 'Hell', uberhell: 'UBERHELL' },
  css: { all: 'All', foundation: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', hell: 'Hell', uberhell: 'UBERHELL' }
};
const filterKeys = {
  cmd: ['all', 'discover', 'files', 'network', 'automate'],
  python: ['all', 'foundation', 'intermediate', 'advanced', 'hell', 'uberhell'],
  javascript: ['all', 'foundation', 'intermediate', 'advanced', 'hell', 'uberhell'],
  assembly: ['all', 'foundation', 'intermediate', 'advanced', 'hell', 'uberhell'],
  css: ['all', 'foundation', 'intermediate', 'advanced', 'hell', 'uberhell']
};
const pageCounts = { cmd: 3, python: 5, javascript: 5, assembly: 5, css: 5 };
let matrixAnimation;
let glitchAnimation;
let rickAnimation;
let rickFrames = [];
let rickFrameIndex = 0;
let cityScrollFrame;
const savedTheme = localStorage.getItem('cmd-library-theme') || 'default';
let jojoUnlocked = localStorage.getItem('cmd-library-jojo-unlocked') === 'true';
let mahoragaUnlocked = localStorage.getItem('cmd-library-mahoraga-unlocked') === 'true'
  && savedTheme === 'mahoraga';
const shouldResetJojoOnRefresh = jojoUnlocked && ['jojo', 'greyscale'].includes(savedTheme);

function setJojoUnlocked(isUnlocked) {
  jojoUnlocked = isUnlocked;
  document.documentElement.classList.toggle('jojo-unlocked', isUnlocked);
  jojoThemeButton.hidden = !isUnlocked;
  if (isUnlocked) localStorage.setItem('cmd-library-jojo-unlocked', 'true');
  else localStorage.removeItem('cmd-library-jojo-unlocked');
}

function setMahoragaUnlocked(isUnlocked) {
  mahoragaUnlocked = isUnlocked;
  document.documentElement.classList.toggle('mahoraga-unlocked', isUnlocked);
  mahoragaThemeButton.hidden = !isUnlocked;
  if (isUnlocked) localStorage.setItem('cmd-library-mahoraga-unlocked', 'true');
  else localStorage.removeItem('cmd-library-mahoraga-unlocked');
}

function summonMahoraga() {
  setMahoragaUnlocked(true);
  mahoragaEvent.classList.remove('is-active');
  void mahoragaEvent.offsetWidth;
  mahoragaEvent.classList.add('is-active');
  window.setTimeout(() => mahoragaEvent.classList.remove('is-active'), 7000);
}

async function loadRickStream() {
  try {
    const response = await fetch('assets/rick-ascii-stream.txt');
    const stream = await response.text();
    rickFrames = stream.split('\x1b[2J\x1b[H').map((frame) => frame.trim()).filter(Boolean);
    if (rickFrames.length) rickStream.textContent = rickFrames[0];
  } catch {
    rickStream.textContent = 'curl ascii.live/rick';
  }
}

function setRickState(isActive) {
  if (isActive && !rickAnimation && rickFrames.length) {
    rickAnimation = window.setInterval(() => {
      rickFrameIndex = (rickFrameIndex + 1) % rickFrames.length;
      rickStream.textContent = rickFrames[rickFrameIndex];
    }, 90);
  }
  if (!isActive && rickAnimation) {
    clearInterval(rickAnimation);
    rickAnimation = undefined;
  }
}

function updateFutureCity() {
  cityScrollFrame = undefined;
  futureCity.style.setProperty('--city-scroll', `${window.scrollY * -.22}px`);
}

window.addEventListener('scroll', () => {
  if (!cityScrollFrame) cityScrollFrame = requestAnimationFrame(updateFutureCity);
}, { passive: true });

function resizeMatrix() {
  const ratio = window.devicePixelRatio || 1;
  matrixCanvas.width = window.innerWidth * ratio;
  matrixCanvas.height = window.innerHeight * ratio;
  matrixContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawMatrix() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  matrixContext.fillStyle = 'rgba(2, 11, 5, .11)';
  matrixContext.fillRect(0, 0, width, height);
  matrixContext.font = '13px Fira Code, monospace';
  matrixColumns.forEach((column, index) => {
    column.drops.forEach((drop, dropIndex) => {
      const character = Math.random() > .5 ? '1' : '0';
      matrixContext.fillStyle = (index + dropIndex) % 11 === 0 ? '#d8ffd8' : '#55ff70';
      matrixContext.fillText(character, index * matrixColumnWidth, drop.y);
      drop.y += drop.speed;
      if (drop.y > height + 20) drop.y = -Math.random() * height;
    });
  });
  matrixAnimation = requestAnimationFrame(drawMatrix);
}

const matrixColumnWidth = 20;
const matrixDropsPerLane = 10;
const matrixColumns = Array.from({ length: Math.ceil(window.innerWidth / matrixColumnWidth) }, () => ({
  drops: Array.from({ length: matrixDropsPerLane }, () => ({
    y: -Math.random() * window.innerHeight,
    speed: 1.5 + Math.random() * 3
  }))
}));

function setMatrixState(isActive) {
  if (isActive && !matrixAnimation) drawMatrix();
  if (!isActive && matrixAnimation) {
    cancelAnimationFrame(matrixAnimation);
    matrixAnimation = undefined;
    matrixContext.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  }
}

function resizeGlitch() {
  const ratio = window.devicePixelRatio || 1;
  glitchCanvas.width = window.innerWidth * ratio;
  glitchCanvas.height = window.innerHeight * ratio;
  glitchContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawGlitch(time = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const phase = time / 1000;
  glitchContext.clearRect(0, 0, width, height);

  for (let index = 0; index < 900; index += 1) {
    const shade = 80 + Math.floor(Math.random() * 150);
    glitchContext.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${Math.random() * .18})`;
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() > .92 ? 3 : 1;
    glitchContext.fillRect(x, y, size + Math.random() * 4, size);
  }

  glitchContext.fillStyle = 'rgba(255, 255, 255, .045)';
  for (let y = (phase * 38) % 8; y < height; y += 8) glitchContext.fillRect(0, y, width, 1);

  const scale = Math.min(width, height) / 650;
  const figureX = width * .72 + Math.sin(phase * 2.1) * 5;
  const figureY = height * .51;
  const jitter = () => (Math.random() - .5) * 7;
  glitchContext.lineWidth = Math.max(1, scale * 1.3);
  glitchContext.strokeStyle = 'rgba(235, 235, 235, .23)';
  glitchContext.shadowColor = 'rgba(255, 255, 255, .2)';
  glitchContext.shadowBlur = 7;

  const line = (points) => {
    glitchContext.beginPath();
    points.forEach(([x, y], index) => {
      const shiftedX = figureX + x * scale + jitter();
      const shiftedY = figureY + y * scale + jitter();
      if (Math.random() < .13) return;
      if (index === 0) glitchContext.moveTo(shiftedX, shiftedY);
      else glitchContext.lineTo(shiftedX, shiftedY);
    });
    glitchContext.stroke();
  };

  glitchContext.beginPath();
  glitchContext.arc(figureX + jitter(), figureY - 160 * scale + jitter(), 35 * scale, 0, Math.PI * 2);
  glitchContext.stroke();
  line([[-35, -120], [-72, -92], [-87, 0], [-68, 105]]);
  line([[35, -120], [72, -92], [87, 0], [68, 105]]);
  line([[-35, -120], [-15, -135], [15, -135], [35, -120], [44, 50], [31, 155]]);
  line([[-35, -120], [-44, 50], [-31, 155]]);
  line([[-35, -120], [-105, -45], [-135, 40]]);
  line([[35, -120], [105, -45], [135, 40]]);
  glitchContext.shadowBlur = 0;
  glitchAnimation = requestAnimationFrame(drawGlitch);
}

function setGlitchState(isActive) {
  if (isActive && !glitchAnimation) drawGlitch();
  if (!isActive && glitchAnimation) {
    cancelAnimationFrame(glitchAnimation);
    glitchAnimation = undefined;
    glitchContext.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeOptions.querySelectorAll('[data-theme]').forEach((button) => {
    const isActive = button.dataset.theme === theme;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  localStorage.setItem('cmd-library-theme', theme);
  setMatrixState(theme === 'matrix');
  setGlitchState(theme === 'greyscale');
  setRickState(theme === 'default');
  silverAudio.hidden = theme !== 'silversurfer';
}

function setThemeListOpen(isOpen) {
  themeOptions.hidden = !isOpen;
  themeToggle.setAttribute('aria-expanded', String(isOpen));
}

function sendYouTubeCommand(command) {
  silverSurferPlayer.contentWindow.postMessage(JSON.stringify({
    event: 'command',
    func: command,
    args: []
  }), '*');
}

function pointIsNearSegment(pointX, pointY, startX, startY, endX, endY, distance) {
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;
  const progress = lengthSquared === 0
    ? 0
    : Math.max(0, Math.min(1, ((pointX - startX) * segmentX + (pointY - startY) * segmentY) / lengthSquared));
  const closestX = startX + progress * segmentX;
  const closestY = startY + progress * segmentY;
  return Math.hypot(pointX - closestX, pointY - closestY) <= distance;
}

function pointIsOnHumanoid(pointX, pointY) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = Math.min(width, height) / 650;
  const phase = performance.now() / 1000;
  const figureX = width * .72 + Math.sin(phase * 2.1) * 5;
  const figureY = height * .51;
  const hitDistance = Math.max(12, 16 * scale);
  const points = [
    [-35, -120, -72, -92],
    [-72, -92, -87, 0],
    [-87, 0, -68, 105],
    [35, -120, 72, -92],
    [72, -92, 87, 0],
    [87, 0, 68, 105],
    [-35, -120, -15, -135],
    [-15, -135, 15, -135],
    [15, -135, 35, -120],
    [35, -120, 44, 50],
    [44, 50, 31, 155],
    [-35, -120, -44, 50],
    [-44, 50, -31, 155],
    [-35, -120, -105, -45],
    [-105, -45, -135, 40],
    [35, -120, 105, -45],
    [105, -45, 135, 40]
  ];
  const nearBody = points.some(([startX, startY, endX, endY]) => pointIsNearSegment(
    pointX,
    pointY,
    figureX + startX * scale,
    figureY + startY * scale,
    figureX + endX * scale,
    figureY + endY * scale,
    hitDistance
  ));
  const headDistance = Math.hypot(pointX - figureX, pointY - (figureY - 160 * scale));
  return nearBody || headDistance <= 35 * scale + hitDistance;
}

glitchCanvas.addEventListener('click', (event) => {
  if (document.documentElement.dataset.theme !== 'greyscale' || jojoUnlocked) return;
  const bounds = glitchCanvas.getBoundingClientRect();
  const pointX = event.clientX - bounds.left;
  const pointY = event.clientY - bounds.top;
  if (!pointIsOnHumanoid(pointX, pointY)) return;
  setJojoUnlocked(true);
});

humanoidHitTarget.addEventListener('click', () => {
  if (document.documentElement.dataset.theme === 'greyscale') setJojoUnlocked(true);
});

window.addEventListener('pagehide', () => setJojoUnlocked(false));

function render() {
  const query = search.value.trim().toLowerCase();
  const currentCommands = activeMode === 'cmd'
    ? commands
    : activeMode === 'python' ? pythonCommands
      : activeMode === 'javascript' ? javascriptCommands
        : activeMode === 'assembly' ? assemblyCommands : cssCommands;
  const currentPageNames = activeMode === 'cmd'
    ? pageNames
    : activeMode === 'python' ? pythonPageNames
      : activeMode === 'javascript' ? javascriptPageNames
        : activeMode === 'assembly' ? assemblyPageNames : cssPageNames;
  const pageCommands = currentCommands.filter((item) => item.page === activePage);
  filters.querySelectorAll('.filter-button').forEach((button, index) => {
    const filter = filterKeys[activeMode][index];
    button.hidden = !filter;
    if (!filter) return;
    button.dataset.filter = filter;
    const count = filter === 'all'
      ? pageCommands.length
      : pageCommands.filter((item) => item.category === filter).length;
    button.innerHTML = `${filterNames[activeMode][filter]} <span>${count}</span>`;
    button.classList.toggle('is-active', filter === activeFilter);
  });
  const visible = pageCommands.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const searchable = `${item.name} ${item.label} ${item.description} ${item.command}`.toLowerCase();
    return matchesFilter && searchable.includes(query);
  });

  const isMahoragaQuery = query === 'mahoraga';
  resultCount.textContent = String(isMahoragaQuery ? 1 : visible.length).padStart(2, '0');
  emptyState.hidden = isMahoragaQuery || visible.length > 0;
  pageNote.textContent = currentPageNames[activePage];
  pageButtons.innerHTML = Array.from({ length: pageCounts[activeMode] }, (_, index) => index + 1).map((page) => `
    <button class="page-button${page === activePage ? ' is-active' : ''}" data-page="${page}" type="button" aria-current="${page === activePage ? 'page' : 'false'}">
      <span>0${page}</span>${currentPageNames[page].split(' / ')[0]}
    </button>
  `).join('');
  grid.innerHTML = isMahoragaQuery ? `
    <article class="command-card mahoraga-card">
      <div class="card-top"><span class="tag">SECRET</span><span class="card-number">00</span></div>
      <h3>With this treasure I summon...</h3>
      <p>A hidden signal answers from inside the command index.</p>
      <button class="mahoraga-summon" type="button">SUMMON MAHORAGA</button>
    </article>
  ` : visible.map((item, index) => `
    <article class="command-card">
      <div class="card-top"><span class="tag">${item.label}</span><span class="card-number">${String(index + 1).padStart(2, '0')}</span></div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="command-line"><span>${item.command}</span><button class="copy-button" type="button" data-command="${encodeURIComponent(item.command)}">COPY</button></div>
    </article>
  `).join('');
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  activePage = 1;
  filters.querySelectorAll('.filter-button').forEach((item) => item.classList.toggle('is-active', item === button));
  render();
});
function setCommandMode(mode) {
  activeMode = mode;
  activeFilter = 'all';
  activePage = 1;
  const modes = { cmd: cmdMode, python: pythonMode, javascript: javascriptMode, assembly: assemblyMode, css: cssMode };
  Object.entries(modes).forEach(([name, button]) => {
    const isActive = name === mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  libraryTitle.textContent = mode === 'cmd'
    ? 'The standard-user toolkit'
    : `The ${mode === 'python' ? 'Python' : mode === 'javascript' ? 'JavaScript' : mode === 'assembly' ? 'Assembly' : 'CSS'} code toolkit`;
  search.placeholder = mode === 'cmd'
    ? 'Try: network, process, files...'
    : mode === 'assembly' ? 'Try: registers, memory, loops...'
      : mode === 'css' ? 'Try: layout, grid, animation...' : 'Try: arrays, files, async...';
  render();
  toolkitToggle.textContent = mode === 'cmd'
    ? 'CMD' : mode === 'python' ? 'Python' : mode === 'javascript' ? 'JavaScript' : mode === 'assembly' ? 'Assembly' : 'CSS';
  toolkitOptions.hidden = true;
  toolkitToggle.setAttribute('aria-expanded', 'false');
}

cmdMode.addEventListener('click', () => setCommandMode('cmd'));
pythonMode.addEventListener('click', () => setCommandMode('python'));
javascriptMode.addEventListener('click', () => setCommandMode('javascript'));
assemblyMode.addEventListener('click', () => setCommandMode('assembly'));
cssMode.addEventListener('click', () => setCommandMode('css'));

toolkitToggle.addEventListener('click', () => {
  const isOpen = toolkitOptions.hidden;
  toolkitOptions.hidden = !isOpen;
  toolkitToggle.setAttribute('aria-expanded', String(isOpen));
});

pageButtons.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page]');
  if (!button) return;
  activePage = Number(button.dataset.page);
  render();
  document.querySelector('.library-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
search.addEventListener('input', render);
grid.addEventListener('click', (event) => {
  if (event.target.closest('.mahoraga-card')) summonMahoraga();
});
grid.addEventListener('click', async (event) => {
  const button = event.target.closest('.copy-button');
  if (!button) return;
  const command = decodeURIComponent(button.dataset.command);
  try {
    await navigator.clipboard.writeText(command);
    button.textContent = 'COPIED';
    setTimeout(() => { button.textContent = 'COPY'; }, 1300);
  } catch {
    button.textContent = 'SELECT';
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});

themeOptions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-theme]');
  if (!button) return;
  setTheme(button.dataset.theme);
  setThemeListOpen(false);
});

themeToggle.addEventListener('click', () => {
  setThemeListOpen(themeOptions.hidden);
});

document.querySelector('#audio-play').addEventListener('click', () => sendYouTubeCommand('playVideo'));
document.querySelector('#audio-pause').addEventListener('click', () => sendYouTubeCommand('pauseVideo'));
document.querySelector('#audio-stop').addEventListener('click', () => sendYouTubeCommand('stopVideo'));

render();
setJojoUnlocked(shouldResetJojoOnRefresh ? false : jojoUnlocked);
setMahoragaUnlocked(mahoragaUnlocked);
setTheme(shouldResetJojoOnRefresh ? 'default' : savedTheme);
setThemeListOpen(false);
loadRickStream().then(() => setRickState(document.documentElement.dataset.theme === 'default'));
resizeMatrix();
resizeGlitch();
window.addEventListener('resize', () => {
  resizeMatrix();
  resizeGlitch();
});
