# Custom Components for Amplify Studio

This directory contains configuration for custom components used in Amplify Studio.

## How to Use Custom Components

1. Create your React components in `src/components/` or `src/pages/`
2. Create wrapper components in `src/ui-components/` that Amplify Studio can recognize
3. Add component definitions to `custom-components.json`
4. Run `amplify push` to update your Amplify environment
5. Restart Amplify Studio to see your custom components

## Troubleshooting

If your custom components don't appear in Amplify Studio:

1. Make sure the import paths in `custom-components.json` are correct
2. Verify that your wrapper components follow the Amplify Studio format
3. Try running `amplify pull` to sync your local environment with the cloud
4. Clear your browser cache and restart Amplify Studio
5. Check the browser console for any errors related to loading components