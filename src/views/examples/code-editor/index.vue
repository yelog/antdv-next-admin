<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t("codeEditor.title") }}</h2>
      <p class="mb-lg text-secondary">
        {{ $t("codeEditor.description") }}
      </p>

      <a-divider orientation="left">{{
        $t("codeEditor.jsonEditor")
      }}</a-divider>
      <div class="example-section">
        <ProCodeEditor
          v-model="jsonContent"
          language="json"
          :height="300"
          :show-toolbar="true"
        />
      </div>

      <a-divider orientation="left">{{ $t("codeEditor.jsEditor") }}</a-divider>
      <div class="example-section">
        <ProCodeEditor
          v-model="jsContent"
          language="javascript"
          :height="250"
        />
      </div>

      <a-divider orientation="left">{{
        $t("codeEditor.multiLanguage")
      }}</a-divider>
      <div class="example-section">
        <a-space direction="vertical" style="width: 100%">
          <a-select
            v-model:value="selectedLanguage"
            style="width: 200px"
            :options="languageOptions"
          />
          <ProCodeEditor
            v-model="multiLangContent"
            :language="selectedLanguage"
            :height="200"
            :show-language-select="true"
            @language-change="handleLanguageChange"
          />
        </a-space>
      </div>

      <a-divider orientation="left">{{
        $t("codeEditor.readonlyMode")
      }}</a-divider>
      <div class="example-section">
        <ProCodeEditor
          v-model="readonlyContent"
          language="typescript"
          :height="200"
          :readonly="true"
        />
      </div>

      <a-divider orientation="left">{{ $t("codeEditor.darkTheme") }}</a-divider>
      <div class="example-section">
        <a-space direction="vertical" style="width: 100%">
          <a-radio-group v-model:value="editorTheme">
            <a-radio value="auto">{{ $t("codeEditor.themeAuto") }}</a-radio>
            <a-radio value="light">{{ $t("codeEditor.themeLight") }}</a-radio>
            <a-radio value="dark">{{ $t("codeEditor.themeDark") }}</a-radio>
          </a-radio-group>
          <ProCodeEditor
            v-model="darkContent"
            language="python"
            :height="200"
            :theme="editorTheme"
          />
        </a-space>
      </div>

      <a-divider orientation="left">{{
        $t("codeEditor.autoHeight")
      }}</a-divider>
      <div class="example-section">
        <ProCodeEditor
          v-model="autoHeightContent"
          language="markdown"
          height="auto"
          :line-numbers="false"
        />
      </div>

      <a-divider orientation="left">{{ $t("common.preview") }}</a-divider>
      <a-card :title="$t('codeEditor.outputPreview')" size="small">
        <pre class="output-preview">{{ jsonContent }}</pre>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { SupportedLanguage } from "@/components/Pro/ProCodeEditor/index.vue";

import ProCodeEditor from "@/components/Pro/ProCodeEditor/index.vue";

const jsonContent = ref(`{
  "name": "antdv-next-admin",
  "version": "1.0.0",
  "description": "A Vue 3 admin scaffold",
  "dependencies": {
    "vue": "^3.4.0",
    "antdv-next": "^1.1.3",
    "pinia": "^2.1.7"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`);

const jsContent = ref(`// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);

// Arrow function example
const double = (x) => x * 2;
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(double);
console.log(doubled);`);

const readonlyContent = ref(`// TypeScript Interface Example
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`);

const darkContent = ref(`# Python Example
from typing import List, Optional

class User:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def greet(self) -> str:
        return f"Hello, I'm {self.name}!"

def process_users(users: List[User]) -> List[str]:
    return [user.greet() for user in users if user.age >= 18]`);

const autoHeightContent = ref(`# Markdown Example

## Features

- **Lightweight**: Only ~100KB
- **Fast**: Built on CodeMirror 6
- **Extensible**: Support 14+ languages

## Code Block

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| Syntax Highlighting | ✅ |
| Line Numbers | ✅ |
| Code Folding | ✅ |
`);

const selectedLanguage = ref<SupportedLanguage>("javascript");
const multiLangContent = ref(`// Select a language from the dropdown above`);

const editorTheme = ref<"auto" | "light" | "dark">("auto");

const languageOptions = [
  { label: "JSON", value: "json" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Markdown", value: "markdown" },
  { label: "SQL", value: "sql" },
  { label: "YAML", value: "yaml" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
];

const languageExamples: Record<SupportedLanguage, string> = {
  json: '{\n  "key": "value",\n  "array": [1, 2, 3]\n}',
  javascript: "// JavaScript code\nconst hello = 'world';\nconsole.log(hello);",
  typescript:
    "// TypeScript code\ninterface Config {\n  apiUrl: string;\n}\nconst config: Config = { apiUrl: '/api' };",
  html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>",
  css: "/* CSS Example */\n.container {\n  display: flex;\n  gap: 16px;\n  padding: 20px;\n}",
  markdown: "# Heading\\n\\nParagraph text here.",
  sql: "-- SQL Example\\nSELECT * FROM users WHERE age > 18;",
  yaml: "name: example\\nversion: 1.0\\nenvironment: development",
  xml: '<?xml version="1.0"?>\\n<root>\\n  <item>value</item>\\n</root>',
  python: "# Python Example\\ndef greet(name):\\n    return f'Hello, {name}!'",
  java: "// Java Example\\npublic class Main {\\n    public static void main(String[] args) {\\n    }\\n}",
  php: "<?php\\n// PHP Example\\necho 'Hello World';",
  rust: '// Rust Example\\nfn main() {\\n    println!("Hello, world!");\\n}',
  go: '// Go Example\\npackage main\\n\\nfunc main() {\\n    println("Hello")\\n}',
};

function handleLanguageChange(lang: SupportedLanguage) {
  selectedLanguage.value = lang;
  multiLangContent.value = languageExamples[lang] || "";
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.card {
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.mb-lg {
  margin-bottom: 24px;
}

.text-secondary {
  color: var(--color-text-secondary);
}

.example-section {
  margin-bottom: 16px;
}

.output-preview {
  background: var(--color-bg-layout);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

:deep(.ant-divider) {
  margin: 24px 0;
}
</style>
