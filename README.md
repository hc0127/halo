# Halo Admin Website deployment branches on github

Note: On completion of pull request it would deploy to targetted environment and there won't be any extra approval at this stage.
 -  `develop -> dev`
 -  `qa -> qa`
 -  `main -> uat`
 -  `prod -> prod/live`

### Running locally directly

 - [macOS] Make sure you have [brew](https://brew.sh) installed
 - Install the latest stable version of [Node.js](https://nodejs.org/en/)
 - Install the latest stable version of [Yarn](https://yarnpkg.com/en/docs/install)

1. Run `yarn install`
2. Run `yarn start`
3. Navigate to http://localhost:3000

### Build for production

1. Run `yarn install` (if you haven't already)
2. Run `yarn build`

### Run Storybook

1. Run `yarn install` (if you haven't already)
2. Run `yarn storybook`
3. Navigate to http://localhost:9001

# Below readme from Atomic

## Setup

1. Install 2 packages

   - ESLint
   - Prettier

2. Settings for each:

   - ESLint should not need changing
   - Prettier:

     - Tick ESLint integration
     - Tick single quotes
     - Tick Bracket spacing
     - Tick semicolons
     - Print width 100
     - Tab width should be 2 spaces
     - No trailing commas
     - Tick run prettier last

3. Setup your public/config.json file.

   - The needed keys are in Lastpass.

4. Warning: The current Dev environment points to the staging database & backend, to ease setup and allow testing with apps. Please be careful with the data when you develop.

5. TODO: Setup local dev environment

---

## THINGS TO KNOW BEFORE REVIEWING OR WORKING ON CREST - Simon, 18th Dec 2018

- I'm trying to use some new standards, because this app was created by someone else's standards.
- Updating the whole codebase would take too much time, so I'm gonna do it slowly, and mostly with new stuff.
- Please keep that in mind when doing a review. Let me know if you see anything odd or that you're not sure about.

---

## DEPLOYMENT

### **Test**

Deployment on TEST is handled by CircleCI.
Simply merge your PR into `develop` and CircleCI will take care of the rest.
Deployment takes about 5 minutes after merge.

**Do NOT manually rebuild the app on `develop`**

### **Demo**

Deployment to DEMO is done manually.

To do this, follow this process:

- Merge `develop` into `demo` via a PR.
- Pull `demo` locally, update the version number in `package.json` and run `npm run build`. Commit & Push the resulting changes to the `demo` branch.
- On reconnix, in `/home/crest-demo.app-drive.co.uk`, use `git pull`.

### **Live**

Deployment to LIVE is done manually.

First, you have to deploy & test the features on DEMO.

After that, follow this process:

- Merge `demo` into `master`.
- On reconnix, in `/home/crestplanning.co.uk/halo`, use `git pull`.
"# halo" 
