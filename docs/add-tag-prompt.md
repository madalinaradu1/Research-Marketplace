# Add Tag Prompt (DynamoDB)

Use this prompt when you want a safe, PowerShell-friendly command set to add one new tag to the `Tags-*` table.

```md
Generate the exact PowerShell commands to add a new tag to my DynamoDB tags table.

Requirements:
- Table name: Tags-<ENV_NAME>
- Region: us-west-2
- Use AWS CLI commands that work in Windows PowerShell (avoid quote/JSON parsing issues).
- Use file-based JSON payloads (Out-File -Encoding ascii + file://...) for all put/get operations.
- Insert the canonical tag row with all required fields:
  - PK=TAG
  - SK=TAG#<tag_id>
  - GSI1PK=TAG_NAME
  - GSI1SK=<normalized_name>
  - tag_id
  - display_name
  - normalized_name
  - tag_type
  - parent_tag_id (NULL true if none)
  - status=ACTIVE
  - aliases (list)
  - description
  - hierarchy_path (list)
  - created_at (ISO timestamp)
  - created_by_role=ADMIN
  - created_by_id=system
- Insert alias rows for each alias:
  - PK=TAG
  - SK=ALIAS#<alias_normalized>
  - alias
  - alias_normalized
  - tag_id
  - status=ACTIVE
- Add condition expressions to prevent accidental overwrite:
  - attribute_not_exists(PK) AND attribute_not_exists(SK)
- Include verify commands (get-item) for:
  - canonical tag key
  - at least one alias key
- Also include one AppSync test query for listTagsByPrefix using the correct prefix for normalized_name.

Tag to add:
- display_name: <DISPLAY_NAME>
- tag_type: DOMAIN
- aliases: [<ALIAS_1>, <ALIAS_2>, <ALIAS_3>]
- description: <DESCRIPTION>
- parent_tag_id: null

Return only runnable commands and query blocks, no extra explanation.
```

