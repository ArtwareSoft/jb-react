"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPreferredPM = void 0;
const findWorkspaceRoot = require("../node_modules/find-yarn-workspace-root");
const findUp = require("find-up");
const path = require("path");
const whichPM = require("which-pm");
const vscode_1 = require("vscode");
async function pathExists(filePath) {
    try {
        await vscode_1.workspace.fs.stat(vscode_1.Uri.file(filePath));
    }
    catch {
        return false;
    }
    return true;
}
async function isPNPMPreferred(pkgPath) {
    if (await pathExists(path.join(pkgPath, 'pnpm-lock.yaml'))) {
        return { isPreferred: true, hasLockfile: true };
    }
    if (await pathExists(path.join(pkgPath, 'shrinkwrap.yaml'))) {
        return { isPreferred: true, hasLockfile: true };
    }
    if (await findUp('pnpm-lock.yaml', { cwd: pkgPath })) {
        return { isPreferred: true, hasLockfile: true };
    }
    return { isPreferred: false, hasLockfile: false };
}
async function isYarnPreferred(pkgPath) {
    if (await pathExists(path.join(pkgPath, 'yarn.lock'))) {
        return { isPreferred: true, hasLockfile: true };
    }
    try {
        if (typeof findWorkspaceRoot(pkgPath) === 'string') {
            return { isPreferred: true, hasLockfile: false };
        }
    }
    catch (err) { }
    return { isPreferred: false, hasLockfile: false };
}
async function isNPMPreferred(pkgPath) {
    const lockfileExists = await pathExists(path.join(pkgPath, 'package-lock.json'));
    return { isPreferred: lockfileExists, hasLockfile: lockfileExists };
}
async function findPreferredPM(pkgPath) {
    const detectedPackageManagerNames = [];
    const detectedPackageManagerProperties = [];
    const npmPreferred = await isNPMPreferred(pkgPath);
    if (npmPreferred.isPreferred) {
        detectedPackageManagerNames.push('npm');
        detectedPackageManagerProperties.push(npmPreferred);
    }
    const yarnPreferred = await isYarnPreferred(pkgPath);
    if (yarnPreferred.isPreferred) {
        detectedPackageManagerNames.push('yarn');
        detectedPackageManagerProperties.push(yarnPreferred);
    }
    const pnpmPreferred = await isPNPMPreferred(pkgPath);
    if (pnpmPreferred.isPreferred) {
        detectedPackageManagerNames.push('pnpm');
        detectedPackageManagerProperties.push(pnpmPreferred);
    }
    const pmUsedForInstallation = await whichPM(pkgPath);
    if (pmUsedForInstallation && !detectedPackageManagerNames.includes(pmUsedForInstallation.name)) {
        detectedPackageManagerNames.push(pmUsedForInstallation.name);
        detectedPackageManagerProperties.push({ isPreferred: true, hasLockfile: false });
    }
    let lockfilesCount = 0;
    detectedPackageManagerProperties.forEach(detected => lockfilesCount += detected.hasLockfile ? 1 : 0);
    return {
        name: detectedPackageManagerNames[0] || 'npm',
        multipleLockFilesDetected: lockfilesCount > 1
    };
}
exports.findPreferredPM = findPreferredPM;
//# sourceMappingURL=preferred-pm.js.map