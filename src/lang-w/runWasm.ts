import { Intermediate, Result } from './pipeline'

export const runWasm = async (intermediate: Intermediate): Promise<Result> => {
    if (intermediate.type !== "WASM") {
        throw Error("WASM runner expected WASM but got " + intermediate.type);
    }
    const { program, variableList } = intermediate.wasm;

    const memory = new WebAssembly.Memory({
        initial: Math.ceil(variableList.length / (16 * 1024)), 
        maximum: Math.ceil(variableList.length / (16 * 1024))
    });
    const importObject = {
        js: {
            mem: memory
        }
    }

    return await WebAssembly.instantiate(program.bytes, importObject).then(wasm => {
        const { table } = <any>wasm.instance.exports;
        if (!table) {
            throw Error("WASM instantiation failed");
        }

        const main = table.get(0);
        main();

        const values = new Uint32Array(memory.buffer);
        const finalState: Map<string, number> = new Map<string, number>();
        variableList.forEach((variable, i) => finalState.set(variable, values[i]))
        return finalState;
    });
}