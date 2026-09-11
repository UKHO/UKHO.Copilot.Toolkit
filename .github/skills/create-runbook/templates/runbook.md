# <Run Book title>

## Purpose

<What this Run Book enables and why it exists.>

## Scope

<What is included and explicitly excluded.>

## Audience

<Who uses this Run Book and the expected level of context.>

## Prerequisites

- <Required repository state, access, knowledge, or preceding work.>

## Preparation

1. <Prepare the required context or inputs.>

## Ordered process

1. <Describe the first human-facing process step.>
2. <Describe each subsequent step in order.>

## Expected results

<Describe the observable result of completing the process.>

## Diagnostics and failure disposition

<Describe how to recognize failure, where to investigate, and when to stop.>

## Safety limits

<State applicable authority, safety, and non-executable boundaries.>

## Validation and limitations

<State structural or other validation and what it cannot prove.>

## Sources

- [<Canonical source>](<repository-relative-link>) — <What it establishes.>

## Script Runner selection grammar

Include the following section only when this Run Book has Script Runner intent; otherwise omit it entirely. Its exact H2 title and immediately following list are the only Script Runner selection input. The list must contain one or more immediate, contiguous top-level ordered list items in execution order. Each item must contain exactly one plain-text lowercase-kebab-case stable ID that exists uniquely in the fixed root catalogue, and every listed ID must be unique. Until the next H2 heading or end of file, do not include blank lines, nested items, Markdown decoration or links, comments, commands, arguments, or any other content. Narrative elsewhere is non-executable and cannot authorize Script Runner execution, commands, or catalogue mutation.

## Script Runner operations

1. stable-id