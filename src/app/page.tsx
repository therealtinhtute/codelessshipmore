import Link from "next/link";
import {
  IconAdjustments,
  IconArrowRight,
  IconBraces,
  IconClipboard,
  IconDatabase,
  IconDeviceFloppy,
  IconFileCode,
  IconKey,
  IconBrandGithub,
  IconSparkles,
  IconTerminal2,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "JSON Viewer",
    description:
      "Format and explore JSON data with interactive viewing capabilities including pretty print and tree view modes",
    href: "/json-viewer",
    icon: IconBraces,
  },
  {
    title: "SQL Placeholder",
    description:
      "Fill SQL query placeholders with parameter values from logs, converting JDBC-style ? placeholders to actual values",
    href: "/sql-placeholder",
    icon: IconDatabase,
  },
  {
    title: "Properties Converter",
    description:
      "Convert between YAML, Properties, Spring @Value annotations, and Environment variables formats",
    href: "/properties-converter",
    icon: IconAdjustments,
  },
  {
    title: "Record to Protobuf",
    description:
      "Convert Java record classes to Protocol Buffer definitions with multiple conversion options",
    href: "/record-protobuf",
    icon: IconFileCode,
  },
  {
    title: "TOTP Generator",
    description:
      "Generate the current 6-digit 2FA code from a raw Base32 secret",
    href: "/totp-generator",
    icon: IconKey,
  },
  {
    title: "GitHub Directory",
    description:
      "Download a single folder from a GitHub repo as a ZIP without cloning the whole tree",
    href: "/github-directory",
    icon: IconBrandGithub,
  },
];

const platformHighlights = [
  {
    title: "Focused tool surfaces",
    description:
      "Each utility opens straight into the working interface, with dense controls and calm spacing.",
    icon: IconTerminal2,
  },
  {
    title: "Clipboard-first flow",
    description:
      "Paste, transform, copy, and keep moving without routing data through a backend.",
    icon: IconClipboard,
  },
  {
    title: "Local output handling",
    description:
      "Generated JSON, ENV, SQL, TOTP, and Protobuf results stay in your browser session.",
    icon: IconDeviceFloppy,
  },
  {
    title: "AI assistance where useful",
    description:
      "Prompt enhancement and provider settings sit beside the deterministic developer tools.",
    icon: IconSparkles,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <Badge variant="default" className="mb-6 text-caption uppercase">
            Developer utilities
          </Badge>
          <h1 className="max-w-3xl text-display-hero">CodelessShipMore</h1>
          <p className="mt-6 max-w-2xl text-body">
            A warm, focused workspace for JSON inspection, SQL parameter
            filling, properties conversion, Protobuf generation, TOTP codes, and
            prompt work.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="default" asChild>
              <Link href="/json-viewer">
                Get Started <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">Configure AI</Link>
            </Button>
          </div>
        </div>

        <div className="border border-border bg-muted p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/40" />
            <span className="size-2.5 rounded-full bg-foreground/60" />
            <span className="ml-auto font-mono text-muted-foreground">
              transform.ts
            </span>
          </div>
          <pre className="code-pane overflow-hidden">
            <code>{`const tools = [
  "json-viewer",
  "sql-placeholder",
  "properties-converter",
  "record-protobuf",
  "totp-generator",
]

shipMore(tools, { storage: "local" })`}</code>
          </pre>
          <div className="mt-5 rounded-md border border-border bg-card p-4">
            <div className="text-caption uppercase text-muted-foreground">
              output
            </div>
            <p className="mt-2 text-caption text-body">
              deterministic utilities, AI profile management, and browser-local
              workflows in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <feature.icon className="h-6 w-6 text-primary" />
                {feature.title}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full justify-between"
              >
                <Link href={feature.href}>
                  Open tool <IconArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-lg bg-primary p-10 text-primary-foreground md:p-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div>
            <h2 className="text-display-section text-primary-foreground">
              Built for repeated technical chores.
            </h2>
            <p className="mt-4 max-w-xl text-caption text-primary-foreground/85">
              The interface keeps the controls visible, the output inspectable,
              and the visual noise low.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {platformHighlights.map((highlight) => (
              <div key={highlight.title} className="rounded-md bg-white/12 p-5">
                <highlight.icon className="mb-4 h-5 w-5" />
                <h3 className="text-base font-semibold text-primary-foreground">
                  {highlight.title}
                </h3>
                <p className="mt-2 text-caption text-primary-foreground/80">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
