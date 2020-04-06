# NBSplayer

[Minecraft Note Block Studio](https://www.stuffbydavid.com/mcnbs) as a website.

nbsplayer is a Vue app using vue-cli. The entry point is src/main.js.

NBSplayer can load your ``` .nbs ``` Minecraft Note Block Songs, edit them, and save the updated song files back to your PC. songs can (*for now - Three new instruments are in the works*) only have the default instruments. Any custom instruments are (*for now*) not supported. However, there is no error message that shows when a ``` .nbs ``` file that has custom intruments, or instruments not supported by NBSplayer.

## Project Setup

### Cloning

```bash
git clone https://github.com/GarboMuffin/nbsplayer
```

### Installing dependencies

```bash
# Install dependencies
npm install
```

### Compile for development

```bash
# Starts a development server with live reloads and debugging features enabled.
npm run serve
```

### Compile for production

```bash
# Creates a minimized build for production. You generally do not need to do this -- the source is automatically compiled and deployed when a commit is made to master.
npm run build
```
