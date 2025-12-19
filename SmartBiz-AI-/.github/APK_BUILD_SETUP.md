# GitHub Actions APK Build Setup

This repository is configured to automatically build Android APK files using GitHub Actions.

## Setup Instructions

### 1. Get Expo Access Token

1. Go to https://expo.dev/
2. Login to your account
3. Go to **Settings** → **Access Tokens**
4. Create a new token with a name like "GitHub Actions"
5. Copy the token

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste your Expo access token
6. Click **Add secret**

### 3. Build Triggers

The workflow will automatically build APK when:

- **Push to main branch** - Creates an artifact you can download
- **Create a tag** (v1.0.0, v1.1.0, etc.) - Creates a GitHub Release with APK
- **Pull Request** - Builds APK for testing
- **Manual trigger** - Use "Run workflow" button in Actions tab

## How to Create a Release

To create a release with APK:

```bash
# Tag your commit
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build the APK
2. Create a GitHub Release
3. Attach the APK to the release
4. Generate release notes

## Download APK

### From Artifacts (any push)
1. Go to **Actions** tab
2. Click on the latest workflow run
3. Download the APK from **Artifacts** section

### From Releases (tagged versions)
1. Go to **Releases** section
2. Download the APK from the latest release

## Local Build (Alternative)

If you prefer to build locally:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK locally
eas build --platform android --profile preview --local
```

## Troubleshooting

### Build fails with "EXPO_TOKEN not found"
- Make sure you've added the `EXPO_TOKEN` secret in repository settings

### Build fails with EAS errors
- Check that your Expo account is properly set up
- Verify the token has the correct permissions
- Try running `eas build` locally first

### APK not found in artifacts
- Check the workflow logs for errors
- Ensure the build completed successfully
- The artifact is available for 30 days after the build

## Build Profiles

The project uses different build profiles (defined in `eas.json`):

- **preview** - For testing, builds APK (not AAB)
- **production** - For Play Store release, builds AAB by default

## Need Help?

Check the GitHub Actions logs for detailed error messages or visit:
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
