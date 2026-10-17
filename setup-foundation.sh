Here's a concise debugging record you can keep for EngineerOS. It captures the root cause, the debugging approach, and the fixes we made.

EngineerOS Debugging Log
Module: Engineering Decisions

Date: July 2026

Problem

Engineering Decisions appeared to save successfully but did not appear inside the selected Project.

Symptoms:

Save button worked.
Modal closed successfully.
No errors while saving.
saveDecision() returned updated data.
LocalStorage contained the new decision.
Project Decision Log always displayed 0 Decisions.
Step 1 — Verify the Save Pipeline

Added logging inside DecisionModal.

console.log("Form submitted");
console.log("Decision to save:", decision);

Confirmed:

Form submitted
onSave() existed
Decision object created correctly

Conclusion:

✅ DecisionModal was not the problem.

Step 2 — Verify App Save Handler

Added logging inside

handleSaveDecision()

Logged

console.log("Saving decision:", item);
console.log("Storage returned:", updated);
console.log(getDecisions());

Result

Storage returned: Array(16)

Conclusion

✅ App saved correctly.

Step 3 — Verify Storage

Checked browser storage.

Incorrect key

localStorage.getItem("engineeros_decisions")

returned

null

Correct key

localStorage.getItem("engineeros_decisions_v6")

returned

Array(16)

Conclusion

Storage worked perfectly.

Step 4 — Verify State Refresh

Confirmed

setDecisions(getDecisions());

was executed after every save.

Conclusion

React state refreshed correctly.

Step 5 — Inspect Project Filtering

Inside ProjectDetail we logged

console.log(project.id);
console.log(project.name);
console.log(projectDecisions);

Result

Current project:
proj-1785485638477

Matching decisions:
[]

This proved:

The project existed.

The decisions existed.

But none belonged to that project.

Root Cause

The DecisionModal was not assigning the selected project's id to the saved decision.

Instead the saved object contained either

projectId: ""

or

projectId: undefined

Therefore

decisions.filter(d => d.projectId === project.id)

always returned

[]
Fix

Inside DecisionModal we changed the saved object to include

projectId: selectedProject.id,
projectName: selectedProject.name,

instead of empty values.

After that

Matching decisions:
Array(1)

appeared immediately.

Result

✔ Decisions now save.

✔ Decisions appear inside the correct Project.

✔ Decision counts update.

✔ Project filtering works.

New Issue Found

Opening

Trace Decision

caused

Cannot read properties of undefined (reading 'length')

inside

SingleSourcePanel.tsx
Root Cause

Prop name mismatch.

App.tsx passed

<SingleSourcePanel
    linkedAssets={traceLinks}
/>

but SingleSourcePanel expected

connectedLinks

Therefore

connectedLinks === undefined

and

connectedLinks.length

crashed.

Fix

Unified the prop names.

Changed

connectedLinks

to

linkedAssets

(or vice versa).

Also added a safe default

linkedAssets = []

to prevent future crashes.

Debugging Strategy Used

Whenever something appears "not to work", follow this order:

UI
 ↓
Event Handler
 ↓
App Handler
 ↓
Storage
 ↓
React State
 ↓
Filtering Logic
 ↓
Rendering Component

Do not assume the save failed just because nothing appears on screen.

Always verify:

Was the event fired?
Was the handler called?
Was storage updated?
Was React state refreshed?
Is the component filtering correctly?
Is the render receiving the correct props?

This systematic approach isolates whether the issue lies in saving, state management, data relationships, or UI rendering, and prevents chasing the wrong part of the application.    