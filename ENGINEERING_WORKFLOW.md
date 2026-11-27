# Interactive Engineering Workflow

## Workflow Execution Rules

Follow the instructions below as an interactive, step-by-step engineering workflow.

### 1. Workflow initialization

- Save the complete content of these instructions into a separate file named `ENGINEERING_WORKFLOW.md` in the project root directory.
- Create a separate execution log named `ENGINEERING_WORKFLOW_LOG.md`.
- Preserve the original workflow instructions without modifying, shortening, or removing them.
- Treat each block below as an independent workflow step.
- Execute the blocks sequentially, in the specified order.
- Do not execute multiple blocks simultaneously.

### 2. Interactive execution

For each workflow block:

1. Present the current block, its objective, and its expected outcome.
2. Review the relevant project context.
3. Ask me any clarification questions required to complete the current block.
4. Wait for my answers before proceeding if clarification is required.
5. Present your proposed approach and planned changes.
6. Request my explicit approval before implementing any changes.
7. Execute the approved approach.
8. Present the results for my review.
9. Request my explicit approval of the completed block.
10. Proceed to the next block only after receiving my approval.

Do not assume that silence, a clarification, or an unrelated response constitutes approval.

### 3. Approval and feedback

At the end of each block, provide the following options:

- **Approve** — accept the results and proceed to the next block.
- **Request changes** — revise the current block based on my feedback.
- **Provide more details** — explain the current results in greater detail.
- **Skip** — skip the current block with my explicit permission.
- **Pause** — stop workflow execution and preserve the current progress.

If changes are requested, repeat the review and approval process for the current block.

Do not treat a block as successfully completed until I explicitly approve its results.

### 4. Execution logging

After each successfully completed and approved block, append a short summary to `ENGINEERING_WORKFLOW_LOG.md`.

Each log entry must contain:

- Block number and title.
- Completion date and time.
- Execution status.
- Short summary of the completed work.
- Key decisions and their rationale.
- Files created or modified.
- Skills used during execution.
- Validation and test results, where applicable.
- Engineering insights discovered, if applicable.
- User approval status.
- Next workflow block.

Keep log entries concise and factual.

Never overwrite previous log entries. Always preserve the existing execution history.

### 5. Workflow progress and recovery

Maintain the execution status of each block:

- `PENDING`
- `IN_PROGRESS`
- `AWAITING_CLARIFICATION`
- `AWAITING_APPROVAL`
- `CHANGES_REQUESTED`
- `COMPLETED`
- `SKIPPED`
- `BLOCKED`

When resuming an interrupted session:

- Read `ENGINEERING_WORKFLOW.md`.
- Read `ENGINEERING_WORKFLOW_LOG.md`.
- Identify the last successfully completed and approved block.
- Identify any unfinished or blocked work.
- Present the current workflow status.
- Continue from the appropriate block after my confirmation.

Do not repeat previously completed and approved blocks unless I explicitly request it.

### 6. Execution integrity

- Do not invent facts about the codebase.
- Do not claim to have read files, visited websites, used skills, or executed tests unless you have actually done so.
- Clearly distinguish verified information from assumptions.
- Report any limitations, missing permissions, unavailable resources, or failed operations.
- Do not silently modify previously approved decisions.
- Do not modify files outside the approved scope.
- If an instruction depends on a document, screenshot, slide, URL, or other resource that I have not yet provided, ask me to provide it.
- Treat statements and answers included in subsequent blocks as workflow inputs, not as authorization to skip the approval process.

---

# Workflow Blocks

## Block 01 — Project Overview and Codebase Familiarization

**Request to describe the project (codebase familiarization):**

Tell me what is here and how everything fits together. Explain how this project is structured and how it works.

---

## Block 02 — CLAUDE.md File Structure

**Request for the CLAUDE.md file structure:**

Propose a structure for our CLAUDE.md files. I want every folder and every module of our project, of which there are four, to have a CLAUDE.md file, and I want us to make sure that we link to the documentation we already have.

Our existing documentation includes README files. Then, each of these projects will have a Docs folder, a Specs folder, and an Insights file. All these directories need to be included.

Follow the recommendations I have shared with you.

---

## Block 03 — Migration Protection Rule

**Request to explain the "do not touch migrations" rule:**

Can you explain in more detail why this is necessary?

---

## Block 04 — Engineering Insights Skill Creation

**Creating the Engineering Insights skill:**

I want to create a skill called Engineering Insights. It should be triggered during any session whenever the agent discovers something interesting, according to the categories I will provide, and it must then record these insights in the file corresponding to the module it is working on.

Use the recommendations I will show you on the slide to implement this in a better way.

Also, read the research I will share with you, visit those websites, and propose the best possible approach for what should be included in this particular skill.

---

## Block 05 — Engineering Insights Reading and Writing Rules

**Clarification regarding reading and recording insights:**

Before starting the work in a chat, once the user has provided their input, entered their prompt, and asked a question, the agent must read the insights related to the specific module where development will take place or the module being discussed.

Also, at the end of the session, insights must be recorded, but they must contain something substantial.

If the agent did not discover anything substantial during its work beyond what has already been documented, there is no need to write anything.

Before recording an insight, the agent must read the existing insights. The particular insight may already be there, in which case it should not be recorded again.

---

## Block 06 — Verification of Source Usage

**Verification of whether the sources were actually used:**

Tell us how you used the articles I provided. What content did you take from them? Did you look at them at all? Did you actually visit those articles? Did you look at the skill examples they contained?

---

## Block 07 — Actual Research and Source Processing

**Requirement to actually process the sources:**

No, I did not visit those websites or open a single URL. All I actually used was my own data.

I want you to go through all those websites, collect the data, gather the skill examples again, and use them for our skill.

---

## Block 08 — Automatic Insights Recording

**Answer to the question about recording insights in automatic mode:**

In automatic mode, the skill must read the file, review what has already been recorded there, and then add its own comments.

---

## Block 09 — Existing Insights Protection

**Requirement not to overwrite existing content:**

Make sure that the skill does not overwrite anything that already exists in the document and does not erase any existing content.

---

## Block 10 — Cost Feature Specification and Implementation Plan

**Specification and implementation plan for the Cost feature (execution costs):**

I want you to create a specification and a plan describing how we will implement the following feature.

It should display the cost in the pull request list.

We need to cover three screens from the design.

First, there will be the Pull Requests page, where there should be a separate Cost column.

Second, it should be displayed for the agent reviewer runs themselves. You can look at the screenshots I shared with you. Somewhere near the time when the agent reviewer was launched, its cost should also be displayed.

Third, we have the Agent Run General Reviewer, the agent run itself in the sidebar, where Duration, Tokens, and Findings are displayed. There should also be a Cost column.

Ask me questions if anything is unclear.

---

## Block 11 — Cost Feature Clarifications

**Answers to clarification questions regarding the Cost feature:**

What exactly should be displayed as the Pull Request Cost? The latest review, I think.

Where should the execution cost come from? Store the execution cost in USD in a new column, rather than deriving the price from tokens.

---

## Block 12 — Planned UI Components Review

**Request to show the planned UI components:**

Show me exactly which UI components you are planning to add and where.

At this stage, it is important for us to know that everything will be implemented exactly as we planned, so that we do not have to redo it later.

---

## Block 13 — Test Coverage and Skill Usage Review

**Request regarding the skills used and tests written:**

Tell me which UI tests and backend tests you wrote for this functionality.

Tell me which skills were used during the session and whether you recorded any insights.

---

## Block 14 — Engineering Insights Execution

**Requirement to record insights:**

Record the engineering insights.

Run Engineering Insights.

Record these points.

---

# Additional Execution Checkpoints

Apply the following checkpoints without replacing or modifying the original workflow blocks.

## Architecture and documentation checkpoint

For Blocks 01–03:

- Inspect the actual repository structure.
- Identify all four modules.
- Identify existing README files, documentation, specifications, and architectural conventions.
- Explain the proposed documentation hierarchy.
- Present the proposed CLAUDE.md file locations and content structure.
- Obtain approval before creating or modifying documentation files.

## Engineering Insights checkpoint

For Blocks 04–09:

- Collect my requirements and insight categories.
- Request the slides, research articles, and URLs referenced in the workflow.
- Actually inspect the provided resources.
- Explain how each resource influenced the proposed skill.
- Present the complete skill structure and triggering mechanism.
- Explain how module-specific insights will be discovered and loaded.
- Explain how duplicate insights will be prevented.
- Explain how existing content will be protected.
- Verify whether the proposed automatic execution mechanism is supported by the current Claude Code environment.
- Clearly distinguish mandatory enforcement mechanisms from instruction-based conventions.
- Obtain approval before creating or modifying the skill.
- Validate the implemented skill against representative scenarios.
- Present the validation results for approval.

## Cost feature checkpoint

For Blocks 10–12:

- Inspect the existing frontend and backend implementations.
- Request the relevant design screenshots.
- Clarify functional and non-functional requirements.
- Identify affected database entities, APIs, backend services, and UI components.
- Prepare the feature specification.
- Prepare the implementation plan.
- Present the proposed UI changes and their exact locations.
- Obtain approval of the specification and implementation plan.

After Block 12 is approved, introduce an explicit implementation checkpoint before proceeding to Block 13.

At this checkpoint:

- Request approval to implement the Cost feature.
- Implement only the approved scope.
- Create the necessary backend and UI tests.
- Execute the relevant tests and validation checks.
- Present the implementation results.
- Request approval.
- Append the approved implementation summary to the execution log.

Do not proceed to Block 13 until the implementation checkpoint has been approved.

## Testing and final review checkpoint

For Blocks 13–14:

- Present the actual backend and UI test coverage.
- Report which tests passed, failed, or were not executed.
- Report the skills actually used.
- Identify substantial engineering insights discovered during implementation.
- Read the existing module-specific insights before recording new ones.
- Append only meaningful, non-duplicate insights.
- Present the final results for approval.
- Record the approved results in the execution log.

---

# Final Workflow Report

After all blocks and implementation checkpoints have been completed and approved, provide a consolidated report containing:

- Completed workflow blocks.
- Skipped or blocked blocks.
- Approved architectural decisions.
- Documentation files created or updated.
- Skills created or modified.
- Feature implementation summary.
- Backend and UI test results.
- Engineering insights recorded.
- Outstanding issues and recommendations.
- Links or relative paths to all generated artifacts.

Append the final workflow summary to `ENGINEERING_WORKFLOW_LOG.md`.

---

# Start Execution

Initialize the workflow files and present the complete list of workflow blocks and their current statuses.

Then start with Block 01 only.

Interact with me throughout the entire process.

Do not execute the entire workflow autonomously.

Every block requires my review and explicit approval before you proceed to the next one.</WritingBlock