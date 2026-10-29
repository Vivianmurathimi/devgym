// Starter content. Edit freely and run `npm run db:reset --workspace server` to reload.
// Adding a challenge = adding an object to this list.

export type SeedChallenge = {
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  level: number;
  prompt: string;
  functionName: string;
  params: string;
  tests: { args: unknown[]; expected: unknown }[];
  hints: string[];
  solution: string;
};

export const challenges: SeedChallenge[] = [
  {
    slug: "count-vowels",
    title: "Count the vowels",
    difficulty: "easy",
    topic: "strings",
    level: 1,
    prompt:
      "Write `countVowels(text)` that returns how many vowels (a, e, i, o, u) are in the string. Uppercase counts too.",
    functionName: "countVowels",
    params: "text",
    tests: [
      { args: ["hello"], expected: 2 },
      { args: ["DEVGYM"], expected: 1 },
      { args: ["rhythm"], expected: 0 },
      { args: [""], expected: 0 },
      { args: ["Aeiou AEIOU"], expected: 10 },
    ],
    hints: ["Convert the text to lowercase first.", "Loop over each character and check if it is in \"aeiou\"."],
    solution: `function countVowels(text) {
  let count = 0;
  for (const ch of text.toLowerCase()) {
    if ("aeiou".includes(ch)) count++;
  }
  return count;
}`,
  },
  {
    slug: "reverse-string",
    title: "Reverse a string",
    difficulty: "easy",
    topic: "strings",
    level: 1,
    prompt: "Write `reverseString(text)` that returns the text backwards.",
    functionName: "reverseString",
    params: "text",
    tests: [
      { args: ["abc"], expected: "cba" },
      { args: ["DevGym"], expected: "myGveD" },
      { args: [""], expected: "" },
      { args: ["a b"], expected: "b a" },
    ],
    hints: ["Strings can be turned into arrays with `.split(\"\")`.", "Arrays have a `.reverse()` method and a `.join()` method."],
    solution: `function reverseString(text) {
  return text.split("").reverse().join("");
}`,
  },
  {
    slug: "sum-array",
    title: "Sum of an array",
    difficulty: "easy",
    topic: "arrays",
    level: 1,
    prompt: "Write `sumArray(numbers)` that returns the sum of all numbers. An empty array sums to 0.",
    functionName: "sumArray",
    params: "numbers",
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[]], expected: 0 },
      { args: [[-5, 5, 10]], expected: 10 },
    ],
    hints: ["Start a variable at 0 and add each number to it.", "Advanced: try `.reduce()`."],
    solution: `function sumArray(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}`,
  },
  {
    slug: "max-number",
    title: "Largest number",
    difficulty: "easy",
    topic: "arrays",
    level: 1,
    prompt: "Write `maxNumber(numbers)` that returns the largest number. If the array is empty, return `null`.",
    functionName: "maxNumber",
    params: "numbers",
    tests: [
      { args: [[3, 9, 2]], expected: 9 },
      { args: [[-4, -1, -7]], expected: -1 },
      { args: [[]], expected: null },
      { args: [[5]], expected: 5 },
    ],
    hints: ["Handle the empty case first.", "Don't start your max at 0: what if all numbers are negative?"],
    solution: `function maxNumber(numbers) {
  if (numbers.length === 0) return null;
  let max = numbers[0];
  for (const n of numbers) if (n > max) max = n;
  return max;
}`,
  },
  {
    slug: "is-palindrome",
    title: "Palindrome check",
    difficulty: "easy",
    topic: "strings",
    level: 1,
    prompt:
      "Write `isPalindrome(text)` that returns `true` if the text reads the same backwards. Ignore case, spaces and punctuation.",
    functionName: "isPalindrome",
    params: "text",
    tests: [
      { args: ["racecar"], expected: true },
      { args: ["Never odd or even"], expected: true },
      { args: ["A man, a plan, a canal: Panama"], expected: true },
      { args: ["hello"], expected: false },
      { args: [""], expected: true },
    ],
    hints: ["First clean the string: lowercase it and keep only letters/numbers.", "A regex like /[^a-z0-9]/g can remove the rest."],
    solution: `function isPalindrome(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}`,
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "easy",
    topic: "loops",
    level: 1,
    prompt:
      "Write `fizzBuzz(n)` that returns an array of strings from 1 to n. Multiples of 3 become \"Fizz\", multiples of 5 \"Buzz\", multiples of both \"FizzBuzz\", other numbers become the number as a string.",
    functionName: "fizzBuzz",
    params: "n",
    tests: [
      { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { args: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] },
      { args: [0], expected: [] },
    ],
    hints: ["Check the 'both' case (divisible by 15) first.", "Use the % operator: `i % 3 === 0`."],
    solution: `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push("FizzBuzz");
    else if (i % 3 === 0) out.push("Fizz");
    else if (i % 5 === 0) out.push("Buzz");
    else out.push(String(i));
  }
  return out;
}`,
  },
  {
    slug: "count-words",
    title: "Count words",
    difficulty: "easy",
    topic: "strings",
    level: 1,
    prompt: "Write `countWords(text)` that returns the number of words. Words are separated by one or more spaces.",
    functionName: "countWords",
    params: "text",
    tests: [
      { args: ["hello world"], expected: 2 },
      { args: ["  lots   of   spaces  "], expected: 3 },
      { args: [""], expected: 0 },
      { args: ["one"], expected: 1 },
    ],
    hints: ["`.trim()` removes spaces at the ends.", "`.split(/\\s+/)` splits on any amount of whitespace."],
    solution: `function countWords(text) {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\\s+/).length;
}`,
  },
  {
    slug: "remove-duplicates",
    title: "Remove duplicates",
    difficulty: "easy",
    topic: "arrays",
    level: 2,
    prompt: "Write `removeDuplicates(items)` that returns a new array without duplicates, keeping the first occurrence order.",
    functionName: "removeDuplicates",
    params: "items",
    tests: [
      { args: [[1, 2, 2, 3, 1]], expected: [1, 2, 3] },
      { args: [["a", "b", "a"]], expected: ["a", "b"] },
      { args: [[]], expected: [] },
    ],
    hints: ["A `Set` only stores unique values.", "`[...new Set(items)]` turns it back into an array."],
    solution: `function removeDuplicates(items) {
  return [...new Set(items)];
}`,
  },
  {
    slug: "char-frequency",
    title: "Character frequency",
    difficulty: "medium",
    topic: "objects",
    level: 2,
    prompt:
      "Write `charFrequency(text)` that returns an object counting each character. Example: \"aab\" → { a: 2, b: 1 }.",
    functionName: "charFrequency",
    params: "text",
    tests: [
      { args: ["aab"], expected: { a: 2, b: 1 } },
      { args: [""], expected: {} },
      { args: ["hello"], expected: { h: 1, e: 1, l: 2, o: 1 } },
    ],
    hints: ["Start with an empty object `{}`.", "`counts[ch] = (counts[ch] ?? 0) + 1`"],
    solution: `function charFrequency(text) {
  const counts = {};
  for (const ch of text) counts[ch] = (counts[ch] ?? 0) + 1;
  return counts;
}`,
  },
  {
    slug: "capitalize-words",
    title: "Capitalize words",
    difficulty: "easy",
    topic: "strings",
    level: 2,
    prompt: "Write `capitalizeWords(text)` that makes the first letter of every word uppercase and the rest lowercase.",
    functionName: "capitalizeWords",
    params: "text",
    tests: [
      { args: ["hello world"], expected: "Hello World" },
      { args: ["dEVgYM is FUN"], expected: "Devgym Is Fun" },
      { args: [""], expected: "" },
    ],
    hints: ["Split into words, transform each, join back.", "`word[0].toUpperCase() + word.slice(1).toLowerCase()`"],
    solution: `function capitalizeWords(text) {
  return text
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}`,
  },
  {
    slug: "group-by-length",
    title: "Group words by length",
    difficulty: "medium",
    topic: "objects",
    level: 2,
    prompt:
      "Write `groupByLength(words)` that returns an object where each key is a word length and the value is the list of words with that length, in order.",
    functionName: "groupByLength",
    params: "words",
    tests: [
      { args: [["hi", "cat", "yo", "dog"]], expected: { 2: ["hi", "yo"], 3: ["cat", "dog"] } },
      { args: [[]], expected: {} },
    ],
    hints: ["Object keys are strings, so `groups[3]` and `groups['3']` are the same.", "Create the array if it doesn't exist yet, then push."],
    solution: `function groupByLength(words) {
  const groups = {};
  for (const w of words) {
    (groups[w.length] ??= []).push(w);
  }
  return groups;
}`,
  },
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "medium",
    topic: "hash maps",
    level: 2,
    prompt:
      "Write `twoSum(nums, target)` that returns the indices `[i, j]` (i < j) of the two numbers that add up to target. Assume exactly one answer exists. Bonus: do it in one pass with a Map.",
    functionName: "twoSum",
    params: "nums, target",
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
    ],
    hints: ["Brute force: two nested loops. That's fine to start!", "Faster: store each number's index in a Map, and look up `target - num`."],
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  },
  {
    slug: "chunk-array",
    title: "Chunk an array",
    difficulty: "medium",
    topic: "arrays",
    level: 2,
    prompt: "Write `chunk(items, size)` that splits an array into groups of `size`. The last group may be smaller.",
    functionName: "chunk",
    params: "items, size",
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]] },
      { args: [[1, 2, 3], 3], expected: [[1, 2, 3]] },
      { args: [[], 2], expected: [] },
    ],
    hints: ["Loop with `i += size`.", "`items.slice(i, i + size)` gives one chunk."],
    solution: `function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}`,
  },
  {
    slug: "flatten-deep",
    title: "Flatten nested arrays",
    difficulty: "hard",
    topic: "recursion",
    level: 2,
    prompt: "Write `flatten(items)` that flattens arrays nested to any depth, without using `.flat()`.",
    functionName: "flatten",
    params: "items",
    tests: [
      { args: [[1, [2, [3, [4]]], 5]], expected: [1, 2, 3, 4, 5] },
      { args: [[[], [[]]]], expected: [] },
      { args: [[1, 2]], expected: [1, 2] },
    ],
    hints: ["Recursion: if an item is an array, flatten it too.", "`Array.isArray(x)` tells you if something is an array."],
    solution: `function flatten(items) {
  const out = [];
  for (const x of items) {
    if (Array.isArray(x)) out.push(...flatten(x));
    else out.push(x);
  }
  return out;
}`,
  },
];

// ---------- Computer science exam ----------
// Generic starter content: replace topics/cards with your actual exam syllabus.

export const subjects: {
  name: string;
  topics: string[];
  cards: [string, string][];
  questions: [string, string][];
}[] = [
  {
    name: "Algorithms & Data Structures",
    topics: ["Big-O notation", "Sorting algorithms", "Searching & binary search", "Stacks & queues", "Linked lists", "Trees & BST", "Graphs (BFS/DFS)", "Hash tables", "Dynamic programming"],
    cards: [
      ["Time complexity of binary search?", "O(log n): the search space halves each step. Requires sorted input."],
      ["Average and worst case of quicksort?", "Average O(n log n), worst O(n²) (bad pivots, e.g. already sorted input with first-element pivot)."],
      ["Difference between BFS and DFS?", "BFS explores level by level using a queue (finds shortest path in unweighted graphs). DFS goes deep first using a stack/recursion."],
      ["What makes merge sort stable and what is its space cost?", "Equal elements keep their order when merging; it needs O(n) extra space."],
      ["Average lookup time in a hash table?", "O(1) average; O(n) worst case when many keys collide."],
    ],
    questions: [
      ["Explain dynamic programming and give an example.", "DP solves problems with overlapping subproblems and optimal substructure by storing results of subproblems (memoization top-down or tabulation bottom-up). Example: Fibonacci in O(n) instead of O(2ⁿ), or the knapsack problem."],
      ["Compare arrays and linked lists.", "Arrays: contiguous memory, O(1) index access, costly insert/delete in the middle (O(n)). Linked lists: nodes with pointers, O(n) access, O(1) insert/delete when you have the node, extra memory per node, poorer cache locality."],
    ],
  },
  {
    name: "Databases",
    topics: ["Relational model", "SQL queries & joins", "Normalization (1NF–BCNF)", "Indexes", "Transactions & ACID", "Concurrency control", "ER modelling", "NoSQL basics"],
    cards: [
      ["What does ACID stand for?", "Atomicity, Consistency, Isolation, Durability."],
      ["What is a foreign key?", "A column that references the primary key of another table, enforcing referential integrity."],
      ["INNER JOIN vs LEFT JOIN?", "INNER returns only matching rows; LEFT returns all rows from the left table plus matches (NULLs where none)."],
      ["What is 3NF?", "2NF plus no transitive dependencies: non-key attributes depend only on the key."],
      ["Why can indexes slow down writes?", "Every INSERT/UPDATE/DELETE must also update the index structures (e.g. B-trees)."],
    ],
    questions: [
      ["Explain normalization and why it is used.", "Organising tables to reduce redundancy and update anomalies by splitting data based on functional dependencies (1NF atomic values, 2NF no partial dependency, 3NF no transitive dependency, BCNF every determinant is a key). Trade-off: more joins."],
      ["What are transaction isolation levels?", "Read uncommitted, read committed, repeatable read, serializable. Higher levels prevent more anomalies (dirty reads, non-repeatable reads, phantoms) at the cost of concurrency."],
    ],
  },
  {
    name: "Operating Systems",
    topics: ["Processes vs threads", "CPU scheduling", "Synchronization & deadlock", "Memory management & paging", "Virtual memory", "File systems", "I/O"],
    cards: [
      ["Process vs thread?", "A process has its own address space; threads share the address space of their process but have their own stack and registers."],
      ["Four conditions for deadlock (Coffman)?", "Mutual exclusion, hold and wait, no preemption, circular wait."],
      ["What is a page fault?", "Access to a page not in physical memory; the OS loads it from disk and updates the page table."],
      ["What does a mutex guarantee?", "Only one thread at a time enters the critical section."],
    ],
    questions: [
      ["Compare scheduling algorithms FCFS, SJF and Round Robin.", "FCFS: simple, convoy effect. SJF: optimal average waiting time but needs burst estimates and can starve long jobs. Round Robin: time quantum, fair and responsive, overhead from context switches; performance depends on quantum size."],
    ],
  },
  {
    name: "Computer Networks",
    topics: ["OSI & TCP/IP models", "IP addressing & subnetting", "TCP vs UDP", "Routing", "DNS", "HTTP/HTTPS", "Network security basics"],
    cards: [
      ["TCP vs UDP?", "TCP: connection-oriented, reliable, ordered, flow/congestion control. UDP: connectionless, no guarantees, lower overhead (video, DNS, games)."],
      ["What does DNS do?", "Translates domain names into IP addresses."],
      ["Steps of the TCP three-way handshake?", "SYN → SYN-ACK → ACK."],
      ["What layer is IP on (OSI)?", "Layer 3, the network layer."],
    ],
    questions: [
      ["What happens when you type a URL in the browser and press Enter?", "DNS resolution → TCP connection (handshake) → TLS handshake for HTTPS → HTTP request → server response → browser parses HTML, fetches CSS/JS/images, builds DOM/CSSOM, renders the page."],
    ],
  },
  {
    name: "Software Engineering",
    topics: ["SDLC models (Waterfall, Agile)", "Requirements engineering", "UML diagrams", "Design patterns", "Testing levels", "Version control"],
    cards: [
      ["Unit vs integration test?", "Unit tests check one piece in isolation; integration tests check pieces working together."],
      ["What is the Singleton pattern?", "Ensures a class has only one instance and provides global access to it."],
      ["Functional vs non-functional requirement?", "Functional: what the system does. Non-functional: qualities like performance, security, usability."],
    ],
    questions: [
      ["Compare Waterfall and Agile.", "Waterfall: sequential phases, fixed requirements, good for stable well-understood projects, late feedback. Agile: iterative sprints, evolving requirements, continuous feedback and delivery, needs active customer involvement."],
    ],
  },
];

// ---------- Thesis ----------

export const chapters = ["Introduction", "Literature review", "Requirements & analysis", "Design", "Implementation", "Testing & evaluation", "Conclusion"];

export const defenseCards: [string, string][] = [
  ["Summarise your thesis in 2 minutes.", "Problem → why it matters → what you built/did → main result → limitation → future work."],
  ["Why did you choose this topic?", "(Write your personal + technical motivation here.)"],
  ["What are the main limitations of your work?", "(List 2–3 honest limitations and how you'd address them.)"],
  ["Why did you choose this technology stack?", "(Compare with 1–2 alternatives and give reasons.)"],
  ["How did you evaluate / test your solution?", "(Methods, metrics, results.)"],
  ["What would you do differently or next?", "(Future work.)"],
];
