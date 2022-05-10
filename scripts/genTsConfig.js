const { readdirSync, writeFileSync } = require('fs');
const { printInfo, printHeader } = require('./utils');
const INDENT_SIZE = 12;
const pathPropertyIndent = () => ' '.repeat(INDENT_SIZE);

const nestedFolders = ['fieldInput'];

const EXCLUDED_FOLDERS = ['jest-report'];
const FLOW_BUILDER_UI_PACKAGE_DIR = 'packages/@flow-builder/ui';

(function genTsConfig(packageDir) {
    const lwcModuleDir = `${packageDir}/src/builder_platform_interaction`;
    printHeader(`Package modules folder: ${lwcModuleDir}`);

    let paths = readdirSync(lwcModuleDir, { withFileTypes: true })
        .filter(
            (dirent) =>
                dirent.isDirectory() && !EXCLUDED_FOLDERS.includes(dirent.name) && !nestedFolders.includes(dirent.name)
        )
        .map(({ name }) => {
            const path = `${pathPropertyIndent()}"builder_platform_interaction/${name}": ["./src/builder_platform_interaction/${name}/${name}.ts"]`;
            printInfo(`Adding path: ${path.trim()} to ${packageDir}/tsconfig.json`);
            return path;
        });

    nestedFolders.forEach((nestedFolder) => {
        paths = paths.concat(
            readdirSync(`${lwcModuleDir}/${nestedFolder}`, { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map(({ name }) => {
                    const path = `${pathPropertyIndent()}"builder_platform_interaction/${name}": ["./src/builder_platform_interaction/${nestedFolder}/${name}/${name}.ts"]`;
                    printInfo(`Adding path: ${path.trim()} to ${packageDir}/tsconfig.json`);
                    return path;
                })
        );
    });

    writeFileSync(
        `${packageDir}/tsconfig.json`,
        `/*  THIS FILE IS AUTO GENERATED BY ./scripts/genTsConfig.js  */
{
    "extends": "../../../tsconfig.json",
    "compilerOptions": {
        "experimentalDecorators": true,
        "declaration": false,
        "noUnusedLocals": false,
        "noImplicitAny": false,
        "outDir": "./build",
        "baseUrl": ".",
         "paths": {
${pathPropertyIndent()}"lightning/accordion": ["../../../node_modules/lwc-components-lightning/src/lightning/accordion/accordion.js"],
${pathPropertyIndent()}"lightning/focusTrap": ["../../../node_modules/lwc-components-lightning/src/lightning/focusTrap/focusTrap.js"],
${pathPropertyIndent()}"lightning/popup": ["../../../node_modules/lwc-components-lightning/src/lightning/popup/popup.js"],
${pathPropertyIndent()}"lightning/popupSource": ["../../../node_modules/lwc-components-lightning/src/lightning/popupSource/popupSource.js"],
${pathPropertyIndent()}"lightning/accordionSection": ["../../../node_modules/lwc-components-lightning/src/lightning/accordionSection/accordionSection.js"],
${pathPropertyIndent()}"lightning/utils": ["../../../node_modules/lwc-components-lightning/src/lightning/utils/utils.js"],
${pathPropertyIndent()}"lightning/platformShowToastEvent": ["../../../node_modules/lwc-components-lightning/src/lightning/platformShowToastEvent/platformShowToastEvent.js"],
${pathPropertyIndent()}"lightning/uiObjectInfoApi": ["../../../node_modules/lwc-components-lightning/src/lightning/uiObjectInfoApi/uiObjectInfoApi.js"],
${pathPropertyIndent()}"lightning/uiRecordApi": ["../../../node_modules/lwc-components-lightning/src/lightning/uiRecordApi/uiRecordApi.js"],
${pathPropertyIndent()}"builder_platform_interaction/autoLayoutCanvas": ["../auto-layout-canvas/dist/types/index.d.js"],
${pathPropertyIndent()}"builder_platform_interaction/sharedUtils": ["../shared-utils/dist/types/index.d.js"],
${pathPropertyIndent()}"builder_platform_interaction/alcEvents": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcEvents/alcEvents.ts"],
${pathPropertyIndent()}"builder_platform_interaction/popover": ["../auto-layout-canvas-ui/src/builder_platform_interaction/popover/popover.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcMenu": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcMenu/alcMenu.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcNodeMenu": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcNodeMenu/alcNodeMenu.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcConnectorMenu": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcConnectorMenu/alcConnectorMenu.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcComponentsUtils": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcComponentsUtils/alcComponentsUtils.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcMenuUtils": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcMenuUtils/alcMenuUtils.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcCanvas": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcCanvas/alcCanvas.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcFlow": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcFlow/alcFlow.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcCompoundNode": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcCompoundNode/alcCompoundNode.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcNode": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcNode/alcNode.ts"],
${pathPropertyIndent()}"builder_platform_interaction/alcConnector": ["../auto-layout-canvas-ui/src/builder_platform_interaction/alcConnector/alcConnector.ts"],
${pathPropertyIndent()}"builder_platform_interaction/zoomPanel": ["../auto-layout-canvas-ui/src/builder_platform_interaction/zoomPanel/zoomPanel.ts"],
${paths.join(',\n')}
         }
    },

    "include": ["src/builder_platform_interaction/**/*", "jest-modules/**/*", "jest-mock-data/**/*", "@types", "../shared-utils/@types/index.d.ts", "../auto-layout-canvas-ui/@types/index.d.ts"]
}`
    );
})(
    // only auto gen for "@flow-builder/ui"
    FLOW_BUILDER_UI_PACKAGE_DIR
);
