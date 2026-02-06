import { CHOCO_REGION_GRANULARITY, ChocoStudioTileSetDefinition, ChocoStudioWindowRegionDefinition, ChocoStudioWindowRegionTileAssignment, ChocoStudioWorkspace } from "./ChocoStudio";
import { ChocoCoordinates, TileTransformationTypes } from "./ChocoWindow";

const JsonClone = (o) => {
    return JSON.parse(JSON.stringify(o))
}

export class ChocoStudioUpgrader {
    static AttemptUpgrade(obj) {
        let nextUpgrade = obj;

        if (nextUpgrade.version === "1.0.1") {
            nextUpgrade = ChocoStudioUpgrader.Attempt1_0_1UpgradeTo1_1_0(nextUpgrade);

            if (!nextUpgrade) return null;
        }

        if (nextUpgrade.version === "1.1.0") {
            nextUpgrade = ChocoStudioUpgrader.Attempt_1_1_0UpgradeTo_1_2_0(nextUpgrade);

            if (!nextUpgrade) return null;
        }

        if (nextUpgrade.version === "1.2.0") {
            nextUpgrade = ChocoStudioUpgrader.Attempt_1_2_0UpgradeTo_1_3_0(nextUpgrade);

            if (!nextUpgrade) return null;
        }

        return new ChocoStudioWorkspace(nextUpgrade);
    }

    static Attempt1_0_1UpgradeTo1_1_0(oldWorkspace) {
        const clonedWorkspace = JsonClone(oldWorkspace);
        clonedWorkspace.tileSetDefinitions = [];

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
                            transparencyOverrides: oldTsp?.transparencyOverrides?.map(c => new ChocoCoordinates({x: c.x, y: c.y})) ?? []
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

            clonedWorkspace.tileSetDefinitions[clonedWorkspace.tileSetDefinitions.length] = cloneTsd;
        })

        clonedWorkspace.version = "1.1.0";

        return clonedWorkspace;
    }

    static Attempt_1_1_0UpgradeTo_1_2_0(oldWorkspace) {
        const clonedWorkspace = JsonClone(oldWorkspace);
        clonedWorkspace.granularity = CHOCO_REGION_GRANULARITY.BASIC_EDGES;

        return clonedWorkspace;
    }

    static Attempt_1_2_0UpgradeTo_1_3_0(oldWorkspace) {
        const clonedWorkspace = JsonClone(oldWorkspace);
        for (let preset of clonedWorkspace.presets) {
            const tileSetDefinition = clonedWorkspace.tileSetDefinitions.find(tsd => tsd.id === preset.tileSetDefinitionId);

            if (tileSetDefinition) {
                for (let colorIndex = preset.substituteColors.length - 1; colorIndex >= 0; colorIndex--) {
                    const substituteColor = preset.substituteColors[colorIndex];
                    const defaultColor = tileSetDefinition.defaultColors[colorIndex];

                    if (substituteColor) {
                        if (defaultColor) {
                            preset.substituteColors[colorIndex] = {
                                defaultColor: { r: defaultColor.r, g: defaultColor.g, b: defaultColor.b, a: defaultColor.a },
                                substituteColor: { r: substituteColor.r, g: substituteColor.g, b: substituteColor.b, a: substituteColor.a },
                            }
                        }
                        else {
                            preset.substituteColors.pop();
                        }
                    }
                }
            }
        }

        return clonedWorkspace;
    }
}