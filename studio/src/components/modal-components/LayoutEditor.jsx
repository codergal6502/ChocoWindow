import { ChocoStudioLayout, ChocoStudioWindow } from "../../ChocoStudio"
import { ChocoWin, ChocoWinColor } from "../../ChocoWindow";

const LayoutEditor = ({ /** @type { ChocoStudioLayout } */ layout, /** @type { Array<ChocoStudioWindow> } */ windows, onLayoutChange, onLayoutDelete }) => {
    return (
        <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">Layout Settings <span className="text-sm">({layout.id})</span></h2>
    )
}

export default LayoutEditor;