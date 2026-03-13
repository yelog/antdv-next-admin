<template>
  <div
    class="pro-code-editor"
    :class="{
      'is-disabled': disabled,
      'is-readonly': readonly,
      'is-dark': computedTheme === 'dark',
    }"
  >
    <div v-if="$slots.toolbar || showDefaultToolbar" class="editor-toolbar">
      <slot name="toolbar">
        <a-space v-if="showDefaultToolbar" size="small">
          <a-select
            v-if="showLanguageSelect"
            :value="language"
            size="small"
            style="width: 120px"
            :options="languageOptions"
            @change="handleLanguageChange"
          />
          <a-button
            v-if="language === 'json' && !readonly"
            size="small"
            @click="formatJson"
          >
            {{ $t("codeEditor.format") }}
          </a-button>
          <a-button
            v-if="language === 'json' && !readonly"
            size="small"
            @click="minifyJson"
          >
            {{ $t("codeEditor.minify") }}
          </a-button>
          <a-button size="small" @click="copyToClipboard">
            {{ $t("codeEditor.copy") }}
          </a-button>
        </a-space>
      </slot>
    </div>
    <div class="editor-container" :style="containerStyle">
      <codemirror
        :model-value="modelValue"
        :style="editorStyle"
        :placeholder="placeholder"
        :disabled="disabled"
        :extensions="extensions"
        @update="handleUpdate"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Codemirror } from "vue-codemirror";
import type { Extension } from "@codemirror/state";
import {
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldGutter,
} from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { yaml } from "@codemirror/lang-yaml";
import { xml } from "@codemirror/lang-xml";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { linter } from "@codemirror/lint";

import { message } from "antdv-next";
import { computed, ref, watch, type CSSProperties, type PropType } from "vue";

import { useThemeStore } from "@/stores/theme";

defineOptions({
  name: "ProCodeEditor",
});

export type SupportedLanguage =
  | "json"
  | "javascript"
  | "typescript"
  | "html"
  | "css"
  | "markdown"
  | "sql"
  | "yaml"
  | "xml"
  | "python"
  | "java"
  | "php"
  | "rust"
  | "go";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  language: {
    type: String as PropType<SupportedLanguage>,
    default: "json",
  },
  theme: {
    type: String as PropType<"light" | "dark" | "auto">,
    default: "auto",
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  height: {
    type: [Number, String] as PropType<number | "auto">,
    default: 300,
  },
  placeholder: {
    type: String,
    default: "",
  },
  lineNumbers: {
    type: Boolean,
    default: true,
  },
  foldGutter: {
    type: Boolean,
    default: true,
  },
  showToolbar: {
    type: Boolean,
    default: false,
  },
  showLanguageSelect: {
    type: Boolean,
    default: false,
  },
  formatOnBlur: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
  (e: "focus"): void;
  (e: "blur"): void;
  (e: "languageChange", language: SupportedLanguage): void;
}>();

const themeStore = useThemeStore();
const emitLanguage = ref<SupportedLanguage>(props.language);

const languageOptions: Array<{ label: string; value: SupportedLanguage }> = [
  { label: "JSON", value: "json" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Markdown", value: "markdown" },
  { label: "SQL", value: "sql" },
  { label: "YAML", value: "yaml" },
  { label: "XML", value: "xml" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "PHP", value: "php" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
];

const computedTheme = computed<"light" | "dark">(() => {
  if (props.theme === "auto") {
    return themeStore.isDark ? "dark" : "light";
  }
  return props.theme;
});

const showDefaultToolbar = computed(() => {
  return (
    props.showToolbar || props.showLanguageSelect || props.language === "json"
  );
});

const containerStyle = computed<CSSProperties>(() => {
  if (props.height === "auto") {
    return {
      height: "auto",
      minHeight: "100px",
    };
  }
  return {
    height:
      typeof props.height === "number" ? `${props.height}px` : props.height,
  };
});

const editorStyle = computed<CSSProperties>(() => ({
  height: "100%",
  fontSize: "13px",
}));

function getLanguageExtension(lang: SupportedLanguage) {
  switch (lang) {
    case "json":
      return json();
    case "javascript":
      return javascript();
    case "typescript":
      return javascript({ typescript: true });
    case "html":
      return html();
    case "css":
      return css();
    case "markdown":
      return markdown();
    case "sql":
      return sql();
    case "yaml":
      return yaml();
    case "xml":
      return xml();
    case "python":
      return python();
    case "java":
      return java();
    case "php":
      return php();
    case "rust":
      return rust();
    case "go":
      return go();
    default:
      return json();
  }
}

const baseExtensions = computed<Extension[]>(() => {
  const ext: Extension[] = [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab,
    ]),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
  ];

  if (props.lineNumbers) {
    ext.push(lineNumbers());
    ext.push(highlightActiveLineGutter());
  }

  if (props.foldGutter) {
    ext.push(foldGutter());
  }

  if (computedTheme.value === "dark") {
    ext.push(oneDark);
  }

  ext.push(getLanguageExtension(emitLanguage.value));

  if (emitLanguage.value === "json") {
    ext.push(linter(jsonParseLinter()));
  }

  return ext;
});

const extensions = computed(() => baseExtensions.value);

function handleUpdate(viewUpdate: {
  state: { doc: { toString: () => string } };
}) {
  if (props.readonly || props.disabled) return;
  const value = viewUpdate.state.doc.toString();
  emit("update:modelValue", value);
  emit("change", value);
}

function handleFocus() {
  emit("focus");
}

function handleBlur() {
  if (props.formatOnBlur && emitLanguage.value === "json" && props.modelValue) {
    try {
      const parsed = JSON.parse(props.modelValue);
      const formatted = JSON.stringify(parsed, null, 2);
      emit("update:modelValue", formatted);
      emit("change", formatted);
    } catch {
      // Invalid JSON, do nothing
    }
  }
  emit("blur");
}

function handleLanguageChange(lang: SupportedLanguage) {
  emitLanguage.value = lang;
  emit("languageChange", lang);
}

function formatJson() {
  if (emitLanguage.value !== "json" || !props.modelValue) return;
  try {
    const parsed = JSON.parse(props.modelValue);
    const formatted = JSON.stringify(parsed, null, 2);
    emit("update:modelValue", formatted);
    emit("change", formatted);
    message.success("格式化成功");
  } catch {
    message.error("JSON 格式错误");
  }
}

function minifyJson() {
  if (emitLanguage.value !== "json" || !props.modelValue) return;
  try {
    const parsed = JSON.parse(props.modelValue);
    const minified = JSON.stringify(parsed);
    emit("update:modelValue", minified);
    emit("change", minified);
    message.success("压缩成功");
  } catch {
    message.error("JSON 格式错误");
  }
}

async function copyToClipboard() {
  if (!props.modelValue) return;
  try {
    await navigator.clipboard.writeText(props.modelValue);
    message.success("复制成功");
  } catch {
    message.error("复制失败");
  }
}

watch(
  () => props.language,
  (newLang) => {
    emitLanguage.value = newLang;
  },
);
</script>

<style scoped lang="scss">
.pro-code-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-bg-container);

  &.is-dark {
    background: #1e1e1e;
    border-color: #3c3c3c;
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border-secondary);
  background: var(--color-bg-layout);

  .is-dark & {
    background: #252526;
    border-bottom-color: #3c3c3c;
  }
}

.editor-container {
  overflow: auto;

  :deep(.cm-editor) {
    height: 100%;
    outline: none;
  }

  :deep(.cm-scroller) {
    font-family: "Monaco", "Menlo", "Consolas", monospace;
  }

  :deep(.cm-content) {
    padding: 8px 0;
  }

  :deep(.cm-line) {
    padding: 0 8px;
  }

  :deep(.cm-placeholder) {
    color: var(--color-text-quaternary);
    font-style: italic;
  }
}

.is-readonly {
  .editor-container {
    :deep(.cm-content) {
      cursor: default;
    }

    :deep(.cm-cursor) {
      display: none;
    }
  }
}
</style>
