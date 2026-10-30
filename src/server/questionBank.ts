/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionServer, SkillDifficulty } from '../types';

export const QUESTION_BANK: QuestionServer[] = [
  // 1. JavaScript
  {
    id: 'js-beg-1',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    question: 'What is the result of typeof NaN in JavaScript?',
    options: ['"number"', '"nan"', '"undefined"', '"object"'],
    correctOptionIndex: 0,
    explanation: 'In JavaScript, NaN (Not-a-Number) is technically a numeric data type, so typeof NaN returns "number".',
    isAiGenerated: false
  },
  {
    id: 'js-beg-2',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    question: 'Which method adds one or more elements to the end of an array and returns the new length?',
    options: ['push()', 'pop()', 'unshift()', 'shift()'],
    correctOptionIndex: 0,
    explanation: 'Array.prototype.push() appends items to the end of the array and returns the updated array length.',
    isAiGenerated: false
  },
  {
    id: 'js-int-1',
    skill: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What does this code output?',
    codeSnippet: 'console.log([1, 2, 3] + [4, 5, 6]);',
    options: ['"1,2,34,5,6"', '[1, 2, 3, 4, 5, 6]', 'NaN', 'TypeError'],
    correctOptionIndex: 0,
    explanation: 'The + operator converts both arrays to strings ("1,2,3" and "4,5,6") and concatenates them into "1,2,34,5,6".',
    isAiGenerated: false
  },
  {
    id: 'js-int-2',
    skill: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'Which of the following correctly describes a closure in JavaScript?',
    options: [
      'A function bundled with its lexical environment reference',
      'An encrypted callback used in asynchronous requests',
      'A built-in garbage collection mechanism',
      'A block scope declared with the sealed keyword'
    ],
    correctOptionIndex: 0,
    explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment).',
    isAiGenerated: false
  },
  {
    id: 'js-adv-1',
    skill: 'JavaScript',
    difficulty: 'Advanced',
    question: 'In the V8 JavaScript engine event loop, in what order are Promise microtasks and process.nextTick callbacks executed?',
    options: [
      'process.nextTick queue drains before the Promise microtask queue',
      'Promise microtasks drain before process.nextTick',
      'They execute in alternating round-robin order',
      'They execute in the macrotask timer phase'
    ],
    correctOptionIndex: 0,
    explanation: 'In Node.js event loop, the nextTickQueue is processed before the microtask queue (which handles resolved Promises).',
    isAiGenerated: false
  },

  // 2. TypeScript
  {
    id: 'ts-beg-1',
    skill: 'TypeScript',
    difficulty: 'Beginner',
    question: 'Which keyword is used in TypeScript to define a custom type that can represent union or intersection types?',
    options: ['type', 'interface', 'class', 'implements'],
    correctOptionIndex: 0,
    explanation: 'The `type` alias keyword allows defining union, intersection, primitive, and tuple types.',
    isAiGenerated: false
  },
  {
    id: 'ts-int-1',
    skill: 'TypeScript',
    difficulty: 'Intermediate',
    question: 'What is the utility type in TypeScript that constructs a type with all properties of T set to optional?',
    options: ['Partial<T>', 'Readonly<T>', 'Record<K, T>', 'Pick<T, K>'],
    correctOptionIndex: 0,
    explanation: 'Partial<T> makes all properties in T optional by adding the ? modifier to each property.',
    isAiGenerated: false
  },
  {
    id: 'ts-adv-1',
    skill: 'TypeScript',
    difficulty: 'Advanced',
    question: 'What is the purpose of the `infer` keyword in conditional types?',
    codeSnippet: 'type ElementType<T> = T extends (infer U)[] ? U : T;',
    options: [
      'Introduces a type variable within the true branch to be deduced',
      'Enforces runtime type-casting for generic arrays',
      'Creates a mutable reference in strict mode',
      'Compiles the type into a WebAssembly structure'
    ],
    correctOptionIndex: 0,
    explanation: '`infer` introduces a type variable to be automatically deduced within the `extends` clause of a conditional type.',
    isAiGenerated: false
  },

  // 3. React
  {
    id: 'react-beg-1',
    skill: 'React',
    difficulty: 'Beginner',
    question: 'Which React hook is primarily used to retain state between renders in a functional component?',
    options: ['useState', 'useEffect', 'useMemo', 'useContext'],
    correctOptionIndex: 0,
    explanation: 'useState declares a state variable and returns a pair with current state and a function to update it.',
    isAiGenerated: false
  },
  {
    id: 'react-int-1',
    skill: 'React',
    difficulty: 'Intermediate',
    question: 'When should you pass an empty dependency array `[]` to `useEffect`?',
    options: [
      'When you want the effect to run only once after the component mounts',
      'When the effect must run on every single state change',
      'To prevent the component from unmounting',
      'When returning JSX from an async function'
    ],
    correctOptionIndex: 0,
    explanation: 'An empty dependency array indicates that the effect does not depend on any changing values, so it executes once on mount and cleans up on unmount.',
    isAiGenerated: false
  },
  {
    id: 'react-adv-1',
    skill: 'React',
    difficulty: 'Advanced',
    question: 'What does React Concurrent Mode use under the hood for scheduling and prioritization?',
    options: [
      'MessageChannel / scheduler task priorities and lanes model',
      'Native Web Workers with SharedArrayBuffer',
      'Synchronous requestAnimationFrame blocking loop',
      'Server-Sent Events'
    ],
    correctOptionIndex: 0,
    explanation: 'React Scheduler uses MessageChannel and a fine-grained bitmask lanes model to coordinate task priorities without blocking the main browser thread.',
    isAiGenerated: false
  },

  // 4. Node.js
  {
    id: 'node-beg-1',
    skill: 'Node.js',
    difficulty: 'Beginner',
    question: 'Which core module in Node.js provides asynchronous file operations such as reading and writing files?',
    options: ['fs', 'http', 'path', 'os'],
    correctOptionIndex: 0,
    explanation: 'The `fs` (File System) module allows working with the file system asynchronously and synchronously.',
    isAiGenerated: false
  },
  {
    id: 'node-int-1',
    skill: 'Node.js',
    difficulty: 'Intermediate',
    question: 'What happens when an uncaught exception is thrown in a Node.js process and unhandled?',
    options: [
      'The process emits "uncaughtException" and terminates with non-zero exit code',
      'Node.js automatically re-runs the script from the beginning',
      'The call stack is silently purged without terminating the process',
      'The operating system suspends the Node.js binary'
    ],
    correctOptionIndex: 0,
    explanation: 'By default, uncaught exceptions print a stack trace and terminate the Node process to prevent running in an unstable corrupted state.',
    isAiGenerated: false
  },
  {
    id: 'node-adv-1',
    skill: 'Node.js',
    difficulty: 'Advanced',
    question: 'What mechanism in Node.js streams prevents a fast readable stream from overwhelming a slower writable stream?',
    options: [
      'Backpressure via stream.write() returning false and the "drain" event',
      'Thread pool preemption via libuv pthread mutexes',
      'Automatic memory compression in V8 heap',
      'Chunk discarding in HighWaterMark overflow'
    ],
    correctOptionIndex: 0,
    explanation: 'Backpressure is handled when writable.write() returns false when buffer exceeds highWaterMark, and resumes when the "drain" event fires.',
    isAiGenerated: false
  },

  // 5. Python
  {
    id: 'py-beg-1',
    skill: 'Python',
    difficulty: 'Beginner',
    question: 'Which collection type in Python is ordered, mutable, and allows duplicate elements?',
    options: ['list', 'tuple', 'set', 'frozenset'],
    correctOptionIndex: 0,
    explanation: 'Lists in Python are mutable sequences of values enclosed in square brackets.',
    isAiGenerated: false
  },
  {
    id: 'py-int-1',
    skill: 'Python',
    difficulty: 'Intermediate',
    question: 'What is the function of the `yield` keyword in a Python function?',
    options: [
      'Turns the function into a generator iterator, pausing execution',
      'Terminates the outer loop immediately',
      'Forces garbage collection on local variables',
      'Declares a static method inside a class'
    ],
    correctOptionIndex: 0,
    explanation: '`yield` suspends function execution and yields a value back to the caller, producing a generator iterator.',
    isAiGenerated: false
  },
  {
    id: 'py-adv-1',
    skill: 'Python',
    difficulty: 'Advanced',
    question: 'How does Python’s Global Interpreter Lock (GIL) affect multithreading with CPU-bound workloads in CPython?',
    options: [
      'Prevents multiple native threads from executing Python bytecode simultaneously',
      'Distributes CPU tasks across available cores automatically',
      'Disables asynchronous I/O loops',
      'Prevents memory leaks in circular references'
    ],
    correctOptionIndex: 0,
    explanation: 'The GIL allows only one native thread to hold the Python interpreter lock at any moment, limiting CPU-bound speedup across multiple cores in CPython.',
    isAiGenerated: false
  },

  // 6. SQL
  {
    id: 'sql-beg-1',
    skill: 'SQL',
    difficulty: 'Beginner',
    question: 'Which SQL clause is used to filter records resulting from a SELECT query?',
    options: ['WHERE', 'ORDER BY', 'GROUP BY', 'LIMIT'],
    correctOptionIndex: 0,
    explanation: 'The WHERE clause specifies search conditions to filter rows returned by a query.',
    isAiGenerated: false
  },
  {
    id: 'sql-int-1',
    skill: 'SQL',
    difficulty: 'Intermediate',
    question: 'What is the primary difference between WHERE and HAVING clauses in SQL?',
    options: [
      'WHERE filters rows before aggregation; HAVING filters aggregated groups',
      'WHERE is only used with subqueries; HAVING is used with JOINs',
      'HAVING cannot use comparison operators',
      'WHERE is used exclusively for primary keys'
    ],
    correctOptionIndex: 0,
    explanation: 'WHERE filters individual records before GROUP BY aggregation, whereas HAVING filters aggregate results after grouping.',
    isAiGenerated: false
  },
  {
    id: 'sql-adv-1',
    skill: 'SQL',
    difficulty: 'Advanced',
    question: 'In database transaction isolation levels, which anomaly is allowed in READ COMMITTED that is prevented in REPEATABLE READ?',
    options: [
      'Non-repeatable reads (reading different values upon re-querying within the same transaction)',
      'Dirty reads (reading uncommitted changes from another transaction)',
      'Lost updates on serializable indexes',
      'Write skew in snapshot isolation'
    ],
    correctOptionIndex: 0,
    explanation: 'READ COMMITTED prevents dirty reads, but permits non-repeatable reads where re-executing a query sees commits from other transactions.',
    isAiGenerated: false
  },

  // 7. Data Structures and Algorithms
  {
    id: 'dsa-beg-1',
    skill: 'Data Structures and Algorithms',
    difficulty: 'Beginner',
    question: 'What is the average time complexity for accessing an element in an array by its index?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctOptionIndex: 0,
    explanation: 'Array elements are stored in contiguous memory locations, allowing instant O(1) indexed access.',
    isAiGenerated: false
  },
  {
    id: 'dsa-int-1',
    skill: 'Data Structures and Algorithms',
    difficulty: 'Intermediate',
    question: 'Which data structure is fundamentally used to implement Breadth-First Search (BFS) in a graph or tree?',
    options: ['Queue (FIFO)', 'Stack (LIFO)', 'Max Heap', 'Disjoint Set Union'],
    correctOptionIndex: 0,
    explanation: 'BFS explores nodes level by level using a First-In-First-Out (FIFO) queue.',
    isAiGenerated: false
  },
  {
    id: 'dsa-adv-1',
    skill: 'Data Structures and Algorithms',
    difficulty: 'Advanced',
    question: 'What is the amortized time complexity of finding a set representative in a Disjoint Set Union (DSU) using both path compression and union by rank?',
    options: ['O(α(n)) where α is the inverse Ackermann function', 'O(log n)', 'O(n)', 'O(1) strict worst-case'],
    correctOptionIndex: 0,
    explanation: 'DSU with union by rank and path compression achieves O(α(n)) amortized time per operation, which is effectively constant (<= 4 for all practical n).',
    isAiGenerated: false
  },

  // 8. REST APIs & Git
  {
    id: 'rest-beg-1',
    skill: 'REST APIs',
    difficulty: 'Beginner',
    question: 'Which HTTP method should be used to create a new resource in a RESTful API?',
    options: ['POST', 'GET', 'PUT', 'DELETE'],
    correctOptionIndex: 0,
    explanation: 'POST is conventionally used to submit data to be processed to a specified resource, creating a new entry.',
    isAiGenerated: false
  },
  {
    id: 'git-beg-1',
    skill: 'Git',
    difficulty: 'Beginner',
    question: 'Which Git command stages file changes for the upcoming commit?',
    options: ['git add', 'git push', 'git commit', 'git fetch'],
    correctOptionIndex: 0,
    explanation: '`git add <file>` adds modified files to the staging index area ready for commit.',
    isAiGenerated: false
  },
  {
    id: 'git-int-1',
    skill: 'Git',
    difficulty: 'Intermediate',
    question: 'What is the difference between `git merge` and `git rebase`?',
    options: [
      'Merge creates a merge commit preserving history branch shape; rebase reapplies commits on top of base for a linear history',
      'Rebase creates a remote pull request automatically; merge does not',
      'Merge deletes the source branch; rebase keeps it',
      'There is no difference in git log output'
    ],
    correctOptionIndex: 0,
    explanation: 'Git merge preserves the commit graph with a dedicated merge commit, while rebase rewrites commits sequentially onto the target branch tip.',
    isAiGenerated: false
  }
];

/**
 * Returns balanced fallback questions for a given skill and difficulty.
 */
export function getFallbackQuestions(skill: string, difficulty: SkillDifficulty, count: number = 10): QuestionServer[] {
  // First look for exact skill & difficulty matches
  let matching = QUESTION_BANK.filter(q => 
    q.skill.toLowerCase() === skill.toLowerCase() && q.difficulty === difficulty
  );

  // If not enough, pull from any difficulty for the same skill
  if (matching.length < count) {
    const sameSkillAnyDiff = QUESTION_BANK.filter(q => 
      q.skill.toLowerCase() === skill.toLowerCase() && !matching.includes(q)
    );
    matching = [...matching, ...sameSkillAnyDiff];
  }

  // If still not enough, generate synthetic standard questions tailored to the skill
  let index = matching.length + 1;
  while (matching.length < count) {
    matching.push({
      id: `${skill.toLowerCase().replace(/[^a-z0-9]/g, '')}-${difficulty.toLowerCase()}-${index}`,
      skill,
      difficulty,
      question: `In professional ${skill} development, which practice best ensures robust architecture and maintainability?`,
      options: [
        'Modular separation of concerns with clear interfaces and error boundaries',
        'Inlining all business logic into a single monolithic file without types',
        'Disabling validation layers to increase raw throughput',
        'Relying strictly on global mutable state across all functions'
      ],
      correctOptionIndex: 0,
      explanation: 'Modular design with clear boundaries and strong typing ensures scalable, testable, and maintainable software.',
      isAiGenerated: false
    });
    index++;
  }

  return matching.slice(0, count);
}
