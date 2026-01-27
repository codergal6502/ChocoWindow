import { ChocoStudioTileSetDefinition, ChocoStudioWorkspace } from "./ChocoStudio";

const JsonClone = (o) => {
    return JSON.parse(JSON.stringify(o))
}

export class ChocoStudioUpgrader {
    static AttemptUpgrade(obj) {
        let nextUpgrade = obj;

        if (nextUpgrade.version == "1.0.1") {
            nextUpgrade = ChocoStudioUpgrader.Attempt1_0_1UpgradeTo1_1_0(nextUpgrade);

            if (!nextUpgrade) return null;
        }

        return null;
    }


    static Attempt1_0_1UpgradeTo1_1_0(oldWorkspace) {
        const cloneWorkspace = JsonClone(oldWorkspace);
        cloneWorkspace.tileSetDefinitions = [];
        const newWorkspace = new ChocoStudioWorkspace(cloneWorkspace);

        oldWorkspace.tileSetDefinitions.forEach(oldTsd => {
            const cloneTsd = JsonClone(oldTsd);
            const /** @type {ChocoStudioTileSetDefinition} */ newTsd = new ChocoStudioTileSetDefinition();
            debugger;
        })

        debugger;
    }
}