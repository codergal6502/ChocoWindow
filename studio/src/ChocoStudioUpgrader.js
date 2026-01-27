import { ChocoStudioTileSetDefinition, ChocoStudioWindowRegionDefinition, ChocoStudioWindowRegionTileAssignment, ChocoStudioWorkspace } from "./ChocoStudio";
import { ChocoWinCoordinates, TileTransformationTypes } from "./ChocoWindow";

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

        return nextUpgrade;
    }

    static Attempt1_0_1UpgradeTo1_1_0(oldWorkspace) {
        const cloneWorkspace = JsonClone(oldWorkspace);
        cloneWorkspace.tileSetDefinitions = [];

        oldWorkspace.tileSetDefinitions.forEach(oldTsd => {
            const cloneTsd = JsonClone(oldTsd);

            for (const regionIdentifier in cloneTsd.regions) {
                const clonedRegion = cloneTsd.regions[regionIdentifier];
                clonedRegion.colCount = clonedRegion.width;
                clonedRegion.rowCount = clonedRegion.height;
                const rowNumbers = Array.from(Array(Number(clonedRegion.rowCount))).map((_, idx) => idx);
                const colNumbers = Array.from(Array(Number(clonedRegion.colCount))).map((_, idx) => idx);

                clonedRegion.internalArray = []
                for (const rowIndex in rowNumbers) {
                    const row = [];
                    clonedRegion.internalArray[clonedRegion.internalArray.length] = row;

                    for (const colIndex in colNumbers) {
                        const oldTsp = clonedRegion.tileSheetPositions?.[rowIndex]?.[colIndex];
                        row[row.length] = new ChocoStudioWindowRegionTileAssignment({
                            id: crypto.randomUUID(),
                            xSheetCoordinate: oldTsp?.x ?? 0,
                            ySheetCoordinate: oldTsp?.y ?? 0,
                            geometricTransformation: oldTsp?.geometricTransformation ?? TileTransformationTypes.BASE,
                            transparencyOverrides: oldTsp?.transparencyOverrides?.map(c => new ChocoWinCoordinates({x: c.x, y: c.y})) ?? []
                        })
                    }
                }

                delete clonedRegion.width;
                delete clonedRegion.height;
                delete clonedRegion.tileSheetPositions;

                clonedRegion.id = crypto.randomUUID();
                const /** @type {ChocoStudioWindowRegionDefinition} */ newRd = new ChocoStudioWindowRegionDefinition(clonedRegion);
                cloneTsd.regions[regionIdentifier] = newRd;
            }

            cloneWorkspace.tileSetDefinitions[cloneWorkspace.tileSetDefinitions.length] = cloneTsd;
        })

        const newWorkspace = new ChocoStudioWorkspace(cloneWorkspace);
        return newWorkspace;
    }
}