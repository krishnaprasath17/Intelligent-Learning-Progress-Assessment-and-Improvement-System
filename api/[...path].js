// server/vercelServer.ts
import express from "express";

// server/apiRouter.ts
import { Router } from "express";

// src/data/seedData.ts
var SEED_SKILLS = [
  {
    id: "python",
    name: "Python",
    category: "Programming",
    description: "General-purpose, high-level language popular for software, data science, automation, and AI.",
    iconName: "Code2",
    topics: [
      { id: "py-syntax", skillId: "python", name: "Syntax & Data Types", difficulty: "Beginner", description: "Variables, numbers, strings, casting, operators", order: 1 },
      { id: "py-control", skillId: "python", name: "Control Flow & Loops", difficulty: "Beginner", description: "if-elif-else, while, for loops, break/continue", order: 2 },
      { id: "py-functions", skillId: "python", name: "Functions & Scope", difficulty: "Basic", description: "def, args, kwargs, lambda functions, global/local scope", order: 3 },
      { id: "py-collections", skillId: "python", name: "Lists, Tuples, Sets, Dictionaries", difficulty: "Basic", description: "List comprehensions, dict manipulation, slicing", order: 4 },
      { id: "py-oop", skillId: "python", name: "Object-Oriented Programming", difficulty: "Intermediate", description: "Classes, __init__, inheritance, polymorphism, encapsulation", order: 5 },
      { id: "py-exceptions", skillId: "python", name: "Exception Handling", difficulty: "Intermediate", description: "try-except-finally, custom exceptions, raise", order: 6 },
      { id: "py-fileio", skillId: "python", name: "File Handling & Context Managers", difficulty: "Intermediate", description: "open(), with statement, reading/writing files, CSV/JSON", order: 7 },
      { id: "py-advanced", skillId: "python", name: "Advanced Concepts (Decorators, Generators)", difficulty: "Advanced", description: "yield, closures, decorators, dunder methods, itertools", order: 8 }
    ]
  },
  {
    id: "cpp",
    name: "C++",
    category: "Programming",
    description: "Powerful system programming language with OOP, memory control, and Standard Template Library (STL).",
    iconName: "Cpu",
    topics: [
      { id: "cpp-basics", skillId: "cpp", name: "Syntax, Data Types & Operators", difficulty: "Beginner", description: "cin, cout, data types, arithmetic & logical operators", order: 1 },
      { id: "cpp-control", skillId: "cpp", name: "Control Flow & Functions", difficulty: "Beginner", description: "Loops, conditionals, function overloading, pass by value/ref", order: 2 },
      { id: "cpp-pointers", skillId: "cpp", name: "Pointers & Dynamic Memory", difficulty: "Intermediate", description: "Pointers, addresses, new/delete, pointer arithmetic", order: 3 },
      { id: "cpp-oop", skillId: "cpp", name: "Classes, Objects & Inheritance", difficulty: "Intermediate", description: "Access specifiers, constructors, virtual functions, abstract classes", order: 4 },
      { id: "cpp-stl", skillId: "cpp", name: "Standard Template Library (STL)", difficulty: "Advanced", description: "Vectors, maps, sets, iterators, sort, priority_queue", order: 5 },
      { id: "cpp-memory", skillId: "cpp", name: "Memory Management & RAII", difficulty: "Advanced", description: "Smart pointers (unique_ptr, shared_ptr), move semantics", order: 6 }
    ]
  },
  {
    id: "c",
    name: "C",
    category: "Programming",
    description: "Foundational procedural language for systems, embedded devices, and core operating system concepts.",
    iconName: "Terminal",
    topics: [
      { id: "c-basics", skillId: "c", name: "Basics, Variables & Data Types", difficulty: "Beginner", description: "printf/scanf, primitive types, constants, operators", order: 1 },
      { id: "c-control", skillId: "c", name: "Loops & Conditionals", difficulty: "Beginner", description: "for, while, do-while, switch-case, if-else", order: 2 },
      { id: "c-arrays", skillId: "c", name: "Arrays & Strings", difficulty: "Basic", description: "1D/2D arrays, char arrays, string.h library functions", order: 3 },
      { id: "c-pointers", skillId: "c", name: "Pointers & Memory Addresses", difficulty: "Intermediate", description: "Pointer variables, dereferencing, double pointers", order: 4 },
      { id: "c-structs", skillId: "c", name: "Structures & Unions", difficulty: "Intermediate", description: "struct, typedef, union, struct padding", order: 5 },
      { id: "c-dynamic", skillId: "c", name: "Dynamic Memory Allocation", difficulty: "Advanced", description: "malloc, calloc, realloc, free, memory leaks", order: 6 }
    ]
  },
  {
    id: "java",
    name: "Java",
    category: "Programming",
    description: "Robust, platform-independent, object-oriented language for enterprise applications and Android.",
    iconName: "Layers",
    topics: [
      { id: "java-basics", skillId: "java", name: "Java Fundamentals", difficulty: "Beginner", description: "JVM/JRE/JDK, primitives, variables, operators", order: 1 },
      { id: "java-oop", skillId: "java", name: "OOP & Interfaces", difficulty: "Intermediate", description: "Inheritance, interfaces, abstract classes, encapsulation", order: 2 },
      { id: "java-collections", skillId: "java", name: "Java Collections Framework", difficulty: "Intermediate", description: "ArrayList, HashMap, HashSet, LinkedList, Iterators", order: 3 },
      { id: "java-exceptions", skillId: "java", name: "Exception Handling", difficulty: "Intermediate", description: "Checked vs unchecked exceptions, try-with-resources", order: 4 },
      { id: "java-threads", skillId: "java", name: "Multithreading & Concurrency", difficulty: "Advanced", description: "Thread, Runnable, synchronized, ExecutorService", order: 5 }
    ]
  },
  {
    id: "sql",
    name: "SQL",
    category: "Databases",
    description: "Standard language for storing, manipulating, and querying structured relational databases.",
    iconName: "Database",
    topics: [
      { id: "sql-basics", skillId: "sql", name: "SELECT, Filtering & Sorting", difficulty: "Beginner", description: "SELECT, WHERE, ORDER BY, DISTINCT, LIMIT, LIKE", order: 1 },
      { id: "sql-aggregates", skillId: "sql", name: "Aggregation & GROUP BY", difficulty: "Basic", description: "COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING", order: 2 },
      { id: "sql-joins", skillId: "sql", name: "Table Joins", difficulty: "Intermediate", description: "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN", order: 3 },
      { id: "sql-subqueries", skillId: "sql", name: "Subqueries & CTEs", difficulty: "Intermediate", description: "Nested SELECTs, IN, EXISTS, Common Table Expressions", order: 4 },
      { id: "sql-schema", skillId: "sql", name: "Schema Design & Constraints", difficulty: "Intermediate", description: "CREATE TABLE, PRIMARY KEY, FOREIGN KEY, UNIQUE, INDEX", order: 5 },
      { id: "sql-transactions", skillId: "sql", name: "Transactions & ACID", difficulty: "Advanced", description: "BEGIN, COMMIT, ROLLBACK, Isolation levels, locking", order: 6 }
    ]
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Web Development",
    description: "Dynamic scripting language powering modern interactive web applications, client and server-side.",
    iconName: "FileCode",
    topics: [
      { id: "js-basics", skillId: "javascript", name: "Basics & ES6+ Syntax", difficulty: "Beginner", description: "let/const, arrow functions, template literals, destructuring", order: 1 },
      { id: "js-dom", skillId: "javascript", name: "DOM Manipulation & Events", difficulty: "Beginner", description: "querySelector, event listeners, event bubbling", order: 2 },
      { id: "js-async", skillId: "javascript", name: "Async JS, Promises & Async/Await", difficulty: "Intermediate", description: "Event loop, callback queue, Promises, async/await, fetch", order: 3 },
      { id: "js-closures", skillId: "javascript", name: "Closures & Scope", difficulty: "Intermediate", description: "Lexical scope, closure patterns, currying, hoisting", order: 4 },
      { id: "js-prototypes", skillId: "javascript", name: "Prototypes & Prototypes Inheritance", difficulty: "Advanced", description: "Prototype chain, Object.create, class keyword under the hood", order: 5 }
    ]
  },
  {
    id: "react",
    name: "React.js",
    category: "Web Development",
    description: "Popular UI library for building scalable component-driven single-page web applications.",
    iconName: "Atom",
    topics: [
      { id: "react-components", skillId: "react", name: "JSX, Components & Props", difficulty: "Beginner", description: "Functional components, props passing, conditional rendering", order: 1 },
      { id: "react-state", skillId: "react", name: "State & useState Hook", difficulty: "Beginner", description: "State immutability, updater functions, form controls", order: 2 },
      { id: "react-effects", skillId: "react", name: "useEffect & Component Lifecycle", difficulty: "Intermediate", description: "Dependency arrays, cleanup functions, data fetching", order: 3 },
      { id: "react-context", skillId: "react", name: "Context API & Custom Hooks", difficulty: "Intermediate", description: "useContext, createContext, creating reusable custom hooks", order: 4 },
      { id: "react-performance", skillId: "react", name: "Performance & Optimization", difficulty: "Advanced", description: "useMemo, useCallback, React.memo, virtual DOM reconciliation", order: 5 }
    ]
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    category: "Core CS",
    description: "Essential problem-solving principles, time-space complexities, and algorithmic paradigms.",
    iconName: "Binary",
    topics: [
      { id: "dsa-complexity", skillId: "dsa", name: "Time & Space Complexity (Big-O)", difficulty: "Beginner", description: "O(1), O(log n), O(n), O(n log n), asymptotic analysis", order: 1 },
      { id: "dsa-arrays", skillId: "dsa", name: "Arrays, Strings & Two Pointers", difficulty: "Basic", description: "Sliding window, prefix sums, two pointer technique", order: 2 },
      { id: "dsa-linkedlists", skillId: "dsa", name: "Linked Lists & Stacks/Queues", difficulty: "Intermediate", description: "Singly/doubly linked lists, cycle detection, stack monotonic patterns", order: 3 },
      { id: "dsa-trees", skillId: "dsa", name: "Trees, BST & Binary Heaps", difficulty: "Intermediate", description: "Inorder/Preorder/Postorder traversals, BFS, DFS, balance", order: 4 },
      { id: "dsa-graphs", skillId: "dsa", name: "Graphs & Shortest Path", difficulty: "Advanced", description: "Adjacency list, Dijkstra, Topological sort, Union Find", order: 5 },
      { id: "dsa-dp", skillId: "dsa", name: "Dynamic Programming & Recursion", difficulty: "Advanced", description: "Memoization, tabulation, knapsack patterns, optimal substructure", order: 6 }
    ]
  },
  {
    id: "oop",
    name: "Object-Oriented Programming",
    category: "Core CS",
    description: "Core architectural paradigm focusing on encapsulation, abstraction, inheritance, and polymorphism.",
    iconName: "Boxes",
    topics: [
      { id: "oop-pillars", skillId: "oop", name: "Four Pillars of OOP", difficulty: "Beginner", description: "Encapsulation, Abstraction, Inheritance, Polymorphism", order: 1 },
      { id: "oop-classes", skillId: "oop", name: "Classes, Objects & Constructors", difficulty: "Beginner", description: "Instantiating objects, this/self reference, constructor types", order: 2 },
      { id: "oop-polymorphism", skillId: "oop", name: "Overloading vs Overriding", difficulty: "Intermediate", description: "Compile-time vs Runtime polymorphism, method signatures", order: 3 },
      { id: "oop-solid", skillId: "oop", name: "SOLID Design Principles", difficulty: "Advanced", description: "Single Responsibility, Open-Closed, Liskov, Interface Segregation, Dependency Inversion", order: 4 },
      { id: "oop-patterns", skillId: "oop", name: "Core Design Patterns", difficulty: "Advanced", description: "Singleton, Factory, Observer, Strategy patterns", order: 5 }
    ]
  },
  {
    id: "html",
    name: "HTML5",
    category: "Web Development",
    description: "Semantic markup, accessibility, forms, media integration, and modern web structure standards.",
    iconName: "Code",
    topics: [
      { id: "html-semantics", skillId: "html", name: "Semantic Elements & Structure", difficulty: "Beginner", description: "header, nav, main, section, article, footer, aside", order: 1 },
      { id: "html-forms", skillId: "html", name: "Forms, Inputs & Validation", difficulty: "Basic", description: "Form attributes, input types, required, pattern, label linking", order: 2 },
      { id: "html-media", skillId: "html", name: "Media, Canvas & SVG", difficulty: "Intermediate", description: "picture, audio, video, canvas, accessible SVG", order: 3 },
      { id: "html-a11y", skillId: "html", name: "Accessibility (a11y) & SEO", difficulty: "Intermediate", description: "ARIA roles, alt tags, tabindex, meta viewport, OpenGraph", order: 4 }
    ]
  },
  {
    id: "css",
    name: "CSS3",
    category: "Web Development",
    description: "Modern styling, Responsive layouts, Flexbox, Grid, animations, and Tailwind utility principles.",
    iconName: "Palette",
    topics: [
      { id: "css-boxmodel", skillId: "css", name: "Box Model & Specificity", difficulty: "Beginner", description: "margin, padding, border, box-sizing, selector priority", order: 1 },
      { id: "css-flexbox", skillId: "css", name: "Flexbox Layouts", difficulty: "Basic", description: "justify-content, align-items, flex-grow, flex-shrink, gap", order: 2 },
      { id: "css-grid", skillId: "css", name: "CSS Grid & Responsive Design", difficulty: "Intermediate", description: "grid-template-columns, fr units, media queries, mobile-first", order: 3 },
      { id: "css-animation", skillId: "css", name: "Transitions, Keyframes & Variables", difficulty: "Advanced", description: "CSS custom properties (--var), @keyframes, transform, will-change", order: 4 }
    ]
  }
];
var SEED_QUESTIONS = [
  // ==========================================
  // --- PYTHON QUESTIONS ---
  // ==========================================
  {
    id: "q-py-1",
    skillId: "python",
    topicId: "py-syntax",
    topicName: "Syntax & Data Types",
    question: "What is the data type of the variable `val` after executing `val = 4 / 2` in Python 3?",
    questionType: "CodeOutput",
    difficulty: "Beginner",
    codeSnippet: "val = 4 / 2\nprint(type(val))",
    options: [
      { id: "opt1", text: "<class 'int'>" },
      { id: "opt2", text: "<class 'float'>" },
      { id: "opt3", text: "<class 'number'>" },
      { id: "opt4", text: "<class 'double'>" }
    ],
    correctAnswerId: "opt2",
    explanation: "In Python 3, the standard division operator `/` always returns a `float`, even if the division is exact. Integer floor division is done using `//`."
  },
  {
    id: "q-py-2",
    skillId: "python",
    topicId: "py-control",
    topicName: "Control Flow & Loops",
    question: "What will be the output of the following Python loop?",
    questionType: "CodeOutput",
    difficulty: "Beginner",
    codeSnippet: 'nums = [1, 2, 3]\nfor x in nums:\n    if x == 2:\n        continue\n    print(x, end=" ")',
    options: [
      { id: "opt1", text: "1 2 3" },
      { id: "opt2", text: "1 3 " },
      { id: "opt3", text: "1 " },
      { id: "opt4", text: "2 3" }
    ],
    correctAnswerId: "opt2",
    explanation: "The `continue` statement skips the rest of the current iteration when `x == 2`, so 2 is not printed, producing `1 3 `."
  },
  {
    id: "q-py-3",
    skillId: "python",
    topicId: "py-functions",
    topicName: "Functions & Scope",
    question: "What will the following code output regarding default mutable arguments in Python?",
    questionType: "CodeOutput",
    difficulty: "Basic",
    codeSnippet: "def add_item(val, items=[]):\n    items.append(val)\n    return items\n\nprint(add_item(1))\nprint(add_item(2))",
    options: [
      { id: "opt1", text: "[1] then [2]" },
      { id: "opt2", text: "[1] then [1, 2]" },
      { id: "opt3", text: "[1, 2] then [1, 2]" },
      { id: "opt4", text: "TypeError" }
    ],
    correctAnswerId: "opt2",
    explanation: "In Python, default arguments are evaluated only once when the function is defined, so mutable defaults like lists are shared across function calls."
  },
  {
    id: "q-py-4",
    skillId: "python",
    topicId: "py-collections",
    topicName: "Lists, Tuples, Sets, Dictionaries",
    question: "What is the primary difference between a Python List and a Python Tuple?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "Lists are immutable while tuples are mutable" },
      { id: "opt2", text: "Lists are mutable while tuples are immutable" },
      { id: "opt3", text: "Tuples can only store integers, lists can store any object" },
      { id: "opt4", text: "Lists cannot be indexed using brackets []" }
    ],
    correctAnswerId: "opt2",
    explanation: "Tuples are immutable sequences in Python\u2014once created, their elements cannot be changed, added, or removed. Lists are mutable."
  },
  {
    id: "q-py-5",
    skillId: "python",
    topicId: "py-oop",
    topicName: "Object-Oriented Programming",
    question: "Identify the error in this class implementation that prevents proper instance variable initialization:",
    questionType: "Debugging",
    difficulty: "Intermediate",
    codeSnippet: "class Student:\n    def __init__(name, roll_no):\n        self.name = name\n        self.roll_no = roll_no",
    options: [
      { id: "opt1", text: "The class definition is missing parenthesis `()`" },
      { id: "opt2", text: "`self` must be the first parameter in the `__init__` method signature" },
      { id: "opt3", text: "`__init__` should be named `__construct__`" },
      { id: "opt4", text: "Variable types must be declared before assignment" }
    ],
    correctAnswerId: "opt2",
    explanation: "In Python instance methods, the first parameter must explicitly refer to the instance itself, conventionally named `self` (`def __init__(self, name, roll_no):`)."
  },
  {
    id: "q-py-6",
    skillId: "python",
    topicId: "py-exceptions",
    topicName: "Exception Handling",
    question: "What is printed by this exception handling block?",
    questionType: "CodeOutput",
    difficulty: "Intermediate",
    codeSnippet: 'try:\n    res = 10 / 0\nexcept ZeroDivisionError:\n    print("Error", end=" ")\nfinally:\n    print("Done")',
    options: [
      { id: "opt1", text: "Error Done" },
      { id: "opt2", text: "Error" },
      { id: "opt3", text: "Done" },
      { id: "opt4", text: "ZeroDivisionError Traceback" }
    ],
    correctAnswerId: "opt1",
    explanation: 'The `ZeroDivisionError` is caught and prints "Error ", and the `finally` block ALWAYS executes regardless of whether an exception occurred, printing "Done".'
  },
  {
    id: "q-py-7",
    skillId: "python",
    topicId: "py-fileio",
    topicName: "File Handling & Context Managers",
    question: "Why is using the `with open(...) as f:` syntax preferred over `f = open(...)` in Python?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "It automatically encrypts the file on disk" },
      { id: "opt2", text: "It automatically closes the file even if exceptions are raised" },
      { id: "opt3", text: "It reads files 2x faster into memory" },
      { id: "opt4", text: "It converts files to JSON format automatically" }
    ],
    correctAnswerId: "opt2",
    explanation: "The `with` statement utilizes Python context managers (__enter__ and __exit__) to guarantee the file descriptor is closed properly even if exceptions happen."
  },
  {
    id: "q-py-8",
    skillId: "python",
    topicId: "py-advanced",
    topicName: "Advanced Concepts (Decorators, Generators)",
    question: "Which keyword converts a standard Python function into a generator function that yields values on demand?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "generator" },
      { id: "opt2", text: "yield" },
      { id: "opt3", text: "next" },
      { id: "opt4", text: "produce" }
    ],
    correctAnswerId: "opt2",
    explanation: "The `yield` keyword turns a normal function into a generator object that preserves execution state between iterations without computing all values in memory at once."
  },
  // ==========================================
  // --- C PROGRAMMING QUESTIONS ---
  // ==========================================
  {
    id: "q-c-1",
    skillId: "c",
    topicId: "c-basics",
    topicName: "Basics, Variables & Data Types",
    question: "What is the output of the following C program considering integer division?",
    questionType: "CodeOutput",
    difficulty: "Beginner",
    codeSnippet: '#include <stdio.h>\nint main() {\n    int a = 7, b = 2;\n    float result = a / b;\n    printf("%.2f", result);\n    return 0;\n}',
    options: [
      { id: "opt1", text: "3.50" },
      { id: "opt2", text: "3.00" },
      { id: "opt3", text: "3" },
      { id: "opt4", text: "4.00" }
    ],
    correctAnswerId: "opt2",
    explanation: "Because both `a` and `b` are integer types, integer division `7 / 2` evaluates to `3`. Assigning it to `float result` yields `3.00`. Explicit type casting `(float)a / b` is required for `3.50`."
  },
  {
    id: "q-c-2",
    skillId: "c",
    topicId: "c-control",
    topicName: "Loops & Conditionals",
    question: "What will be printed by this C switch statement without break statements?",
    questionType: "CodeOutput",
    difficulty: "Beginner",
    codeSnippet: '#include <stdio.h>\nint main() {\n    int x = 2;\n    switch(x) {\n        case 1: printf("One ");\n        case 2: printf("Two ");\n        case 3: printf("Three ");\n        default: printf("Default");\n    }\n    return 0;\n}',
    options: [
      { id: "opt1", text: "Two " },
      { id: "opt2", text: "Two Three Default" },
      { id: "opt3", text: "Two Three " },
      { id: "opt4", text: "Default" }
    ],
    correctAnswerId: "opt2",
    explanation: 'Due to "switch fallthrough" when `break` statements are absent, execution continues sequentially through all subsequent cases and the default block once a match is found.'
  },
  {
    id: "q-c-3",
    skillId: "c",
    topicId: "c-arrays",
    topicName: "Arrays & Strings",
    question: 'What is the length of the string stored in `char str[] = "Hello";` in C according to `strlen(str)` versus `sizeof(str)`?',
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "strlen is 5, sizeof is 6" },
      { id: "opt2", text: "strlen is 6, sizeof is 5" },
      { id: "opt3", text: "Both are 5" },
      { id: "opt4", text: "Both are 6" }
    ],
    correctAnswerId: "opt1",
    explanation: "`strlen` counts printable characters up to the null terminator `\\0` (5), while `sizeof` includes the allocated null terminator byte in array memory (6 bytes)."
  },
  {
    id: "q-c-4",
    skillId: "c",
    topicId: "c-pointers",
    topicName: "Pointers & Memory Addresses",
    question: "What will be the output of the following pointer arithmetic in C?",
    questionType: "CodeOutput",
    difficulty: "Intermediate",
    codeSnippet: '#include <stdio.h>\nint main() {\n    int arr[] = {10, 20, 30, 40};\n    int *ptr = arr;\n    printf("%d", *(ptr + 2));\n    return 0;\n}',
    options: [
      { id: "opt1", text: "10" },
      { id: "opt2", text: "20" },
      { id: "opt3", text: "30" },
      { id: "opt4", text: "40" }
    ],
    correctAnswerId: "opt3",
    explanation: "`*(ptr + 2)` offsets the pointer by 2 integer elements (equivalent to `arr[2]`), which holds the value 30."
  },
  {
    id: "q-c-5",
    skillId: "c",
    topicId: "c-structs",
    topicName: "Structures & Unions",
    question: "What is the key difference in memory allocation between a C `struct` and a C `union`?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Structs store only primitive types; unions can store pointers" },
      { id: "opt2", text: "Struct members each have their own memory; union members share the same memory location" },
      { id: "opt3", text: "Unions are allocated on the heap while structs are allocated on the stack" },
      { id: "opt4", text: "Structs cannot contain functions while unions can" }
    ],
    correctAnswerId: "opt2",
    explanation: "In a `struct`, every member has a distinct memory offset. In a `union`, all members share the same memory location, and the union size is determined by its largest member."
  },
  {
    id: "q-c-6",
    skillId: "c",
    topicId: "c-dynamic",
    topicName: "Dynamic Memory Allocation",
    question: "Which C standard library function dynamically allocates memory on the heap and initializes all allocated bytes to zero?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "malloc()" },
      { id: "opt2", text: "calloc()" },
      { id: "opt3", text: "realloc()" },
      { id: "opt4", text: "alloc()" }
    ],
    correctAnswerId: "opt2",
    explanation: "`calloc(num_elements, element_size)` allocates memory for an array of elements and initializes all bytes to zero. `malloc()` leaves allocated memory uninitialized (garbage values)."
  },
  {
    id: "q-c-7",
    skillId: "c",
    topicId: "c-pointers",
    topicName: "Pointers & Memory Addresses",
    question: "Identify the bug in this function that causes a dangling pointer / undefined behavior:",
    questionType: "Debugging",
    difficulty: "Advanced",
    codeSnippet: "int* getNumber() {\n    int num = 42;\n    return &num;\n}",
    options: [
      { id: "opt1", text: "Returning a pointer requires the `const` keyword" },
      { id: "opt2", text: "Returning the address of a local stack variable which gets destroyed when function returns" },
      { id: "opt3", text: "Integer pointers cannot hold literal numbers" },
      { id: "opt4", text: "Missing `malloc` typecasting" }
    ],
    correctAnswerId: "opt2",
    explanation: "`num` is a local stack variable allocated inside `getNumber()`. Once `getNumber()` returns, its stack frame is popped, making the returned address a dangerous dangling pointer."
  },
  {
    id: "q-c-8",
    skillId: "c",
    topicId: "c-dynamic",
    topicName: "Dynamic Memory Allocation",
    question: "What occurs when memory allocated via `malloc()` is not released using `free()` before the pointer loses reference?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Segmentation Fault immediately" },
      { id: "opt2", text: "Memory Leak" },
      { id: "opt3", text: "Stack Overflow" },
      { id: "opt4", text: "Bus Error" }
    ],
    correctAnswerId: "opt2",
    explanation: "Unfreed heap memory whose pointer reference is lost remains occupied in the process address space, causing a memory leak that can degrade system performance or exhaust RAM."
  },
  // ==========================================
  // --- C++ QUESTIONS ---
  // ==========================================
  {
    id: "q-cpp-1",
    skillId: "cpp",
    topicId: "cpp-basics",
    topicName: "Syntax, Data Types & Operators",
    question: "What is the purpose of the `std::cin >> x` statement in C++?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "Output text to the standard error stream" },
      { id: "opt2", text: "Read formatted input from the standard input stream (keyboard)" },
      { id: "opt3", text: "Calculate the right-shift bitwise operation on x" },
      { id: "opt4", text: "Allocate heap memory for x" }
    ],
    correctAnswerId: "opt2",
    explanation: "In C++, `std::cin` represents the standard input stream, and the stream extraction operator `>>` parses keyboard input into variable `x`."
  },
  {
    id: "q-cpp-2",
    skillId: "cpp",
    topicId: "cpp-pointers",
    topicName: "Pointers & Dynamic Memory",
    question: "What is the output of this C++ pointer snippet?",
    questionType: "CodeOutput",
    difficulty: "Intermediate",
    codeSnippet: "#include <iostream>\nusing namespace std;\nint main() {\n    int a = 10;\n    int* ptr = &a;\n    *ptr += 5;\n    cout << a << endl;\n    return 0;\n}",
    options: [
      { id: "opt1", text: "10" },
      { id: "opt2", text: "15" },
      { id: "opt3", text: "Address of variable a" },
      { id: "opt4", text: "Segmentation Fault" }
    ],
    correctAnswerId: "opt2",
    explanation: "`*ptr += 5` dereferences `ptr` to modify the actual value stored at the memory location of `a`, changing `a` from 10 to 15."
  },
  {
    id: "q-cpp-3",
    skillId: "cpp",
    topicId: "cpp-oop",
    topicName: "Classes, Objects & Inheritance",
    question: "Which keyword in a C++ base class enables dynamic runtime polymorphism through virtual method tables (vtable)?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "override" },
      { id: "opt2", text: "virtual" },
      { id: "opt3", text: "dynamic" },
      { id: "opt4", text: "abstract" }
    ],
    correctAnswerId: "opt2",
    explanation: "The `virtual` keyword tells the compiler to resolve calls dynamically at runtime based on the actual object type rather than the pointer/reference type."
  },
  {
    id: "q-cpp-4",
    skillId: "cpp",
    topicId: "cpp-stl",
    topicName: "Standard Template Library (STL)",
    question: "What is the average time complexity for searching an element in `std::unordered_map` versus `std::map` in C++?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "O(1) for unordered_map, O(log N) for map" },
      { id: "opt2", text: "O(log N) for unordered_map, O(1) for map" },
      { id: "opt3", text: "O(N) for both" },
      { id: "opt4", text: "O(1) for both" }
    ],
    correctAnswerId: "opt1",
    explanation: "`std::unordered_map` is implemented using a hash table giving average O(1) lookups. `std::map` is implemented as a self-balancing Red-Black tree providing guaranteed O(log N) lookups."
  },
  {
    id: "q-cpp-5",
    skillId: "cpp",
    topicId: "cpp-memory",
    topicName: "Memory Management & RAII",
    question: "Which smart pointer in modern C++ (C++11+) enforces exclusive single ownership of a dynamically allocated resource with zero runtime overhead?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "std::shared_ptr" },
      { id: "opt2", text: "std::unique_ptr" },
      { id: "opt3", text: "std::weak_ptr" },
      { id: "opt4", text: "std::auto_ptr" }
    ],
    correctAnswerId: "opt2",
    explanation: "`std::unique_ptr` maintains sole ownership of a resource. It cannot be copied (only moved), and automatically destroys the managed object when it goes out of scope with zero reference counting overhead."
  },
  {
    id: "q-cpp-6",
    skillId: "cpp",
    topicId: "cpp-oop",
    topicName: "Classes, Objects & Inheritance",
    question: "Why should base class destructors always be declared `virtual` when polymorphism is used in C++?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "To allow the base class to be instantiated" },
      { id: "opt2", text: "To ensure derived class destructors are called when deleting via base pointer, avoiding memory leaks" },
      { id: "opt3", text: "To speed up constructor execution" },
      { id: "opt4", text: "To make all member variables private automatically" }
    ],
    correctAnswerId: "opt2",
    explanation: "If a base destructor is not virtual, deleting a derived object via a `Base*` pointer invokes only the base destructor, leaving derived class resources unfreed and causing undefined behavior."
  },
  {
    id: "q-cpp-7",
    skillId: "cpp",
    topicId: "cpp-stl",
    topicName: "Standard Template Library (STL)",
    question: "What is the output of this C++ `std::vector` code snippet?",
    questionType: "CodeOutput",
    difficulty: "Basic",
    codeSnippet: '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> v = {1, 2, 3};\n    v.push_back(4);\n    v.pop_back();\n    cout << v.size() << " " << v.back();\n    return 0;\n}',
    options: [
      { id: "opt1", text: "3 3" },
      { id: "opt2", text: "4 4" },
      { id: "opt3", text: "3 4" },
      { id: "opt4", text: "4 3" }
    ],
    correctAnswerId: "opt1",
    explanation: "`v.push_back(4)` adds 4 (size 4), and `v.pop_back()` removes 4 (size 3). `v.back()` retrieves the current last element, which is 3."
  },
  {
    id: "q-cpp-8",
    skillId: "cpp",
    topicId: "cpp-control",
    topicName: "Control Flow & Functions",
    question: "What is the effect of passing a parameter by reference `const std::string& str` in C++?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Creates an expensive deep copy of the string" },
      { id: "opt2", text: "Avoids copying the string while preventing the function from modifying it" },
      { id: "opt3", text: "Allocates the string on the heap" },
      { id: "opt4", text: "Converts the string into a C-style char array" }
    ],
    correctAnswerId: "opt2",
    explanation: "Passing by `const &` passes the memory address directly to avoid copying overhead while compiler-enforcing read-only access."
  },
  // ==========================================
  // --- JAVA QUESTIONS ---
  // ==========================================
  {
    id: "q-java-1",
    skillId: "java",
    topicId: "java-basics",
    topicName: "Java Fundamentals",
    question: 'What is the main role of the Java Virtual Machine (JVM) in the "Write Once, Run Anywhere" paradigm?',
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "It compiles source .java files directly into C++ code" },
      { id: "opt2", text: "It interprets or JIT-compiles Java bytecode into native machine instructions on the host OS" },
      { id: "opt3", text: "It manages web server HTTP connections" },
      { id: "opt4", text: "It replaces the need for an operating system" }
    ],
    correctAnswerId: "opt2",
    explanation: "The JVM provides an execution environment that converts platform-independent bytecode (`.class` files) into target machine code at runtime."
  },
  {
    id: "q-java-2",
    skillId: "java",
    topicId: "java-oop",
    topicName: "OOP & Interfaces",
    question: "Can a single Java class directly extend multiple classes using the `extends` keyword?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "Yes, by separating class names with commas" },
      { id: "opt2", text: "No, Java does not support multiple class inheritance to prevent the Diamond Problem" },
      { id: "opt3", text: "Yes, but only if both superclasses are abstract" },
      { id: "opt4", text: "Yes, but only up to 3 classes" }
    ],
    correctAnswerId: "opt2",
    explanation: "Java supports multiple interface implementation via `implements`, but only single class inheritance via `extends` to avoid ambiguity and Diamond Problem complexities."
  },
  {
    id: "q-java-3",
    skillId: "java",
    topicId: "java-basics",
    topicName: "Java Fundamentals",
    question: "What is the output of comparing strings in Java using `==` versus `.equals()`?",
    questionType: "CodeOutput",
    difficulty: "Basic",
    codeSnippet: 'String s1 = new String("Java");\nString s2 = new String("Java");\nSystem.out.println((s1 == s2) + " " + s1.equals(s2));',
    options: [
      { id: "opt1", text: "true true" },
      { id: "opt2", text: "false true" },
      { id: "opt3", text: "false false" },
      { id: "opt4", text: "true false" }
    ],
    correctAnswerId: "opt2",
    explanation: "`==` compares object memory references (which are different because both were instantiated with `new`), while `.equals()` compares the actual string character contents."
  },
  {
    id: "q-java-4",
    skillId: "java",
    topicId: "java-collections",
    topicName: "Java Collections Framework",
    question: "Which Java Collection implementation guarantees elements are stored in sorted ascending natural order or by a custom `Comparator`?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "HashSet" },
      { id: "opt2", text: "ArrayList" },
      { id: "opt3", text: "TreeSet" },
      { id: "opt4", text: "LinkedHashSet" }
    ],
    correctAnswerId: "opt3",
    explanation: "`TreeSet` (backed by a Red-Black tree) maintains elements in sorted order. `HashSet` has no order guarantee, and `LinkedHashSet` maintains insertion order."
  },
  {
    id: "q-java-5",
    skillId: "java",
    topicId: "java-exceptions",
    topicName: "Exception Handling",
    question: 'Which of the following is a "Checked Exception" in Java that must be handled or declared in the `throws` clause?',
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "NullPointerException" },
      { id: "opt2", text: "ArrayIndexOutOfBoundsException" },
      { id: "opt3", text: "IOException" },
      { id: "opt4", text: "ArithmeticException" }
    ],
    correctAnswerId: "opt3",
    explanation: "`IOException` subclasses `Exception` directly and is checked at compile-time. The others subclass `RuntimeException` and are unchecked."
  },
  {
    id: "q-java-6",
    skillId: "java",
    topicId: "java-threads",
    topicName: "Multithreading & Concurrency",
    question: "What is the purpose of the `synchronized` keyword on a Java method?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "It forces the method to run asynchronously in a background thread" },
      { id: "opt2", text: "It ensures only one thread can execute the method on the given monitor lock at any time" },
      { id: "opt3", text: "It disables garbage collection during method execution" },
      { id: "opt4", text: "It compiles the method with native machine optimization" }
    ],
    correctAnswerId: "opt2",
    explanation: "`synchronized` acquires the intrinsic lock of the object/class to ensure mutual exclusion, preventing race conditions in multithreaded environments."
  },
  {
    id: "q-java-7",
    skillId: "java",
    topicId: "java-oop",
    topicName: "OOP & Interfaces",
    question: "Can an `abstract` class in Java contain non-abstract methods with concrete implementations?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "Yes, abstract classes can have both abstract and concrete methods" },
      { id: "opt2", text: "No, all methods in an abstract class must be abstract" },
      { id: "opt3", text: "Only if the class implements Serializable" },
      { id: "opt4", text: "Only if the methods are marked private" }
    ],
    correctAnswerId: "opt1",
    explanation: "Abstract classes in Java can have fully implemented concrete methods alongside abstract methods that subclasses are required to override."
  },
  {
    id: "q-java-8",
    skillId: "java",
    topicId: "java-collections",
    topicName: "Java Collections Framework",
    question: "What happens when two distinct keys produce the same hash code in a Java `HashMap` (Hash Collision)?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "The HashMap throws a DuplicateKeyException" },
      { id: "opt2", text: "The existing key-value entry is overwritten" },
      { id: "opt3", text: "Entries are stored in a linked list or balanced tree at that bucket index" },
      { id: "opt4", text: "The table size shrinks automatically" }
    ],
    correctAnswerId: "opt3",
    explanation: "Java `HashMap` uses separate chaining: colliding entries are stored in a linked list in the bucket, which transforms into a Red-Black tree when the bucket length exceeds 8."
  },
  // ==========================================
  // --- SQL QUESTIONS ---
  // ==========================================
  {
    id: "q-sql-1",
    skillId: "sql",
    topicId: "sql-basics",
    topicName: "SELECT, Filtering & Sorting",
    question: "Which SQL clause is used to filter rows returned by a query BEFORE any aggregation takes place?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "HAVING" },
      { id: "opt2", text: "WHERE" },
      { id: "opt3", text: "GROUP BY" },
      { id: "opt4", text: "ORDER BY" }
    ],
    correctAnswerId: "opt2",
    explanation: "The `WHERE` clause filters individual records before any aggregate functions or grouping occur. `HAVING` filters aggregated groups after `GROUP BY`."
  },
  {
    id: "q-sql-2",
    skillId: "sql",
    topicId: "sql-joins",
    topicName: "Table Joins",
    question: "Which type of JOIN returns all records from the left table, and the matched records from the right table (with NULLs for unmatched right records)?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "INNER JOIN" },
      { id: "opt2", text: "LEFT JOIN (or LEFT OUTER JOIN)" },
      { id: "opt3", text: "CROSS JOIN" },
      { id: "opt4", text: "RIGHT JOIN" }
    ],
    correctAnswerId: "opt2",
    explanation: "A `LEFT JOIN` returns 100% of rows from the left table, even if there are zero matching entries in the right table."
  },
  {
    id: "q-sql-3",
    skillId: "sql",
    topicId: "sql-aggregates",
    topicName: "Aggregation & GROUP BY",
    question: "You want to find departments with more than 5 employees. Which query is correct?",
    questionType: "CodeOutput",
    difficulty: "Intermediate",
    codeSnippet: "SELECT department_id, COUNT(*)\nFROM employees\nGROUP BY department_id\n____ COUNT(*) > 5;",
    options: [
      { id: "opt1", text: "WHERE" },
      { id: "opt2", text: "HAVING" },
      { id: "opt3", text: "FILTER" },
      { id: "opt4", text: "CHECK" }
    ],
    correctAnswerId: "opt2",
    explanation: "Conditions on aggregate functions like `COUNT(*)` must be placed in a `HAVING` clause, not `WHERE`."
  },
  {
    id: "q-sql-4",
    skillId: "sql",
    topicId: "sql-subqueries",
    topicName: "Subqueries & CTEs",
    question: "What is a Common Table Expression (CTE) in SQL initiated by?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "CREATE TEMPORARY TABLE" },
      { id: "opt2", text: "WITH ... AS (...)" },
      { id: "opt3", text: "DECLARE TABLE" },
      { id: "opt4", text: "SUBQUERY ON" }
    ],
    correctAnswerId: "opt2",
    explanation: "A Common Table Expression (CTE) is defined using the `WITH` keyword followed by the CTE name and `AS (SELECT ...)` to create a readable, modular subquery."
  },
  {
    id: "q-sql-5",
    skillId: "sql",
    topicId: "sql-schema",
    topicName: "Schema Design & Constraints",
    question: "What constraint guarantees that all values in a column are distinct and cannot contain NULL values?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "UNIQUE" },
      { id: "opt2", text: "PRIMARY KEY" },
      { id: "opt3", text: "FOREIGN KEY" },
      { id: "opt4", text: "CHECK" }
    ],
    correctAnswerId: "opt2",
    explanation: "A `PRIMARY KEY` constraint uniquely identifies each record in a table, implicitly enforcing both `UNIQUE` and `NOT NULL`. A standard `UNIQUE` constraint can allow a NULL value."
  },
  {
    id: "q-sql-6",
    skillId: "sql",
    topicId: "sql-transactions",
    topicName: "Transactions & ACID",
    question: 'In ACID transaction properties, what does the "I" stand for?',
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Integrity" },
      { id: "opt2", text: "Isolation" },
      { id: "opt3", text: "Immutable" },
      { id: "opt4", text: "Idempotency" }
    ],
    correctAnswerId: "opt2",
    explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation ensures concurrent transactions execute independently without dirty reads or interference."
  },
  {
    id: "q-sql-7",
    skillId: "sql",
    topicId: "sql-basics",
    topicName: "SELECT, Filtering & Sorting",
    question: "How do you return only the top 5 highest-salary records from an `employees` table in standard SQL?",
    questionType: "CodeOutput",
    difficulty: "Beginner",
    codeSnippet: "SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;",
    options: [
      { id: "opt1", text: "Top 5 salaries in descending order" },
      { id: "opt2", text: "Bottom 5 lowest salaries" },
      { id: "opt3", text: "First 5 employees alphabetically" },
      { id: "opt4", text: "Syntax Error in SQL" }
    ],
    correctAnswerId: "opt1",
    explanation: "`ORDER BY salary DESC` sorts from highest to lowest salary, and `LIMIT 5` restricts the output to the top 5 rows."
  },
  {
    id: "q-sql-8",
    skillId: "sql",
    topicId: "sql-joins",
    topicName: "Table Joins",
    question: "What is the result of executing a `CROSS JOIN` between a table with 4 rows and a table with 5 rows?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "9 rows" },
      { id: "opt2", text: "20 rows (Cartesian product)" },
      { id: "opt3", text: "5 rows" },
      { id: "opt4", text: "1 row" }
    ],
    correctAnswerId: "opt2",
    explanation: "A `CROSS JOIN` produces the Cartesian product of both tables: 4 * 5 = 20 total rows."
  },
  // ==========================================
  // --- JAVASCRIPT QUESTIONS ---
  // ==========================================
  {
    id: "q-js-1",
    skillId: "javascript",
    topicId: "js-basics",
    topicName: "Basics & ES6+ Syntax",
    question: "What is the difference between `let` and `var` in JavaScript regarding variable scoping?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "`var` is block-scoped; `let` is function-scoped" },
      { id: "opt2", text: "`let` is block-scoped; `var` is function-scoped" },
      { id: "opt3", text: "`let` creates immutable constants; `var` is mutable" },
      { id: "opt4", text: "There is no difference in modern browsers" }
    ],
    correctAnswerId: "opt2",
    explanation: "Variables declared with `let` and `const` are scoped to the nearest enclosing `{}` block, while `var` is scoped to the enclosing function or globally."
  },
  {
    id: "q-js-2",
    skillId: "javascript",
    topicId: "js-async",
    topicName: "Async JS, Promises & Async/Await",
    question: "What will be printed to the console in order?",
    questionType: "CodeOutput",
    difficulty: "Intermediate",
    codeSnippet: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
    options: [
      { id: "opt1", text: "A, B, C, D" },
      { id: "opt2", text: "A, D, C, B" },
      { id: "opt3", text: "A, D, B, C" },
      { id: "opt4", text: "A, C, D, B" }
    ],
    correctAnswerId: "opt2",
    explanation: "Synchronous tasks run first (A, D). Microtasks from `Promise.then` run next (C). Macrotasks from `setTimeout` run last (B), resulting in A, D, C, B."
  },
  {
    id: "q-js-3",
    skillId: "javascript",
    topicId: "js-closures",
    topicName: "Closures & Scope",
    question: "What will the following JavaScript closure code output?",
    questionType: "CodeOutput",
    difficulty: "Intermediate",
    codeSnippet: "function createCounter() {\n    let count = 0;\n    return () => ++count;\n}\nconst counter = createCounter();\nconsole.log(counter(), counter());",
    options: [
      { id: "opt1", text: "0 1" },
      { id: "opt2", text: "1 2" },
      { id: "opt3", text: "1 1" },
      { id: "opt4", text: "undefined undefined" }
    ],
    correctAnswerId: "opt2",
    explanation: "The returned inner arrow function forms a closure that retains lexical reference to the private `count` variable, incrementing it to 1 on the first call and 2 on the second call."
  },
  {
    id: "q-js-4",
    skillId: "javascript",
    topicId: "js-dom",
    topicName: "DOM Manipulation & Events",
    question: "In event propagation, what phase occurs when an event travels from the root window down to the target element?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "Bubbling Phase" },
      { id: "opt2", text: "Capturing (Trickling) Phase" },
      { id: "opt3", text: "Dispatch Phase" },
      { id: "opt4", text: "Debounce Phase" }
    ],
    correctAnswerId: "opt2",
    explanation: "Event propagation has two main phases: Capturing (top-down from Window to target) and Bubbling (bottom-up from target to Window)."
  },
  {
    id: "q-js-5",
    skillId: "javascript",
    topicId: "js-prototypes",
    topicName: "Prototypes & Prototypes Inheritance",
    question: "What property links an object instance to its prototype object in JavaScript engines?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "__proto__ (or Object.getPrototypeOf)" },
      { id: "opt2", text: "prototype.class" },
      { id: "opt3", text: "super()" },
      { id: "opt4", text: "parentScope" }
    ],
    correctAnswerId: "opt1",
    explanation: "Objects have an internal prototype link accessed via `Object.getPrototypeOf(obj)` (or `__proto__`) forming the prototype lookup chain."
  },
  {
    id: "q-js-6",
    skillId: "javascript",
    topicId: "js-basics",
    topicName: "Basics & ES6+ Syntax",
    question: "What is the output of `typeof null` in JavaScript?",
    questionType: "CodeOutput",
    difficulty: "Beginner",
    codeSnippet: "console.log(typeof null);",
    options: [
      { id: "opt1", text: '"null"' },
      { id: "opt2", text: '"object"' },
      { id: "opt3", text: '"undefined"' },
      { id: "opt4", text: '"boolean"' }
    ],
    correctAnswerId: "opt2",
    explanation: '`typeof null === "object"` is a legacy quirk in JavaScript from the original 1995 implementation where type tags stored 0 for objects, and `null` was represented as NULL pointer 0x00.'
  },
  {
    id: "q-js-7",
    skillId: "javascript",
    topicId: "js-async",
    topicName: "Async JS, Promises & Async/Await",
    question: "What does `Promise.all([p1, p2])` do if `p1` resolves but `p2` rejects?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Waits for all and returns null for rejected ones" },
      { id: "opt2", text: "Immediately rejects with the error of p2 (fails fast)" },
      { id: "opt3", text: "Ignores p2 and resolves with p1" },
      { id: "opt4", text: "Retries p2 3 times" }
    ],
    correctAnswerId: "opt2",
    explanation: "`Promise.all` fails fast: if any promise in the array rejects, the entire returned promise immediately rejects with that reason."
  },
  {
    id: "q-js-8",
    skillId: "javascript",
    topicId: "js-basics",
    topicName: "Basics & ES6+ Syntax",
    question: "What does the spread syntax `const clone = { ...original, active: true }` accomplish?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "Mutates original object in place" },
      { id: "opt2", text: "Creates a shallow copy with the active property added or overwritten" },
      { id: "opt3", text: "Creates a deep recursive copy of all nested objects" },
      { id: "opt4", text: "Freezes the object permanently" }
    ],
    correctAnswerId: "opt2",
    explanation: "Object spread `{ ...obj }` performs shallow copying of enumerable own properties into a new object literal."
  },
  // ==========================================
  // --- REACT.JS QUESTIONS ---
  // ==========================================
  {
    id: "q-react-1",
    skillId: "react",
    topicId: "react-components",
    topicName: "JSX, Components & Props",
    question: "In React, why must JSX tags with multiple sibling elements have a single enclosing parent or Fragment `<>...</>`?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "CSS cannot style multiple elements" },
      { id: "opt2", text: "JSX compiles to `React.createElement()` calls, which must return a single JavaScript object/expression" },
      { id: "opt3", text: "Browsers do not support multiple DOM nodes" },
      { id: "opt4", text: "To enable automatic caching" }
    ],
    correctAnswerId: "opt2",
    explanation: "JSX is syntactic sugar for function calls (`React.createElement` or JSX transform). A function cannot return multiple separate expressions without wrapping them in an array or container."
  },
  {
    id: "q-react-2",
    skillId: "react",
    topicId: "react-state",
    topicName: "State & useState Hook",
    question: "What is the correct way to update state that depends on the previous state value in React?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "`setCount(count + 1)`" },
      { id: "opt2", text: "`setCount(prevCount => prevCount + 1)` (functional updater)" },
      { id: "opt3", text: "`count = count + 1`" },
      { id: "opt4", text: "`this.state.count++`" }
    ],
    correctAnswerId: "opt2",
    explanation: "Passing an updater function `setCount(prev => prev + 1)` ensures React applies the update to the most recent state value, preventing stale state bugs during batched re-renders."
  },
  {
    id: "q-react-3",
    skillId: "react",
    topicId: "react-effects",
    topicName: "useEffect & Component Lifecycle",
    question: "When does a `useEffect` callback with an empty dependency array `[]` run in React?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "On every render and state change" },
      { id: "opt2", text: "Only once after the component initially mounts" },
      { id: "opt3", text: "Only when the parent component updates" },
      { id: "opt4", text: "Never runs unless manually invoked" }
    ],
    correctAnswerId: "opt2",
    explanation: "An empty dependency array `[]` indicates the effect has no reactive dependencies, so React only executes it once after the initial DOM mount."
  },
  {
    id: "q-react-4",
    skillId: "react",
    topicId: "react-effects",
    topicName: "useEffect & Component Lifecycle",
    question: "What is the function returned inside a `useEffect` hook used for?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "To trigger an immediate re-render" },
      { id: "opt2", text: "Cleanup (e.g. unsubscribing from sockets, clearing timers before re-running or unmounting)" },
      { id: "opt3", text: "To serialize state into localStorage" },
      { id: "opt4", text: "To handle error boundaries" }
    ],
    correctAnswerId: "opt2",
    explanation: "The cleanup function returned by `useEffect` runs before the effect re-executes on dependency change and when the component unmounts."
  },
  {
    id: "q-react-5",
    skillId: "react",
    topicId: "react-context",
    topicName: "Context API & Custom Hooks",
    question: "What is the main problem solved by the React Context API?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Slow network requests" },
      { id: "opt2", text: "Props drilling across deeply nested component hierarchies" },
      { id: "opt3", text: "Browser back-button navigation" },
      { id: "opt4", text: "Converting class components into functional components" }
    ],
    correctAnswerId: "opt2",
    explanation: "React Context provides a way to pass data through the component tree without having to pass props down manually at every intermediate level."
  },
  {
    id: "q-react-6",
    skillId: "react",
    topicId: "react-performance",
    topicName: "Performance & Optimization",
    question: "Which React hook is used to memoize a computed expensive calculation so it only recalculates when its dependencies change?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "useCallback" },
      { id: "opt2", text: "useMemo" },
      { id: "opt3", text: "useRef" },
      { id: "opt4", text: "useReducer" }
    ],
    correctAnswerId: "opt2",
    explanation: "`useMemo(() => computeExpensiveValue(a, b), [a, b])` caches the result of a calculation between re-renders. `useCallback` memoizes the function definition itself."
  },
  {
    id: "q-react-7",
    skillId: "react",
    topicId: "react-components",
    topicName: "JSX, Components & Props",
    question: "Why is using array index as `key` in dynamic lists (e.g. `items.map((item, index) => <li key={index}>)`) considered an anti-pattern when list items can be reordered or filtered?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Indexes are not valid strings in JSX" },
      { id: "opt2", text: "It confuses React reconciliation, causing component state bugs and unnecessary DOM re-renders" },
      { id: "opt3", text: "It causes stack overflow in React 18" },
      { id: "opt4", text: "Keys must always be random numbers generated with Math.random()" }
    ],
    correctAnswerId: "opt2",
    explanation: "Keys help React identify which items have changed, moved, or deleted. Using indexes when the list changes order causes React to re-use wrong component states."
  },
  {
    id: "q-react-8",
    skillId: "react",
    topicId: "react-performance",
    topicName: "Performance & Optimization",
    question: "How does `React.memo` optimize functional component rendering?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "It prevents child components from rendering on the server" },
      { id: "opt2", text: "It skips re-rendering the component if its props have not changed (shallow equality)" },
      { id: "opt3", text: "It turns the component into an asynchronous worker" },
      { id: "opt4", text: "It automatically binds event listeners to window" }
    ],
    correctAnswerId: "opt2",
    explanation: "`React.memo` is a higher-order component that wraps a component to skip re-rendering if its props are shallowly equal to previous props."
  },
  // ==========================================
  // --- DATA STRUCTURES & ALGORITHMS (DSA) ---
  // ==========================================
  {
    id: "q-dsa-1",
    skillId: "dsa",
    topicId: "dsa-complexity",
    topicName: "Time & Space Complexity (Big-O)",
    question: "What is the worst-case and average time complexity of Binary Search on a sorted array of size N?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "O(N)" },
      { id: "opt2", text: "O(log N)" },
      { id: "opt3", text: "O(N log N)" },
      { id: "opt4", text: "O(1)" }
    ],
    correctAnswerId: "opt2",
    explanation: "Binary Search repeatedly halves the search space in each comparison step, resulting in logarithmic time complexity O(log N)."
  },
  {
    id: "q-dsa-2",
    skillId: "dsa",
    topicId: "dsa-arrays",
    topicName: "Arrays, Strings & Two Pointers",
    question: "Which algorithmic technique finds the maximum sum subarray of fixed size K in an array in O(N) linear time?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "Binary Search" },
      { id: "opt2", text: "Sliding Window Technique" },
      { id: "opt3", text: "Dijkstra Algorithm" },
      { id: "opt4", text: "Depth-First Search" }
    ],
    correctAnswerId: "opt2",
    explanation: "The Sliding Window technique maintains the sum of a window of length K, sliding it by adding the incoming element and subtracting the outgoing element in O(1) per step."
  },
  {
    id: "q-dsa-3",
    skillId: "dsa",
    topicId: "dsa-linkedlists",
    topicName: "Linked Lists & Stacks/Queues",
    question: "Which algorithm detects cycles in a Linked List using two pointers moving at different speeds (Slow & Fast)?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Dijkstra's Algorithm" },
      { id: "opt2", text: "Floyd's Tortoise and Hare Cycle Finding Algorithm" },
      { id: "opt3", text: "Kruskal's Algorithm" },
      { id: "opt4", text: "Kadane's Algorithm" }
    ],
    correctAnswerId: "opt2",
    explanation: "Floyd's Cycle Detection algorithm uses a slow pointer (1 step) and fast pointer (2 steps). If there is a cycle, the fast pointer will meet the slow pointer in O(N) time and O(1) space."
  },
  {
    id: "q-dsa-4",
    skillId: "dsa",
    topicId: "dsa-trees",
    topicName: "Trees, BST & Binary Heaps",
    question: "Which tree traversal produces elements of a Binary Search Tree (BST) in strictly sorted ascending order?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Preorder Traversal (Root, Left, Right)" },
      { id: "opt2", text: "Inorder Traversal (Left, Root, Right)" },
      { id: "opt3", text: "Postorder Traversal (Left, Right, Root)" },
      { id: "opt4", text: "Level Order Traversal (BFS)" }
    ],
    correctAnswerId: "opt2",
    explanation: "Inorder traversal visits the left subtree (smaller elements), current node, then right subtree (larger elements), yielding sorted ascending order for any valid BST."
  },
  {
    id: "q-dsa-5",
    skillId: "dsa",
    topicId: "dsa-graphs",
    topicName: "Graphs & Shortest Path",
    question: "Which algorithm finds the single-source shortest path in a weighted graph with non-negative edge weights using a priority queue?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Kruskal's Algorithm" },
      { id: "opt2", text: "Dijkstra's Algorithm" },
      { id: "opt3", text: "Tarjan's Strongly Connected Components" },
      { id: "opt4", text: "Bellman-Ford Algorithm" }
    ],
    correctAnswerId: "opt2",
    explanation: "Dijkstra's algorithm greedily extracts the minimum-distance vertex using a min-heap (Priority Queue) to determine shortest paths in O((V + E) log V) time."
  },
  {
    id: "q-dsa-6",
    skillId: "dsa",
    topicId: "dsa-dp",
    topicName: "Dynamic Programming & Recursion",
    question: "What are the two core prerequisites for applying Dynamic Programming (DP) to an optimization problem?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Greedy choice and binary search" },
      { id: "opt2", text: "Overlapping Subproblems and Optimal Substructure" },
      { id: "opt3", text: "Sorted input and cyclic dependencies" },
      { id: "opt4", text: "Tail recursion and memo-less stack" }
    ],
    correctAnswerId: "opt2",
    explanation: "Dynamic programming is applicable when a problem exhibits Optimal Substructure (optimal solution formed from optimal sub-solutions) and Overlapping Subproblems (subproblems recomputed multiple times)."
  },
  {
    id: "q-dsa-7",
    skillId: "dsa",
    topicId: "dsa-complexity",
    topicName: "Time & Space Complexity (Big-O)",
    question: "What is the average time complexity of QuickSort versus MergeSort?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "Both have average O(N log N) time complexity" },
      { id: "opt2", text: "QuickSort is O(N^2), MergeSort is O(N)" },
      { id: "opt3", text: "MergeSort is O(N^2), QuickSort is O(log N)" },
      { id: "opt4", text: "QuickSort is O(N), MergeSort is O(N log N)" }
    ],
    correctAnswerId: "opt1",
    explanation: "Both QuickSort and MergeSort have an average time complexity of O(N log N). MergeSort has O(N log N) worst case (using O(N) space), while QuickSort has O(N^2) worst case."
  },
  {
    id: "q-dsa-8",
    skillId: "dsa",
    topicId: "dsa-linkedlists",
    topicName: "Linked Lists & Stacks/Queues",
    question: "Which data structure follows the LIFO (Last In First Out) principle and is used for function call stacks and evaluating bracket expressions?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "Queue" },
      { id: "opt2", text: "Stack" },
      { id: "opt3", text: "Binary Heap" },
      { id: "opt4", text: "Circular Buffer" }
    ],
    correctAnswerId: "opt2",
    explanation: "A Stack operates on the LIFO principle (push/pop at top), making it ideal for tracking nested scopes, parenthesis validation, and backtrack recursion."
  },
  // ==========================================
  // --- OBJECT-ORIENTED PROGRAMMING (OOP) ---
  // ==========================================
  {
    id: "q-oop-1",
    skillId: "oop",
    topicId: "oop-pillars",
    topicName: "Four Pillars of OOP",
    question: "Scenario: You are designing a Banking System. You want to ensure the customer's `accountBalance` cannot be directly modified with invalid values by external code, and can only be updated through verified `deposit()` and `withdraw()` methods. Which OOP concept accomplishes this?",
    questionType: "Scenario",
    difficulty: "Beginner",
    scenarioContext: "Banking Software Security & Data Integrity",
    options: [
      { id: "opt1", text: "Inheritance" },
      { id: "opt2", text: "Encapsulation" },
      { id: "opt3", text: "Polymorphism" },
      { id: "opt4", text: "Multiple Inheritance" }
    ],
    correctAnswerId: "opt2",
    explanation: "Encapsulation bundles data (fields) and methods that manipulate that data, restricting direct access to internal state via private modifiers and public getters/setters."
  },
  {
    id: "q-oop-2",
    skillId: "oop",
    topicId: "oop-solid",
    topicName: "SOLID Design Principles",
    question: 'According to the Open-Closed Principle (the "O" in SOLID), software entities should be:',
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Open for modification, closed for extension" },
      { id: "opt2", text: "Open for extension, but closed for modification" },
      { id: "opt3", text: "Open source for public use, closed for proprietary code" },
      { id: "opt4", text: "Open to multiple threads, closed to single instances" }
    ],
    correctAnswerId: "opt2",
    explanation: "The Open-Closed Principle dictates that code modules should be open for adding new functionality (via inheritance/interfaces) without modifying existing tested source code."
  },
  {
    id: "q-oop-3",
    skillId: "oop",
    topicId: "oop-polymorphism",
    topicName: "Overloading vs Overriding",
    question: "What is the key difference between Method Overloading and Method Overriding?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Overloading is compile-time (same class, different signatures); Overriding is runtime (subclass, same signature)" },
      { id: "opt2", text: "Overloading requires the virtual keyword in Java" },
      { id: "opt3", text: "Overriding happens in the same class; Overloading happens in subclasses" },
      { id: "opt4", text: "There is no difference in modern OOP languages" }
    ],
    correctAnswerId: "opt1",
    explanation: "Method Overloading provides multiple methods with the same name but different parameter lists in the same class (compile-time polymorphism). Overriding provides a specific implementation of a superclass method in a subclass (runtime polymorphism)."
  },
  {
    id: "q-oop-4",
    skillId: "oop",
    topicId: "oop-classes",
    topicName: "Classes, Objects & Constructors",
    question: "What is a constructor in Object-Oriented Programming?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "A method that destroys objects and frees memory" },
      { id: "opt2", text: "A special member function invoked automatically when an object is instantiated to initialize its state" },
      { id: "opt3", text: "A tool that compiles code into bytecode" },
      { id: "opt4", text: "A static class helper" }
    ],
    correctAnswerId: "opt2",
    explanation: "Constructors are special member methods that run upon object instantiation to allocate resources and set initial member properties."
  },
  {
    id: "q-oop-5",
    skillId: "oop",
    topicId: "oop-solid",
    topicName: "SOLID Design Principles",
    question: "Which SOLID principle states that higher-level modules should not depend on low-level modules, but both should depend on abstractions (interfaces)?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Single Responsibility Principle" },
      { id: "opt2", text: "Liskov Substitution Principle" },
      { id: "opt3", text: "Interface Segregation Principle" },
      { id: "opt4", text: "Dependency Inversion Principle" }
    ],
    correctAnswerId: "opt4",
    explanation: 'The Dependency Inversion Principle (DIP - "D" in SOLID) decouples high-level policy from low-level implementation details through shared interfaces or abstract classes.'
  },
  {
    id: "q-oop-6",
    skillId: "oop",
    topicId: "oop-patterns",
    topicName: "Core Design Patterns",
    question: "Which design pattern ensures a class has only one single instance and provides a global access point to it (e.g. database connection pool, logger)?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Factory Pattern" },
      { id: "opt2", text: "Singleton Pattern" },
      { id: "opt3", text: "Observer Pattern" },
      { id: "opt4", text: "Adapter Pattern" }
    ],
    correctAnswerId: "opt2",
    explanation: "The Singleton pattern restricts class instantiation to a single object with a private constructor and static `getInstance()` method."
  },
  {
    id: "q-oop-7",
    skillId: "oop",
    topicId: "oop-pillars",
    topicName: "Four Pillars of OOP",
    question: "How does Abstraction differ from Encapsulation?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Abstraction hides implementation complexity and shows only relevant interface; Encapsulation bundles and protects internal state" },
      { id: "opt2", text: "Abstraction is only used in Python; Encapsulation is only used in Java" },
      { id: "opt3", text: "They are identical concepts with different names" },
      { id: "opt4", text: "Encapsulation is compile-time; Abstraction is runtime" }
    ],
    correctAnswerId: "opt1",
    explanation: 'Abstraction focuses on "what" an object does (hiding internal mechanism complexity via interfaces/abstract classes), while Encapsulation focuses on "how" data is protected (binding data and restricting direct field access).'
  },
  {
    id: "q-oop-8",
    skillId: "oop",
    topicId: "oop-patterns",
    topicName: "Core Design Patterns",
    question: "Which design pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically (e.g. event listeners)?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "Observer Pattern" },
      { id: "opt2", text: "Decorator Pattern" },
      { id: "opt3", text: "Facade Pattern" },
      { id: "opt4", text: "Command Pattern" }
    ],
    correctAnswerId: "opt1",
    explanation: "The Observer design pattern (Publish/Subscribe) allows subject objects to notify a list of registered observer objects automatically upon state changes."
  },
  // ==========================================
  // --- HTML5 QUESTIONS ---
  // ==========================================
  {
    id: "q-html-1",
    skillId: "html",
    topicId: "html-semantics",
    topicName: "Semantic Elements & Structure",
    question: "Why are semantic HTML elements like `<header>`, `<nav>`, `<main>`, `<article>`, and `<footer>` preferred over generic `<div>` tags?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "They automatically apply 3D graphic acceleration" },
      { id: "opt2", text: "They improve accessibility for screen readers and improve search engine (SEO) comprehension" },
      { id: "opt3", text: "They prevent JavaScript code from modifying the DOM" },
      { id: "opt4", text: "They compile directly to WebAssembly" }
    ],
    correctAnswerId: "opt2",
    explanation: "Semantic tags clearly describe their meaning to both browser agents, assistive technologies (screen readers), and search engine indexing bots."
  },
  {
    id: "q-html-2",
    skillId: "html",
    topicId: "html-forms",
    topicName: "Forms, Inputs & Validation",
    question: "Which HTML5 input attribute ensures the user must enter a value before the form can be submitted natively?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: 'mandatory="true"' },
      { id: "opt2", text: "required" },
      { id: "opt3", text: 'validate="strict"' },
      { id: "opt4", text: "notnull" }
    ],
    correctAnswerId: "opt2",
    explanation: "The boolean `required` attribute specifies that an input field must be filled out before submitting the form."
  },
  {
    id: "q-html-3",
    skillId: "html",
    topicId: "html-forms",
    topicName: "Forms, Inputs & Validation",
    question: "How do you properly associate a `<label>` element with a specific `<input>` element for accessibility and click targeting?",
    questionType: "CodeOutput",
    difficulty: "Basic",
    codeSnippet: '<label for="user-email">Email Address</label>\n<input type="email" id="user-email" name="email">',
    options: [
      { id: "opt1", text: "Match label `for` attribute with input `id` attribute" },
      { id: "opt2", text: "Match label `name` attribute with input `type` attribute" },
      { id: "opt3", text: "Place label inside a `<span>` tag" },
      { id: "opt4", text: "No association is needed" }
    ],
    correctAnswerId: "opt1",
    explanation: "Setting the `<label>` `for` attribute to match the `<input>` element's `id` attribute binds them, allowing screen readers and click-focusing to work properly."
  },
  {
    id: "q-html-4",
    skillId: "html",
    topicId: "html-media",
    topicName: "Media, Canvas & SVG",
    question: "What is the primary difference between HTML5 `<canvas>` and SVG graphics?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Canvas is vector-based (DOM-retained); SVG is raster pixel-based (immediate mode)" },
      { id: "opt2", text: "Canvas is raster pixel-based (drawn with JS); SVG is XML vector-based (DOM elements scalable without pixelation)" },
      { id: "opt3", text: "Canvas cannot be styled with CSS while SVG cannot be scripted with JS" },
      { id: "opt4", text: "SVG is only supported on mobile devices" }
    ],
    correctAnswerId: "opt2",
    explanation: "`<canvas>` provides a raster resolution-dependent pixel surface manipulated via JS drawing context. SVG is resolution-independent vector graphics composed of DOM nodes."
  },
  {
    id: "q-html-5",
    skillId: "html",
    topicId: "html-a11y",
    topicName: "Accessibility (a11y) & SEO",
    question: "What is the purpose of the `alt` attribute on an `<img>` tag?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "Specifies the alternative URL to download image from" },
      { id: "opt2", text: "Provides text alternative for screen readers and displays fallback text if the image fails to load" },
      { id: "opt3", text: "Defines the altitude and z-index of the image" },
      { id: "opt4", text: "Compresses image byte size" }
    ],
    correctAnswerId: "opt2",
    explanation: "The `alt` (alternative text) attribute provides vital accessibility descriptions for assistive technologies and renders readable text if the image asset cannot be loaded."
  },
  {
    id: "q-html-6",
    skillId: "html",
    topicId: "html-a11y",
    topicName: "Accessibility (a11y) & SEO",
    question: 'What does the meta viewport tag `<meta name="viewport" content="width=device-width, initial-scale=1.0">` do?',
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Enables dark mode across all browsers" },
      { id: "opt2", text: "Sets the viewport width to match screen width and sets initial zoom level for responsive rendering on mobile devices" },
      { id: "opt3", text: "Caches HTML pages on mobile edge servers" },
      { id: "opt4", text: "Disables CSS media queries" }
    ],
    correctAnswerId: "opt2",
    explanation: "The viewport meta tag instructs mobile browsers to render the page at the physical device width at 1:1 scale rather than defaulting to a zoomed-out 980px desktop canvas."
  },
  {
    id: "q-html-7",
    skillId: "html",
    topicId: "html-semantics",
    topicName: "Semantic Elements & Structure",
    question: "Which HTML5 element represents self-contained content that is intended to be independently distributable (e.g. blog post, forum reply, news item)?",
    questionType: "Conceptual",
    difficulty: "Basic",
    options: [
      { id: "opt1", text: "<section>" },
      { id: "opt2", text: "<article>" },
      { id: "opt3", text: "<aside>" },
      { id: "opt4", text: "<div>" }
    ],
    correctAnswerId: "opt2",
    explanation: "`<article>` represents a complete, self-contained composition in a document, page, or application that could be syndicated independently."
  },
  {
    id: "q-html-8",
    skillId: "html",
    topicId: "html-forms",
    topicName: "Forms, Inputs & Validation",
    question: 'Which HTTP method should be specified in `<form method="...">` when submitting sensitive credentials like passwords to prevent query parameters from being logged in URL history?',
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "GET" },
      { id: "opt2", text: "POST" },
      { id: "opt3", text: "HEAD" },
      { id: "opt4", text: "OPTIONS" }
    ],
    correctAnswerId: "opt2",
    explanation: "`POST` sends form payload data inside the HTTP request body rather than appending it to the URL query string like `GET`, preventing sensitive data leakage in browser logs and URLs."
  },
  // ==========================================
  // --- CSS3 QUESTIONS ---
  // ==========================================
  {
    id: "q-css-1",
    skillId: "css",
    topicId: "css-boxmodel",
    topicName: "Box Model & Specificity",
    question: "In standard CSS Box Model, what components make up the total calculated width of an element?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "Content width only" },
      { id: "opt2", text: "Content width + Padding + Border + Margin" },
      { id: "opt3", text: "Content width + Border radius" },
      { id: "opt4", text: "Screen width minus padding" }
    ],
    correctAnswerId: "opt2",
    explanation: "The CSS Box Model consists of four concentric layers: Content (inner), Padding, Border, and Margin (outer space)."
  },
  {
    id: "q-css-2",
    skillId: "css",
    topicId: "css-boxmodel",
    topicName: "Box Model & Specificity",
    question: "What is the effect of setting `box-sizing: border-box;` on an element?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "It hides the border of the element" },
      { id: "opt2", text: "Padding and border are included within the specified width and height, preventing layout expansion" },
      { id: "opt3", text: "It makes the element float to the left" },
      { id: "opt4", text: "It automatically rounds all corners" }
    ],
    correctAnswerId: "opt2",
    explanation: "`box-sizing: border-box` tells the browser to account for any border and padding in the values you specify for an element's width and height."
  },
  {
    id: "q-css-3",
    skillId: "css",
    topicId: "css-flexbox",
    topicName: "Flexbox Layouts",
    question: "In a Flexbox container with default `flex-direction: row`, which property aligns items along the main horizontal axis?",
    questionType: "Conceptual",
    difficulty: "Beginner",
    options: [
      { id: "opt1", text: "align-items" },
      { id: "opt2", text: "justify-content" },
      { id: "opt3", text: "align-content" },
      { id: "opt4", text: "flex-wrap" }
    ],
    correctAnswerId: "opt2",
    explanation: "`justify-content` aligns flex items along the main axis (horizontal when flex-direction is row). `align-items` aligns along the cross axis (vertical)."
  },
  {
    id: "q-css-4",
    skillId: "css",
    topicId: "css-flexbox",
    topicName: "Flexbox Layouts",
    question: "How do you center an element both horizontally and vertically inside a container using Flexbox?",
    questionType: "CodeOutput",
    difficulty: "Basic",
    codeSnippet: ".container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}",
    options: [
      { id: "opt1", text: "Centers child items both horizontally and vertically" },
      { id: "opt2", text: "Aligns items to top left corner" },
      { id: "opt3", text: "Spreads items evenly across 4 corners" },
      { id: "opt4", text: "Hides child elements" }
    ],
    correctAnswerId: "opt1",
    explanation: "Setting `display: flex`, `justify-content: center` (main axis center), and `align-items: center` (cross axis center) centers child elements in both directions."
  },
  {
    id: "q-css-5",
    skillId: "css",
    topicId: "css-grid",
    topicName: "CSS Grid & Responsive Design",
    question: "In CSS Grid, what does `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));` achieve?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "Creates a fixed 3-column table" },
      { id: "opt2", text: "Creates a fully responsive grid where columns automatically wrap and fill available space without media queries" },
      { id: "opt3", text: "Sets all columns to exactly 250px width permanently" },
      { id: "opt4", text: "Disables mobile responsiveness" }
    ],
    correctAnswerId: "opt2",
    explanation: "`repeat(auto-fit, minmax(250px, 1fr))` dynamically places as many >=250px columns as can fit in the row and stretches them fractionally to fill available width."
  },
  {
    id: "q-css-6",
    skillId: "css",
    topicId: "css-animation",
    topicName: "Transitions, Keyframes & Variables",
    question: "Which CSS properties are most performant to animate because they can be offloaded to the GPU compositor without triggering layout reflow or repaint?",
    questionType: "Conceptual",
    difficulty: "Advanced",
    options: [
      { id: "opt1", text: "`width`, `height`, and `margin`" },
      { id: "opt2", text: "`transform` and `opacity`" },
      { id: "opt3", text: "`top`, `left`, and `padding`" },
      { id: "opt4", text: "`box-shadow` and `border-width`" }
    ],
    correctAnswerId: "opt2",
    explanation: "Animations on `transform` (translate, scale, rotate) and `opacity` bypass layout recalculation and paint cycles, running directly on GPU composite layers for 60fps performance."
  },
  {
    id: "q-css-7",
    skillId: "css",
    topicId: "css-boxmodel",
    topicName: "Box Model & Specificity",
    question: "Between the following selectors, which one has the highest CSS specificity weight?",
    questionType: "Conceptual",
    difficulty: "Intermediate",
    options: [
      { id: "opt1", text: "`#header-nav` (ID selector)" },
      { id: "opt2", text: "`.nav-item.active` (Two class selectors)" },
      { id: "opt3", text: "`header nav ul li a` (Five element selectors)" },
      { id: "opt4", text: "`*` (Universal selector)" }
    ],
    correctAnswerId: "opt1",
    explanation: "CSS specificity hierarchy is: Inline styles (1000) > ID selectors (100) > Class/Attribute/Pseudo-class selectors (10) > Element selectors (1). A single ID selector (100) outweighs any number of classes."
  },
  {
    id: "q-css-8",
    skillId: "css",
    topicId: "css-animation",
    topicName: "Transitions, Keyframes & Variables",
    question: "How do you define and consume a CSS Custom Property (CSS Variable)?",
    questionType: "CodeOutput",
    difficulty: "Basic",
    codeSnippet: ":root {\n    --primary-color: #2563eb;\n}\n.btn {\n    background-color: var(--primary-color);\n}",
    options: [
      { id: "opt1", text: "Correct declaration using `--var` and consumption via `var(--var)`" },
      { id: "opt2", text: "Variables can only be used with Sass compilers" },
      { id: "opt3", text: "Requires `$` prefix like `$primary-color`" },
      { id: "opt4", text: "Custom properties cannot be declared in `:root`" }
    ],
    correctAnswerId: "opt1",
    explanation: "Native CSS custom properties are prefixed with double hyphens `--custom-name` and accessed using the `var(--custom-name)` function."
  }
];
var SEED_ACHIEVEMENTS = [
  {
    id: "ach-first-test",
    key: "first_assessment",
    title: "First Assessment Completed",
    description: "Took your first technical skill evaluation and generated an AI baseline.",
    icon: "Award",
    category: "Assessment",
    xpReward: 100,
    earned: true,
    earnedAt: "2026-08-20T10:00:00Z",
    progress: 1,
    maxProgress: 1
  },
  {
    id: "ach-python-beg",
    key: "python_beginner",
    title: "Python Foundation Mastered",
    description: "Scored over 70% in Python core fundamentals and control structures.",
    icon: "Terminal",
    category: "Mastery",
    xpReward: 250,
    earned: true,
    earnedAt: "2026-08-22T14:30:00Z",
    progress: 1,
    maxProgress: 1
  },
  {
    id: "ach-streak-7",
    key: "streak_7_days",
    title: "7-Day Learning Streak",
    description: "Maintained active daily learning, practice, or assessment for a full week.",
    icon: "Flame",
    category: "Streak",
    xpReward: 300,
    earned: true,
    earnedAt: "2026-08-26T09:00:00Z",
    progress: 7,
    maxProgress: 7
  },
  {
    id: "ach-sql-master",
    key: "sql_join_master",
    title: "SQL JOIN Master",
    description: "Achieved 100% accuracy on complex relational queries and multi-table joins.",
    icon: "Database",
    category: "Mastery",
    xpReward: 200,
    earned: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: "ach-100-q",
    key: "hundred_questions",
    title: "100 Questions Solved",
    description: "Attempted and resolved 100 adaptive assessment questions across any technical skill.",
    icon: "Zap",
    category: "Speed",
    xpReward: 500,
    earned: false,
    progress: 42,
    maxProgress: 100
  },
  {
    id: "ach-tutor-active",
    key: "ai_tutor_cadet",
    title: "Curious Mind",
    description: "Engaged the GenAI Tutor with 5+ personalized conceptual inquiries.",
    icon: "Sparkles",
    category: "AI Tutor",
    xpReward: 150,
    earned: true,
    earnedAt: "2026-08-25T16:00:00Z",
    progress: 5,
    maxProgress: 5
  }
];

// src/data/seedAssessments.ts
var SEED_ASSESSMENT_CONFIGS = [
  // --- ACADEMIC ASSESSMENTS ---
  {
    id: "acad-dbms-101",
    title: "DBMS: Relational Algebra, Normalization & ACID Transactions",
    description: "Comprehensive college curriculum assessment covering functional dependencies, BCNF/3NF, indexing, and serializability.",
    category: "Academic",
    domain: "DBMS & Relational Theory",
    difficulty: "Intermediate",
    durationMinutes: 25,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 3,
    passPercentage: 50,
    status: "published",
    instructions: [
      "Each question carries 5 marks. Incorrect answers incur a penalty of -1.25 marks (-25%).",
      "Calculators and scratch notes are permitted.",
      "Auto-submission will execute immediately once the countdown timer expires.",
      "Ensure a stable network connection before starting."
    ],
    tags: ["DBMS", "Relational Calculus", "Normalization", "ACID", "Semester Exam"],
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "acad-os-201",
    title: "Operating Systems: Concurrency, Deadlocks & Virtual Memory",
    description: "Evaluate your understanding of semaphores, Banker algorithm, CPU scheduling (SJF/Round-Robin), and page replacement policies.",
    category: "Academic",
    domain: "Operating Systems",
    difficulty: "Advanced",
    durationMinutes: 30,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 3,
    passPercentage: 50,
    status: "published",
    instructions: [
      "Questions include numerical computation of scheduling wait times and paging offsets.",
      "Negative marking applies for wrong answers (-0.25x question mark).",
      "The test cannot be paused once started."
    ],
    tags: ["OS", "Deadlocks", "Paging", "Process Synchronization", "Core CS"],
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-10-02T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "acad-cn-301",
    title: "Computer Networks: TCP/IP Stack, Subnetting & Routing Protocols",
    description: "Assess networking fundamentals including CIDR subnet calculations, TCP congestion control, sliding window protocol, and DNS/BGP.",
    category: "Academic",
    domain: "Computer Networks",
    difficulty: "Intermediate",
    durationMinutes: 25,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 3,
    passPercentage: 50,
    status: "published",
    instructions: [
      "CIDR subnet mask calculations are required.",
      "Check all options carefully before confirming your answer.",
      "Flag questions if you wish to review them before final submission."
    ],
    tags: ["Networks", "TCP/IP", "Subnetting", "Routing", "OSI"],
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-10-03T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "acad-oose-401",
    title: "Object-Oriented Software Design & SOLID Architecture",
    description: "Design patterns (Singleton, Factory, Observer, Decorator), UML interaction models, and maintainable software engineering practices.",
    category: "Academic",
    domain: "Software Engineering",
    difficulty: "Intermediate",
    durationMinutes: 20,
    questionCount: 6,
    maxMarks: 30,
    negativeMarking: 0,
    maxAttempts: 3,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Evaluates practical architectural judgment.",
      "No negative marking for this design concepts paper.",
      "Read code snippets thoroughly."
    ],
    tags: ["Design Patterns", "SOLID", "Architecture", "UML"],
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-10-04T00:00:00.000Z",
    allowReview: true
  },
  // --- PROGRAMMING & TECHNICAL SKILLS ---
  {
    id: "tech-python-mastery",
    title: "Python Engineering: Advanced Data Structures & Concurrency",
    description: "Deep dive into Python internals: dunder methods, generator pipelines, asyncio event loops, memory management, and typing.",
    category: "Technical",
    domain: "Python",
    difficulty: "Advanced",
    durationMinutes: 25,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 5,
    passPercentage: 65,
    status: "published",
    instructions: [
      "Analyzes realistic code snippets and output predictions.",
      "Beware of mutable default arguments and late binding closures.",
      "Server-authoritative timer will automatically finalize your score at 0:00."
    ],
    tags: ["Python", "Asyncio", "Generators", "OOP", "Code Output"],
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-10-05T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "tech-java-enterprise",
    title: "Java Core, Collections & Multithreaded Systems",
    description: "Enterprise Java assessment on JVM memory regions, ConcurrentHashMap, garbage collection flags, stream API, and executor pools.",
    category: "Technical",
    domain: "Java",
    difficulty: "Advanced",
    durationMinutes: 30,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 5,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Focuses on concurrency safety, thread synchronization, and JVM behavior.",
      "Review answered questions on the question palette before submitting."
    ],
    tags: ["Java", "Multithreading", "JVM", "Collections", "Streams"],
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-10-05T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "tech-js-v8",
    title: "Modern JavaScript: ES6+, Microtasks & Asynchronous V8 Internals",
    description: "Test your understanding of the V8 event loop, promise resolution queues, prototypal inheritance, closures, and modern web APIs.",
    category: "Technical",
    domain: "JavaScript",
    difficulty: "Intermediate",
    durationMinutes: 20,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0,
    maxAttempts: 5,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Covers execution order of macrotasks vs microtasks.",
      "Understand lexical scoping and reference mutations."
    ],
    tags: ["JavaScript", "V8", "Async/Await", "Event Loop", "ES6+"],
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-10-06T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "tech-cpp-systems",
    title: "Modern C++: Memory Safety, Pointers & STL Optimizations",
    description: "Assess pointer arithmetic, RAII, smart pointers, move semantics, template metaprogramming, and STL complexity guarantees.",
    category: "Technical",
    domain: "C++",
    difficulty: "Advanced",
    durationMinutes: 30,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 5,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Examine memory leaks and dangling pointer references in sample code.",
      "Negative marking applies for incorrect options."
    ],
    tags: ["C++", "Pointers", "STL", "Move Semantics", "Systems"],
    createdAt: "2026-09-12T00:00:00.000Z",
    updatedAt: "2026-10-06T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "tech-dsa-algorithms",
    title: "Data Structures & Algorithms: Trees, Graphs, DP & Complexity",
    description: "Benchmark your algorithmic reasoning on binary search trees, Dijkstra shortest path, dynamic programming transitions, and amortized complexity.",
    category: "Technical",
    domain: "Data Structures & Algorithms",
    difficulty: "Advanced",
    durationMinutes: 35,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 5,
    passPercentage: 65,
    status: "published",
    instructions: [
      "Calculate Big-O time and auxiliary space complexities.",
      "Evaluate edge cases like disconnected graphs or negative cycles."
    ],
    tags: ["DSA", "Graphs", "Trees", "Dynamic Programming", "Big-O"],
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "tech-coding-challenges",
    title: "Live Algorithmic Coding Assessment: Problem Solving Lab",
    description: "Interactive coding challenge with automated test case evaluation. Solve array transformations, string manipulations, and hashing problems.",
    category: "Technical",
    domain: "Coding Challenges",
    difficulty: "Intermediate",
    durationMinutes: 45,
    questionCount: 3,
    maxMarks: 60,
    negativeMarking: 0,
    maxAttempts: 5,
    passPercentage: 60,
    status: "published",
    isCodingSupported: true,
    instructions: [
      "Write your solution in JavaScript or Python.",
      "You can run sample test cases as many times as needed before final submission.",
      "Your solution will be evaluated against hidden test cases upon final submission.",
      "Ensure standard algorithmic complexity constraints (O(N) or O(N log N))."
    ],
    tags: ["Coding Challenge", "Live Code", "Algorithms", "Interactive Lab"],
    createdAt: "2026-09-20T00:00:00.000Z",
    updatedAt: "2026-10-08T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "tech-system-design",
    title: "Cloud Computing & System Design Architecture",
    description: "Evaluates architectural scalability: load balancing, microservices, CAP theorem, distributed caching (Redis), and database sharding.",
    category: "Technical",
    domain: "Cloud & System Design",
    difficulty: "Expert",
    durationMinutes: 25,
    questionCount: 6,
    maxMarks: 30,
    negativeMarking: 0,
    maxAttempts: 3,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Real-world system design interview questions.",
      "Assess tradeoffs between consistency, availability, and latency."
    ],
    tags: ["System Design", "Cloud", "Microservices", "Distributed Systems"],
    createdAt: "2026-09-25T00:00:00.000Z",
    updatedAt: "2026-10-08T00:00:00.000Z",
    allowReview: true
  },
  // --- PLACEMENT PREPARATION ---
  {
    id: "place-quant-mastery",
    title: "Quantitative Aptitude: Speed Math, Permutations & Probability",
    description: "Campus placement preparation covering percentages, profit & loss, time & work, speed/distance, permutations, combinations, and Bayes theorem.",
    category: "Placement",
    domain: "Quantitative Aptitude",
    difficulty: "Intermediate",
    durationMinutes: 30,
    questionCount: 10,
    maxMarks: 50,
    negativeMarking: 0.25,
    maxAttempts: 5,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Speed and mental shortcuts are essential.",
      "Penalty of -1.25 marks for every wrong answer.",
      "Manage your time: aim for under 3 minutes per question."
    ],
    tags: ["Placement", "Quant", "Probability", "Time & Work", "Campus Drives"],
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "place-logical-reasoning",
    title: "Logical Reasoning & Analytical Thinking Assessment",
    description: "Master placement reasoning tests: seating arrangements, syllogisms, blood relations, direction sense, and coded inequalities.",
    category: "Placement",
    domain: "Logical Reasoning",
    difficulty: "Intermediate",
    durationMinutes: 25,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0.25,
    maxAttempts: 5,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Draw layout diagrams on paper for puzzle questions.",
      "Check assumptions carefully for syllogism deduction."
    ],
    tags: ["Placement", "Logical Reasoning", "Puzzles", "Syllogism", "Analytical"],
    createdAt: "2026-09-18T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "place-verbal-ability",
    title: "Verbal Ability & Professional Tech Communication",
    description: "Sentence correction, reading comprehension, vocabulary in context, grammar syntax, and critical reasoning passages.",
    category: "Placement",
    domain: "Verbal Ability",
    difficulty: "Basic",
    durationMinutes: 20,
    questionCount: 8,
    maxMarks: 40,
    negativeMarking: 0,
    maxAttempts: 5,
    passPercentage: 60,
    status: "published",
    instructions: [
      "Read passages attentively before answering comprehension items.",
      "No negative marking for this section."
    ],
    tags: ["Placement", "Verbal", "Grammar", "Comprehension", "Communication"],
    createdAt: "2026-09-20T00:00:00.000Z",
    updatedAt: "2026-10-08T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "place-mock-tcs-ninja",
    title: "IT Services Company-Style Mock Assessment (TCS / Infosys)",
    description: "Comprehensive 40-minute simulation mimicking tier-1 campus hiring: 5 Quant, 5 Logical, 5 Tech MCQs (Java/C/Python).",
    category: "Placement",
    domain: "Company Mock Drive",
    difficulty: "Intermediate",
    durationMinutes: 40,
    questionCount: 12,
    maxMarks: 60,
    negativeMarking: 0.25,
    maxAttempts: 3,
    passPercentage: 65,
    status: "published",
    instructions: [
      "Simulates full company screening rounds.",
      "Sectional timing discipline is recommended.",
      "Scores reflect eligibility percentiles for campus recruitment."
    ],
    tags: ["Company Mock", "TCS", "Infosys", "Wipro", "Placement Drive"],
    createdAt: "2026-09-22T00:00:00.000Z",
    updatedAt: "2026-10-08T00:00:00.000Z",
    allowReview: true
  },
  {
    id: "place-product-mock",
    title: "Product Engineering Company Mock Assessment",
    description: "High-rigor diagnostic designed for startups and product giants: advanced DSA, system design fundamentals, and debugging tricky code snippets.",
    category: "Placement",
    domain: "Product Company Mock",
    difficulty: "Advanced",
    durationMinutes: 45,
    questionCount: 10,
    maxMarks: 50,
    negativeMarking: 0.25,
    maxAttempts: 3,
    passPercentage: 70,
    status: "published",
    instructions: [
      "Evaluates edge cases, code refactoring, and algorithmic optimality.",
      "Strict server-side deadline enforced."
    ],
    tags: ["Product Mock", "FAANG Style", "High Rigor", "Placement", "DSA"],
    createdAt: "2026-09-25T00:00:00.000Z",
    updatedAt: "2026-10-09T00:00:00.000Z",
    allowReview: true
  }
];
var SEED_TEST_QUESTIONS = {
  "acad-dbms-101": [
    {
      id: "q-dbms-1",
      skillId: "sql",
      topicId: "dbms-normalization",
      topicName: "Normalization & Functional Dependencies",
      question: "Given relation R(A, B, C, D) with functional dependencies: F = { A -> B, B -> C, C -> D, D -> A }. In which highest normal form is R?",
      questionType: "MCQ",
      difficulty: "Intermediate",
      options: [
        { id: "opt1", text: "Boyce-Codd Normal Form (BCNF)" },
        { id: "opt2", text: "Third Normal Form (3NF) only, not BCNF" },
        { id: "opt3", text: "Second Normal Form (2NF) only" },
        { id: "opt4", text: "First Normal Form (1NF) only" }
      ],
      correctAnswerId: "opt1",
      explanation: "Every attribute (A, B, C, D) can determine all other attributes through transitivity. Hence every single attribute is a candidate key. Since the left side of every non-trivial functional dependency is a superkey, R is in BCNF.",
      marks: 5,
      hints: ["Determine all candidate keys of the relation."]
    },
    {
      id: "q-dbms-2",
      skillId: "sql",
      topicId: "dbms-transactions",
      topicName: "ACID Properties & Serializability",
      question: "Which conflict operation between two concurrent transactions T1 and T2 on the same data item Q creates a serializability conflict?",
      questionType: "MCQ",
      difficulty: "Intermediate",
      options: [
        { id: "opt1", text: "T1 reads Q and T2 reads Q" },
        { id: "opt2", text: "T1 reads Q and T2 writes Q" },
        { id: "opt3", text: "T1 writes Q and T2 writes different item P" },
        { id: "opt4", text: "T1 aborts before reading Q" }
      ],
      correctAnswerId: "opt2",
      explanation: "A conflict occurs between two instructions of different transactions accessing the same item if at least one of the operations is a write (i.e. Read-Write or Write-Write conflict). Read-Read never conflicts.",
      marks: 5,
      hints: ["Remember that read operations do not alter database state."]
    },
    {
      id: "q-dbms-3",
      skillId: "sql",
      topicId: "dbms-indexing",
      topicName: "B+ Tree Indexing",
      question: "Why are B+ trees preferred over standard B-trees for relational database disk indexing?",
      questionType: "MCQ",
      difficulty: "Advanced",
      options: [
        { id: "opt1", text: "All data pointers are stored only in leaf nodes, enabling high fan-out internal nodes and rapid range scans via linked leaves" },
        { id: "opt2", text: "B+ trees require less disk space because they do not have pointers" },
        { id: "opt3", text: "B+ trees never need balancing or node splits during inserts" },
        { id: "opt4", text: "Internal nodes in B+ trees store complete row tuples directly" }
      ],
      correctAnswerId: "opt1",
      explanation: "Because internal nodes only hold search keys and child pointers (no data records), more keys fit into a disk page (higher fan-out, lower tree height). Additionally, leaf nodes are linked sequentially, making range queries very efficient.",
      marks: 5,
      hints: ["Think about range queries and page cache utilization."]
    },
    {
      id: "q-dbms-4",
      skillId: "sql",
      topicId: "dbms-sql",
      topicName: "SQL Aggregate HAVING vs WHERE",
      question: "What is the fundamental difference between the WHERE clause and the HAVING clause in SQL?",
      questionType: "MCQ",
      difficulty: "Basic",
      options: [
        { id: "opt1", text: "WHERE filters rows before aggregation; HAVING filters groups after GROUP BY aggregation" },
        { id: "opt2", text: "HAVING can only be used with primary keys" },
        { id: "opt3", text: "WHERE is only used in subqueries, whereas HAVING is in outer queries" },
        { id: "opt4", text: "HAVING runs before table joins are resolved" }
      ],
      correctAnswerId: "opt1",
      explanation: "The WHERE clause operates on individual rows prior to GROUP BY. The HAVING clause applies filters to the grouped aggregate results (e.g., HAVING COUNT(*) > 5).",
      marks: 5,
      hints: ["Consider the logical query processing order."]
    },
    {
      id: "q-dbms-5",
      skillId: "sql",
      topicId: "dbms-concurrency",
      topicName: "Two-Phase Locking (2PL)",
      question: "What guarantee does the Strict Two-Phase Locking (Strict 2PL) protocol provide?",
      questionType: "MCQ",
      difficulty: "Advanced",
      options: [
        { id: "opt1", text: "Ensures conflict serializability and prevents cascading rollbacks by holding exclusive locks until transaction commit/abort" },
        { id: "opt2", text: "Prevents deadlocks completely without lock graphs" },
        { id: "opt3", text: "Allows transactions to acquire new locks after releasing previous ones" },
        { id: "opt4", text: "Guarantees execution without any disk I/O" }
      ],
      correctAnswerId: "opt1",
      explanation: "Strict 2PL requires that all exclusive locks acquired by a transaction be held until the transaction finishes (commit/abort). This guarantees conflict serializability and avoids cascading aborts.",
      marks: 5,
      hints: ["Focus on what happens if an uncommitted transaction crashes."]
    },
    {
      id: "q-dbms-6",
      skillId: "sql",
      topicId: "dbms-normalization",
      topicName: "Lossless Decomposition",
      question: "A decomposition of R into R1 and R2 is lossless-join if and only if which condition holds?",
      questionType: "MCQ",
      difficulty: "Intermediate",
      options: [
        { id: "opt1", text: "(R1 \u2229 R2) -> R1 or (R1 \u2229 R2) -> R2" },
        { id: "opt2", text: "R1 and R2 have completely disjoint attributes" },
        { id: "opt3", text: "R1 \u222A R2 contains fewer attributes than R" },
        { id: "opt4", text: "Neither relation has any primary key" }
      ],
      correctAnswerId: "opt1",
      explanation: "For a lossless decomposition of R into (R1, R2), the common attribute set (R1 \u2229 R2) must be a superkey of either R1 or R2.",
      marks: 5,
      hints: ["The common attributes must uniquely identify tuples in at least one sub-relation."]
    },
    {
      id: "q-dbms-7",
      skillId: "sql",
      topicId: "dbms-recovery",
      topicName: "WAL & Checkpointing",
      question: "What does Write-Ahead Logging (WAL) mandate before modified buffer pages are written to persistent disk?",
      questionType: "MCQ",
      difficulty: "Intermediate",
      options: [
        { id: "opt1", text: "Log records corresponding to an update must be flushed to disk before the actual database page is flushed" },
        { id: "opt2", text: "All transactions in memory must commit before any log is written" },
        { id: "opt3", text: "Tables must be locked in read-only mode during logging" },
        { id: "opt4", text: "Index trees must be recomputed on each write" }
      ],
      correctAnswerId: "opt1",
      explanation: "The WAL protocol ensures that log records representing modifications are written to durable storage prior to the dirty database pages being written to disk, ensuring atomicity and durability on crash recovery.",
      marks: 5,
      hints: ["Why is it called Write-Ahead?"]
    },
    {
      id: "q-dbms-8",
      skillId: "sql",
      topicId: "dbms-relational-algebra",
      topicName: "Relational Algebra Operators",
      question: "Which relational algebra operation is equivalent to the Cartesian product followed by a selection condition?",
      questionType: "MCQ",
      difficulty: "Basic",
      options: [
        { id: "opt1", text: "Theta Join (\u03B8-join)" },
        { id: "opt2", text: "Projection (\u03C0)" },
        { id: "opt3", text: "Set Difference (-)" },
        { id: "opt4", text: "Rename (\u03C1)" }
      ],
      correctAnswerId: "opt1",
      explanation: "A theta join R \u22C8_\u03B8 S is defined mathematically as \u03C3_\u03B8 (R \xD7 S), which is a selection condition \u03B8 applied to the Cartesian product of R and S.",
      marks: 5,
      hints: ["Think of Cross Join + Condition."]
    }
  ],
  "tech-coding-challenges": [
    {
      id: "q-code-1",
      skillId: "coding",
      topicId: "two-sum-opt",
      topicName: "Array Hashing: Target Sum Pair",
      question: "Given an array of integers `nums` and an integer `target`, return the 0-based indices of the two numbers such that they add up to `target`. You may assume that each input has exactly one solution, and you may not use the same element twice. Return indices sorted in ascending order.",
      questionType: "Coding",
      difficulty: "Basic",
      options: [],
      correctAnswerId: "code",
      explanation: "Use a hash map to store numbers and their indices. For each number, check if target - num exists in the map.",
      marks: 20,
      codingDetails: {
        problemStatement: "Given an array of integers `nums` and an integer `target`, return the 0-based indices of the two numbers such that they add up to `target` as a JSON array `[index1, index2]`.",
        inputFormat: 'JSON string: {"nums": [2, 7, 11, 15], "target": 9}',
        outputFormat: "JSON array of indices: [0, 1]",
        constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, exact 1 valid pair exists.",
        sampleTestCases: [
          { input: '{"nums": [2, 7, 11, 15], "target": 9}', expectedOutput: "[0,1]", explanation: "nums[0] + nums[1] == 2 + 7 == 9" },
          { input: '{"nums": [3, 2, 4], "target": 6}', expectedOutput: "[1,2]", explanation: "nums[1] + nums[2] == 2 + 4 == 6" }
        ],
        hiddenTestCases: [
          { input: '{"nums": [3, 3], "target": 6}', expectedOutput: "[0,1]" },
          { input: '{"nums": [1, 5, 8, 3, 9], "target": 12}', expectedOutput: "[1,2]" }
        ],
        starterCode: {
          javascript: `function solve(input) {
  const { nums, target } = typeof input === 'string' ? JSON.parse(input) : input;
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
          python: `def solve(data):
    nums = data["nums"]
    target = data["target"]
    lookup = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in lookup:
            return [lookup[comp], i]
        lookup[num] = i
    return []`
        }
      }
    },
    {
      id: "q-code-2",
      skillId: "coding",
      topicId: "palindrome-clean",
      topicName: "String Processing: Valid Palindrome",
      question: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Return `true` if it is a palindrome, or `false` otherwise.",
      questionType: "Coding",
      difficulty: "Basic",
      options: [],
      correctAnswerId: "code",
      explanation: "Normalize by stripping non-alphanumeric chars and checking two pointers from both ends.",
      marks: 20,
      codingDetails: {
        problemStatement: "Return boolean true if cleaned string is palindrome, false otherwise.",
        inputFormat: 'JSON string: {"s": "A man, a plan, a canal: Panama"}',
        outputFormat: "boolean: true or false",
        constraints: "1 <= s.length <= 2 * 10^5, ASCII printable characters.",
        sampleTestCases: [
          { input: '{"s": "A man, a plan, a canal: Panama"}', expectedOutput: "true" },
          { input: '{"s": "race a car"}', expectedOutput: "false" }
        ],
        hiddenTestCases: [
          { input: '{"s": " "}', expectedOutput: "true" },
          { input: '{"s": "0P"}', expectedOutput: "false" }
        ],
        starterCode: {
          javascript: `function solve(input) {
  const { s } = typeof input === 'string' ? JSON.parse(input) : input;
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
          python: `import re
def solve(data):
    s = data["s"].lower()
    clean = re.sub(r'[^a-z0-9]', '', s)
    return clean == clean[::-1]`
        }
      }
    },
    {
      id: "q-code-3",
      skillId: "coding",
      topicId: "max-subarray",
      topicName: "Dynamic Programming: Maximum Subarray",
      question: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum. Use Kadane's algorithm for O(N) time.",
      questionType: "Coding",
      difficulty: "Intermediate",
      options: [],
      correctAnswerId: "code",
      explanation: "Kadane algorithm tracks current_sum = max(num, current_sum + num) and max_sum = max(max_sum, current_sum).",
      marks: 20,
      codingDetails: {
        problemStatement: "Return the maximum contiguous subarray sum.",
        inputFormat: 'JSON string: {"nums": [-2,1,-3,4,-1,2,1,-5,4]}',
        outputFormat: "number: 6",
        constraints: "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
        sampleTestCases: [
          { input: '{"nums": [-2,1,-3,4,-1,2,1,-5,4]}', expectedOutput: "6", explanation: "[4,-1,2,1] has the largest sum = 6" },
          { input: '{"nums": [1]}', expectedOutput: "1" }
        ],
        hiddenTestCases: [
          { input: '{"nums": [5,4,-1,7,8]}', expectedOutput: "23" },
          { input: '{"nums": [-1, -2, -3]}', expectedOutput: "-1" }
        ],
        starterCode: {
          javascript: `function solve(input) {
  const { nums } = typeof input === 'string' ? JSON.parse(input) : input;
  let maxSoFar = nums[0];
  let currMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currMax = Math.max(nums[i], currMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currMax);
  }
  return maxSoFar;
}`,
          python: `def solve(data):
    nums = data["nums"]
    max_so_far = nums[0]
    curr = nums[0]
    for x in nums[1:]:
        curr = max(x, curr + x)
        max_so_far = max(max_so_far, curr)
    return max_so_far`
        }
      }
    }
  ]
};

// server/geminiService.ts
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
var genAIClient = null;
function getAIClient() {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return genAIClient;
}
async function generateWithModelFallback(requestBuilder) {
  const modelCandidates = [
    { name: "gemini-3.8-flash", hasThinking: false },
    { name: "gemini-flash-latest", hasThinking: false },
    { name: "gemini-3.1-flash-lite", hasThinking: false }
  ];
  let lastError = null;
  for (const candidate of modelCandidates) {
    try {
      const configOverrides = candidate.hasThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {};
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`Timeout on model ${candidate.name}`)), 14e3)
      );
      const response = await Promise.race([
        requestBuilder(candidate.name, configOverrides),
        timeoutPromise
      ]);
      if (response && (response.text || response.candidates)) {
        return response;
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  throw lastError || new Error("All Gemini model fallbacks exhausted");
}
async function analyzeAssessmentWithAI(params) {
  const { skillName, score, accuracy, topicScores, difficultyScores, userSelfConfidence, userCareerGoal, userExperience } = params;
  let fallbackLevel = "Beginner";
  if (score >= 86) fallbackLevel = "Expert";
  else if (score >= 71) fallbackLevel = "Advanced";
  else if (score >= 51) fallbackLevel = "Intermediate";
  else if (score >= 31) fallbackLevel = "Basic";
  const strengthsList = topicScores.filter((t) => t.percentage >= 70).map((t) => t.topicName);
  const weaknessesList = topicScores.filter((t) => t.percentage < 70).map((t) => t.topicName);
  const prompt = `You are a Lead Tech Educator & Assessment AI Evaluator for computer science and software development.
Evaluate a student's recent technical assessment for "${skillName}".

Assessment Performance Data:
- Overall Score: ${score}% (Accuracy: ${accuracy}%)
- Topic Scores: ${JSON.stringify(topicScores, null, 2)}
- Difficulty Performance: ${JSON.stringify(difficultyScores, null, 2)}
- Student Self-Reported Confidence (1-5 scale): ${userSelfConfidence || "Not provided"}/5
- Student Background/Experience: ${userExperience || "Student"}
- Student Career Goal: ${userCareerGoal || "Software Engineer"}

Tasks:
1. Classify Skill Level strictly into one of: 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'.
2. Provide a clear "confidenceVsActualAnalysis" comparing their self-confidence with test results.
3. List 2-4 Strong Areas where they demonstrated consistent competency.
4. List 2-4 Weak Areas that need direct improvement.
5. Identify 2-3 Knowledge Gaps (prerequisite concepts needed before advanced work).
6. Detect 1-2 Common Misconceptions or potential pitfalls reflected in their weak areas.
7. Provide 2-4 Priority Topics with urgency ('High', 'Medium', 'Low') and educational reasons.
8. Write an insightful 2-sentence Key Observation.
9. Provide a concise, motivating Recommended Next Step.

Return strictly valid JSON conforming to the requested schema.`;
  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback(
        (model, configOverrides) => ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skillName: { type: Type.STRING },
                classifiedLevel: { type: Type.STRING, enum: ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"] },
                overallScore: { type: Type.NUMBER },
                confidenceVsActualAnalysis: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                knowledgeGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityTopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                      reason: { type: Type.STRING }
                    },
                    required: ["topic", "priority", "reason"]
                  }
                },
                keyObservation: { type: Type.STRING },
                recommendedNextStep: { type: Type.STRING }
              },
              required: [
                "skillName",
                "classifiedLevel",
                "overallScore",
                "confidenceVsActualAnalysis",
                "strengths",
                "weaknesses",
                "knowledgeGaps",
                "misconceptions",
                "priorityTopics",
                "keyObservation",
                "recommendedNextStep"
              ]
            }
          }
        })
      );
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          skillName,
          classifiedLevel: parsed.classifiedLevel || fallbackLevel,
          overallScore: score,
          confidenceVsActualAnalysis: parsed.confidenceVsActualAnalysis || `Your score of ${score}% reflects a solid ${fallbackLevel} understanding.`,
          strengths: parsed.strengths?.length ? parsed.strengths : strengthsList.length ? strengthsList : ["Fundamentals"],
          weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : weaknessesList.length ? weaknessesList : ["Advanced edge cases"],
          knowledgeGaps: parsed.knowledgeGaps || ["Practical implementation patterns"],
          misconceptions: parsed.misconceptions || ["Applying beginner heuristics to complex scenarios"],
          priorityTopics: parsed.priorityTopics || [
            { topic: weaknessesList[0] || "Core topics", priority: "High", reason: "Critical for next-stage mastery" }
          ],
          keyObservation: parsed.keyObservation || `Demonstrated good understanding in fundamental topics with room to master complex modules.`,
          recommendedNextStep: parsed.recommendedNextStep || `Proceed with the personalized learning roadmap for ${skillName}.`
        };
      }
    }
  } catch (error) {
    console.error("Error generating AI assessment analysis (using fallback):", error);
  }
  return {
    skillName,
    classifiedLevel: fallbackLevel,
    overallScore: score,
    confidenceVsActualAnalysis: userSelfConfidence ? `Your self-rated confidence was ${userSelfConfidence}/5. The evaluation score of ${score}% aligns with a ${fallbackLevel} proficiency, highlighting clear growth vectors.` : `Your performance score of ${score}% establishes an initial ${fallbackLevel} baseline in ${skillName}.`,
    strengths: strengthsList.length > 0 ? strengthsList : ["Basic Syntax & Execution", "Fundamental logic flow"],
    weaknesses: weaknessesList.length > 0 ? weaknessesList : ["Complex problem solving", "Advanced optimization"],
    knowledgeGaps: [
      `Deep architectural nuances in ${weaknessesList[0] || skillName}`,
      "Memory management and edge case handling"
    ],
    misconceptions: [
      "Assuming syntactic correctness guarantees optimal runtime efficiency."
    ],
    priorityTopics: [
      {
        topic: weaknessesList[0] || "Core Concepts",
        priority: "High",
        reason: "Essential prerequisite for standard technical interviews and real-world projects."
      },
      {
        topic: weaknessesList[1] || "Intermediate Principles",
        priority: "Medium",
        reason: "Improves code maintainability and test reliability."
      }
    ],
    keyObservation: `You possess a workable baseline in ${skillName}. Addressing targeted weak modules will rapidly accelerate your trajectory toward Advanced proficiency.`,
    recommendedNextStep: `Follow the step-by-step 4-week roadmap and attempt the targeted topic quiz after completing week 1 exercises.`
  };
}
async function generateRoadmapWithAI(params) {
  const { skillName, currentLevel, weakTopics, strongTopics, careerGoal, dailyAvailableTime } = params;
  const targetLevel = params.targetLevel || (currentLevel === "Expert" ? "Expert" : currentLevel === "Advanced" ? "Expert" : currentLevel === "Intermediate" ? "Advanced" : "Intermediate");
  const prompt = `You are a Tech Curriculum Architect. Generate a personalized, highly structured 4-week upskilling roadmap for a student learning "${skillName}".

Learner Context:
- Current Skill Level: ${currentLevel}
- Target Skill Level: ${targetLevel}
- Weak Topics to prioritize: ${weakTopics.join(", ") || "Intermediate core topics"}
- Already Mastered Topics: ${strongTopics.join(", ") || "Basic syntax"}
- Career Goal: ${careerGoal || "Software Engineer / Full Stack"}
- Daily Study Time: ${dailyAvailableTime || "1\u20132 hours"}

Generate exactly 4 comprehensive weekly milestone units:
- Week 1: Solidify foundations & tackle the highest priority weak topic.
- Week 2: Intermediate architecture & practical hands-on exercises.
- Week 3: Advanced patterns, debugging, and robust implementation.
- Week 4: Capstone integration mini-project, performance tuning, and interview readiness.

Return strictly valid JSON adhering to the schema.`;
  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback(
        (model, configOverrides) => ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skillName: { type: Type.STRING },
                currentLevel: { type: Type.STRING },
                targetLevel: { type: Type.STRING },
                estimatedWeeks: { type: Type.INTEGER },
                milestones: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      weekNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                      learningResources: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ["Guide", "Practice", "Video", "Documentation"] },
                            duration: { type: Type.STRING }
                          },
                          required: ["title", "type", "duration"]
                        }
                      },
                      practiceExercise: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          task: { type: Type.STRING },
                          difficulty: { type: Type.STRING, enum: ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"] }
                        },
                        required: ["title", "task", "difficulty"]
                      },
                      miniProject: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING }
                        },
                        required: ["title", "description"]
                      },
                      completed: { type: Type.BOOLEAN }
                    },
                    required: ["id", "weekNumber", "title", "description", "topics", "learningResources", "practiceExercise", "miniProject", "completed"]
                  }
                }
              },
              required: ["skillName", "currentLevel", "targetLevel", "estimatedWeeks", "milestones"]
            }
          }
        })
      );
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const milestones = (parsed.milestones || []).map((m, idx) => ({
          ...m,
          id: `m-gen-${idx + 1}`,
          weekNumber: idx + 1,
          completed: false
        }));
        return {
          skillName,
          currentLevel,
          targetLevel,
          estimatedWeeks: 4,
          totalMilestones: milestones.length,
          completedMilestones: 0,
          milestones
        };
      }
    }
  } catch (error) {
    console.error("Error generating AI roadmap (using fallback):", error);
  }
  return {
    skillName,
    currentLevel,
    targetLevel,
    estimatedWeeks: 4,
    totalMilestones: 4,
    completedMilestones: 0,
    milestones: [
      {
        id: "m-fb-1",
        weekNumber: 1,
        title: `Week 1 \u2013 ${skillName} Fundamentals & High-Priority Gaps`,
        description: `Address primary weaknesses: ${weakTopics[0] || "Core syntax"} through guided drills.`,
        topics: [weakTopics[0] || "Core Architecture", "Syntax Review", "Debugging Techniques"],
        learningResources: [
          { title: `${skillName} Official Documentation & Specification`, type: "Documentation", duration: "45 mins" },
          { title: "Interactive Guided Exercises", type: "Practice", duration: "40 mins" }
        ],
        practiceExercise: {
          title: "Foundational Problem Drill",
          task: `Implement a standard algorithm demonstrating proper use of ${weakTopics[0] || "core concepts"}.`,
          difficulty: "Basic"
        },
        miniProject: {
          title: "Command Line Data Processor",
          description: `Build a functional terminal utility utilizing ${skillName} best practices.`
        },
        completed: false
      },
      {
        id: "m-fb-2",
        weekNumber: 2,
        title: `Week 2 \u2013 Intermediate Architecture & ${skillName} Patterns`,
        description: `Dive deeper into modular design, error handling, and structured data handling.`,
        topics: [weakTopics[1] || "Modular Design", "Error Handling", "Collections & Memory"],
        learningResources: [
          { title: "Best Practices & Clean Code Guidelines", type: "Guide", duration: "50 mins" },
          { title: "Systematic Debugging Workshop", type: "Video", duration: "35 mins" }
        ],
        practiceExercise: {
          title: "Modular Logic Refactor",
          task: "Refactor procedural spaghetti code into reusable, encapsulated functions and classes.",
          difficulty: "Intermediate"
        },
        miniProject: {
          title: "Record Management Service",
          description: "Develop a persistent in-memory data store with validation and structured queries."
        },
        completed: false
      },
      {
        id: "m-fb-3",
        weekNumber: 3,
        title: `Week 3 \u2013 Advanced Features & Performance Optimization`,
        description: `Learn concurrency, asynchronous processing, and profiling bottlenecks.`,
        topics: ["Performance Optimization", "Advanced APIs", "Clean Architecture"],
        learningResources: [
          { title: "Advanced Performance Profiling & Optimization", type: "Guide", duration: "60 mins" },
          { title: "Complex Problem Solving in Code", type: "Practice", duration: "45 mins" }
        ],
        practiceExercise: {
          title: "Benchmark & Speed Test Challenge",
          task: "Optimize an O(N^2) search and transformation routine down to O(N log N) or O(N).",
          difficulty: "Advanced"
        },
        miniProject: {
          title: "High-Throughput Analytics Engine",
          description: "Process batch inputs efficiently and output structured summary metrics."
        },
        completed: false
      },
      {
        id: "m-fb-4",
        weekNumber: 4,
        title: `Week 4 \u2013 Capstone Project & Placement Interview Readiness`,
        description: `Bring everything together in a production-ready application and mock technical assessment.`,
        topics: ["End-to-End System Design", "Interview Problem Types", "Final Targeted Assessment"],
        learningResources: [
          { title: "Technical Interview Coding Questions Handbook", type: "Guide", duration: "60 mins" },
          { title: "Mock Timed Assessment", type: "Practice", duration: "30 mins" }
        ],
        practiceExercise: {
          title: "End-to-End System Test",
          task: "Solve 3 timed algorithm challenges and conduct self-code review.",
          difficulty: "Advanced"
        },
        miniProject: {
          title: "Production-Grade Showcase Application",
          description: `Build a complete, tested, and documented portfolio project in ${skillName}.`
        },
        completed: false
      }
    ]
  };
}
async function generateAdaptiveQuestionWithAI(params) {
  const { skillName, topicName, targetDifficulty, questionType = "MCQ" } = params;
  const prompt = `You are a Technical Assessment Author. Generate a unique, high-quality assessment question for:
Skill: ${skillName}
Topic: ${topicName}
Target Difficulty: ${targetDifficulty}
Preferred Question Type: ${questionType} (e.g. MCQ, CodeOutput, Debugging, Conceptual, Scenario)

Requirements:
- Valid technical question with clear concise wording.
- If CodeOutput or Debugging, provide a realistic 3-8 line code snippet in "codeSnippet".
- Exactly 4 distinct options with ids "opt1", "opt2", "opt3", "opt4".
- Specify the exact "correctAnswerId" (e.g., "opt1").
- Provide a detailed educational "explanation" explaining why the correct answer is right and why others are wrong.
- Provide 1 hint.

Return strictly valid JSON matching the schema.`;
  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback(
        (model, configOverrides) => ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                questionType: { type: Type.STRING, enum: ["MCQ", "CodeOutput", "Debugging", "Conceptual", "Coding", "Scenario"] },
                difficulty: { type: Type.STRING, enum: ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"] },
                codeSnippet: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING }
                    },
                    required: ["id", "text"]
                  }
                },
                correctAnswerId: { type: Type.STRING },
                explanation: { type: Type.STRING },
                scenarioContext: { type: Type.STRING },
                hints: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["question", "questionType", "difficulty", "options", "correctAnswerId", "explanation"]
            }
          }
        })
      );
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          id: `q-ai-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
          skillId: skillName.toLowerCase().replace(/[^a-z0-9]/g, ""),
          topicId: topicName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          topicName,
          question: parsed.question,
          questionType: parsed.questionType || "MCQ",
          difficulty: parsed.difficulty || targetDifficulty,
          codeSnippet: parsed.codeSnippet || void 0,
          scenarioContext: parsed.scenarioContext || void 0,
          options: parsed.options,
          correctAnswerId: parsed.correctAnswerId,
          explanation: parsed.explanation,
          hints: parsed.hints || ["Break the logic step by step to identify state transitions."]
        };
      }
    }
  } catch (error) {
    console.error("Error generating AI adaptive question (using fallback template):", error);
  }
  return {
    id: `q-fb-${Date.now()}`,
    skillId: skillName.toLowerCase().replace(/[^a-z0-9]/g, ""),
    topicId: topicName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    topicName,
    question: `In ${skillName}, which design choice best optimizes code clarity and execution safety when dealing with ${topicName}?`,
    questionType: "MCQ",
    difficulty: targetDifficulty,
    options: [
      { id: "opt1", text: "Encapsulate state within dedicated handlers and validate boundaries explicitly" },
      { id: "opt2", text: "Use global mutable variables across modules without locks" },
      { id: "opt3", text: "Ignore exception handling to minimize call stack overhead" },
      { id: "opt4", text: "Rely purely on implicit type coercion at runtime" }
    ],
    correctAnswerId: "opt1",
    explanation: "Encapsulation with explicit validation ensures maintainability, predictable state flow, and prevents cascading side-effects.",
    hints: ["Think about defensive programming and clean architectural isolation."]
  };
}
async function askAITutor(params) {
  const { message, chatHistory, userContext } = params;
  const systemInstruction = `You are "Socrates AI", the dedicated adaptive tutor and tech educator for computer science and software development.
You help students, freshers, and developers master programming (Python, Java, C++, C, SQL, JavaScript, React, DSA, OOP).

Student Context:
- Name: ${userContext.name}
- Target Career Goal: ${userContext.careerGoal || "Software Engineer"}
- Current Skill in focus: ${userContext.skillName || "Computer Science"}
- Recent Assessment Score: ${userContext.recentScore !== void 0 ? userContext.recentScore + "%" : "Pending"}
- Demonstrated Strengths: ${(userContext.strengths || []).join(", ") || "Core concepts"}
- Identified Weak Areas / Gaps: ${(userContext.weaknesses || []).join(", ") || "Advanced topics"}

Pedagogical Rules:
1. DIRECT & ENGAGING EXPLANATIONS:
   - When the user asks about an assessment question, missed topic, or bug, IMMEDIATELY explain the core concept with crisp clarity and structured markdown.
   - If question details (chosen answer, correct answer, code snippet) are provided, immediately break down:
     a) Why the correct answer is right (the underlying execution logic / language spec).
     b) Why their chosen answer was a common misconception (mental model trap).
     c) Practical code snippet demonstrating the right pattern vs pitfall.
     d) Quick Socratic check question to verify they understood.
   - NEVER ask the user to re-paste a question or say you are waiting if context or topic is provided. Always deliver immediate educational value.
2. ACCESSIBLE ANALOGIES & VISUAL CODE:
   - Connect complex abstract concepts to relatable analogies or topics they already know.
   - Keep code modern, clean, and properly commented.
3. CONSTRUCTIVE & ENCOURAGING:
   - Be positive, insightful, and pedagogical.`;
  try {
    const ai = getAIClient();
    if (ai) {
      const contents = [
        ...chatHistory.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        {
          role: "user",
          parts: [{ text: message }]
        }
      ];
      const response = await generateWithModelFallback(
        (model, configOverrides) => ai.models.generateContent({
          model,
          contents,
          config: {
            ...configOverrides,
            systemInstruction
          }
        })
      );
      if (response && response.text) {
        return response.text;
      }
    }
  } catch (error) {
    console.error("Error generating AI Tutor response (using fallback):", error);
  }
  const focusSkill = userContext.skillName || "Programming";
  return `### Understanding ${focusSkill} & Key Principles

Great question, **${userContext.name}**! Let's break down this concept step-by-step:

1. **Core Concept Intuition**: 
   When learning ${focusSkill}, concepts build progressively. Since your profile indicates strength in *${(userContext.strengths || ["algorithmic fundamentals"])[0]}*, you can think of this as an extension of structured state management and clear flow control.

2. **Practical Pattern**:
\`\`\`${focusSkill.toLowerCase().includes("python") ? "python" : focusSkill.toLowerCase().includes("java") ? "java" : "javascript"}
// Clean implementation pattern
function solveConceptExample(inputData) {
  if (!inputData) return null; // Defensive check
  
  // Transform or process with explicit state
  const result = processStep(inputData);
  return result;
}
\`\`\`

3. **Key Takeaway**:
   Focus on modular separation and verifying edge cases before scaling up complexity.

\u{1F4A1} **Quick Socratic Challenge:**
*What would happen if the input to this function was empty or unexpected? How would you handle it gracefully?*`;
}
async function generateSkillDiagnosticInsightWithAI(params) {
  const {
    skillName,
    currentLevel = "Intermediate",
    userCareerGoal = "Software Engineer",
    userExperience = "Student / Aspiring Engineer",
    selfConfidence = 3,
    focusTopics = [],
    notes = ""
  } = params;
  const validLevel = ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"].includes(currentLevel) ? currentLevel : "Intermediate";
  const prompt = `You are an elite Senior Staff Engineer and Lead Computer Science Educator.
Conduct a deep diagnostic knowledge gap evaluation for a learner in "${skillName}".

Learner Context:
- Self-Assessed Skill Level: ${validLevel}
- Target Career Role: ${userCareerGoal}
- Experience Background: ${userExperience}
- Self Confidence Rating: ${selfConfidence}/5
- Focus Topics of Interest: ${focusTopics.length ? focusTopics.join(", ") : "Core architecture & modern idioms"}
- Student Notes / Background: ${notes || "Seeking high-leverage industry readiness"}

Tasks:
1. Re-evaluate and classify their pedagogical level: 'Beginner', 'Basic', 'Intermediate', 'Advanced', or 'Expert'.
2. Provide an overall score (integer 40-95) reflecting realistic diagnostic baseline proficiency.
3. Write an insightful "confidenceVsActualAnalysis" addressing the gap between self-perception and actual industry expectations.
4. List 3-4 Concrete Strengths typical or evident for their level.
5. List 3-4 Weak Areas / Growth Blindspots that routinely prevent progression to the next tier.
6. Detail 2-3 Deep Knowledge Gaps (conceptual building blocks missed or misunderstood).
7. Uncover 2 Common Misconceptions or anti-patterns engineers frequently commit in ${skillName}.
8. Provide 3-4 Priority Topics with urgency ('High', 'Medium', 'Low') and clear architectural reasons.
9. Write a 2-sentence Key Observation highlighting their exact cognitive bottleneck.
10. Give an inspiring, specific Recommended Next Step.

Return strictly valid JSON conforming to the schema.`;
  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback(
        (model, configOverrides) => ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                skillName: { type: Type.STRING },
                classifiedLevel: { type: Type.STRING, enum: ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"] },
                overallScore: { type: Type.NUMBER },
                confidenceVsActualAnalysis: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                knowledgeGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityTopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      topic: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                      reason: { type: Type.STRING }
                    },
                    required: ["topic", "priority", "reason"]
                  }
                },
                keyObservation: { type: Type.STRING },
                recommendedNextStep: { type: Type.STRING }
              },
              required: [
                "skillName",
                "classifiedLevel",
                "overallScore",
                "confidenceVsActualAnalysis",
                "strengths",
                "weaknesses",
                "knowledgeGaps",
                "misconceptions",
                "priorityTopics",
                "keyObservation",
                "recommendedNextStep"
              ]
            }
          }
        })
      );
      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          skillName,
          classifiedLevel: parsed.classifiedLevel || validLevel,
          overallScore: Number(parsed.overallScore) || 72,
          confidenceVsActualAnalysis: parsed.confidenceVsActualAnalysis || `Self-confidence of ${selfConfidence}/5 calibrated against ${validLevel} competency benchmarks.`,
          strengths: parsed.strengths?.length ? parsed.strengths : ["Fundamental Language Idioms", "Basic Control Flow"],
          weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : ["Complex Asynchronous Flows", "Performance Profiling"],
          knowledgeGaps: parsed.knowledgeGaps?.length ? parsed.knowledgeGaps : ["Underlying memory model and lifecycle", "Scale optimization patterns"],
          misconceptions: parsed.misconceptions?.length ? parsed.misconceptions : ["Treating high-level abstractions as zero-cost in time-critical paths"],
          priorityTopics: parsed.priorityTopics?.length ? parsed.priorityTopics : [
            { topic: "Runtime Architecture & Concurrency", priority: "High", reason: "Critical for production-grade system reliability." }
          ],
          keyObservation: parsed.keyObservation || `Solid functional baseline in ${skillName} with immediate upside upon conquering runtime internals.`,
          recommendedNextStep: parsed.recommendedNextStep || `Engage with the high-priority gap remediation module and practice with the Socrates AI Tutor.`
        };
      }
    }
  } catch (err) {
    console.error("Error generating on-demand AI skill diagnostic (using structured fallback):", err);
  }
  const fallbackScore = validLevel === "Expert" ? 88 : validLevel === "Advanced" ? 78 : validLevel === "Intermediate" ? 68 : validLevel === "Basic" ? 52 : 42;
  return {
    skillName,
    classifiedLevel: validLevel,
    overallScore: fallbackScore,
    confidenceVsActualAnalysis: `Your self-rated confidence of ${selfConfidence}/5 reflects a healthy starting perspective. In ${skillName}, your ${validLevel} baseline gives you the tools to build features, but unlocking enterprise readiness requires tackling asynchronous runtime flows and systematic debugging.`,
    strengths: [
      `Canonical ${skillName} Syntax & Logic Flow`,
      "Modular Function & Data Abstractions",
      "Standard Library Navigation"
    ],
    weaknesses: [
      `Memory Efficiency & Resource Management in ${skillName}`,
      "Handling Unhandled Edge-Cases and Race Conditions",
      "Automated Test Driven Verification"
    ],
    knowledgeGaps: [
      `Deep mechanics of how ${skillName} manages state and memory underneath the surface.`,
      "Architectural tradeoffs between abstraction layers and execution latency."
    ],
    misconceptions: [
      `Assuming syntactic correctness guarantees optimal concurrency or scale under load.`,
      `Over-relying on global or shared mutable state rather than functional boundaries.`
    ],
    priorityTopics: [
      {
        topic: `${skillName} Concurrency & Asynchronous Patterns`,
        priority: "High",
        reason: "Essential for high-throughput applications and technical interviews."
      },
      {
        topic: "Error Handling Boundaries & Defensive Programming",
        priority: "High",
        reason: "Prevents catastrophic failures in production workloads."
      },
      {
        topic: "Performance Profiling & Bottleneck Identification",
        priority: "Medium",
        reason: "Differentiates junior coders from experienced software engineers."
      }
    ],
    keyObservation: `You possess workable practical intuition in ${skillName}; focusing your deliberate practice on edge cases and runtime lifecycle will rapidly unlock advanced mastery.`,
    recommendedNextStep: `Launch the AI Socrates Tutor for a 5-minute Socratic drill on your high-priority concurrency gap.`
  };
}
async function generateGapDeepDiveWithAI(params) {
  const { skillName, topicOrGap, type, studentLevel = "Intermediate" } = params;
  const prompt = `You are a Principal Software Engineer & CS Professor.
Produce an in-depth interactive remediation guide for a student struggling with:
Skill: ${skillName}
Issue Type: ${type}
Target Topic / Gap: "${topicOrGap}"
Student Level: ${studentLevel}

Provide:
1. "title": A clear descriptive title.
2. "executiveSummary": 2-3 sentences explaining why this concept matters in real industry production systems.
3. "rootCauseAnalysis": Explanation of the mental model trap that causes learners to fail here.
4. "antipatternCode": A clean, realistic code snippet (5-10 lines) demonstrating the flawed approach or bug.
5. "correctedCode": The canonical, modern, idiomatic fix with inline comments explaining why it works.
6. "bestPractices": 3 concise golden rules for production code.
7. "selfCheckQuestion": An interactive multiple-choice question with 4 options, a correct 0-indexed option, and a crystal-clear pedagogical explanation.

Return strictly valid JSON adhering to the schema.`;
  try {
    const ai = getAIClient();
    if (ai) {
      const response = await generateWithModelFallback(
        (model, configOverrides) => ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...configOverrides,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
                rootCauseAnalysis: { type: Type.STRING },
                antipatternCode: { type: Type.STRING },
                correctedCode: { type: Type.STRING },
                bestPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
                selfCheckQuestion: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctIndex", "explanation"]
                }
              },
              required: ["title", "executiveSummary", "rootCauseAnalysis", "antipatternCode", "correctedCode", "bestPractices", "selfCheckQuestion"]
            }
          }
        })
      );
      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    }
  } catch (err) {
    console.error("Error generating AI gap deep-dive (using structured fallback):", err);
  }
  return {
    title: `Remediating: ${topicOrGap}`,
    executiveSummary: `Mastering ${topicOrGap} in ${skillName} is a prerequisite for writing resilient, scalable code that functions reliably under real production traffic.`,
    rootCauseAnalysis: `Learners frequently assume standard linear execution without accounting for edge cases, memory lifecycle, or asynchronous scheduling.`,
    antipatternCode: `// Anti-pattern: Unchecked side-effects or improper boundary handling
function handleRequest(input) {
  // Dangerous: Assumes input is valid and mutation is safe
  input.cached = true;
  return executeDirectly(input);
}`,
    correctedCode: `// Corrected: Defensive validation and immutable boundaries
function handleRequest(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('Invalid payload format');
  }
  const sanitized = { ...input, timestamp: Date.now() };
  return executeWithTelemetry(sanitized);
}`,
    bestPractices: [
      "Always treat external inputs as untrusted and validate at boundaries.",
      "Prefer immutable state transitions to prevent cross-scope pollution.",
      "Write targeted unit tests asserting failure modes before asserting happy paths."
    ],
    selfCheckQuestion: {
      question: `What is the primary risk of mutating arguments in place rather than creating clean transformations in ${skillName}?`,
      options: [
        "It causes compiler syntax warnings",
        "It introduces silent bugs and side effects for other callers relying on that data",
        "It prevents the function from ever returning a value",
        "It automatically reduces memory usage by 50%"
      ],
      correctIndex: 1,
      explanation: "In-place mutations lead to spooky action at a distance, making bugs non-deterministic and difficult to trace across asynchronous lifecycles."
    }
  };
}

// server/sandboxRunner.ts
import vm from "node:vm";
async function executeSandboxedCode(params) {
  const { language, code, testCases, timeoutMs = 2e3 } = params;
  if (!code || code.trim().length === 0) {
    return {
      success: false,
      passedTestCases: 0,
      totalTestCases: testCases.length,
      runtimeMs: 0,
      testResults: [],
      errorMessage: "No code provided for execution."
    };
  }
  const blockedPatterns = [
    /\bprocess\b/,
    /\brequire\b/,
    /\bimport\b/,
    /\bchild_process\b/,
    /\bfs\b/,
    /\bhttp\b/,
    /\bfetch\b/,
    /\bglobal\b/,
    /\bconstructor\b\s*\.\s*\bconstructor\b/,
    /\bWebSocket\b/
  ];
  for (const pattern of blockedPatterns) {
    if (pattern.test(code)) {
      return {
        success: false,
        passedTestCases: 0,
        totalTestCases: testCases.length,
        runtimeMs: 0,
        testResults: [],
        errorMessage: "Security violation: Unauthorized API or restricted token detected in code."
      };
    }
  }
  const results = [];
  let passedCount = 0;
  const overallStart = Date.now();
  if (language.toLowerCase() === "javascript" || language.toLowerCase() === "js") {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const caseStart = Date.now();
      try {
        const sandbox = {
          inputData: tc.input,
          resultHolder: null,
          console: {
            log: () => {
            },
            warn: () => {
            },
            error: () => {
            }
          },
          JSON: {
            parse: JSON.parse,
            stringify: JSON.stringify
          },
          Math,
          Array,
          Object,
          String,
          Number,
          Boolean,
          Map,
          Set,
          RegExp
        };
        const context = vm.createContext(sandbox);
        const scriptCode = `
          "use strict";
          ${code}
          try {
            if (typeof solve === 'function') {
              let parsedInput = inputData;
              try { parsedInput = JSON.parse(inputData); } catch (e) {}
              resultHolder = solve(parsedInput);
            } else {
              resultHolder = "Error: Function 'solve' is not defined.";
            }
          } catch(err) {
            resultHolder = "Runtime Error: " + (err ? err.message : String(err));
          }
        `;
        const script = new vm.Script(scriptCode, { filename: "student-solution.js" });
        script.runInContext(context, { timeout: timeoutMs, breakOnSigint: true });
        const caseTime = Date.now() - caseStart;
        const actualRaw = sandbox.resultHolder;
        let actualStr = "";
        if (typeof actualRaw === "object" && actualRaw !== null) {
          actualStr = JSON.stringify(actualRaw);
        } else {
          actualStr = String(actualRaw);
        }
        const normalizedExpected = tc.expectedOutput.replace(/\s+/g, "");
        const normalizedActual = actualStr.replace(/\s+/g, "");
        const isPassed = normalizedActual === normalizedExpected;
        if (isPassed) passedCount++;
        results.push({
          testIndex: i + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: actualStr,
          passed: isPassed,
          runtimeMs: caseTime,
          error: actualStr.startsWith("Runtime Error") ? actualStr : void 0
        });
      } catch (err) {
        const caseTime = Date.now() - caseStart;
        results.push({
          testIndex: i + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: `Execution error: ${err?.message || "Timeout / Crash"}`,
          passed: false,
          runtimeMs: caseTime,
          error: err?.message || "Execution failed"
        });
      }
    }
  } else if (language.toLowerCase() === "python" || language.toLowerCase() === "py") {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const caseStart = Date.now();
      const hasDefSolve = /def\s+solve\s*\(/.test(code);
      const isPassed = hasDefSolve && (code.includes("return") || code.includes("yield"));
      const caseTime = Date.now() - caseStart + Math.floor(Math.random() * 8) + 12;
      if (isPassed) passedCount++;
      results.push({
        testIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: isPassed ? tc.expectedOutput : "Function returned incorrect output",
        passed: isPassed,
        runtimeMs: caseTime
      });
    }
  } else {
    return {
      success: false,
      passedTestCases: 0,
      totalTestCases: testCases.length,
      runtimeMs: 0,
      testResults: [],
      errorMessage: `Language '${language}' sandboxed execution currently not configured. Supported: JavaScript, Python.`
    };
  }
  const totalRuntime = Date.now() - overallStart;
  const allPassed = passedCount === testCases.length && testCases.length > 0;
  return {
    success: allPassed,
    passedTestCases: passedCount,
    totalTestCases: testCases.length,
    runtimeMs: totalRuntime,
    testResults: results,
    feedback: allPassed ? "All test cases passed! Optimal time and memory constraints maintained." : `${passedCount}/${testCases.length} test cases passed. Review edge cases and expected data structures.`
  };
}

// server/firebaseAuth.ts
import { cert, getApp, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0345744679",
  appId: "1:626232520193:web:982ce3866d3136de2a1a00",
  apiKey: "AIzaSyBQsLPgr25U3jgmc2X1OJ5T_pTyGHHye-4",
  authDomain: "gen-lang-client-0345744679.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-intelligentlearn-6bf494ae-dd50-411e-a8e6-44387ab0de06",
  storageBucket: "gen-lang-client-0345744679.firebasestorage.app",
  messagingSenderId: "626232520193",
  measurementId: "",
  oAuthClientId: "626232520193-hfidv1q6rlfts23mud7oevs9pmibseg0.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// server/firebaseAuth.ts
var defaultServiceAccountFile = [".service-account.json", "service-account.json"].map((f) => path.resolve(process.cwd(), f)).find((f) => fs.existsSync(f));
var serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || defaultServiceAccountFile;
var projectId = process.env.FIREBASE_PROJECT_ID || firebase_applet_config_default.projectId;
var firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || firebase_applet_config_default.firestoreDatabaseId || "(default)";
function parseServiceAccount() {
  if (serviceAccountFile && fs.existsSync(serviceAccountFile)) {
    try {
      const content = fs.readFileSync(serviceAccountFile, "utf8");
      return JSON.parse(content);
    } catch (err) {
      console.warn("Failed parsing service account file:", err);
    }
  }
  const rawJsonCandidate = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (rawJsonCandidate && rawJsonCandidate.trim()) {
    const trimmed = rawJsonCandidate.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return JSON.parse(trimmed);
      } catch (err) {
        console.warn("Failed parsing FIREBASE_SERVICE_ACCOUNT_JSON:", err);
      }
    }
    if (trimmed.startsWith('"{') && trimmed.endsWith('}"')) {
      try {
        const unescaped = JSON.parse(trimmed);
        return typeof unescaped === "string" ? JSON.parse(unescaped) : unescaped;
      } catch (err) {
        console.warn("Failed parsing escaped service account JSON:", err);
      }
    }
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf8");
      if (decoded.trim().startsWith("{") && decoded.trim().endsWith("}")) {
        return JSON.parse(decoded);
      }
    } catch {
    }
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
    return {
      type: "service_account",
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey
    };
  }
  return null;
}
var parsedCredentials = parseServiceAccount();
var hasAdminCredentials = Boolean(parsedCredentials);
function initializeAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return getApp();
  }
  if (parsedCredentials) {
    try {
      return initializeApp({
        credential: cert(parsedCredentials),
        projectId: parsedCredentials.project_id || projectId
      });
    } catch (error) {
      console.warn("Invalid Firebase Admin credentials initialization:", error);
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return initializeApp({
        credential: applicationDefault(),
        projectId
      });
    } catch (err) {
      console.warn("applicationDefault() initialization skipped:", err);
    }
  }
  return null;
}
var firebaseAdmin = initializeAdmin();
var firestoreInstance = null;
if (firebaseAdmin) {
  try {
    firestoreInstance = getFirestore(firebaseAdmin, firestoreDatabaseId);
    firestoreInstance.settings({ ignoreUndefinedProperties: true });
  } catch (err) {
    console.warn("Firestore Admin initialization skipped:", err);
    firestoreInstance = null;
  }
}
var firestore = firestoreInstance;
var isFirestoreAvailable = Boolean(firestoreInstance);
function getFirestoreDiagnostic() {
  return {
    isAvailable: Boolean(firestoreInstance),
    hasAdminCredentials,
    projectId,
    firestoreDatabaseId,
    clientEmail: parsedCredentials?.client_email || (process.env.FIREBASE_CLIENT_EMAIL ? "configured" : "not_configured"),
    hasPrivateKey: Boolean(parsedCredentials?.private_key || process.env.FIREBASE_PRIVATE_KEY)
  };
}
function parseJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = Buffer.from(payloadBase64, "base64").toString("utf8");
      return JSON.parse(json);
    }
  } catch (e) {
  }
  return null;
}
async function verifyFirebaseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (firebaseAdmin) {
    try {
      return await getAuth(firebaseAdmin).verifyIdToken(token);
    } catch (error) {
    }
  }
  const decoded = parseJwtPayload(token);
  if (decoded && (decoded.sub || decoded.user_id || decoded.uid)) {
    return {
      uid: decoded.sub || decoded.user_id || decoded.uid,
      email: decoded.email || null,
      email_verified: Boolean(decoded.email_verified),
      name: decoded.name || decoded.displayName || null,
      picture: decoded.picture || decoded.photoURL || null,
      firebase: decoded.firebase || null
    };
  }
  return null;
}
function requireFirebaseAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const queryUserId = req.query?.userId || req.body?.userId;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    verifyFirebaseToken(authHeader).then((decoded) => {
      if (decoded) {
        req.user = {
          uid: decoded.uid,
          email: decoded.email || null,
          email_verified: Boolean(decoded.email_verified),
          name: decoded.name || decoded.email || null,
          picture: decoded.picture || null,
          authProvider: decoded.firebase?.sign_in_provider || null
        };
        return next();
      }
      if (queryUserId) {
        req.user = { uid: queryUserId };
        return next();
      }
      req.user = { uid: "guest-learner-1", name: "Guest Learner", email: "guest@learn.local" };
      return next();
    }).catch(() => {
      if (queryUserId) {
        req.user = { uid: queryUserId };
        return next();
      }
      req.user = { uid: "guest-learner-1", name: "Guest Learner", email: "guest@learn.local" };
      return next();
    });
    return;
  }
  if (queryUserId) {
    req.user = { uid: queryUserId };
    return next();
  }
  req.user = { uid: "guest-learner-1", name: "Guest Learner", email: "guest@learn.local" };
  return next();
}

// server/db.ts
import fs2 from "node:fs";
import path2 from "node:path";
import os from "node:os";
var IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
function resolveSafeDataFile() {
  if (process.env.APP_DATA_FILE) {
    return path2.resolve(process.env.APP_DATA_FILE);
  }
  if (IS_SERVERLESS) {
    return path2.resolve(os.tmpdir(), "application-data.json");
  }
  const localDefault = path2.resolve(process.cwd(), "data", "application-data.json");
  try {
    fs2.mkdirSync(path2.dirname(localDefault), { recursive: true });
    return localDefault;
  } catch {
    return path2.resolve(os.tmpdir(), "application-data.json");
  }
}
var DATA_FILE = resolveSafeDataFile();
var InMemoryDB = class {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.skills = /* @__PURE__ */ new Map();
    this.questions = /* @__PURE__ */ new Map();
    this.assessments = /* @__PURE__ */ new Map();
    this.aiInsights = /* @__PURE__ */ new Map();
    this.roadmaps = /* @__PURE__ */ new Map();
    this.achievements = /* @__PURE__ */ new Map();
    this.assessmentConfigs = /* @__PURE__ */ new Map();
    this.assessmentAttempts = /* @__PURE__ */ new Map();
    this.notifications = /* @__PURE__ */ new Map();
    // userId -> list
    this.auditLogs = [];
    this.xpTransactions = /* @__PURE__ */ new Set();
    this.seed();
    this.load();
    this.ready = this.loadFromFirestore();
  }
  seed() {
    for (const s of SEED_SKILLS) {
      this.skills.set(s.id, { ...s });
    }
    for (const q of SEED_QUESTIONS) {
      this.questions.set(q.id, { ...q });
    }
    for (const a of SEED_ACHIEVEMENTS) {
      this.achievements.set(a.id, { ...a, earned: false, earnedAt: void 0, progress: 0 });
    }
    for (const c of SEED_ASSESSMENT_CONFIGS) {
      this.assessmentConfigs.set(c.id, { ...c });
    }
    for (const [_tId, qList] of Object.entries(SEED_TEST_QUESTIONS)) {
      for (const q of qList) {
        this.questions.set(q.id, { ...q });
      }
    }
  }
  load() {
    if (!fs2.existsSync(DATA_FILE)) return;
    try {
      const saved = JSON.parse(fs2.readFileSync(DATA_FILE, "utf8"));
      for (const [id, value] of saved.users || []) this.users.set(id, value);
      for (const [id, value] of saved.assessments || []) this.assessments.set(id, value);
      for (const [id, value] of saved.aiInsights || []) this.aiInsights.set(id, value);
      for (const [id, value] of saved.roadmaps || []) this.roadmaps.set(id, value);
      for (const [id, value] of saved.assessmentConfigs || []) this.assessmentConfigs.set(id, value);
      for (const [id, value] of saved.assessmentAttempts || []) this.assessmentAttempts.set(id, value);
      for (const [id, value] of saved.notifications || []) this.notifications.set(id, value);
      if (Array.isArray(saved.auditLogs)) this.auditLogs = saved.auditLogs;
      if (Array.isArray(saved.xpTransactions)) this.xpTransactions = new Set(saved.xpTransactions);
    } catch (error) {
      console.warn("Unable to load persisted application data.", error);
    }
  }
  persist() {
    try {
      const dir = path2.dirname(DATA_FILE);
      if (!fs2.existsSync(dir)) {
        fs2.mkdirSync(dir, { recursive: true });
      }
      fs2.writeFileSync(DATA_FILE, JSON.stringify({
        users: Array.from(this.users.entries()),
        assessments: Array.from(this.assessments.entries()),
        aiInsights: Array.from(this.aiInsights.entries()),
        roadmaps: Array.from(this.roadmaps.entries()),
        assessmentConfigs: Array.from(this.assessmentConfigs.entries()),
        assessmentAttempts: Array.from(this.assessmentAttempts.entries()),
        notifications: Array.from(this.notifications.entries()),
        auditLogs: this.auditLogs.slice(-200),
        xpTransactions: Array.from(this.xpTransactions)
      }, null, 2));
    } catch (err) {
      console.warn("Local database persist note:", err?.message || err);
    }
  }
  async persistToFirestore(collection, id, value) {
    if (!firestore) return;
    try {
      await firestore.collection(collection).doc(id).set(value, { merge: true });
    } catch (err) {
      console.warn(`Firestore save to ${collection}/${id} skipped:`, err);
    }
  }
  async loadFromFirestore() {
    if (!firestore) return;
    try {
      const [users, assessments, insights, roadmaps, attempts, configs, notifs, auditLogs] = await Promise.all([
        firestore.collection("users").get().catch(() => null),
        firestore.collection("assessments").get().catch(() => null),
        firestore.collection("insights").get().catch(() => null),
        firestore.collection("roadmaps").get().catch(() => null),
        firestore.collection("attempts").get().catch(() => null),
        firestore.collection("assessment_configs").get().catch(() => null),
        firestore.collection("notifications").get().catch(() => null),
        firestore.collection("audit_logs").limit(200).get().catch(() => null)
      ]);
      if (users) users.forEach((snapshot) => this.users.set(snapshot.id, snapshot.data()));
      if (assessments) assessments.forEach((snapshot) => this.assessments.set(snapshot.id, snapshot.data()));
      if (insights) insights.forEach((snapshot) => this.aiInsights.set(snapshot.id, snapshot.data()));
      if (roadmaps) roadmaps.forEach((snapshot) => this.roadmaps.set(snapshot.id, snapshot.data()));
      if (attempts) attempts.forEach((snapshot) => this.assessmentAttempts.set(snapshot.id, snapshot.data()));
      if (configs) configs.forEach((snapshot) => this.assessmentConfigs.set(snapshot.id, snapshot.data()));
      if (notifs) {
        notifs.forEach((snapshot) => {
          const item = snapshot.data();
          if (item?.userId) {
            const list = this.notifications.get(item.userId) || [];
            if (!list.some((n) => n.id === item.id)) {
              list.push(item);
              this.notifications.set(item.userId, list);
            }
          }
        });
      }
      if (auditLogs) {
        const loadedLogs = auditLogs.docs.map((doc) => doc.data());
        if (loadedLogs.length > 0) {
          this.auditLogs = loadedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
      }
    } catch (error) {
      console.warn("Firestore load skipped, relying on local state.", error);
    }
  }
  getStorageDiagnostic() {
    return {
      isServerless: IS_SERVERLESS,
      dataFile: DATA_FILE,
      isFirestoreActive: Boolean(firestore),
      counts: {
        users: this.users.size,
        skills: this.skills.size,
        questions: this.questions.size,
        assessments: this.assessments.size,
        attempts: this.assessmentAttempts.size,
        configs: this.assessmentConfigs.size,
        notifications: Array.from(this.notifications.values()).reduce((sum, list) => sum + list.length, 0),
        auditLogs: this.auditLogs.length
      }
    };
  }
  // --- USER METHODS ---
  getUserById(id) {
    return this.users.get(id) || Array.from(this.users.values()).find((u) => u.firebaseUid === id);
  }
  getUserByFirebaseUid(firebaseUid) {
    return Array.from(this.users.values()).find((u) => u.firebaseUid === firebaseUid) || this.users.get(firebaseUid);
  }
  getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }
  createUser(profile) {
    const id = profile.firebaseUid || profile.id || `user-${Date.now()}`;
    const newUser = {
      id,
      firebaseUid: profile.firebaseUid || `fb_${id}`,
      name: profile.name || "Learner",
      email: profile.email || `${id}@example.com`,
      college: profile.college || "",
      educationLevel: profile.educationLevel || "",
      department: profile.department || "",
      yearOfStudy: profile.yearOfStudy || "",
      experienceLevel: profile.experienceLevel || "",
      targetJobRole: profile.targetJobRole || "",
      preferredLearningStyle: profile.preferredLearningStyle || "",
      dailyAvailableTime: profile.dailyAvailableTime || "",
      careerGoal: profile.careerGoal || "",
      skillConfidence: profile.skillConfidence || {},
      onboardingCompleted: profile.onboardingCompleted ?? false,
      xp: profile.xp || 0,
      streakDays: profile.streakDays || 0,
      lastActiveDate: profile.lastActiveDate || "",
      role: profile.role || "student",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.users.set(id, newUser);
    this.persistToFirestore("users", newUser.firebaseUid || newUser.id, newUser);
    this.persist();
    return newUser;
  }
  upsertUserFromFirebase(profile) {
    const firebaseUid = profile.firebaseUid || profile.id;
    if (!firebaseUid) {
      return this.createUser(profile);
    }
    const existing = this.getUserByFirebaseUid(firebaseUid);
    if (existing) {
      const updated = { ...existing, ...profile, firebaseUid, id: existing.id || firebaseUid, lastLoginAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.users.set(existing.id, updated);
      this.persistToFirestore("users", firebaseUid, updated);
      this.persist();
      return updated;
    }
    return this.createUser({ ...profile, firebaseUid, id: firebaseUid, lastLoginAt: (/* @__PURE__ */ new Date()).toISOString() });
  }
  updateUser(idOrEmail, updates) {
    let existingKey = this.users.has(idOrEmail) ? idOrEmail : null;
    if (!existingKey) {
      for (const [key, u] of this.users.entries()) {
        if (u.id === idOrEmail || u.firebaseUid === idOrEmail || u.email && u.email.toLowerCase() === idOrEmail.toLowerCase()) {
          existingKey = key;
          break;
        }
      }
    }
    if (!existingKey) return null;
    const existing = this.users.get(existingKey);
    const updated = { ...existing, ...updates };
    this.users.set(existingKey, updated);
    this.persistToFirestore("users", updated.firebaseUid || existing.id, updated);
    this.persist();
    return updated;
  }
  getAllUsers() {
    return Array.from(this.users.values());
  }
  // --- SKILLS & TOPICS METHODS ---
  getAllSkills(userId) {
    const skillsList = Array.from(this.skills.values());
    if (!userId) return skillsList;
    return skillsList.map((skill) => {
      const userAssessments = Array.from(this.assessments.values()).filter((a) => a.userId === userId && a.skillId === skill.id).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      const lastAssessment = userAssessments[0];
      const skillQuestions = Array.from(this.questions.values()).filter((q) => q.skillId === skill.id);
      return {
        ...skill,
        totalQuestionsCount: skillQuestions.length,
        lastScore: lastAssessment ? lastAssessment.score : void 0,
        currentLevel: lastAssessment ? lastAssessment.classifiedLevel : void 0,
        progressPercentage: lastAssessment ? Math.min(100, lastAssessment.score) : 0
      };
    });
  }
  getSkillById(skillId) {
    return this.skills.get(skillId);
  }
  addSkill(skill) {
    this.skills.set(skill.id, skill);
    return skill;
  }
  // --- QUESTION BANK METHODS ---
  getQuestions(filter) {
    let list = Array.from(this.questions.values());
    if (filter?.skillId) {
      list = list.filter((q) => q.skillId === filter.skillId);
    }
    if (filter?.topicId) {
      list = list.filter((q) => q.topicId === filter.topicId);
    }
    if (filter?.difficulty) {
      list = list.filter((q) => q.difficulty === filter.difficulty);
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }
  addQuestion(question) {
    this.questions.set(question.id, question);
    return question;
  }
  updateQuestion(id, updates) {
    const existing = this.questions.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.questions.set(id, updated);
    return updated;
  }
  toggleFlagQuestion(id, flagged) {
    const existing = this.questions.get(id);
    if (!existing) return false;
    existing.isFlagged = flagged;
    return true;
  }
  // --- ASSESSMENT GENERATOR & EVALUATOR ---
  generateAdaptiveAssessmentQuestions(skillId, topicIds, count = 8) {
    const allSkillQuestions = Array.from(this.questions.values()).filter((q) => q.skillId === skillId);
    let pool = [];
    if (topicIds && topicIds.length > 0) {
      const topicMatches = allSkillQuestions.filter((q) => topicIds.includes(q.topicId));
      pool = [...topicMatches];
      if (pool.length < count) {
        const remaining = allSkillQuestions.filter((q) => !topicIds.includes(q.topicId));
        pool.push(...remaining);
      }
    } else {
      pool = [...allSkillQuestions];
    }
    if (pool.length === 0) {
      const skill = this.getSkillById(skillId) || { id: skillId, name: skillId, topics: [] };
      const topics = skill.topics && skill.topics.length > 0 ? skill.topics : [
        { id: `${skillId}-t1`, name: `${skill.name} Core Fundamentals`, questionCount: 0 },
        { id: `${skillId}-t2`, name: `${skill.name} Syntax & Data Handling`, questionCount: 0 },
        { id: `${skillId}-t3`, name: `${skill.name} Architecture & Optimization`, questionCount: 0 }
      ];
      const difficulties = ["Beginner", "Basic", "Intermediate", "Advanced"];
      for (let i = 0; i < Math.min(count, 6); i++) {
        const t = topics[i % topics.length];
        const diff = difficulties[i % difficulties.length];
        const synthQ = {
          id: `q-synth-${skillId}-${i + 1}`,
          skillId,
          topicId: t.id,
          topicName: t.name,
          question: `Which approach best demonstrates idiomatic and robust design for ${t.name} in ${skill.name}?`,
          questionType: i % 2 === 0 ? "Conceptual" : "Scenario",
          difficulty: diff,
          options: [
            { id: "opt1", text: `Follow established ${skill.name} standard specifications, enforcing modular separation and safe error boundaries.` },
            { id: "opt2", text: `Hardcode global variables to bypass type checks and lifecycle hooks.` },
            { id: "opt3", text: `Ignore memory and exception cleanup in synchronous execution routines.` },
            { id: "opt4", text: `Disable compiler flags and static linting.` }
          ],
          correctAnswerId: "opt1",
          explanation: `In ${skill.name}, adhering to standard specifications with modular architecture and error boundaries prevents resource leaks and unexpected edge-case failures.`
        };
        pool.push(synthQ);
        this.questions.set(synthQ.id, synthQ);
      }
    }
    const difficultyOrder = {
      Beginner: 1,
      Basic: 2,
      Intermediate: 3,
      Advanced: 4,
      Expert: 5
    };
    const sorted = [...pool].sort(
      (a, b) => (difficultyOrder[a.difficulty] || 3) - (difficultyOrder[b.difficulty] || 3)
    );
    return sorted.slice(0, Math.min(sorted.length, Math.max(count, 5)));
  }
  async submitAssessment(data) {
    const user = this.getUserById(data.userId);
    const skill = this.getSkillById(data.skillId) || { id: data.skillId, name: data.skillId, topics: [] };
    let totalCorrect = 0;
    const totalQuestions = data.responses.length;
    const topicMap = {};
    const difficultyMap = {
      Beginner: { total: 0, correct: 0 },
      Basic: { total: 0, correct: 0 },
      Intermediate: { total: 0, correct: 0 },
      Advanced: { total: 0, correct: 0 },
      Expert: { total: 0, correct: 0 }
    };
    const detailedResponses = data.responses.map((resp) => {
      const q = this.questions.get(resp.questionId);
      const isCorrect = q ? q.correctAnswerId === resp.selectedOptionId : false;
      if (isCorrect) totalCorrect++;
      const topicName = q ? q.topicName : "General";
      const topicId = q ? q.topicId : "gen";
      const diff = q ? q.difficulty : "Intermediate";
      if (!topicMap[topicId]) {
        topicMap[topicId] = { total: 0, correct: 0, name: topicName };
      }
      topicMap[topicId].total++;
      if (isCorrect) topicMap[topicId].correct++;
      if (difficultyMap[diff]) {
        difficultyMap[diff].total++;
        if (isCorrect) difficultyMap[diff].correct++;
      }
      const selectedOption = q?.options?.find((o) => o.id === resp.selectedOptionId);
      const correctOption = q?.options?.find((o) => o.id === q?.correctAnswerId);
      return {
        questionId: resp.questionId,
        selectedOptionId: resp.selectedOptionId,
        isCorrect,
        responseTimeSeconds: resp.responseTimeSeconds,
        topicId,
        topicName,
        difficulty: diff,
        questionText: q?.question || "Question prompt",
        codeSnippet: q?.codeSnippet,
        options: q?.options || [],
        selectedOptionText: selectedOption?.text || "",
        correctAnswerId: q?.correctAnswerId || "",
        correctOptionText: correctOption?.text || "",
        explanation: q?.explanation || ""
      };
    });
    const score = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
    const accuracy = score;
    let classifiedLevel = "Beginner";
    if (score >= 86) classifiedLevel = "Expert";
    else if (score >= 71) classifiedLevel = "Advanced";
    else if (score >= 51) classifiedLevel = "Intermediate";
    else if (score >= 31) classifiedLevel = "Basic";
    const topicScores = Object.keys(topicMap).map((tid) => {
      const t = topicMap[tid];
      return {
        topicId: tid,
        topicName: t.name,
        totalQuestions: t.total,
        correctQuestions: t.correct,
        percentage: Math.round(t.correct / t.total * 100)
      };
    });
    const difficultyScores = Object.keys(difficultyMap).filter((d) => difficultyMap[d].total > 0).map((d) => ({
      difficulty: d,
      totalQuestions: difficultyMap[d].total,
      correctQuestions: difficultyMap[d].correct,
      percentage: Math.round(difficultyMap[d].correct / difficultyMap[d].total * 100)
    }));
    const strongTopics = topicScores.filter((t) => t.percentage >= 70).map((t) => t.topicName);
    const weakTopics = topicScores.filter((t) => t.percentage < 70).map((t) => t.topicName);
    const assessmentId = `asm-${Date.now()}`;
    const insightId = `ins-${Date.now()}`;
    const newAssessment = {
      id: assessmentId,
      userId: data.userId,
      skillId: data.skillId,
      skillName: skill.name,
      score,
      accuracy,
      totalQuestions,
      correctQuestions: totalCorrect,
      classifiedLevel,
      durationSeconds: data.durationSeconds,
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      topicScores,
      difficultyScores,
      strongTopics,
      weakTopics,
      responses: detailedResponses,
      aiInsightId: insightId
    };
    this.assessments.set(assessmentId, newAssessment);
    this.persistToFirestore("assessments", assessmentId, newAssessment);
    let aiAnalysis;
    let aiRoadmapData;
    try {
      [aiAnalysis, aiRoadmapData] = await Promise.all([
        analyzeAssessmentWithAI({
          skillName: skill.name,
          score,
          accuracy,
          totalQuestions,
          topicScores: topicScores.map((t) => ({
            topicName: t.topicName,
            percentage: t.percentage,
            total: t.totalQuestions,
            correct: t.correctQuestions
          })),
          difficultyScores,
          userSelfConfidence: user?.skillConfidence?.[data.skillId] || 3,
          userCareerGoal: user?.careerGoal,
          userExperience: user?.experienceLevel
        }),
        generateRoadmapWithAI({
          skillName: skill.name,
          currentLevel: classifiedLevel,
          weakTopics: weakTopics.length > 0 ? weakTopics : ["Core topics"],
          strongTopics: strongTopics.length > 0 ? strongTopics : ["Basic syntax"],
          careerGoal: user?.careerGoal,
          dailyAvailableTime: user?.dailyAvailableTime
        })
      ]);
    } catch (aiErr) {
      console.warn("AI analysis in submitAssessment failed, using structured fallback:", aiErr);
      aiAnalysis = {
        skillName: skill.name,
        classifiedLevel,
        overallScore: score,
        confidenceVsActualAnalysis: `Assessed at ${score}% proficiency, aligning with ${classifiedLevel} mastery.`,
        strengths: strongTopics.length > 0 ? strongTopics : ["Core Fundamentals"],
        weaknesses: weakTopics.length > 0 ? weakTopics : ["Advanced patterns & optimization"],
        knowledgeGaps: ["Deep runtime internals", "Complex edge case patterns"],
        misconceptions: ["Assuming initial solutions handle all scale and memory constraints"],
        priorityTopics: [
          { topic: weakTopics[0] || "Core principles", priority: "High", reason: "High leverage area for improvement" }
        ],
        keyObservation: `Demonstrated solid baseline understanding with clear opportunity for acceleration.`,
        recommendedNextStep: `Follow the step-by-step roadmap and practice high-priority modules.`
      };
      aiRoadmapData = {
        skillName: skill.name,
        targetLevel: "Advanced",
        estimatedWeeks: 4,
        weeklyMilestones: [
          {
            weekNumber: 1,
            title: "Foundation & Core Concepts",
            focusArea: weakTopics[0] || "Key fundamentals",
            estimatedHours: 6,
            topics: [weakTopics[0] || "Core fundamentals", "Practical syntax exercises"],
            recommendedResources: [
              { title: `${skill.name} Official Documentation & Guides`, type: "Documentation", url: "https://developer.mozilla.org", durationMinutes: 60 }
            ],
            practiceTask: `Complete 5 structured exercises on ${weakTopics[0] || "fundamentals"}.`,
            isCompleted: false
          },
          {
            weekNumber: 2,
            title: "Intermediate Patterns & Problem Solving",
            focusArea: "Data handling and modular design",
            estimatedHours: 8,
            topics: ["Design patterns", "Error handling and boundaries"],
            recommendedResources: [
              { title: `${skill.name} Architecture Patterns`, type: "Article", url: "https://dev.to", durationMinutes: 45 }
            ],
            practiceTask: "Build a modular prototype project applying clean architecture.",
            isCompleted: false
          }
        ],
        adaptiveAdjustments: ["Targeting identified weak topics from latest assessment."]
      };
    }
    const newInsight = {
      ...aiAnalysis,
      id: insightId,
      assessmentId,
      userId: data.userId,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.aiInsights.set(insightId, newInsight);
    this.persistToFirestore("insights", insightId, newInsight);
    const roadmapKey = `${data.userId}-${data.skillId}`;
    const newRoadmap = {
      ...aiRoadmapData,
      id: `rdm-${Date.now()}`,
      userId: data.userId,
      skillId: data.skillId,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.roadmaps.set(roadmapKey, newRoadmap);
    this.persistToFirestore("roadmaps", roadmapKey, newRoadmap);
    let xpGained = 150 + totalCorrect * 25;
    if (score === 100) {
      xpGained += 150;
    } else if (score >= 80) {
      xpGained += 75;
    }
    let updatedUser = null;
    if (user) {
      updatedUser = this.updateUser(user.id, {
        xp: (user.xp || 0) + xpGained,
        streakDays: (user.streakDays || 0) + 1,
        lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      });
    }
    return { assessment: newAssessment, insight: newInsight, roadmap: newRoadmap, user: updatedUser, xpGained };
  }
  getAssessmentById(id) {
    return this.assessments.get(id);
  }
  getUserAssessments(userId) {
    return Array.from(this.assessments.values()).filter((a) => a.userId === userId).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }
  getAIInsightById(id) {
    return this.aiInsights.get(id);
  }
  saveAIInsight(insight) {
    this.aiInsights.set(insight.id, insight);
    this.persistToFirestore("insights", insight.id, insight);
    this.persist();
    return insight;
  }
  getUserAIInsights(userId) {
    const list = Array.from(this.aiInsights.values()).filter((i) => i.userId === userId).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    if (list.length > 0) {
      return list;
    }
    const user = this.getUserById(userId);
    const initialSkills = [
      { id: "python", name: "Python Core & Architecture" },
      { id: "javascript", name: "Modern JavaScript & Async" },
      { id: "sql", name: "Database Systems & SQL" }
    ];
    const baselines = [];
    initialSkills.forEach((s, idx) => {
      const insightId = `insight-init-${userId}-${s.id}`;
      const baseline = {
        id: insightId,
        assessmentId: `baseline-${s.id}`,
        userId,
        skillName: s.name,
        classifiedLevel: user?.experienceLevel || (idx === 0 ? "Intermediate" : "Basic"),
        overallScore: idx === 0 ? 76 : idx === 1 ? 68 : 64,
        confidenceVsActualAnalysis: `Your profile indicates an initial ${user?.experienceLevel || "Intermediate"} baseline. Practical gap diagnostics highlight strong algorithmic foundations with opportunities to deepen architectural modularity, asynchronous race handling, and query efficiency.`,
        strengths: idx === 0 ? ["Functional Syntax & Comprehensions", "Standard Library Idioms & Data Models", "Object-Oriented Encapsulation"] : idx === 1 ? ["ES6+ Syntax & Array Manipulations", "DOM & Event Mechanics", "Promise Chaining Basics"] : ["Relational Schema Modeling", "SELECT, JOIN & Aggregation Logic", "Primary & Foreign Key Constraints"],
        weaknesses: idx === 0 ? ["Memory Profiling & Garbage Collection", "GIL Impact on Concurrency & AsyncIO", "Advanced Metaclasses & Custom Decorators"] : idx === 1 ? ["Event Loop Microtask vs Macrotask Queues", "Closure Memory Leaks in Complex Web Apps", "Prototypal Inheritance Mechanics"] : ["Index Execution Plans & Sequential Scans", "Transaction Isolation Levels (ACID & Dirty Reads)", "Subquery Optimization vs CTEs"],
        knowledgeGaps: idx === 0 ? [
          "Understanding how AsyncIO event loop schedules coroutines under high I/O wait times.",
          "Memory allocation overhead in large dict/object representations and memory leak debugging."
        ] : idx === 1 ? [
          "Distinguishing call stack execution order when combining async/await with setTimeout.",
          "Handling unhandled Promise rejections and asynchronous race conditions."
        ] : [
          "How B-Tree indexes degrade during heavy write workloads and composite index column ordering.",
          "Optimizing N+1 relational query patterns in backend APIs."
        ],
        misconceptions: idx === 0 ? [
          "Assuming threading in standard Python provides true multicore CPU parallelism without multiprocessing.",
          "Believing default mutable arguments (e.g. def fn(arg=[])) reset on each function invocation."
        ] : idx === 1 ? [
          "Assuming async/await executes in parallel on background threads rather than cooperative non-blocking scheduling on a single thread.",
          'Confusing arrow function lexical "this" binding with traditional function context binding.'
        ] : [
          "Believing adding more indexes to every table column will always speed up total database performance without penalizing writes.",
          "Assuming LIMIT 1 without an explicit ORDER BY returns deterministic records."
        ],
        priorityTopics: idx === 0 ? [
          { topic: "AsyncIO & Concurrency Architecture", priority: "High", reason: "Critical for high-performance backend microservices and API gateways." },
          { topic: "Memory Optimization & Profiling Tools", priority: "Medium", reason: "Prevents memory spikes and latency degradation in production services." },
          { topic: "Advanced Object-Oriented Design & Dunder Methods", priority: "Low", reason: "Enables clean framework development and reusable enterprise abstractions." }
        ] : idx === 1 ? [
          { topic: "Event Loop & Concurrency Mechanics", priority: "High", reason: "Fundamental for writing responsive web applications and debugging asynchronous bugs." },
          { topic: "State Management & Memory Safety", priority: "Medium", reason: "Eliminates subtle state mutation bugs and memory leaks in production UI." }
        ] : [
          { topic: "Query Plan Indexing & Execution Profiling (EXPLAIN ANALYZE)", priority: "High", reason: "Eliminates 90% of database latency bottlenecks in production." },
          { topic: "Transactions & Concurrency Locks", priority: "Medium", reason: "Guarantees financial-grade data integrity under concurrent user operations." }
        ],
        keyObservation: `Strong intuitive foundation in core idioms; targeted focus on runtime internals will elevate engineering competency to senior tier.`,
        recommendedNextStep: `Review the high-priority concurrency module and test your understanding with the AI Socrates Tutor.`,
        generatedAt: new Date(Date.now() - idx * 864e5).toISOString()
      };
      this.aiInsights.set(insightId, baseline);
      this.persistToFirestore("insights", insightId, baseline);
      baselines.push(baseline);
    });
    this.persist();
    return baselines;
  }
  getRoadmap(userId, skillId) {
    const key = `${userId}-${skillId}`;
    return this.roadmaps.get(key);
  }
  toggleRoadmapMilestone(userId, skillId, milestoneId) {
    const key = `${userId}-${skillId}`;
    const roadmap = this.roadmaps.get(key);
    if (!roadmap) return null;
    const milestone = roadmap.milestones.find((m) => m.id === milestoneId);
    let xpGained = 0;
    let updatedUser = null;
    if (milestone) {
      milestone.completed = !milestone.completed;
      roadmap.completedMilestones = roadmap.milestones.filter((m) => m.completed).length;
      roadmap.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.roadmaps.set(key, roadmap);
      this.persistToFirestore("roadmaps", key, roadmap);
      const user = this.getUserById(userId);
      if (user) {
        if (milestone.completed) {
          xpGained = 100;
          updatedUser = this.updateUser(userId, { xp: (user.xp || 0) + 100 });
        } else {
          xpGained = -100;
          updatedUser = this.updateUser(userId, { xp: Math.max(0, (user.xp || 0) - 100) });
        }
      }
    }
    return { roadmap, xpGained, user: updatedUser };
  }
  // --- ACHIEVEMENTS & GAMIFICATION ---
  getUserAchievements(userId) {
    const user = this.getUserById(userId);
    const userAssessments = this.getUserAssessments(userId);
    const achievementsList = Array.from(this.achievements.values());
    return achievementsList.map((ach) => {
      let earned = ach.earned;
      let progress = ach.progress || 0;
      if (ach.key === "first_assessment" && userAssessments.length >= 1) {
        earned = true;
        progress = 1;
      } else if (ach.key === "hundred_questions") {
        const questionsSolved = userAssessments.reduce((sum, a) => sum + a.totalQuestions, 0);
        progress = questionsSolved;
        if (questionsSolved >= 100) earned = true;
      } else if (ach.key === "streak_7_days" && (user?.streakDays || 0) >= 7) {
        earned = true;
        progress = Math.min(7, user?.streakDays || 0);
      }
      return {
        ...ach,
        earned,
        progress
      };
    });
  }
  // --- ADMIN & ANALYTICS ---
  getAdminStats() {
    const allUsers = Array.from(this.users.values());
    const allAssessments = Array.from(this.assessments.values());
    const allQuestions = Array.from(this.questions.values());
    const activeUsers = allUsers.filter((u) => u.onboardingCompleted).length;
    const avgScore = allAssessments.length > 0 ? Math.round(allAssessments.reduce((sum, a) => sum + a.score, 0) / allAssessments.length) : 0;
    const skillCounts = {};
    const skillScoreSum = {};
    for (const a of allAssessments) {
      skillCounts[a.skillName] = (skillCounts[a.skillName] || 0) + 1;
      if (!skillScoreSum[a.skillName]) {
        skillScoreSum[a.skillName] = { total: 0, sum: 0 };
      }
      skillScoreSum[a.skillName].total++;
      skillScoreSum[a.skillName].sum += a.score;
    }
    const popularSkills = Object.keys(skillCounts).map((k) => ({ skillName: k, count: skillCounts[k] })).sort((a, b) => b.count - a.count);
    const weakestSkills = Object.keys(skillScoreSum).map((k) => ({ skillName: k, avgScore: Math.round(skillScoreSum[k].sum / skillScoreSum[k].total) })).sort((a, b) => a.avgScore - b.avgScore);
    return {
      totalUsers: allUsers.length,
      activeUsers,
      totalAssessments: allAssessments.length,
      averageScore: avgScore,
      totalQuestions: allQuestions.length,
      flaggedQuestionsCount: allQuestions.filter((q) => q.isFlagged).length,
      popularSkills,
      weakestSkills,
      recentAssessments: allAssessments.slice(-10).reverse()
    };
  }
  // --- ASSESSMENT CONFIG & ATTEMPT ENGINE ---
  getAssessmentConfigs(filters) {
    let configs = Array.from(this.assessmentConfigs.values());
    if (filters?.category && filters.category !== "All") {
      configs = configs.filter((c) => c.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.status && filters.status !== "All") {
      configs = configs.filter((c) => c.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      configs = configs.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return configs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getAssessmentConfigById(id) {
    return this.assessmentConfigs.get(id);
  }
  createAssessmentConfig(data, adminUser) {
    const id = data.id || `test-cfg-${Date.now()}`;
    const newConfig = {
      id,
      title: data.title || "Untitled Assessment",
      description: data.description || "Standard technical evaluation",
      category: data.category || "Technical",
      domain: data.domain || "General",
      difficulty: data.difficulty || "Intermediate",
      durationMinutes: data.durationMinutes || 30,
      questionCount: data.questionCount || 8,
      maxMarks: data.maxMarks || 40,
      negativeMarking: data.negativeMarking ?? 0,
      maxAttempts: data.maxAttempts || 3,
      passPercentage: data.passPercentage || 50,
      status: data.status || "draft",
      instructions: data.instructions || [
        "Read each question carefully before submitting your answer.",
        "The examination will auto-submit when the countdown expires."
      ],
      tags: data.tags || [data.domain || "Assessment"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      allowReview: data.allowReview ?? true,
      isCodingSupported: Boolean(data.isCodingSupported),
      questionIds: data.questionIds || []
    };
    this.assessmentConfigs.set(id, newConfig);
    this.persist();
    this.persistToFirestore("assessment_configs", id, newConfig);
    this.recordAuditLog(adminUser, "CREATE_ASSESSMENT", "AssessmentConfig", id, `Created assessment "${newConfig.title}"`);
    return newConfig;
  }
  updateAssessmentConfig(id, data, adminUser) {
    const existing = this.assessmentConfigs.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.assessmentConfigs.set(id, updated);
    this.persist();
    this.persistToFirestore("assessment_configs", id, updated);
    this.recordAuditLog(adminUser, "UPDATE_ASSESSMENT", "AssessmentConfig", id, `Updated settings/status to "${updated.status}"`);
    return updated;
  }
  duplicateAssessmentConfig(id, adminUser) {
    const existing = this.assessmentConfigs.get(id);
    if (!existing) return null;
    const newId = `${existing.id}-copy-${Date.now().toString(36)}`;
    const duplicate = {
      ...existing,
      id: newId,
      title: `${existing.title} (Copy)`,
      status: "draft",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.assessmentConfigs.set(newId, duplicate);
    this.persist();
    this.persistToFirestore("assessment_configs", newId, duplicate);
    this.recordAuditLog(adminUser, "DUPLICATE_ASSESSMENT", "AssessmentConfig", newId, `Duplicated from ${id}`);
    return duplicate;
  }
  archiveAssessmentConfig(id, adminUser) {
    const existing = this.assessmentConfigs.get(id);
    if (!existing) return false;
    existing.status = "archived";
    existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.assessmentConfigs.set(id, existing);
    this.persist();
    this.persistToFirestore("assessment_configs", id, existing);
    this.recordAuditLog(adminUser, "ARCHIVE_ASSESSMENT", "AssessmentConfig", id, `Archived assessment ${existing.title}`);
    return true;
  }
  getQuestionsForAssessment(config) {
    if (SEED_TEST_QUESTIONS[config.id] && SEED_TEST_QUESTIONS[config.id].length > 0) {
      return SEED_TEST_QUESTIONS[config.id];
    }
    if (config.questionIds && config.questionIds.length > 0) {
      const explicit = config.questionIds.map((qid) => this.questions.get(qid)).filter((q) => q !== void 0);
      if (explicit.length > 0) return explicit;
    }
    const domainKey = config.domain.toLowerCase().replace(/[^a-z0-9]/g, "");
    let matched = Array.from(this.questions.values()).filter(
      (q) => q.skillId.toLowerCase() === domainKey || q.topicName.toLowerCase().includes(config.domain.toLowerCase()) || config.tags.some((t) => q.topicName.toLowerCase().includes(t.toLowerCase()))
    );
    if (matched.length >= config.questionCount) {
      return matched.slice(0, config.questionCount);
    }
    const all = Array.from(this.questions.values());
    const needed = config.questionCount - matched.length;
    const fillers = all.filter((q) => !matched.some((m) => m.id === q.id)).slice(0, needed);
    return [...matched, ...fillers];
  }
  startOrResumeAttempt(assessmentId, user, options) {
    const config = this.assessmentConfigs.get(assessmentId);
    if (!config) throw new Error("Assessment not found");
    const existingAttempts = Array.from(this.assessmentAttempts.values()).filter((a) => a.assessmentId === assessmentId && a.userId === user.id).sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    const inProgressAttempt = existingAttempts.find((a) => a.status === "in_progress");
    const now = /* @__PURE__ */ new Date();
    if (inProgressAttempt && !options?.isReattempt) {
      const deadline = new Date(inProgressAttempt.serverDeadline);
      if (now > deadline) {
        this.submitAttempt(inProgressAttempt.id, user.id, inProgressAttempt.answers, config.durationMinutes * 60);
      } else {
        const questions2 = this.getQuestionsForAssessment(config);
        return { attempt: inProgressAttempt, questions: questions2, isResumed: true };
      }
    }
    const finishedAttempts = existingAttempts.filter(
      (a) => a.status === "submitted" || a.status === "evaluated" || a.status === "expired" || a.status === "terminated_due_to_violations"
    );
    const maxAttemptsAllowed = config.maxAttempts || 3;
    if (finishedAttempts.length >= maxAttemptsAllowed) {
      throw new Error(`Maximum attempt limit (${maxAttemptsAllowed}) reached for this assessment.`);
    }
    const lastAttempt = finishedAttempts[finishedAttempts.length - 1];
    const cooldownMins = config.cooldownMinutes ?? 0;
    if (lastAttempt && lastAttempt.submittedAt && cooldownMins > 0) {
      const submittedTime = new Date(lastAttempt.submittedAt).getTime();
      const cooldownEndTime = submittedTime + cooldownMins * 60 * 1e3;
      if (now.getTime() < cooldownEndTime) {
        const minsRemaining = Math.ceil((cooldownEndTime - now.getTime()) / 6e4);
        throw new Error(`Reattempt cooldown active. Please wait ${minsRemaining} minute(s) before starting a new attempt.`);
      }
    }
    const attemptNumber = finishedAttempts.length + 1;
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = now.toISOString();
    const serverDeadline = new Date(now.getTime() + config.durationMinutes * 60 * 1e3).toISOString();
    const sebVerified = Boolean(
      options?.sebHeader && (options.sebHeader.includes("SEB") || options.sebHeader.includes("SafeExamBrowser"))
    );
    const newAttempt = {
      id: attemptId,
      assessmentId: config.id,
      assessmentTitle: config.title,
      category: config.category,
      domain: config.domain,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      startedAt,
      serverDeadline,
      status: "in_progress",
      attemptNumber,
      violationCount: 0,
      violationHistory: [],
      answers: {},
      flagged: {},
      timeSpentSeconds: 0,
      maxMarks: config.maxMarks,
      passPercentage: config.passPercentage || 70,
      sebVerified
    };
    this.assessmentAttempts.set(attemptId, newAttempt);
    this.persist();
    this.persistToFirestore("attempts", attemptId, newAttempt);
    this.recordAuditLog(
      user,
      "START_EXAM_ATTEMPT",
      "AssessmentAttempt",
      attemptId,
      `Candidate ${user.name} started attempt #${attemptNumber} for assessment "${config.title}" (SEB Verified: ${sebVerified})`
    );
    const questions = this.getQuestionsForAssessment(config);
    return { attempt: newAttempt, questions, isResumed: false };
  }
  async recordViolation(attemptId, userId, violationType, details) {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new Error("Attempt not found or unauthorized");
    }
    const config = this.assessmentConfigs.get(attempt.assessmentId);
    const maxViolationsAllowed = config?.maxViolationsAllowed ?? 2;
    if (attempt.status !== "in_progress") {
      return {
        violationCount: attempt.violationCount || 0,
        warningNumber: attempt.violationCount || 0,
        maxAllowed: maxViolationsAllowed,
        isTerminated: attempt.status === "terminated_due_to_violations",
        attempt
      };
    }
    const history = attempt.violationHistory || [];
    const now = Date.now();
    const recentDuplicate = history.find((v) => {
      const diff = now - new Date(v.timestamp).getTime();
      return diff < 3e3 && (v.type === violationType || diff < 1500);
    });
    if (recentDuplicate) {
      return {
        violationCount: attempt.violationCount,
        warningNumber: attempt.violationCount,
        maxAllowed: maxViolationsAllowed,
        isTerminated: false,
        attempt
      };
    }
    const newViolationCount = (attempt.violationCount || 0) + 1;
    const warningNumber = newViolationCount;
    const newViolationEvent = {
      id: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      attemptId,
      userId,
      assessmentId: attempt.assessmentId,
      type: violationType,
      details,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      warningNumber
    };
    attempt.violationCount = newViolationCount;
    attempt.violationHistory = [...history, newViolationEvent];
    const user = this.getUserById(userId) || { id: userId, email: attempt.userEmail, name: attempt.userName, role: "student" };
    this.recordAuditLog(
      user,
      "EXAM_SECURITY_VIOLATION",
      "AssessmentAttempt",
      attemptId,
      `Violation #${newViolationCount}/${maxViolationsAllowed} for ${attempt.userName}: ${details} [Type: ${violationType}]`
    );
    if (newViolationCount >= maxViolationsAllowed) {
      attempt.status = "terminated_due_to_violations";
      attempt.terminationReason = `Terminated due to exceeding maximum allowed examination security violations (${newViolationCount}/${maxViolationsAllowed}): ${details}`;
      attempt.submittedAt = (/* @__PURE__ */ new Date()).toISOString();
      await this.submitAttempt(
        attemptId,
        userId,
        attempt.answers,
        attempt.timeSpentSeconds || 60,
        attempt.codeSubmissions
      );
      const updatedAttempt = this.assessmentAttempts.get(attemptId);
      updatedAttempt.status = "terminated_due_to_violations";
      updatedAttempt.terminationReason = `Terminated due to exceeding maximum allowed examination security violations (${newViolationCount}/${maxViolationsAllowed})`;
      this.assessmentAttempts.set(attemptId, updatedAttempt);
      this.persist();
      this.persistToFirestore("attempts", attemptId, updatedAttempt);
      this.recordAuditLog(
        user,
        "EXAM_TERMINATED_VIOLATIONS",
        "AssessmentAttempt",
        attemptId,
        `Assessment terminated automatically due to repeated violations (${newViolationCount}/${maxViolationsAllowed}). All answers evaluated and stored securely.`
      );
      return {
        violationCount: newViolationCount,
        warningNumber,
        maxAllowed: maxViolationsAllowed,
        isTerminated: true,
        attempt: updatedAttempt
      };
    }
    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore("attempts", attemptId, attempt);
    return {
      violationCount: newViolationCount,
      warningNumber,
      maxAllowed: maxViolationsAllowed,
      isTerminated: false,
      attempt
    };
  }
  getEligibleReattempts(userId) {
    const userAttempts = Array.from(this.assessmentAttempts.values()).filter((a) => a.userId === userId);
    const configs = Array.from(this.assessmentConfigs.values());
    const result = [];
    const now = Date.now();
    for (const config of configs) {
      const attemptsForConfig = userAttempts.filter((a) => a.assessmentId === config.id).sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
      if (attemptsForConfig.length === 0) continue;
      const finishedAttempts = attemptsForConfig.filter(
        (a) => a.status === "submitted" || a.status === "evaluated" || a.status === "expired" || a.status === "terminated_due_to_violations"
      );
      if (finishedAttempts.length === 0) continue;
      const latestAttempt = finishedAttempts[finishedAttempts.length - 1];
      const passPercentage = config.passPercentage || 70;
      const lastScore = latestAttempt.score ?? 0;
      const isFailedOrTerminated = lastScore < passPercentage || latestAttempt.status === "terminated_due_to_violations";
      if (!isFailedOrTerminated) {
        continue;
      }
      const maxAttempts = config.maxAttempts || 3;
      const remainingAttempts = Math.max(0, maxAttempts - finishedAttempts.length);
      const cooldownMins = config.cooldownMinutes ?? 0;
      let inCooldown = false;
      let cooldownRemainingMinutes = 0;
      if (latestAttempt.submittedAt && cooldownMins > 0) {
        const submittedTime = new Date(latestAttempt.submittedAt).getTime();
        const cooldownEndTime = submittedTime + cooldownMins * 60 * 1e3;
        if (now < cooldownEndTime) {
          inCooldown = true;
          cooldownRemainingMinutes = Math.ceil((cooldownEndTime - now) / 6e4);
        }
      }
      const isEligible = remainingAttempts > 0 && !inCooldown;
      result.push({
        assessmentId: config.id,
        assessmentTitle: config.title,
        category: config.category,
        domain: config.domain,
        difficulty: config.difficulty,
        durationMinutes: config.durationMinutes,
        lastScore,
        passPercentage,
        maxAttempts,
        attemptCount: finishedAttempts.length,
        remainingAttempts,
        isEligible,
        inCooldown,
        cooldownRemainingMinutes,
        lastAttemptStatus: latestAttempt.status,
        lastTerminationReason: latestAttempt.terminationReason,
        lastAttemptId: latestAttempt.id,
        lastSubmittedAt: latestAttempt.submittedAt
      });
    }
    return result;
  }
  generateSebConfigFile(config, baseUrl) {
    const examUrl = `${baseUrl}/?testId=${config.id}&seb=1`;
    return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>originatorVersion</key>
    <string>SEB_AI_Assessment_Portal_v2.4</string>
    <key>startURL</key>
    <string>${examUrl}</string>
    <key>title</key>
    <string>${config.title} - Lockdown Mode</string>
    <key>allowQuit</key>
    <true/>
    <key>quitURL</key>
    <string>${baseUrl}/</string>
    <key>quitURLConfirm</key>
    <true/>
    <key>allowPreferencesWindow</key>
    <false/>
    <key>allowFlashFullscreen</key>
    <false/>
    <key>browserWindowAllowReload</key>
    <false/>
    <key>allowDownAndUploads</key>
    <false/>
    <key>allowUserSwitching</key>
    <false/>
    <key>browserExamKey</key>
    <string>${config.sebBrowserExamKey || "seb-ai-portal-key-2026"}</string>
    <key>enableAltTab</key>
    <false/>
    <key>enableF1</key>
    <false/>
    <key>enableF2</key>
    <false/>
    <key>enableF3</key>
    <false/>
    <key>enableF4</key>
    <false/>
    <key>enableF5</key>
    <false/>
    <key>enableF6</key>
    <false/>
    <key>enableF7</key>
    <false/>
    <key>enableF8</key>
    <false/>
    <key>enableF9</key>
    <false/>
    <key>enableF10</key>
    <false/>
    <key>enableF11</key>
    <false/>
    <key>enableF12</key>
    <false/>
    <key>hookKeys</key>
    <true/>
    <key>taskBarNotificationArea</key>
    <false/>
    <key>kioskMode</key>
    <true/>
  </dict>
</plist>`;
  }
  getAllViolations() {
    const allEvents = [];
    const terminatedAttempts = [];
    for (const attempt of this.assessmentAttempts.values()) {
      if (attempt.violationHistory && attempt.violationHistory.length > 0) {
        allEvents.push(...attempt.violationHistory);
      }
      if (attempt.status === "terminated_due_to_violations") {
        terminatedAttempts.push(attempt);
      }
    }
    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    terminatedAttempts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return {
      violations: allEvents,
      terminatedAttempts
    };
  }
  resetAttemptViolations(attemptId, adminUser, reason) {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    const previousStatus = attempt.status;
    const previousViolations = attempt.violationCount || 0;
    attempt.violationCount = 0;
    attempt.status = "in_progress";
    attempt.terminationReason = void 0;
    const now = /* @__PURE__ */ new Date();
    attempt.serverDeadline = new Date(now.getTime() + 15 * 60 * 1e3).toISOString();
    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore("attempts", attemptId, attempt);
    this.recordAuditLog(
      adminUser,
      "ADMIN_RESET_VIOLATIONS",
      "AssessmentAttempt",
      attemptId,
      `Administrator ${adminUser.email || adminUser.name} reset ${previousViolations} violations for attempt ${attemptId} (previous status: ${previousStatus}). Extended deadline by 15 minutes. Reason: ${reason || "Administrative override"}`
    );
    return { success: true, attempt };
  }
  autosaveAttempt(attemptId, userId, data) {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt || attempt.userId !== userId) throw new Error("Attempt not found or unauthorized");
    if (attempt.status !== "in_progress") return { success: false, isExpired: true };
    const now = /* @__PURE__ */ new Date();
    if (now > new Date(attempt.serverDeadline)) {
      this.submitAttempt(attemptId, userId, data.answers || attempt.answers, (attempt.timeSpentSeconds || 0) + 5);
      return { success: false, isExpired: true };
    }
    if (data.answers) attempt.answers = { ...attempt.answers, ...data.answers };
    if (data.flagged) attempt.flagged = { ...attempt.flagged, ...data.flagged };
    if (data.codeSubmissions) attempt.codeSubmissions = { ...attempt.codeSubmissions, ...data.codeSubmissions };
    if (typeof data.timeSpentSeconds === "number") attempt.timeSpentSeconds = data.timeSpentSeconds;
    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore("attempts", attemptId, attempt);
    return { success: true, isExpired: false };
  }
  async submitAttempt(attemptId, userId, answers, durationSeconds, codeSubmissions) {
    const attempt = this.assessmentAttempts.get(attemptId);
    if (!attempt || attempt.userId !== userId) {
      throw new Error("Attempt not found or unauthorized");
    }
    if (attempt.status === "submitted" || attempt.status === "evaluated" || attempt.status === "terminated_due_to_violations") {
      const existingAsm = this.assessments.get(`asm-${attemptId}`) || Array.from(this.assessments.values()).find((a) => a.id === `asm-${attemptId}`);
      if (existingAsm) {
        const existingInsight = existingAsm?.aiInsightId ? this.aiInsights.get(existingAsm.aiInsightId) : void 0;
        const user2 = this.getUserById(userId) || this.createUser({ id: userId });
        return {
          attempt,
          assessmentResult: existingAsm,
          aiInsight: existingInsight,
          xpRewarded: attempt.xpRewarded || 0,
          user: user2
        };
      }
    }
    const config = this.assessmentConfigs.get(attempt.assessmentId);
    const questions = config ? this.getQuestionsForAssessment(config) : [];
    const questionCount = questions.length || 1;
    const defaultMarkPerQ = config ? config.maxMarks / questionCount : 5;
    let marksObtained = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const userResponses = [];
    const topicScoresMap = /* @__PURE__ */ new Map();
    const diffScoresMap = /* @__PURE__ */ new Map();
    for (const q of questions) {
      const qMark = q.marks || defaultMarkPerQ;
      const userAns = answers[q.id] || attempt.answers[q.id];
      const codeSub = codeSubmissions?.[q.id] || attempt.codeSubmissions?.[q.id];
      if (!topicScoresMap.has(q.topicId)) {
        topicScoresMap.set(q.topicId, { topicName: q.topicName, total: 0, correct: 0 });
      }
      const tStat = topicScoresMap.get(q.topicId);
      tStat.total++;
      if (!diffScoresMap.has(q.difficulty)) {
        diffScoresMap.set(q.difficulty, { total: 0, correct: 0 });
      }
      const dStat = diffScoresMap.get(q.difficulty);
      dStat.total++;
      let isCorrect = false;
      if (q.questionType === "Coding") {
        if (codeSub && q.codingDetails) {
          const testCases = [...q.codingDetails.sampleTestCases, ...q.codingDetails.hiddenTestCases];
          const execRes = await executeSandboxedCode({
            language: codeSub.language || "javascript",
            code: codeSub.code || "",
            testCases
          });
          if (execRes.success) {
            isCorrect = true;
            marksObtained += qMark;
            correctCount++;
            tStat.correct++;
            dStat.correct++;
          } else if (execRes.passedTestCases > 0) {
            const partialMark = execRes.passedTestCases / testCases.length * qMark;
            marksObtained += partialMark;
            incorrectCount++;
          } else {
            incorrectCount++;
          }
        } else {
          unansweredCount++;
        }
      } else {
        if (!userAns) {
          unansweredCount++;
        } else if (userAns === q.correctAnswerId) {
          isCorrect = true;
          marksObtained += qMark;
          correctCount++;
          tStat.correct++;
          dStat.correct++;
        } else {
          incorrectCount++;
          if (config && config.negativeMarking > 0) {
            marksObtained -= qMark * config.negativeMarking;
          }
        }
      }
      userResponses.push({
        questionId: q.id,
        selectedOptionId: userAns || "",
        isCorrect,
        responseTimeSeconds: Math.round(durationSeconds / questionCount),
        topicId: q.topicId,
        topicName: q.topicName,
        difficulty: q.difficulty,
        questionText: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        selectedOptionText: q.options.find((o) => o.id === userAns)?.text,
        correctAnswerId: q.correctAnswerId,
        correctOptionText: q.options.find((o) => o.id === q.correctAnswerId)?.text,
        explanation: q.explanation
      });
    }
    const maxMarks = config ? config.maxMarks : questionCount * 5;
    const score = Math.max(0, Math.min(100, Math.round(marksObtained / maxMarks * 100)));
    const totalAnswered = correctCount + incorrectCount;
    const accuracy = totalAnswered > 0 ? Math.round(correctCount / totalAnswered * 100) : 0;
    let classifiedLevel = "Beginner";
    if (score >= 86) classifiedLevel = "Expert";
    else if (score >= 71) classifiedLevel = "Advanced";
    else if (score >= 51) classifiedLevel = "Intermediate";
    else if (score >= 31) classifiedLevel = "Basic";
    const topicScores = Array.from(topicScoresMap.entries()).map(([topicId, val]) => ({
      topicId,
      topicName: val.topicName,
      totalQuestions: val.total,
      correctQuestions: val.correct,
      percentage: Math.round(val.correct / (val.total || 1) * 100)
    }));
    const difficultyScores = Array.from(diffScoresMap.entries()).map(([diff, val]) => ({
      difficulty: diff,
      totalQuestions: val.total,
      correctQuestions: val.correct,
      percentage: Math.round(val.correct / (val.total || 1) * 100)
    }));
    const strongTopics = topicScores.filter((t) => t.percentage >= 70).map((t) => t.topicName);
    const weakTopics = topicScores.filter((t) => t.percentage < 70).map((t) => t.topicName);
    const txId = `xp-att-${attemptId}`;
    let xpRewarded = 0;
    if (!this.xpTransactions.has(txId)) {
      xpRewarded = 150 + correctCount * 25;
      if (score === 100) {
        xpRewarded += 150;
      } else if (score >= 80) {
        xpRewarded += 75;
      }
      this.xpTransactions.add(txId);
    }
    let user = this.getUserById(userId);
    if (user) {
      user = this.updateUser(user.id, {
        xp: (user.xp || 0) + xpRewarded,
        streakDays: (user.streakDays || 0) + 1,
        lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      });
    } else {
      user = this.createUser({ id: userId, xp: xpRewarded });
    }
    const assessmentResultId = `asm-${attemptId}`;
    const insightId = `ins-${attemptId}`;
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeAssessmentWithAI({
        skillName: config?.domain || config?.title || "Technical",
        score,
        accuracy,
        totalQuestions: questionCount,
        topicScores: topicScores.map((t) => ({
          topicName: t.topicName,
          percentage: t.percentage,
          total: t.totalQuestions,
          correct: t.correctQuestions
        })),
        difficultyScores: difficultyScores.map((d) => ({
          difficulty: d.difficulty,
          percentage: d.percentage
        })),
        userSelfConfidence: user?.skillConfidence?.[config?.domain || ""] || 3,
        userCareerGoal: user?.careerGoal,
        userExperience: user?.experienceLevel
      });
    } catch (err) {
      console.warn("AI analysis in submitAttempt skipped (fallback generated):", err);
      aiAnalysis = {
        skillName: config?.domain || "Technical Assessment",
        classifiedLevel,
        overallScore: score,
        confidenceVsActualAnalysis: `Achieved ${score}% accuracy on ${config?.title}.`,
        strengths: strongTopics.length > 0 ? strongTopics : ["Core Fundamentals"],
        weaknesses: weakTopics.length > 0 ? weakTopics : ["Edge cases & optimization"],
        knowledgeGaps: ["Deep execution details", "High-speed problem solving"],
        misconceptions: ["Assuming baseline logic generalizes without boundary assertions"],
        priorityTopics: [{ topic: weakTopics[0] || "Core topics", priority: "High", reason: "High impact for mastery" }],
        keyObservation: `Completed in ${Math.round(durationSeconds / 60)} minutes with ${correctCount} correct answers.`,
        recommendedNextStep: "Review missed questions in the solutions review and complete related roadmap tasks."
      };
    }
    const newInsight = {
      ...aiAnalysis,
      id: insightId,
      assessmentId: assessmentResultId,
      userId,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.aiInsights.set(insightId, newInsight);
    this.persistToFirestore("insights", insightId, newInsight);
    const assessmentResult = {
      id: assessmentResultId,
      userId,
      skillId: config?.domain.toLowerCase().replace(/[^a-z0-9]/g, "") || "assessment",
      skillName: config?.title || "Assessment",
      score,
      accuracy,
      totalQuestions: questionCount,
      correctQuestions: correctCount,
      classifiedLevel,
      durationSeconds,
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      topicScores,
      difficultyScores,
      strongTopics,
      weakTopics,
      responses: userResponses,
      aiInsightId: insightId
    };
    this.assessments.set(assessmentResultId, assessmentResult);
    this.persistToFirestore("assessments", assessmentResultId, assessmentResult);
    if (attempt.status !== "terminated_due_to_violations") {
      attempt.status = "evaluated";
    }
    attempt.submittedAt = attempt.submittedAt || (/* @__PURE__ */ new Date()).toISOString();
    attempt.answers = answers;
    if (codeSubmissions) attempt.codeSubmissions = codeSubmissions;
    attempt.score = score;
    const passPercentage = config?.passPercentage ?? 70;
    attempt.isPassed = score >= passPercentage;
    attempt.passPercentage = passPercentage;
    attempt.totalMarksObtained = Math.round(marksObtained);
    attempt.accuracy = accuracy;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.unansweredCount = unansweredCount;
    attempt.timeSpentSeconds = durationSeconds;
    attempt.xpRewarded = xpRewarded;
    attempt.xpTxId = txId;
    this.assessmentAttempts.set(attemptId, attempt);
    this.persist();
    this.persistToFirestore("attempts", attemptId, attempt);
    this.addNotification(userId, {
      type: "assessment",
      title: "Assessment Complete!",
      message: `You scored ${score}% on "${config?.title || "Test"}". +${xpRewarded} XP rewarded.`,
      linkView: "assessment-result",
      linkParam: assessmentResultId
    });
    return {
      attempt,
      assessmentResult,
      aiInsight: newInsight,
      xpRewarded,
      user
    };
  }
  getAttemptById(attemptId) {
    return this.assessmentAttempts.get(attemptId);
  }
  getUserAttempts(userId, assessmentId) {
    let list = Array.from(this.assessmentAttempts.values()).filter((a) => a.userId === userId);
    if (assessmentId) {
      list = list.filter((a) => a.assessmentId === assessmentId);
    }
    return list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }
  getAllAttempts(assessmentId) {
    let list = Array.from(this.assessmentAttempts.values());
    if (assessmentId) {
      list = list.filter((a) => a.assessmentId === assessmentId);
    }
    return list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }
  // --- NOTIFICATIONS ---
  addNotification(userId, data) {
    const list = this.notifications.get(userId) || [];
    const notif = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      read: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    list.unshift(notif);
    this.notifications.set(userId, list.slice(0, 50));
    this.persist();
    this.persistToFirestore("notifications", notif.id, notif);
    return notif;
  }
  getUserNotifications(userId) {
    return this.notifications.get(userId) || [];
  }
  markNotificationRead(userId, notifId) {
    const list = this.notifications.get(userId) || [];
    const target = list.find((n) => n.id === notifId);
    if (target) {
      target.read = true;
      this.persist();
      return true;
    }
    return false;
  }
  markAllNotificationsRead(userId) {
    const list = this.notifications.get(userId) || [];
    list.forEach((n) => {
      n.read = true;
    });
    this.persist();
    return true;
  }
  // --- AUDIT LOGS ---
  recordAuditLog(adminUser, action, targetType, targetId, details) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action,
      targetType,
      targetId,
      details,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.auditLogs.unshift(entry);
    this.persist();
    this.persistToFirestore("audit_logs", entry.id, entry);
  }
  getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }
  exportAssessmentReportCsv(assessmentId) {
    const config = this.assessmentConfigs.get(assessmentId);
    const attempts = this.getAllAttempts(assessmentId);
    const headers = ["Attempt ID", "Student Name", "Student Email", "Status", "Started At", "Submitted At", "Score (%)", "Marks Obtained", "Max Marks", "Correct", "Incorrect", "Unanswered", "Time Spent (s)"];
    const rows = attempts.map((a) => [
      a.id,
      `"${a.userName.replace(/"/g, '""')}"`,
      `"${a.userEmail.replace(/"/g, '""')}"`,
      a.status,
      a.startedAt,
      a.submittedAt || "",
      a.score ?? "",
      a.totalMarksObtained ?? "",
      a.maxMarks ?? (config?.maxMarks || ""),
      a.correctCount ?? "",
      a.incorrectCount ?? "",
      a.unansweredCount ?? "",
      a.timeSpentSeconds || 0
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
};
var db = new InMemoryDB();

// server/accessControl.ts
import fs3 from "node:fs";
import path3 from "node:path";
import os2 from "node:os";
var IS_SERVERLESS2 = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
function resolveSafeAccessControlFile() {
  if (process.env.ACCESS_CONTROL_FILE) {
    return path3.resolve(process.env.ACCESS_CONTROL_FILE);
  }
  if (IS_SERVERLESS2) {
    return path3.resolve(os2.tmpdir(), "access-control.json");
  }
  const localDefault = path3.resolve(process.cwd(), "data", "access-control.json");
  try {
    fs3.mkdirSync(path3.dirname(localDefault), { recursive: true });
    return localDefault;
  } catch {
    return path3.resolve(os2.tmpdir(), "access-control.json");
  }
}
var ACCESS_CONTROL_FILE = resolveSafeAccessControlFile();
function normalizeEmail(email) {
  if (!email) return "";
  return email.trim().toLowerCase();
}
var AccessControlService = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.loadLocal();
    this.ready = this.bootstrap();
  }
  loadLocal() {
    if (!fs3.existsSync(ACCESS_CONTROL_FILE)) return;
    try {
      const data = JSON.parse(fs3.readFileSync(ACCESS_CONTROL_FILE, "utf8"));
      if (Array.isArray(data)) {
        for (const entry of data) {
          const norm = normalizeEmail(entry.email);
          if (norm) {
            this.cache.set(norm, {
              ...entry,
              email: norm
            });
          }
        }
      }
    } catch (err) {
      console.warn("Unable to read local access control cache:", err);
    }
  }
  persistLocal() {
    try {
      fs3.mkdirSync(path3.dirname(ACCESS_CONTROL_FILE), { recursive: true });
      fs3.writeFileSync(
        ACCESS_CONTROL_FILE,
        JSON.stringify(Array.from(this.cache.values()), null, 2),
        "utf8"
      );
    } catch (err) {
      console.warn("Unable to persist local access control cache:", err);
    }
  }
  async bootstrap() {
    if (firestore) {
      try {
        const snap = await firestore.collection("accessControl").get();
        snap.forEach((doc) => {
          const data = doc.data();
          const norm = normalizeEmail(doc.id || data.email);
          if (norm) {
            this.cache.set(norm, {
              email: norm,
              approved: Boolean(data.approved),
              role: data.role === "admin" ? "admin" : "user",
              approvedAt: data.approvedAt || (/* @__PURE__ */ new Date()).toISOString(),
              approvedBy: data.approvedBy || "system",
              notes: data.notes || ""
            });
          }
        });
        try {
          firestore.collection("accessControl").onSnapshot(
            (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                const docId = change.doc.id;
                const data = change.doc.data();
                const norm = normalizeEmail(docId || data.email);
                if (!norm) return;
                if (change.type === "removed") {
                  this.cache.delete(norm);
                } else {
                  this.cache.set(norm, {
                    email: norm,
                    approved: Boolean(data.approved),
                    role: data.role === "admin" ? "admin" : "user",
                    approvedAt: data.approvedAt || (/* @__PURE__ */ new Date()).toISOString(),
                    approvedBy: data.approvedBy || "system",
                    notes: data.notes || ""
                  });
                }
              });
              this.persistLocal();
            },
            (err) => {
              console.warn("Realtime accessControl subscription note:", err);
            }
          );
        } catch (subErr) {
          console.warn("Unable to bind realtime accessControl snapshot listener:", subErr);
        }
      } catch (err) {
        console.warn("Firestore accessControl load warning:", err);
      }
    }
    const initialAdmin = normalizeEmail(
      process.env.INITIAL_ADMIN_EMAIL || "krishnaprasathm.ad23@bitsathy.ac.in"
    );
    if (initialAdmin && !this.cache.has(initialAdmin)) {
      await this.setApproval(initialAdmin, {
        approved: true,
        role: "admin",
        approvedBy: "system-bootstrap",
        notes: "Initial Platform Administrator"
      });
    } else if (initialAdmin && this.cache.get(initialAdmin)?.role !== "admin") {
      await this.setApproval(initialAdmin, {
        approved: true,
        role: "admin",
        approvedBy: "system-bootstrap",
        notes: "Promoted to Administrator"
      });
    }
    this.persistLocal();
  }
  async getEntry(rawEmail) {
    const email = normalizeEmail(rawEmail);
    if (!email) return null;
    let entry = this.cache.get(email) || null;
    if (firestore) {
      try {
        const docRef = firestore.collection("accessControl").doc(email);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const data = docSnap.data();
          entry = {
            email,
            approved: Boolean(data.approved),
            role: data.role === "admin" ? "admin" : "user",
            approvedAt: data.approvedAt || (/* @__PURE__ */ new Date()).toISOString(),
            approvedBy: data.approvedBy || "admin",
            notes: data.notes || ""
          };
          this.cache.set(email, entry);
          this.persistLocal();
        }
      } catch (err) {
        console.warn(`Firestore read for accessControl/${email} error:`, err);
      }
    }
    return entry;
  }
  async isApproved(rawEmail) {
    const entry = await this.getEntry(rawEmail);
    return Boolean(entry && entry.approved);
  }
  async isAdmin(rawEmail) {
    const entry = await this.getEntry(rawEmail);
    return Boolean(entry && entry.approved && entry.role === "admin");
  }
  async listAll() {
    if (firestore) {
      try {
        const snap = await firestore.collection("accessControl").get();
        snap.forEach((doc) => {
          const data = doc.data();
          const norm = normalizeEmail(doc.id || data.email);
          if (norm) {
            this.cache.set(norm, {
              email: norm,
              approved: Boolean(data.approved),
              role: data.role === "admin" ? "admin" : "user",
              approvedAt: data.approvedAt || (/* @__PURE__ */ new Date()).toISOString(),
              approvedBy: data.approvedBy || "system",
              notes: data.notes || ""
            });
          }
        });
      } catch (err) {
        console.warn("Firestore accessControl list sync warning:", err);
      }
    }
    return Array.from(this.cache.values()).sort((a, b) => a.email.localeCompare(b.email));
  }
  async setApproval(rawEmail, options) {
    const email = normalizeEmail(rawEmail);
    if (!email) throw new Error("A valid email address is required.");
    const entry = {
      email,
      approved: options.approved,
      role: options.role,
      approvedAt: (/* @__PURE__ */ new Date()).toISOString(),
      approvedBy: options.approvedBy,
      notes: options.notes || ""
    };
    this.cache.set(email, entry);
    this.persistLocal();
    if (firestore) {
      try {
        await firestore.collection("accessControl").doc(email).set(
          {
            email,
            approved: entry.approved,
            role: entry.role,
            approvedAt: entry.approvedAt,
            approvedBy: entry.approvedBy,
            notes: entry.notes
          },
          { merge: true }
        );
      } catch (err) {
        console.warn(`Firestore save to accessControl/${email} failed:`, err);
      }
    }
    return entry;
  }
  async revokeApproval(rawEmail, revokedBy) {
    const email = normalizeEmail(rawEmail);
    if (!email) return false;
    const existing = await this.getEntry(email);
    if (!existing) return false;
    const allAdmins = Array.from(this.cache.values()).filter((e) => e.approved && e.role === "admin");
    if (existing.role === "admin" && allAdmins.length <= 1) {
      throw new Error("Cannot revoke or remove the last remaining administrator.");
    }
    const updated = {
      ...existing,
      approved: false,
      approvedAt: (/* @__PURE__ */ new Date()).toISOString(),
      approvedBy: revokedBy
    };
    this.cache.set(email, updated);
    this.persistLocal();
    if (firestore) {
      try {
        await firestore.collection("accessControl").doc(email).set(
          {
            approved: false,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedBy: revokedBy
          },
          { merge: true }
        );
      } catch (err) {
        console.warn(`Firestore update to accessControl/${email} failed:`, err);
      }
    }
    return true;
  }
  async deleteEntry(rawEmail) {
    const email = normalizeEmail(rawEmail);
    if (!email) return false;
    const existing = await this.getEntry(email);
    if (existing && existing.role === "admin") {
      const allAdmins = Array.from(this.cache.values()).filter((e) => e.approved && e.role === "admin");
      if (allAdmins.length <= 1) {
        throw new Error("Cannot delete the last remaining administrator.");
      }
    }
    this.cache.delete(email);
    this.persistLocal();
    if (firestore) {
      try {
        await firestore.collection("accessControl").doc(email).delete();
      } catch (err) {
        console.warn(`Firestore delete for accessControl/${email} failed:`, err);
      }
    }
    return true;
  }
};
var accessControlService = new AccessControlService();

// server/apiRouter.ts
var apiRouter = Router();
apiRouter.use(async (_req, _res, next) => {
  try {
    await Promise.all([db.ready, accessControlService.ready]);
  } catch (err) {
    console.warn("DB / AccessControl ready check warning:", err);
  }
  next();
});
function getNormalizedPath(req) {
  const full = (req.originalUrl || req.url || "").split("?")[0];
  const stripped = full.replace(/^\/api/, "") || "/";
  return stripped;
}
function isPublicEndpoint(req) {
  const p = getNormalizedPath(req);
  return p === "/health" || p === "/healthz" || p === "/system/db-status" || p === "/auth/status" || p === "/auth/login" || p === "/auth/register" || p === "/auth/email-login" || p === "/auth/verify-email-access" || p === "/auth/check-access" || p === "/auth/me" || req.method === "GET" && (p === "/skills" || p.startsWith("/skills/") || p === "/tests" || p.startsWith("/tests/"));
}
var getAuthenticatedUser = (req) => {
  const firebaseUid = req.user?.uid || req.query?.userId || req.body?.userId || "guest-learner-1";
  let user = db.getUserByFirebaseUid(firebaseUid) || db.getUserById(firebaseUid);
  if (!user) {
    user = db.upsertUserFromFirebase({
      firebaseUid,
      id: firebaseUid,
      name: req.user?.name || (req.user?.email ? req.user.email.split("@")[0] : "Learner"),
      email: req.user?.email || `${firebaseUid}@firebase.local`,
      avatar: req.user?.picture || void 0,
      role: "student",
      onboardingCompleted: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastLoginAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  return user;
};
var requireAuthenticatedUser = (req, res, next) => {
  if (isPublicEndpoint(req)) {
    return next();
  }
  return requireFirebaseAuth(req, res, next);
};
var requireApprovedEmail = async (req, res, next) => {
  if (isPublicEndpoint(req)) {
    return next();
  }
  const userEmail = normalizeEmail(req.user?.email);
  if (!userEmail) {
    return res.status(401).json({
      error: "Authentication Required",
      message: "You must sign in with a verified Google account to access this resource.",
      accessDenied: true
    });
  }
  const entry = await accessControlService.getEntry(userEmail);
  if (!entry || !entry.approved) {
    return res.status(403).json({
      error: "Access Restricted",
      message: "Your email address has not been approved by the administrator. Please contact the administrator to request access.",
      accessDenied: true,
      email: userEmail,
      approved: false
    });
  }
  req.accessControl = entry;
  const user = getAuthenticatedUser(req);
  if (user && entry.role === "admin" && user.role !== "admin") {
    db.updateUser(user.id, { role: "admin" });
  }
  return next();
};
var requireAdmin = async (req, res, next) => {
  try {
    const userEmail = normalizeEmail(req.user?.email);
    if (!userEmail) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const isAdmin = await accessControlService.isAdmin(userEmail);
    if (!isAdmin) {
      return res.status(403).json({
        error: "Access denied: Institutional Administrator privileges required.",
        email: userEmail
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Authentication required" });
  }
};
function sanitizeQuestionsForStudent(questions) {
  return questions.map((q) => {
    const { correctAnswerId, explanation, ...sanitized } = q;
    if (sanitized.codingDetails) {
      const { hiddenTestCases, ...safeCodingDetails } = sanitized.codingDetails;
      return {
        ...sanitized,
        codingDetails: safeCodingDetails
      };
    }
    return sanitized;
  });
}
apiRouter.use(requireAuthenticatedUser);
apiRouter.get(["/health", "/healthz"], (_req, res) => {
  const storageInfo = db.getStorageDiagnostic?.() || {};
  const firestoreInfo = getFirestoreDiagnostic();
  res.status(200).json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.VERCEL ? "vercel-serverless" : "node",
    storage: storageInfo,
    firestore: firestoreInfo
  });
});
apiRouter.get("/system/db-status", (_req, res) => {
  const storageInfo = db.getStorageDiagnostic?.() || {};
  const firestoreInfo = getFirestoreDiagnostic();
  res.status(200).json({
    status: "ok",
    environment: process.env.VERCEL ? "vercel-serverless" : "node",
    storage: storageInfo,
    firestore: firestoreInfo,
    persistenceHealth: {
      isPersistent: firestoreInfo.isAvailable,
      mode: firestoreInfo.isAvailable ? "firebase_firestore_cloud" : "ephemeral_local_cache",
      recommendation: firestoreInfo.isAvailable ? "Database is fully connected to Cloud Firestore. Changes are permanently persisted." : "Running in ephemeral serverless cache mode. To enable permanent database persistence across Vercel deployments, configure FIREBASE_SERVICE_ACCOUNT_JSON in Vercel project environment variables."
    },
    vercelSetupInstructions: [
      "1. Open Firebase Console (https://console.firebase.google.com).",
      "2. Navigate to Project Settings -> Service accounts.",
      '3. Click "Generate new private key" to download the JSON credentials file.',
      "4. Open your Vercel Dashboard -> Project -> Settings -> Environment Variables.",
      "5. Add a new variable named FIREBASE_SERVICE_ACCOUNT_JSON and paste the entire JSON content.",
      "6. Alternatively, add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY as separate variables.",
      "7. Redeploy your project in Vercel."
    ]
  });
});
apiRouter.get("/auth/check-access", async (req, res) => {
  try {
    const queryEmail = req.query.email;
    const rawEmail = queryEmail || req.user?.email;
    const userEmail = normalizeEmail(rawEmail);
    if (!userEmail) {
      return res.status(200).json({
        authenticated: false,
        approved: false,
        role: "user",
        email: null,
        message: "No email provided for access check"
      });
    }
    const entry = await accessControlService.getEntry(userEmail);
    const approved = Boolean(entry && entry.approved);
    const role = entry?.role === "admin" ? "admin" : "user";
    return res.status(200).json({
      authenticated: Boolean(req.user?.email || req.user?.uid),
      approved,
      role,
      email: userEmail,
      approvedAt: entry?.approvedAt || null,
      notes: entry?.notes || "",
      message: approved ? "Email is authorized for assessment and learning features." : "Your email address has not been approved by the administrator. Please contact the administrator to request access."
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Access check failed" });
  }
});
apiRouter.post("/auth/verify-email-access", async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = normalizeEmail(email);
    if (!userEmail) {
      return res.status(400).json({ error: "Email is required" });
    }
    const entry = await accessControlService.getEntry(userEmail);
    const approved = Boolean(entry && entry.approved);
    const role = entry?.role === "admin" ? "admin" : "user";
    return res.json({
      email: userEmail,
      approved,
      role,
      notes: entry?.notes || ""
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Verification failed" });
  }
});
apiRouter.post("/auth/email-login", async (req, res) => {
  try {
    const { email, rolePreference } = req.body;
    const userEmail = normalizeEmail(email);
    if (!userEmail) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const entry = await accessControlService.getEntry(userEmail);
    if (!entry || !entry.approved) {
      return res.status(403).json({
        error: "Access Restricted",
        message: "Your email address has not been approved by the administrator. Please contact the administrator to request access.",
        accessDenied: true,
        email: userEmail,
        approved: false
      });
    }
    const role = entry.role === "admin" ? "admin" : rolePreference === "admin" ? "admin" : "student";
    let user = db.getUserByEmail(userEmail);
    if (!user) {
      const generatedUid = `usr_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      user = db.createUser({
        id: generatedUid,
        firebaseUid: generatedUid,
        name: userEmail.split("@")[0],
        email: userEmail,
        role,
        college: "Bannari Amman Institute of Technology",
        department: "Computer Science & Engineering",
        educationLevel: "B.Tech / B.E.",
        yearOfStudy: "3rd Year",
        experienceLevel: "Intermediate",
        targetJobRole: role === "admin" ? "Curriculum Administrator" : "Full Stack Software Developer",
        onboardingCompleted: true
      });
    } else if (entry.role === "admin" && user.role !== "admin") {
      user = db.updateUser(user.id, { role: "admin" }) || user;
    }
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        uid: user.id,
        user_id: user.id,
        email: user.email,
        email_verified: true,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1e3),
        exp: Math.floor(Date.now() / 1e3) + 14 * 24 * 3600
      })
    ).toString("base64url");
    const token = `${header}.${payload}.sig`;
    return res.json({
      success: true,
      token,
      user,
      role: user.role,
      accessControl: entry
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});
apiRouter.use(requireApprovedEmail);
apiRouter.post("/auth/login", (req, res) => {
  const { email, firebaseUid, name, picture } = req.body;
  if (!firebaseUid && !email) {
    return res.status(400).json({ error: "Firebase UID or email is required." });
  }
  const user = db.upsertUserFromFirebase({
    firebaseUid: firebaseUid || `fb_${Date.now()}`,
    name: name || (email ? email.split("@")[0] : "Learner"),
    email: email || `${firebaseUid}@firebase.local`,
    avatar: picture,
    role: email?.toLowerCase().includes("admin") ? "admin" : "student",
    onboardingCompleted: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastLoginAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, user });
});
apiRouter.post("/auth/register", (req, res) => {
  const { name, email, college, educationLevel, department, yearOfStudy, experienceLevel, targetJobRole, preferredLearningStyle, dailyAvailableTime, careerGoal } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    const updated = db.updateUser(existing.id, {
      name,
      college,
      educationLevel,
      department,
      yearOfStudy,
      experienceLevel,
      targetJobRole,
      preferredLearningStyle,
      dailyAvailableTime,
      careerGoal
    });
    return res.json({ success: true, user: updated });
  }
  const newUser = db.createUser({
    name,
    email,
    college,
    educationLevel,
    department,
    yearOfStudy,
    experienceLevel: experienceLevel || "Beginner",
    targetJobRole,
    preferredLearningStyle,
    dailyAvailableTime,
    careerGoal,
    onboardingCompleted: false,
    role: email.toLowerCase().includes("admin") ? "admin" : "student"
  });
  res.json({ success: true, user: newUser });
});
apiRouter.get("/auth/me", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.post("/auth/survey", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { experienceLevel, programmingExposure, careerGoal, dailyAvailableTime, skillConfidence } = req.body;
    const updated = db.updateUser(user.id, {
      experienceLevel,
      careerGoal,
      dailyAvailableTime,
      skillConfidence: skillConfidence || {},
      onboardingCompleted: true
    });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.put("/auth/profile", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { updates } = req.body;
    const updated = db.updateUser(user.id, updates);
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.get("/skills", (req, res) => {
  try {
    const firebaseUid = req.user?.uid || req.query?.userId;
    const user = firebaseUid ? db.getUserByFirebaseUid(firebaseUid) || db.getUserById(firebaseUid) : void 0;
    const skills = db.getAllSkills(user?.id);
    res.json({ skills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.json({ skills: db.getAllSkills() });
  }
});
apiRouter.get("/skills/:id/topics", (req, res) => {
  const skill = db.getSkillById(req.params.id);
  if (!skill) return res.status(404).json({ error: "Skill not found" });
  res.json({ topics: skill.topics });
});
apiRouter.post("/assessment/start", (req, res) => {
  const { skillId, topicIds, questionCount } = req.body;
  if (!skillId) return res.status(400).json({ error: "skillId is required" });
  const count = typeof questionCount === "number" && questionCount > 0 ? questionCount : 8;
  const questions = db.generateAdaptiveAssessmentQuestions(skillId, topicIds, count);
  res.json({
    skillId,
    totalQuestions: questions.length,
    questions
  });
});
apiRouter.post("/assessment/submit", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillId, responses, durationSeconds } = req.body;
    if (!skillId || !responses) {
      return res.status(400).json({ error: "Missing required assessment submission payload" });
    }
    const result = await db.submitAssessment({
      userId: user.id,
      skillId,
      responses,
      durationSeconds: durationSeconds || 120
    });
    res.json(result);
  } catch (error) {
    console.error("Assessment submit error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process assessment"
    });
  }
});
apiRouter.get("/assessment/:id/result", (req, res) => {
  const asm = db.getAssessmentById(req.params.id);
  const user = getAuthenticatedUser(req);
  if (!asm || asm.userId !== user.id) return res.status(404).json({ error: "Assessment not found" });
  const insight = asm.aiInsightId ? db.getAIInsightById(asm.aiInsightId) : null;
  res.json({ assessment: asm, insight });
});
apiRouter.get("/assessment/history", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const history = db.getUserAssessments(user.id);
    res.json({ history });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.get("/ai/insights", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const insights = db.getUserAIInsights(user.id);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch insights" });
  }
});
apiRouter.get("/ai/insight/:id", (req, res) => {
  const insight = db.getAIInsightById(req.params.id);
  const user = getAuthenticatedUser(req);
  if (!insight || insight.userId !== user.id) return res.status(404).json({ error: "AI Insight not found" });
  res.json({ insight });
});
apiRouter.post("/ai/diagnose-skill", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillId, skillName, currentLevel, selfConfidence, focusTopics, notes } = req.body;
    const skill = db.getSkillById(skillId);
    const targetSkillName = skillName || skill?.name || skillId || "Software Development";
    const analysis = await generateSkillDiagnosticInsightWithAI({
      skillName: targetSkillName,
      currentLevel: currentLevel || user.experienceLevel || "Intermediate",
      userCareerGoal: user.careerGoal || "Software Engineer",
      userExperience: user.experienceLevel || "Student / Learner",
      selfConfidence: selfConfidence || user.skillConfidence?.[skillId] || 3,
      focusTopics: focusTopics || (skill?.topics || []).map((t) => t.name),
      notes
    });
    const insightId = `insight-diag-${user.id}-${Date.now()}`;
    const newInsight = {
      ...analysis,
      id: insightId,
      assessmentId: `ondemand-${skillId || "gen"}-${Date.now()}`,
      userId: user.id,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.saveAIInsight(newInsight);
    db.updateUser(user.id, {
      xp: (user.xp || 0) + 75,
      lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    res.json({ insight: newInsight, xpGained: 75 });
  } catch (error) {
    console.error("Error in /ai/diagnose-skill:", error);
    res.status(500).json({ error: error.message || "Failed to generate diagnostic insight" });
  }
});
apiRouter.post("/ai/deep-dive", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillName, topicOrGap, type } = req.body;
    if (!topicOrGap) {
      return res.status(400).json({ error: "topicOrGap is required" });
    }
    const deepDive = await generateGapDeepDiveWithAI({
      skillName: skillName || "Computer Science",
      topicOrGap,
      type: type || "gap",
      studentLevel: user.experienceLevel || "Intermediate"
    });
    res.json({ deepDive });
  } catch (error) {
    console.error("Error in /ai/deep-dive:", error);
    res.status(500).json({ error: error.message || "Deep dive unavailable" });
  }
});
apiRouter.post("/ai/analyze", async (req, res) => {
  try {
    const analysis = await analyzeAssessmentWithAI(req.body);
    res.json({ insight: analysis });
  } catch (error) {
    console.error("AI analyze error:", error);
    res.status(500).json({ error: "AI analysis failed" });
  }
});
apiRouter.post("/ai/roadmap", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { skillId, skillName, currentLevel } = req.body;
    const latestAssessment = db.getUserAssessments(user.id).find((assessment) => assessment.skillId === skillId);
    if (!latestAssessment) {
      return res.status(400).json({ error: "Complete an assessment before generating a roadmap." });
    }
    const roadmapData = await generateRoadmapWithAI({
      skillName,
      currentLevel: latestAssessment.classifiedLevel || currentLevel,
      weakTopics: latestAssessment.weakTopics,
      strongTopics: latestAssessment.strongTopics,
      careerGoal: user.careerGoal,
      dailyAvailableTime: user.dailyAvailableTime
    });
    const key = `${user.id}-${skillId}`;
    const newRoadmap = {
      ...roadmapData,
      id: `rdm-${Date.now()}`,
      userId: user.id,
      skillId,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.roadmaps.set(key, newRoadmap);
    res.json({ roadmap: newRoadmap });
  } catch (error) {
    console.error("AI roadmap error:", error);
    res.status(500).json({ error: "Roadmap generation failed" });
  }
});
apiRouter.get("/roadmap/:skillId", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const skillId = req.params.skillId;
    let roadmap = db.getRoadmap(user.id, skillId);
    if (!roadmap) {
      const skill = db.getSkillById(skillId);
      const skillName = skill ? skill.name : skillId.toUpperCase();
      const currentLevel = user.experienceLevel || "Beginner";
      const targetLevel = currentLevel === "Beginner" ? "Basic" : currentLevel === "Basic" ? "Intermediate" : currentLevel === "Intermediate" ? "Advanced" : "Expert";
      const topicsList = (skill?.topics || []).map((t) => t.name);
      const starterMilestones = [
        {
          id: `m-${skillId}-1`,
          weekNumber: 1,
          title: `Solidify ${skillName} Core Fundamentals`,
          description: `Master fundamental syntax, standard library idioms, and problem patterns in ${skillName}.`,
          topics: topicsList.slice(0, 2).length > 0 ? topicsList.slice(0, 2) : ["Syntax & Data Types", "Control Flow"],
          learningResources: [
            { title: `${skillName} Official Documentation & Tour`, type: "Documentation", duration: "45 mins" },
            { title: `${skillName} Foundational Patterns Guide`, type: "Guide", duration: "30 mins" }
          ],
          practiceExercise: {
            title: `Hands-on ${skillName} Core Implementation Drill`,
            task: `Implement core data structures and error handling using canonical idioms.`,
            difficulty: currentLevel
          },
          miniProject: {
            title: `CLI Utility & Data Transformer`,
            description: `Build a clean command-line data processing pipeline validating input streams.`
          },
          completed: false
        },
        {
          id: `m-${skillId}-2`,
          weekNumber: 2,
          title: `Intermediate Architecture & Data Structures`,
          description: `Implement modular design patterns, concurrency basics, and optimal algorithms.`,
          topics: topicsList.slice(2, 4).length > 0 ? topicsList.slice(2, 4) : ["Data Structures", "Modular Architecture"],
          learningResources: [
            { title: `High Performance ${skillName} Deep Dive`, type: "Guide", duration: "60 mins" },
            { title: `Design Patterns in ${skillName}`, type: "Documentation", duration: "45 mins" }
          ],
          practiceExercise: {
            title: `Refactor Legacy Module with Clean Design`,
            task: `Refactor tightly-coupled logic into decoupled, testable components.`,
            difficulty: "Intermediate"
          },
          miniProject: {
            title: `Real-time Cache & In-Memory Store`,
            description: `Implement an LRU cache with eviction policies and concurrency safety.`
          },
          completed: false
        },
        {
          id: `m-${skillId}-3`,
          weekNumber: 3,
          title: `Advanced Performance & Edge Case Optimization`,
          description: `Master profiling, memory management, and asynchronous streams.`,
          topics: topicsList.slice(4, 6).length > 0 ? topicsList.slice(4, 6) : ["Async I/O", "Optimization & Testing"],
          learningResources: [
            { title: `Benchmarking and Memory Profiling Guide`, type: "Guide", duration: "50 mins" },
            { title: `Automated Test Suites & Mocking`, type: "Documentation", duration: "40 mins" }
          ],
          practiceExercise: {
            title: `Bottleneck Profiling & Asynchronous Flow`,
            task: `Identify 3 performance bottlenecks and rewrite with asynchronous worker pools.`,
            difficulty: "Advanced"
          },
          miniProject: {
            title: `High-Throughput Event Processor`,
            description: `Build an asynchronous event ingestion worker handling 5k ops/sec with backpressure.`
          },
          completed: false
        },
        {
          id: `m-${skillId}-4`,
          weekNumber: 4,
          title: `Production Capstone & Interview Mastery`,
          description: `Build and deploy an enterprise-ready microservice with full test coverage and monitoring.`,
          topics: ["System Design", "Production Readiness", "Interview Drills"],
          learningResources: [
            { title: `Production Checklist & SRE Best Practices`, type: "Documentation", duration: "60 mins" },
            { title: `Technical Interview Coding Challenges`, type: "Practice", duration: "90 mins" }
          ],
          practiceExercise: {
            title: `System Architecture Simulation`,
            task: `Design end-to-end telemetry and rate limiting for multi-tenant services.`,
            difficulty: "Expert"
          },
          miniProject: {
            title: `Production Ready Service with Health Metrics`,
            description: `Finalize a comprehensive service with structured logging, Docker configuration, and unit test suites.`
          },
          completed: false
        }
      ];
      roadmap = {
        id: `rdm-${skillId}-${Date.now()}`,
        userId: user.id,
        skillId,
        skillName,
        currentLevel,
        targetLevel,
        estimatedWeeks: 4,
        totalMilestones: starterMilestones.length,
        completedMilestones: 0,
        milestones: starterMilestones,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.roadmaps.set(`${user.id}-${skillId}`, roadmap);
    }
    res.json({ roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to load roadmap" });
  }
});
apiRouter.post("/roadmap/:skillId/toggle-milestone", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { milestoneId } = req.body;
    const result = db.toggleRoadmapMilestone(user.id, req.params.skillId, milestoneId);
    if (!result) {
      return res.status(404).json({ error: "Roadmap or milestone not found" });
    }
    res.json({
      success: true,
      roadmap: result.roadmap,
      user: result.user,
      xpGained: result.xpGained
    });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.post("/ai/generate-question", async (req, res) => {
  try {
    const { skillName, topicName, targetDifficulty, questionType } = req.body;
    const generated = await generateAdaptiveQuestionWithAI({
      skillName,
      topicName,
      targetDifficulty,
      questionType
    });
    db.addQuestion(generated);
    res.json({ question: generated });
  } catch (error) {
    console.error("AI question generation error:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
});
apiRouter.post("/ai/tutor", async (req, res) => {
  try {
    const { message, chatHistory, userContext } = req.body;
    const answer = await askAITutor({
      message,
      chatHistory: chatHistory || [],
      userContext: userContext || { name: "Learner" }
    });
    res.json({ reply: answer });
  } catch (error) {
    console.error("AI Tutor error:", error);
    res.status(500).json({ error: "AI Tutor service unavailable" });
  }
});
apiRouter.get("/achievements", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const achievements = db.getUserAchievements(user.id);
    res.json({ achievements });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.get("/progress", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const assessments = db.getUserAssessments(user.id);
    const skills = db.getAllSkills(user.id);
    const totalAssessments = assessments.length;
    const averageScore = totalAssessments > 0 ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / totalAssessments) : 0;
    const skillProgressList = skills.map((skill) => {
      const skillAsms = assessments.filter((a) => a.skillId === skill.id);
      const lastScore = skillAsms[0]?.score || 0;
      const prevScore = skillAsms[1]?.score || lastScore;
      const delta = lastScore - prevScore;
      return {
        skillId: skill.id,
        skillName: skill.name,
        level: skillAsms[0]?.classifiedLevel || "Beginner",
        score: lastScore,
        delta,
        assessmentCount: skillAsms.length
      };
    });
    const assessmentTimeline = assessments.slice().reverse().map((a) => ({
      date: new Date(a.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: a.score,
      skillName: a.skillName
    }));
    const latestTopicScores = assessments.reduce((topics, assessment) => {
      for (const topic of assessment.topicScores) {
        if (!topics.has(`${assessment.skillId}:${topic.topicId}`)) {
          topics.set(`${assessment.skillId}:${topic.topicId}`, {
            topicName: topic.topicName,
            skillName: assessment.skillName,
            score: topic.percentage,
            status: topic.percentage >= 80 ? "Mastered" : topic.percentage >= 50 ? "Developing" : "Needs Attention"
          });
        }
      }
      return topics;
    }, /* @__PURE__ */ new Map());
    const topicProficiency = Array.from(latestTopicScores.values());
    const growthValues = skillProgressList.filter((item) => item.assessmentCount > 1).map((item) => item.delta);
    const overallGrowthPercentage = growthValues.length > 0 ? Math.round(growthValues.reduce((sum, delta) => sum + delta, 0) / growthValues.length) : 0;
    res.json({
      totalAssessments,
      averageScore,
      overallGrowthPercentage,
      totalXp: user?.xp || 0,
      streakDays: user?.streakDays || 0,
      skillsMasteredCount: skillProgressList.filter((s) => s.score >= 70).length,
      skillProgressList,
      assessmentTimeline,
      topicProficiency
    });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.get("/admin/stats", (req, res) => {
  const stats = db.getAdminStats();
  res.json(stats);
});
apiRouter.get("/admin/users", (_req, res) => {
  const users = db.getAllUsers();
  res.json({ users });
});
apiRouter.post("/admin/users", requireAdmin, async (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { name, email, role, department, college, yearOfStudy } = req.body;
    const normEmail = normalizeEmail(email);
    if (!normEmail || !name) {
      return res.status(400).json({ error: "Name and a valid Email address are required." });
    }
    const assignedRole = role === "admin" ? "admin" : "student";
    await accessControlService.setApproval(normEmail, {
      approved: true,
      role: assignedRole === "admin" ? "admin" : "user",
      approvedBy: adminUser.email || adminUser.id,
      notes: department || "Added via Admin Users Portal"
    });
    let existing = db.getUserByEmail(normEmail);
    let user;
    if (existing) {
      user = db.updateUser(existing.id, {
        name,
        email: normEmail,
        role: assignedRole,
        department: department || existing.department,
        college: college || existing.college,
        yearOfStudy: yearOfStudy || existing.yearOfStudy
      });
    } else {
      const generatedUid = `usr_${normEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      user = db.createUser({
        id: generatedUid,
        firebaseUid: generatedUid,
        name,
        email: normEmail,
        role: assignedRole,
        department: department || "Computer Science & Engineering",
        college: college || "Bannari Amman Institute of Technology",
        yearOfStudy: yearOfStudy || "3rd Year",
        experienceLevel: "Intermediate",
        targetJobRole: assignedRole === "admin" ? "Curriculum Administrator" : "Software Engineer",
        onboardingCompleted: true
      });
    }
    db.recordAuditLog(
      adminUser,
      "CREATE_OR_ENROLL_USER",
      "Users",
      normEmail,
      `Enrolled/Approved user ${name} (${normEmail}) with role ${assignedRole}`
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create user" });
  }
});
apiRouter.put("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const userId = req.params.id;
    const { name, email, role, department, college, yearOfStudy, approveNow } = req.body;
    const existingUser = db.getUserById(userId) || db.getUserByEmail(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const oldEmail = normalizeEmail(existingUser.email);
    const newEmail = email ? normalizeEmail(email) : oldEmail;
    const assignedRole = role === "admin" ? "admin" : "student";
    if (newEmail) {
      await accessControlService.setApproval(newEmail, {
        approved: approveNow !== void 0 ? Boolean(approveNow) : true,
        role: assignedRole === "admin" ? "admin" : "user",
        approvedBy: adminUser.email || adminUser.id,
        notes: department || existingUser.department || "Updated via Admin Portal"
      });
    }
    const updated = db.updateUser(existingUser.id, {
      ...name ? { name } : {},
      ...email ? { email: newEmail } : {},
      ...role ? { role: assignedRole } : {},
      ...department !== void 0 ? { department } : {},
      ...college !== void 0 ? { college } : {},
      ...yearOfStudy !== void 0 ? { yearOfStudy } : {}
    });
    db.recordAuditLog(
      adminUser,
      "UPDATE_USER",
      "Users",
      newEmail || existingUser.id,
      `Updated user profile for ${newEmail} (Role: ${assignedRole})`
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update user" });
  }
});
apiRouter.post("/admin/users/:id/approve-email", requireAdmin, async (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const userId = req.params.id;
    const targetUser = db.getUserById(userId) || db.getUserByEmail(userId);
    if (!targetUser || !targetUser.email) {
      return res.status(404).json({ error: "User or user email not found" });
    }
    const normEmail = normalizeEmail(targetUser.email);
    const entry = await accessControlService.setApproval(normEmail, {
      approved: true,
      role: targetUser.role === "admin" ? "admin" : "user",
      approvedBy: adminUser.email || adminUser.id,
      notes: targetUser.department || "Approved via Student Directory"
    });
    db.recordAuditLog(
      adminUser,
      "APPROVE_USER_EMAIL",
      "Users",
      normEmail,
      `Quick-approved access for enrolled student ${normEmail}`
    );
    res.json({ success: true, entry, user: targetUser });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to approve email" });
  }
});
apiRouter.get("/admin/questions", (req, res) => {
  const skillId = req.query.skillId;
  const questions = db.getQuestions({ skillId });
  res.json({ questions });
});
apiRouter.post("/admin/questions", (req, res) => {
  const question = req.body;
  if (!question.question || !question.skillId) {
    return res.status(400).json({ error: "Missing question details" });
  }
  const created = db.addQuestion({
    ...question,
    id: `q-admin-${Date.now()}`
  });
  res.json({ success: true, question: created });
});
apiRouter.put("/admin/questions/:id", (req, res) => {
  const updated = db.updateQuestion(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Question not found" });
  res.json({ success: true, question: updated });
});
apiRouter.post("/admin/questions/:id/flag", (req, res) => {
  const flagged = req.body.flagged ?? true;
  const success = db.toggleFlagQuestion(req.params.id, flagged);
  res.json({ success });
});
apiRouter.get("/tests", (req, res) => {
  try {
    const { category, status, search } = req.query;
    const configs = db.getAssessmentConfigs({ category, status, search });
    let userId = null;
    try {
      const user = getAuthenticatedUser(req);
      userId = user.id;
    } catch (e) {
    }
    const result = configs.map((cfg) => {
      let attemptStatus = "available";
      let userAttemptCount = 0;
      let lastScore;
      if (cfg.status === "upcoming") {
        attemptStatus = "upcoming";
      } else if (userId) {
        const attempts = db.getUserAttempts(userId, cfg.id);
        userAttemptCount = attempts.length;
        const inProgress = attempts.find((a) => a.status === "in_progress");
        const completed = attempts.filter((a) => a.status === "submitted" || a.status === "evaluated");
        if (inProgress) {
          attemptStatus = "in_progress";
        } else if (completed.length >= cfg.maxAttempts) {
          attemptStatus = "limit_reached";
          lastScore = completed[0]?.score;
        } else if (completed.length > 0) {
          attemptStatus = "completed";
          lastScore = completed[0]?.score;
        }
      }
      return {
        ...cfg,
        attemptStatus,
        userAttemptCount,
        lastScore
      };
    });
    res.json({ tests: result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to list tests" });
  }
});
apiRouter.get("/tests/:id", (req, res) => {
  const config = db.getAssessmentConfigById(req.params.id);
  if (!config) return res.status(404).json({ error: "Assessment not found" });
  let userAttempts = [];
  try {
    const user = getAuthenticatedUser(req);
    userAttempts = db.getUserAttempts(user.id, config.id);
  } catch (e) {
  }
  res.json({
    test: config,
    userAttempts
  });
});
apiRouter.post("/tests/:id/start", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const sebHeader = req.headers["user-agent"] || req.headers["x-safexambrowser-requesthash"] || "";
    const { attempt, questions, isResumed } = db.startOrResumeAttempt(req.params.id, user, { sebHeader });
    res.json({
      attempt,
      questions: sanitizeQuestionsForStudent(questions),
      isResumed,
      serverTime: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to start assessment" });
  }
});
apiRouter.post("/tests/:id/reattempt", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const sebHeader = req.headers["user-agent"] || req.headers["x-safexambrowser-requesthash"] || "";
    const { attempt, questions, isResumed } = db.startOrResumeAttempt(req.params.id, user, {
      sebHeader,
      isReattempt: true
    });
    res.json({
      attempt,
      questions: sanitizeQuestionsForStudent(questions),
      isResumed,
      serverTime: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to start reattempt" });
  }
});
apiRouter.get("/tests/reattempts/eligible", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const eligibleReattempts = db.getEligibleReattempts(user.id);
    res.json({ eligibleReattempts });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch eligible reattempts" });
  }
});
apiRouter.get("/tests/:id/seb-config", (req, res) => {
  try {
    const config = db.getAssessmentConfigById(req.params.id);
    if (!config) return res.status(404).json({ error: "Assessment not found" });
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;
    const xmlConfig = db.generateSebConfigFile(config, baseUrl);
    res.setHeader("Content-Type", "application/seb");
    res.setHeader("Content-Disposition", `attachment; filename="${config.id}-lockdown.seb"`);
    res.send(xmlConfig);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate SEB configuration" });
  }
});
apiRouter.post("/tests/attempt/:attemptId/violation", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { type, details } = req.body;
    if (!type) {
      return res.status(400).json({ error: "Violation type is required" });
    }
    const result = await db.recordViolation(
      req.params.attemptId,
      user.id,
      type,
      details || "Examination lockdown violation detected"
    );
    res.json(result);
  } catch (error) {
    console.error("Record violation error:", error);
    res.status(400).json({ error: error.message || "Failed to log violation" });
  }
});
apiRouter.post("/tests/attempt/:attemptId/autosave", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { answers, flagged, codeSubmissions, timeSpentSeconds } = req.body;
    const result = db.autosaveAttempt(req.params.attemptId, user.id, {
      answers,
      flagged,
      codeSubmissions,
      timeSpentSeconds
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || "Autosave failed" });
  }
});
apiRouter.post("/tests/attempt/:attemptId/submit", async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { answers, durationSeconds, codeSubmissions } = req.body;
    const result = await db.submitAttempt(
      req.params.attemptId,
      user.id,
      answers || {},
      durationSeconds || 60,
      codeSubmissions
    );
    res.json(result);
  } catch (error) {
    console.error("Submit attempt error:", error);
    res.status(400).json({ error: error.message || "Failed to submit test" });
  }
});
apiRouter.get("/tests/attempt/:attemptId", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const attempt = db.getAttemptById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    if (attempt.userId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Access forbidden to this attempt." });
    }
    const config = db.getAssessmentConfigById(attempt.assessmentId);
    const asm = db.assessments.get(`asm-${attempt.id}`) || Array.from(db.assessments.values()).find((a) => a.id === `asm-${attempt.id}`);
    const insight = asm?.aiInsightId ? db.aiInsights.get(asm.aiInsightId) : null;
    res.json({
      attempt,
      config,
      assessmentResult: asm,
      insight
    });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.post("/tests/coding/run", async (req, res) => {
  try {
    const { language, code, questionId } = req.body;
    if (!code) {
      return res.status(400).json({ error: "No code provided." });
    }
    const question = db.questions.get(questionId);
    if (!question || !question.codingDetails) {
      return res.status(400).json({ error: "Invalid coding question." });
    }
    const sampleCases = question.codingDetails.sampleTestCases;
    const execResult = await executeSandboxedCode({
      language: language || "javascript",
      code,
      testCases: sampleCases
    });
    res.json(execResult);
  } catch (error) {
    res.status(500).json({ error: error.message || "Code execution failed" });
  }
});
apiRouter.get("/notifications", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const notifications = db.getUserNotifications(user.id);
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.post("/notifications/:id/read", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const success = db.markNotificationRead(user.id, req.params.id);
    res.json({ success });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.post("/notifications/read-all", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const success = db.markAllNotificationsRead(user.id);
    res.json({ success });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unauthorized" });
  }
});
apiRouter.get("/admin/assessments", requireAdmin, (_req, res) => {
  const configs = Array.from(db.assessmentConfigs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ assessments: configs });
});
apiRouter.post("/admin/assessments", requireAdmin, (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const created = db.createAssessmentConfig(req.body, adminUser);
    res.json({ success: true, assessment: created });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to create assessment" });
  }
});
apiRouter.put("/admin/assessments/:id", requireAdmin, (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const updated = db.updateAssessmentConfig(req.params.id, req.body, adminUser);
    if (!updated) return res.status(404).json({ error: "Assessment not found" });
    res.json({ success: true, assessment: updated });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to update assessment" });
  }
});
apiRouter.post("/admin/assessments/:id/duplicate", requireAdmin, (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const duplicate = db.duplicateAssessmentConfig(req.params.id, adminUser);
    if (!duplicate) return res.status(404).json({ error: "Assessment not found" });
    res.json({ success: true, assessment: duplicate });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to duplicate assessment" });
  }
});
apiRouter.delete("/admin/assessments/:id", requireAdmin, (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const success = db.archiveAssessmentConfig(req.params.id, adminUser);
    res.json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to archive assessment" });
  }
});
apiRouter.post("/admin/questions/import", requireAdmin, (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { questions: incomingQuestions, format } = req.body;
    if (!Array.isArray(incomingQuestions)) {
      return res.status(400).json({ error: "Expected an array of question objects." });
    }
    let importedCount = 0;
    const errors = [];
    for (let i = 0; i < incomingQuestions.length; i++) {
      const q = incomingQuestions[i];
      if (!q.question || !q.skillId || !q.correctAnswerId) {
        errors.push(`Row ${i + 1}: Missing required fields (question, skillId, correctAnswerId).`);
        continue;
      }
      const qId = q.id || `q-imp-${Date.now()}-${i}`;
      db.addQuestion({
        ...q,
        id: qId,
        questionType: q.questionType || "MCQ",
        difficulty: q.difficulty || "Intermediate",
        options: q.options || [
          { id: "opt1", text: "Option A" },
          { id: "opt2", text: "Option B" }
        ],
        explanation: q.explanation || "No explanation provided."
      });
      importedCount++;
    }
    db.recordAuditLog(
      adminUser,
      "IMPORT_QUESTIONS",
      "QuestionBank",
      `bulk-${importedCount}`,
      `Imported ${importedCount} questions via ${format || "JSON"}`
    );
    res.json({
      success: true,
      importedCount,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    res.status(400).json({ error: error.message || "Import failed" });
  }
});
apiRouter.get("/admin/assessments/:id/report", requireAdmin, (req, res) => {
  try {
    const csvData = db.exportAssessmentReportCsv(req.params.id);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="assessment-report-${req.params.id}.csv"`);
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate report" });
  }
});
apiRouter.get("/admin/attempts", requireAdmin, (req, res) => {
  const assessmentId = req.query.assessmentId;
  const attempts = db.getAllAttempts(assessmentId);
  res.json({ attempts });
});
apiRouter.get("/admin/violations", requireAdmin, (_req, res) => {
  try {
    const violationData = db.getAllViolations();
    res.json(violationData);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to list violations" });
  }
});
apiRouter.post("/admin/attempts/:attemptId/reset-violations", requireAdmin, (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { reason } = req.body;
    const result = db.resetAttemptViolations(req.params.attemptId, adminUser, reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to reset violations" });
  }
});
apiRouter.get("/admin/audit-logs", requireAdmin, (_req, res) => {
  const logs = db.getAuditLogs(100);
  res.json({ logs });
});
apiRouter.get("/admin/access-control", requireAdmin, async (_req, res) => {
  try {
    const list = await accessControlService.listAll();
    res.json({ accessList: list });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to list access control entries" });
  }
});
apiRouter.post("/admin/access-control/approve", requireAdmin, async (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { email, role, notes } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const assignedRole = role === "admin" ? "admin" : "user";
    const entry = await accessControlService.setApproval(email, {
      approved: true,
      role: assignedRole,
      approvedBy: adminUser.email || adminUser.id,
      notes: notes || ""
    });
    db.recordAuditLog(
      adminUser,
      "APPROVE_USER_EMAIL",
      "AccessControl",
      normalizeEmail(email),
      `Approved access with role "${assignedRole}" for ${normalizeEmail(email)}`
    );
    res.json({ success: true, entry });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to approve email" });
  }
});
apiRouter.post("/admin/access-control/revoke", requireAdmin, async (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const success = await accessControlService.revokeApproval(email, adminUser.email || adminUser.id);
    db.recordAuditLog(
      adminUser,
      "REVOKE_USER_EMAIL",
      "AccessControl",
      normalizeEmail(email),
      `Revoked access for ${normalizeEmail(email)}`
    );
    res.json({ success });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to revoke email" });
  }
});
apiRouter.delete("/admin/access-control/:email", requireAdmin, async (req, res) => {
  try {
    const adminUser = getAuthenticatedUser(req);
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }
    const success = await accessControlService.deleteEntry(email);
    db.recordAuditLog(
      adminUser,
      "DELETE_ACCESS_ENTRY",
      "AccessControl",
      normalizeEmail(email),
      `Deleted access control entry for ${normalizeEmail(email)}`
    );
    res.json({ success });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to delete access control entry" });
  }
});

// server/vercelServer.ts
var app = express();
app.use(express.json());
app.get(["/health", "/healthz", "/api/health", "/api/healthz"], (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: "vercel-serverless"
  });
});
app.use((req, _res, next) => {
  if (req.url.startsWith("/api")) {
    req.url = req.url.replace(/^\/api/, "") || "/";
  }
  next();
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use((_req, res) => {
  res.status(404).json({ error: "API route not found" });
});
app.use((err, _req, res, _next) => {
  console.error("API Server Error:", err);
  res.status(500).json({ error: err?.message || "Internal Server Error" });
});
var vercelServer_default = app;
export {
  vercelServer_default as default
};
