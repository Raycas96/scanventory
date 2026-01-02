import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      issuePrefixes: ["SCAN-"],
    },
  },
  formatter: "@commitlint/format",
  rules: {
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "wip",
        "release",
      ],
    ],
    // Allow uppercase in subject for issue references like "SCAN-0000"
    // This allows patterns like: "feat: SCAN-0000 add feature"
    // Disable subject-case rule to allow uppercase issue references
    "subject-case": [RuleConfigSeverity.Disabled],
  },
};

export default Configuration;
