import { AstNode } from './parse'
import { Intermediate } from './pipeline'

export type WasmProgram = {
    bytes: Uint8Array,
    text: Array<{ index: number, text: string}>,
}

type AnnotatedWasm = {
    instruction: Array<number>,
    annotation: string,
}

const annotate = (annotation: string, ...instruction: Array<number>): AnnotatedWasm => ({instruction, annotation})

const combine = (...instructions: Array<AnnotatedWasm>): AnnotatedWasm => ({instruction: instructions.flatMap(instruction => instruction.instruction), annotation: instructions.map(instruction => instruction.annotation).join(" ")})
const addPrefix = (prefix: string, instruction: AnnotatedWasm): AnnotatedWasm => ({instruction: instruction.instruction, annotation: prefix + instruction.annotation})
const addExtra = (extra: string, instruction: AnnotatedWasm): AnnotatedWasm => ({instruction: instruction.instruction, annotation: instruction.annotation + " (" + extra + ")"})

const moduleHeader = [annotate("Magic number", 0x00, 0x61, 0x73, 0x6d), annotate("Version", 0x01, 0x00, 0x00, 0x00)]

const emptyArray = annotate("Empty vector", 0x00)

const sectionType = {
    type: annotate("Type section", 1),
    import: annotate("Import section", 2),
    function: annotate("Function section", 3),
    table: annotate("Table section", 4),
    export: annotate("Export section", 7),
    elem: annotate("Elem section", 9),
    code: annotate("Code section", 10)
}

const wasmInstruction = {
    nop: annotate("nop", 0x01),

    block: annotate("block", 0x02),
    loop: annotate("loop", 0x03),
    if: annotate("if", 0x04),
    else: annotate("else", 0x05),
    end: annotate("end", 0x0b),
    br: annotate("br", 0x0c),
    br_if: annotate("br_if", 0x0d),

    call: annotate("call", 0x10),

    get: annotate("get", 0x20),
    set: annotate("set", 0x21),

    i32: annotate("i32", 0x41),

    eqz: annotate("eqz", 0x44),

    eq: annotate("eq", 0x46),
    ne: annotate("ne", 0x47),
    lt: annotate("lt", 0x48),
    gt: annotate("gt", 0x4a),
    le: annotate("le", 0x4c),
    ge: annotate("ge", 0x4e),

    add: annotate("add", 0x6a),
    sub: annotate("sub", 0x6b),
    mul: annotate("mul", 0x6c),
    div: annotate("div", 0x6d),
    and: annotate("and", 0x71),
    or: annotate("or", 0x72),
}

const type = {
    i32: annotate("Type i32", 0x7f),
    void: annotate("Type void", 0x40),
    func: annotate("Type func", 0x60),
    funcref: annotate("Type funcref", 0x70),
}

const ioType = {
    func: annotate("Func", 0x00),
    table: annotate("Table", 0x01)
}
const byteSize = (instructions: Array<AnnotatedWasm>) => {
    return instructions.map(aWasm => aWasm.instruction.length).reduce((total, instructionLength) => total + instructionLength);
}

const str = (str: string): Array<AnnotatedWasm> => [annotate("String length " + str.length, ...u32(str.length).instruction), annotate('String "' + str + '"', ...str.split("").map(c => c.charCodeAt(0)))]

const u32 = (value: number): AnnotatedWasm => {
    const str = value.toString();
    value |= 0;
    const result = [];
    do {
        const b = value & 0x7f;
        value >>= 7;
        result.push(b | (value && 0x80));
    } while (value != 0);
    return annotate(str, ...result);
}

const s32 = (value: number): AnnotatedWasm => {
    const str = value.toString();
    value |= 0;
    const result = [];
    while (true) {
        const b = value & 0x7f;
        value >>= 7;
        if ((value === 0 && (b & 0x40) === 0) || (value === -1 && (b & 0x40) !== 0)) {
        result.push(b);
        return annotate(str, ...result);
        }
        result.push(b | 0x80);
    }
}

const vector = (...contents: Array<Array<AnnotatedWasm>>): Array<AnnotatedWasm> => [annotate("Vector length " + contents.length, ...u32(contents.length).instruction), ...contents.flat()]

const section = (type: AnnotatedWasm, ...contents: Array<Array<AnnotatedWasm>>): Array<AnnotatedWasm> => {
    const v = vector(...contents);
    return [type, addPrefix("Section size ", u32(byteSize(v))), ...v];
}

export const compileWasm = (intermediate: Intermediate): Intermediate => {
    if (intermediate.type !== "AST") {
        throw Error("Compiler expected ast but got " + intermediate.type);
    }
    const ast = intermediate.ast;

    const program: Array<AnnotatedWasm> = [];

    const variableList: Array<string> = [];
    const getVariableAddress = (variable: string) => {
        const index = variableList.indexOf(variable);
        if (index === -1) {
            return variableList.push(variable) - 1;
        }
        return index;
    }    

    const compileNode = (ast: AstNode): Array<AnnotatedWasm> => {
        switch (ast.type) {
            case "sequence":
                return ast.statements.flatMap(statement => compileNode(statement));
            case "assignment":
                return [...compileNode(ast.calculation), combine(wasmInstruction.set, u32(getVariableAddress(ast.identifier.identifier)))];
            case "skip":
                return [wasmInstruction.nop];
            case "while":
                const head = compileNode(ast.head);
                const body = compileNode(ast.body);
                return [wasmInstruction.loop, type.void, ...head, wasmInstruction.br_if, u32(0), ...body, wasmInstruction.end];
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
                return [combine(wasmInstruction.i32, s32(ast.value))];
            case "identifier":
                return [wasmInstruction.get, u32(getVariableAddress(ast.identifier))];
            case "boolean":
                return [wasmInstruction.i32, s32(ast.value ? 0 : 1)];
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

    program.push(...moduleHeader); // Magic value + version
    program.push(...section(sectionType.type, [type.func, ...vector([type.i32]), emptyArray], [type.func, emptyArray, emptyArray])); // Type section: [0: (i32) => void, 1: () => void]
    program.push(...section(sectionType.import, [...str("js"), ...str("ret"), ioType.func, addPrefix("Type ", u32(0))])); // Import section: func js.ret typ 0
    program.push(...section(sectionType.function, [addPrefix("Type ", u32(1))])); // Function section: [0: () => void]
    program.push(...section(sectionType.table, [type.funcref, annotate("Limit type", 0x01), addPrefix("Initial ", u32(1)), addPrefix("Max ", u32(1))])); // Table section: 1 funcref-table size 1
    program.push(...section(sectionType.export, [...str("table"), ioType.table, addPrefix("Table ", u32(0))])); // Export section: main with type 1
    program.push(...section(sectionType.elem, [addPrefix("Segment flags ", u32(0)), addPrefix("Initializer: ", combine(wasmInstruction.i32, u32(0), wasmInstruction.end)), ...vector([addPrefix("Function ", u32(1))])])); // Elem section: main with type 1
    const code = [...compileNode(ast), ...variableList.flatMap(variable => [combine(wasmInstruction.get, u32(getVariableAddress(variable))), addExtra("ret", combine(wasmInstruction.call, u32(0)))])];
    const func = [...vector([u32(variableList.length), type.i32]), ...code, wasmInstruction.end];
    program.push(...section(sectionType.code, [addPrefix("Function size ", u32(byteSize(func))), ...func])); // Code section: body for func at 0

    const wasmProgram: Array<number> = []
    const text: Array<{ index: number, text: string}> = []

    program.forEach(annotatedWasm => {
        text.push({ index: wasmProgram.length, text: annotatedWasm.annotation});
        wasmProgram.push(...annotatedWasm.instruction);
    });

    return { type: "WASM", wasm: { program: { bytes: Uint8Array.from(wasmProgram), text: text }, variableList} };
}