import { AstNode } from './parse'
import { Intermediate } from './pipeline'

export type WasmProgram = {
    bytes: Uint8Array,
    text: Array<{ index: number, text: string}>,
}

const moduleHeader = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]

const emptyArray = 0x00

const sectionType = {
    type: 1,
    import: 2,
    function: 3,
    export: 7,
    code: 10,
}

const wasmInstruction = {
    nop: 0x01,

    block: 0x02,
    loop: 0x03,
    if: 0x04,
    else: 0x05,
    end: 0x0b,
    br: 0x0c,
    br_if: 0x0d,

    call: 0x10,

    get: 0x20,
    set: 0x21,

    i32: 0x41,

    eqz: 0x44,

    eq: 0x46,
    ne: 0x47,
    lt: 0x48,
    gt: 0x4a,
    le: 0x4c,
    ge: 0x4e,

    add: 0x6a,
    sub: 0x6b,
    mul: 0x6c,
    div: 0x6d,
    and: 0x71,
    or: 0x72,
}

const type = {
    i32: 0x7f,
    void: 0x40,
    func: 0x60
}

const ioType = {
    func: 0x00
}

export const compileWasm = (intermediate: Intermediate): Intermediate => {
    if (intermediate.type !== "AST") {
        throw Error("Compiler expected ast but got " + intermediate.type);
    }
    const ast = intermediate.ast;

    const program: Array<number> = []; // Magic number + Version

    const text: Array<{ index: number, text: string }> = []
    const addText = (str: string) => {
        text.push({ index: program.length, text: str });
    }

    const variableList: Array<string> = [];
    const getVariableAddress = (variable: string) => {
        const index = variableList.indexOf(variable);
        if (index === -1) {
            return variableList.push(variable) - 1;
        }
        return index;
    }

    const str = (str: string): Array<number> => [str.length, ...str.split("").map(c => c.charCodeAt(0))]

    const u32 = (value: number): Array<number> => {
        value |= 0;
        const result = [];
        do {
            const b = value & 0x7f;
            value >>= 7;
            result.push(b | (value && 0x80));
        } while (value != 0);
        return result;
    }

    const s32 = (value: number): Array<number> => {
        value |= 0;
        const result = [];
        while (true) {
          const b = value & 0x7f;
          value >>= 7;
          if ((value === 0 && (b & 0x40) === 0) || (value === -1 && (b & 0x40) !== 0)) {
            result.push(b);
            return result;
          }
          result.push(b | 0x80);
        }
    }

    const vector = (...contents: Array<Array<number>>) => [...u32(contents.length), ...contents.flat()]

    const section = (type: number, ...contents: Array<Array<number>>): Array<number> => {
        const v = vector(...contents);
        return [type, ...u32(v.length), ...v];
    }

    const compileNode = (ast: AstNode): Array<number> => {
        switch (ast.type) {
            case "sequence":
                return ast.statements.flatMap(statement => compileNode(statement));
            case "assignment":
                return [...compileNode(ast.calculation), wasmInstruction.set, ...u32(getVariableAddress(ast.identifier.identifier))];
            case "skip":
                return [wasmInstruction.nop];
            case "while":
                const head = compileNode(ast.head);
                const body = compileNode(ast.body);
                return [wasmInstruction.loop, type.void, ...head, wasmInstruction.br_if, ...u32(0), ...body, wasmInstruction.end];
            case "if":
                const condition = compileNode(ast.condition);
                const consequence = compileNode(ast.consequence);
                const alternative = compileNode(ast.alternative);
                return [...condition, wasmInstruction.if, type.void, ...consequence, wasmInstruction.else, ...alternative, wasmInstruction.end];
            case "+":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.add];
            case "-":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.sub];
            case "|":
                return [...compileNode(ast.right), wasmInstruction.eqz, ...compileNode(ast.left), wasmInstruction.eqz, wasmInstruction.and, wasmInstruction.eqz];
            case "*":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.mul];
            case "/":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.div];
            case "&":
                return [...compileNode(ast.right), wasmInstruction.eqz, ...compileNode(ast.left), wasmInstruction.eqz, wasmInstruction.or, wasmInstruction.eqz];
            case "not":
                return [...compileNode(ast.factor), wasmInstruction.eqz];
            case "number":
                return [wasmInstruction.i32, ...s32(ast.value)];
            case "identifier":
                return [wasmInstruction.get, ...u32(getVariableAddress(ast.identifier))];
            case "boolean":
                return [wasmInstruction.i32, ...s32(ast.value ? 0 : 1)];
            case "parenthesized_calculation":
                return compileNode(ast.calculation);
            case "<=":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.le];
            case ">=":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.ge];
            case "<>":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.ne];
            case "<":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.lt];
            case ">":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.gt];
            case "=":
                return [...compileNode(ast.right), ...compileNode(ast.left), wasmInstruction.eq];
            default:
                return [];
        }
    }

    addText("Module Header");
    program.push(...moduleHeader); // Magic value + version

    addText("Type section");
    program.push(...section(sectionType.type, [type.func, ...vector([type.i32]), emptyArray], [type.func, emptyArray, emptyArray])); // Type section: [0: (i32) => void, 1: () => void]

    addText("Import section");
    program.push(...section(sectionType.import, [...str("js"), ...str("ret"), ioType.func, 0x00])); // Import section: func js.ret typ 0
    
    addText("Function section");
    program.push(...section(sectionType.function, [1])); // Function section: [0: () => void]
    
    addText("Export section");
    program.push(...section(sectionType.export, [...str("main"), ioType.func, 0x01])); // Export section: main with type 1
    
    addText("Code section");
    const code = [...compileNode(ast), ...variableList.flatMap(variable => [wasmInstruction.get, ...u32(getVariableAddress(variable)), wasmInstruction.call, ...u32(0)])];
    const func = [...vector([...u32(variableList.length), type.i32]), ...code, wasmInstruction.end];
    program.push(...section(sectionType.code, [...u32(func.length), ...func])); // Code section: body for func at 0

    return { type: "WASM", wasm: { program: { bytes: Uint8Array.from(program), text: text }, variableList} };
}