# Jira Cloud REST API Patterns

## Authentication

Jira Cloud uses Basic Auth with base64-encoded `email:api_token`.

```bash
AUTH=$(printf '%s:%s' "$JIRA_USER" "$JIRA_TOKEN" | base64)
curl -s -H "Authorization: Basic ${AUTH}" -H "Content-Type: application/json" "$URL"
```

**Important:** Do NOT use `-u user:token` directly — it fails with tokens containing special characters. Always base64 encode.

## Read Jira credentials from MCP config

```bash
JIRA_USER=$(jq -r '.mcpServers["mcp-atlassian"].env.JIRA_USERNAME' ~/.claude/mcp.json)
JIRA_TOKEN=$(jq -r '.mcpServers["mcp-atlassian"].env.JIRA_API_TOKEN' ~/.claude/mcp.json)
JIRA_URL=$(jq -r '.mcpServers["mcp-atlassian"].env.JIRA_URL' ~/.claude/mcp.json)
```

## Discovery Calls

### Verify authentication
```
GET /rest/api/3/myself
```

### Get project issue types
```
GET /rest/api/3/project/{projectKey}
-> .issueTypes[] -> {id, name, subtask}
```

Common types: Epic, Story, Task, Sub-task, Bug. Names and IDs vary per project.

### Get project statuses (also reveals issue types)
```
GET /rest/api/3/project/{projectKey}/statuses
```

### Find Epic Link custom field
```
GET /rest/api/3/field
-> filter for name containing "epic" (case insensitive)
-> usually customfield_10014 for "Epic Link"
```

## Fetch Issue Details

```
GET /rest/api/3/issue/{issueKey}?expand=renderedFields
-> .fields.summary, .fields.description, .fields.status.name
-> .renderedFields.description (HTML rendered version)
-> .fields.subtasks, .fields.issuelinks
```

## Create Issues

### Epic
```json
POST /rest/api/3/issue
{
  "fields": {
    "project": {"key": "PROJ"},
    "issuetype": {"id": "<epic_type_id>"},
    "summary": "Epic title",
    "description": { ADF document }
  }
}
```

### Task/Story (child of Epic)
```json
{
  "fields": {
    "project": {"key": "PROJ"},
    "parent": {"key": "EPIC-1"},
    "issuetype": {"id": "<task_type_id>"},
    "summary": "Task title",
    "description": { ADF document }
  }
}
```

**Important:** Use `parent` field, NOT `customfield_10014` (Epic Link). The Epic Link field may not be on the project's screen scheme and will error. The `parent` field works universally in Jira Cloud.

### Subtask (child of Task/Story)
```json
{
  "fields": {
    "project": {"key": "PROJ"},
    "parent": {"key": "TASK-2"},
    "issuetype": {"id": "<subtask_type_id>"},
    "summary": "Subtask title",
    "description": { ADF document }
  }
}
```

## ADF (Atlassian Document Format)

Jira Cloud v3 API uses ADF for descriptions:

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [{"type": "text", "text": "Paragraph text"}]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {"type": "paragraph", "content": [{"type": "text", "text": "Item 1"}]}
          ]
        }
      ]
    }
  ]
}
```

## Batch Creation Pattern

To create an entire breakdown efficiently:

1. Create the Epic, get `EPIC_KEY`
2. Create all Stories/Tasks with `parent: EPIC_KEY`, collect `STORY_KEYS`
3. Create all Subtasks with `parent: STORY_KEY` for each story

Use a shell function for subtask creation to avoid repetition:

```bash
create_subtask() {
  local parent=$1 summary=$2 desc=$3
  curl -s -X POST -H "Authorization: Basic ${AUTH}" -H "Content-Type: application/json" "$BASE" \
    -d "{
      \"fields\": {
        \"project\": {\"key\": \"$PROJECT\"},
        \"parent\": {\"key\": \"$parent\"},
        \"issuetype\": {\"id\": \"$SUBTASK_TYPE_ID\"},
        \"summary\": \"$summary\",
        \"description\": {\"version\": 1, \"type\": \"doc\", \"content\": [
          {\"type\": \"paragraph\", \"content\": [{\"type\": \"text\", \"text\": \"$desc\"}]}
        ]}
      }
    }" | jq -r '.key'
}
```

## Error Handling

- `"Issue does not exist or you do not have permission"` — check auth, issue key
- `"Field 'X' cannot be set"` — field not on project screen scheme, use alternative
- `null` key in response — check full response body for error details
- Auth returns `"Client must be authenticated"` — token may be expired or malformed
