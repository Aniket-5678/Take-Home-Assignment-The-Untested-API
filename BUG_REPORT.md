# Bug Report

## Bug 1: Status Filter Allowed Partial Matches

### Location

`src/services/taskService.js` - `getByStatus()`

### Expected Behavior

The `status` query parameter should match a task's status exactly.

For example:

```http
GET /tasks?status=todo