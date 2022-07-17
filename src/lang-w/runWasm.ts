import { Intermediate, Result } from './pipeline'

export const runWasm = async (intermediate: Intermediate): Promise<Result> => {
    if (intermediate.type !== "WASM") {
        throw Error("WASM runner expected WASM but got " + intermediate.type);
    }
    const { program, variableList } = intermediate.wasm;

    const returnValues: Array<number> = [];
    const importObject = {
        js: {
            ret(val: number) {
                returnValues.push(val);
            }
        }
    }

    return await WebAssembly.instantiate(program.bytes, importObject).then(wasm => {
        (<any>wasm.instance.exports).main();

        const finalState: Map<string, number> = new Map<string, number>();
        returnValues.forEach((value, i) => finalState.set(variableList[i], value))
        return finalState;
    });
}