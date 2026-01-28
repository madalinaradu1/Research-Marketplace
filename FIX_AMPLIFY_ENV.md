# FIX AMPLIFY ENVIRONMENT ISSUE

## PROBLEM
Amplify CLI can't detect the environment because local-env-info.json was missing.

## SOLUTION - Use Amplify Pull

Your AppID from team-provider-info.json: **d1ev55w0oxuc99**

### Step 1: Pull Existing Backend

```bash
cd "c:\Users\arsen\Documents\Research Marketplace\Research-Marketplace"
amplify pull --appId d1ev55w0oxuc99 --envName dev
```

### Step 2: Answer Prompts

When prompted, answer:
```
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use: default (or your AWS profile name)
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building: javascript
? What javascript framework are you using: react
? Source Directory Path: src
? Distribution Directory Path: build
? Build Command: npm run-script build
? Start Command: npm run-script start
? Do you plan on modifying this backend? Yes
```

### Step 3: Verify

After pull completes:
```bash
amplify status
```

Should show "No Change" for all resources.

### Step 4: Push Schema Changes

```bash
amplify push
```

When prompted:
- "Do you want to update code for your updated GraphQL API?" → **Yes**
- "Do you want to generate GraphQL statements?" → **Yes**

## ALTERNATIVE: If Pull Fails

If `amplify pull` fails, try:

```bash
amplify init
```

When prompted:
```
? Do you want to use an existing environment? Yes
? Choose the environment you would like to use: dev
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building: javascript
? What javascript framework are you using: react
? Source Directory Path: src
? Distribution Directory Path: build
? Build Command: npm run-script build
? Start Command: npm run-script start
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use: default
```

Then run:
```bash
amplify status
amplify push
```

## EXPECTED OUTCOME

After successful push:
```
✔ All resources are updated in the cloud

GraphQL endpoint: https://...
GraphQL API KEY: ...
```

Then:
1. Clear browser cache
2. Refresh page
3. Test faculty accept/reject
4. Should work!
