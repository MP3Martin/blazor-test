// src/optimize.ts
var rules = [
    // load of (addr + constant) => merge constant into load's offset
    {
        a: [
            [
                "$",
                40 /* i32_load */,
                41 /* i64_load */,
                42 /* f32_load */,
                43 /* f64_load */,
                44 /* i32_load8_s */,
                45 /* i32_load8_u */,
                46 /* i32_load16_s */,
                47 /* i32_load16_u */,
                48 /* i64_load8_s */,
                49 /* i64_load8_u */,
                50 /* i64_load16_s */,
                51 /* i64_load16_u */,
                52 /* i64_load32_s */,
                53 /* i64_load32_u */
            ],
            [106 /* i32_add */, "x", [65 /* i32_const */, "Q"]],
            "P"
        ],
        b: ["$", "x", [-2 /* i32_add */, "P", "Q"]]
    },
    // store of (addr + constant) => merge constant into store's offset
    {
        a: [
            [
                "$",
                54 /* i32_store */,
                55 /* i64_store */,
                56 /* f32_store */,
                57 /* f64_store */,
                58 /* i32_store8 */,
                59 /* i32_store16 */,
                60 /* i64_store8 */,
                61 /* i64_store16 */,
                62 /* i64_store32 */
            ],
            [106 /* i32_add */, "x", [65 /* i32_const */, "Q"]],
            "y",
            "P"
        ],
        b: ["$", "x", "y", [-2 /* i32_add */, "P", "Q"]]
    },
    // i64_store8 => i32_store8
    {
        a: [60 /* i64_store8 */, "x", "y", "P"],
        e: {
            "y": [
                {
                    a: [66 /* i64_const */, "Q"],
                    b: [58 /* i32_store8 */, "x", [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]], "P"]
                },
                {
                    a: [
                        [
                            "$",
                            48 /* i64_load8_s */,
                            49 /* i64_load8_u */,
                            50 /* i64_load16_s */,
                            51 /* i64_load16_u */,
                            52 /* i64_load32_s */,
                            53 /* i64_load32_u */,
                            41 /* i64_load */
                        ],
                        "z",
                        "Q"
                    ],
                    b: [58 /* i32_store8 */, "x", [45 /* i32_load8_u */, "z", "Q"], "P"]
                },
                {
                    a: [["@", 172 /* i64_extend_i32_s */, 173 /* i64_extend_i32_u */], "z"],
                    b: [58 /* i32_store8 */, "x", "z", "P"]
                }
            ]
        }
    },
    // i64_store16 => i32_store16
    {
        a: [61 /* i64_store16 */, "x", "y", "P"],
        e: {
            "y": [
                {
                    a: [66 /* i64_const */, "Q"],
                    b: [59 /* i32_store16 */, "x", [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]], "P"]
                },
                {
                    a: [48 /* i64_load8_s */, "z", "Q"],
                    b: [59 /* i32_store16 */, "x", [44 /* i32_load8_s */, "z", "Q"], "P"]
                },
                {
                    a: [49 /* i64_load8_u */, "z", "Q"],
                    b: [59 /* i32_store16 */, "x", [45 /* i32_load8_u */, "z", "Q"], "P"]
                },
                {
                    a: [
                        [
                            "$",
                            50 /* i64_load16_s */,
                            51 /* i64_load16_u */,
                            52 /* i64_load32_s */,
                            53 /* i64_load32_u */,
                            41 /* i64_load */
                        ],
                        "z",
                        "Q"
                    ],
                    b: [59 /* i32_store16 */, "x", [47 /* i32_load16_u */, "z", "Q"], "P"]
                },
                {
                    a: [["@", 172 /* i64_extend_i32_s */, 173 /* i64_extend_i32_u */], "z"],
                    b: [59 /* i32_store16 */, "x", "z", "P"]
                }
            ]
        }
    },
    // i64_store32 => i32_store
    {
        a: [62 /* i64_store32 */, "x", "y", "P"],
        e: {
            "y": [
                {
                    a: [66 /* i64_const */, "Q"],
                    b: [54 /* i32_store */, "x", [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]], "P"]
                },
                {
                    a: [48 /* i64_load8_s */, "z", "Q"],
                    b: [54 /* i32_store */, "x", [44 /* i32_load8_s */, "z", "Q"], "P"]
                },
                {
                    a: [49 /* i64_load8_u */, "z", "Q"],
                    b: [54 /* i32_store */, "x", [45 /* i32_load8_u */, "z", "Q"], "P"]
                },
                {
                    a: [50 /* i64_load16_s */, "z", "Q"],
                    b: [54 /* i32_store */, "x", [46 /* i32_load16_s */, "z", "Q"], "P"]
                },
                {
                    a: [51 /* i64_load16_u */, "z", "Q"],
                    b: [54 /* i32_store */, "x", [47 /* i32_load16_u */, "z", "Q"], "P"]
                },
                {
                    a: [
                        [
                            "$",
                            52 /* i64_load32_s */,
                            53 /* i64_load32_u */,
                            41 /* i64_load */
                        ],
                        "z",
                        "Q"
                    ],
                    b: [54 /* i32_store */, "x", [40 /* i32_load */, "z", "Q"], "P"]
                },
                {
                    a: [["@", 172 /* i64_extend_i32_s */, 173 /* i64_extend_i32_u */], "z"],
                    b: [54 /* i32_store */, "x", "z", "P"]
                }
            ]
        }
    },
    // i64_eqz => i32_eqz
    {
        a: [80 /* i64_eqz */, "x"],
        e: {
            "x": [
                {
                    a: [["$", 48 /* i64_load8_s */, 49 /* i64_load8_u */], "y", "P"],
                    b: [69 /* i32_eqz */, [45 /* i32_load8_u */, "y", "P"]]
                },
                {
                    a: [["$", 50 /* i64_load16_s */, 51 /* i64_load16_u */], "y", "P"],
                    b: [69 /* i32_eqz */, [47 /* i32_load16_u */, "y", "P"]]
                },
                {
                    a: [["$", 52 /* i64_load32_s */, 53 /* i64_load32_u */], "y", "P"],
                    b: [69 /* i32_eqz */, [40 /* i32_load */, "y", "P"]]
                },
                {
                    a: [["@", 172 /* i64_extend_i32_s */, 173 /* i64_extend_i32_u */], "y"],
                    b: [69 /* i32_eqz */, "y"]
                }
            ]
        }
    },
    // 64-bit equality on unsigned 32-bit load => 32-bit equality
    {
        a: [81 /* i64_eq */, [49 /* i64_load8_u */, "x", "P"], [66 /* i64_const */, "Q"]],
        b: [70 /* i32_eq */, [45 /* i32_load8_u */, "x", "P"], [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]]],
        d: ["Q", "<=", 0xFFn]
    },
    {
        a: [82 /* i64_ne */, [49 /* i64_load8_u */, "x", "P"], [66 /* i64_const */, "Q"]],
        b: [71 /* i32_ne */, [45 /* i32_load8_u */, "x", "P"], [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]]],
        d: ["Q", "<=", 0xFFn]
    },
    {
        a: [81 /* i64_eq */, [51 /* i64_load16_u */, "x", "P"], [66 /* i64_const */, "Q"]],
        b: [70 /* i32_eq */, [47 /* i32_load16_u */, "x", "P"], [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]]],
        d: ["Q", "<=", 0xFFFFn]
    },
    {
        a: [82 /* i64_ne */, [51 /* i64_load16_u */, "x", "P"], [66 /* i64_const */, "Q"]],
        b: [71 /* i32_ne */, [47 /* i32_load16_u */, "x", "P"], [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]]],
        d: ["Q", "<=", 0xFFFFn]
    },
    {
        a: [81 /* i64_eq */, [53 /* i64_load32_u */, "x", "P"], [66 /* i64_const */, "Q"]],
        b: [70 /* i32_eq */, [40 /* i32_load */, "x", "P"], [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]]],
        d: ["Q", "<=", 0xFFFFFFFFn]
    },
    {
        a: [82 /* i64_ne */, [53 /* i64_load32_u */, "x", "P"], [66 /* i64_const */, "Q"]],
        b: [71 /* i32_ne */, [40 /* i32_load */, "x", "P"], [65 /* i32_const */, [-1 /* i64_to_i32 */, "Q"]]],
        d: ["Q", "<=", 0xFFFFFFFFn]
    },
    // Optimize boolean operations
    {
        a: [240 /* BOOL */, "x"],
        e: {
            "x": [
                // "if (x ? 1 : 0)" => "if (x)"
                { a: [242 /* BOOL_TO_INT */, "y"], b: [240 /* BOOL */, "y"] },
                // "if (x ? 0 : 1)" => "if (!x)"
                { a: [["@", 69 /* i32_eqz */, 80 /* i64_eqz */], "x"], b: [241 /* BOOL_NOT */, "y"] }
            ]
        }
    },
    {
        a: [241 /* BOOL_NOT */, "x"],
        e: {
            "x": [
                // "if (!(x ? 1 : 0))" => "if (!x)"
                { a: [242 /* BOOL_TO_INT */, "y"], b: [241 /* BOOL_NOT */, "y"] },
                // "if (!(x ? 0 : 1)" => "if (x)"
                { a: [["@", 69 /* i32_eqz */, 80 /* i64_eqz */], "y"], b: [240 /* BOOL */, "y"] },
                // "if (!(x === 0))" => "if (x !== 0)" (note: does not apply to floating-point due to NaN)
                { a: [70 /* i32_eq */, "y", "z"], b: [240 /* BOOL */, [71 /* i32_ne */, "y", "z"]] },
                { a: [71 /* i32_ne */, "y", "z"], b: [240 /* BOOL */, [70 /* i32_eq */, "y", "z"]] },
                { a: [72 /* i32_lt_s */, "y", "z"], b: [240 /* BOOL */, [78 /* i32_ge_s */, "y", "z"]] },
                { a: [73 /* i32_lt_u */, "y", "z"], b: [240 /* BOOL */, [79 /* i32_ge_u */, "y", "z"]] },
                { a: [74 /* i32_gt_s */, "y", "z"], b: [240 /* BOOL */, [76 /* i32_le_s */, "y", "z"]] },
                { a: [75 /* i32_gt_u */, "y", "z"], b: [240 /* BOOL */, [77 /* i32_le_u */, "y", "z"]] },
                { a: [76 /* i32_le_s */, "y", "z"], b: [240 /* BOOL */, [74 /* i32_gt_s */, "y", "z"]] },
                { a: [77 /* i32_le_u */, "y", "z"], b: [240 /* BOOL */, [75 /* i32_gt_u */, "y", "z"]] },
                { a: [78 /* i32_ge_s */, "y", "z"], b: [240 /* BOOL */, [72 /* i32_lt_s */, "y", "z"]] },
                { a: [79 /* i32_ge_u */, "y", "z"], b: [240 /* BOOL */, [73 /* i32_lt_u */, "y", "z"]] },
                { a: [81 /* i64_eq */, "y", "z"], b: [240 /* BOOL */, [82 /* i64_ne */, "y", "z"]] },
                { a: [82 /* i64_ne */, "y", "z"], b: [240 /* BOOL */, [81 /* i64_eq */, "y", "z"]] },
                { a: [83 /* i64_lt_s */, "y", "z"], b: [240 /* BOOL */, [89 /* i64_ge_s */, "y", "z"]] },
                { a: [84 /* i64_lt_u */, "y", "z"], b: [240 /* BOOL */, [90 /* i64_ge_u */, "y", "z"]] },
                { a: [85 /* i64_gt_s */, "y", "z"], b: [240 /* BOOL */, [87 /* i64_le_s */, "y", "z"]] },
                { a: [86 /* i64_gt_u */, "y", "z"], b: [240 /* BOOL */, [88 /* i64_le_u */, "y", "z"]] },
                { a: [87 /* i64_le_s */, "y", "z"], b: [240 /* BOOL */, [85 /* i64_gt_s */, "y", "z"]] },
                { a: [88 /* i64_le_u */, "y", "z"], b: [240 /* BOOL */, [86 /* i64_gt_u */, "y", "z"]] },
                { a: [89 /* i64_ge_s */, "y", "z"], b: [240 /* BOOL */, [83 /* i64_lt_s */, "y", "z"]] },
                { a: [90 /* i64_ge_u */, "y", "z"], b: [240 /* BOOL */, [84 /* i64_lt_u */, "y", "z"]] }
            ]
        }
    },
    // Optimize sign conversions
    {
        a: [243 /* TO_U32 */, "x"],
        e: {
            "x": [
                {
                    a: [40 /* i32_load */, "y", "P"],
                    b: [245 /* U32_LOAD */, "y", "P"]
                }
            ]
        }
    },
    {
        a: [244 /* TO_S64 */, "x"],
        e: {
            "x": [
                {
                    a: [41 /* i64_load */, "y", "P"],
                    b: [246 /* S64_LOAD */, "y", "P"]
                },
                // No sign conversion is needed for values in the shared signed/unsigned range
                {
                    a: [66 /* i64_const */, "P"],
                    b: [66 /* i64_const */, "P"],
                    d: ["P", "<=", 0x7FFFFFFFFFFFFFFFn]
                },
                {
                    a: [["$", 49 /* i64_load8_u */, 51 /* i64_load16_u */, 53 /* i64_load32_u */], "y", "P"],
                    b: ["$", "y", "P"]
                }
            ]
        }
    },
    // i32_wrap_i64 removal
    {
        a: [167 /* i32_wrap_i64 */, "x"],
        e: {
            "x": [
                {
                    a: [66 /* i64_const */, "P"],
                    b: [65 /* i32_const */, [-1 /* i64_to_i32 */, "P"]]
                },
                {
                    a: [48 /* i64_load8_s */, "y", "P"],
                    b: [44 /* i32_load8_s */, "y", "P"]
                },
                {
                    a: [49 /* i64_load8_u */, "y", "P"],
                    b: [45 /* i32_load8_u */, "y", "P"]
                },
                {
                    a: [50 /* i64_load16_s */, "y", "P"],
                    b: [46 /* i32_load16_s */, "y", "P"]
                },
                {
                    a: [51 /* i64_load16_u */, "y", "P"],
                    b: [47 /* i32_load16_u */, "y", "P"]
                },
                {
                    a: [["$", 52 /* i64_load32_s */, 53 /* i64_load32_u */, 41 /* i64_load */], "y", "P"],
                    b: [40 /* i32_load */, "y", "P"]
                },
                {
                    a: [["@", 172 /* i64_extend_i32_s */, 173 /* i64_extend_i32_u */], "y"],
                    b: "y"
                },
                {
                    a: [124 /* i64_add */, [["@", 172 /* i64_extend_i32_s */, 173 /* i64_extend_i32_u */], "y"], [66 /* i64_const */, "P"]],
                    b: [106 /* i32_add */, "y", [65 /* i32_const */, [-1 /* i64_to_i32 */, "P"]]]
                }
            ]
        }
    },
    // i64_and
    {
        a: [131 /* i64_and */, "x", [66 /* i64_const */, "P"]],
        e: {
            "x": [
                {
                    a: [66 /* i64_const */, "Q"],
                    b: [66 /* i64_const */, [-3 /* i64_and */, "P", "Q"]]
                },
                {
                    a: [131 /* i64_and */, "y", [66 /* i64_const */, "Q"]],
                    b: [131 /* i64_and */, "y", [66 /* i64_const */, [-3 /* i64_and */, "P", "Q"]]]
                },
                {
                    a: [49 /* i64_load8_u */, "y", "Q"],
                    b: [49 /* i64_load8_u */, "y", "Q"],
                    d: [["P", "&", 0xFFn], "===", 0xFFn]
                },
                {
                    a: [48 /* i64_load8_s */, "y", "Q"],
                    b: [49 /* i64_load8_u */, "y", "Q"],
                    d: ["P", "===", 0xFFn]
                },
                {
                    a: [51 /* i64_load16_u */, "y", "Q"],
                    b: [51 /* i64_load16_u */, "y", "Q"],
                    d: [["P", "&", 0xFFFFn], "===", 0xFFFFn]
                },
                {
                    a: [50 /* i64_load16_s */, "y", "Q"],
                    b: [51 /* i64_load16_u */, "y", "Q"],
                    d: ["P", "===", 0xFFFFn]
                },
                {
                    a: [53 /* i64_load32_u */, "y", "Q"],
                    b: [53 /* i64_load32_u */, "y", "Q"],
                    d: [["P", "&", 0xFFFFFFFFn], "===", 0xFFFFFFFFn]
                },
                {
                    a: [52 /* i64_load32_s */, "y", "Q"],
                    b: [53 /* i64_load32_u */, "y", "Q"],
                    d: ["P", "===", 0xFFFFFFFFn]
                }
            ]
        }
    }
];
var compileOptimizations = () => {
    let nextVar = 0;
    const newVarName = () => "v" + nextVar++;
    const compileOperand = (ptrVar, index, operands, reusableNodes, then) => {
        if (index < operands.length) {
            const operand = operands[index];
            if (typeof operand === "string") {
                placeholderExprs[operand] = `${astVar}[${ptrVar}+${index + 1}]`;
                compileOperand(ptrVar, index + 1, operands, reusableNodes, then);
            } else {
                const childPtr = newVarName();
                const childOp = newVarName();
                code += `var ${childPtr}=${astVar}[${ptrVar}+${index + 1}],${childOp}=${astVar}[${childPtr}]&${255 /* OpMask */};`;
                compileMatch(childPtr, childOp, operand, reusableNodes, (reusableNodes2) => {
                    compileOperand(ptrVar, index + 1, operands, reusableNodes2, then);
                });
            }
        } else {
            then(reusableNodes);
        }
    };
    const compileMatch = (ptrVar, opVar, [pattern, ...operands], reusableNodes, then) => {
        const parts = [];
        if (typeof pattern === "number") {
            parts.push(`${opVar}===${pattern}`);
        } else {
            const [name, ...oneOf] = pattern;
            oneOf.sort((a, b) => a - b);
            oneOfOps[name] = {
                k: ptrVar,
                w: opVar,
                x: oneOf.some((x) => opCanBeOptimized.has(x))
            };
            for (let i = 0; i < oneOf.length; i++) {
                let run = 1;
                while (i + run < oneOf.length && oneOf[i + run - 1] + 1 === oneOf[i + run])
                    run++;
                parts.push(run > 2 ? `${opVar}>=${oneOf[i]}&&${opVar}<=${oneOf[i += run - 1]}` : `${opVar}===${oneOf[i]}`);
            }
        }
        reusableNodes = reusableNodes.concat({
            k: ptrVar,
            l: operands.map((x) => typeof x === "string" ? x : null)
        });
        code += `if(${parts.join("||")}){`;
        compileOperand(ptrVar, 0, operands, reusableNodes, then);
        code += "}";
    };
    const compileRules = (ptrVar, opVar, rules2, buildStatName, reusableNodes, placeholderVarsFromParent) => {
        for (const { a: match, e: nested, b: replace, d: onlyIf } of rules2) {
            compileMatch(ptrVar, opVar, match, reusableNodes, (reusableNodes2) => {
                const placeholderVars = Object.create(placeholderVarsFromParent);
                compileOnlyIf(onlyIf, placeholderVars, () => {
                    if (nested) {
                        for (const operand in nested) {
                            storePlaceholderExprToVar(operand, placeholderVars);
                        }
                        for (const operand in nested) {
                            const childPtrVar = placeholderVars[operand];
                            const childOpVar = newVarName();
                            code += `var ${childOpVar}=${astVar}[${childPtrVar}]&${255 /* OpMask */};`;
                            compileRules(
                                childPtrVar,
                                childOpVar,
                                nested[operand],
                                0 /* Stats */ ? (subMatch) => buildStatName(substituteMatch(match, operand, subMatch)) : null,
                                reusableNodes2,
                                placeholderVars
                            );
                        }
                    }
                    if (replace) {
                        if (0 /* Stats */)
                            code += `${recordStatsVar}(${JSON.stringify(buildStatName(match))});`;
                        const replacePtr = constructReplacement(replace, placeholderVars, reusableNodes2.slice(), `|${astVar}[${rootPtrVar}]&${~0 << 24 /* OutSlotShift */}`);
                        const optimizeAgain = typeof replace !== "string" && (typeof replace[0] === "string" ? oneOfOps[replace[0]].x : opCanBeOptimized.has(replace[0]));
                        if (optimizeAgain) {
                            if (rootPtrVar !== replacePtr)
                                code += `${rootPtrVar}=${replacePtr};`;
                            code += "continue";
                        } else {
                            code += "return " + replacePtr;
                        }
                    }
                });
            });
        }
    };
    const compileOnlyIf = (onlyIf, placeholderVars, then) => {
        if (onlyIf) {
            const compileCheck = (onlyIf2) => {
                if (typeof onlyIf2 === "string") {
                    return `${constantsVar}[${placeholderVars[onlyIf2] || placeholderExprs[onlyIf2]}]&0xFFFFFFFFFFFFFFFFn`;
                }
                if (typeof onlyIf2 === "bigint") {
                    return onlyIf2 + "n";
                }
                return `(${compileCheck(onlyIf2[0])})${onlyIf2[1]}(${compileCheck(onlyIf2[2])})`;
            };
            code += `if(${compileCheck(onlyIf)}){`;
            then();
            code += "}";
        } else {
            then();
        }
    };
    const storePlaceholderExprToVar = (operand, placeholderVars) => {
        if (!(operand in placeholderVars)) {
            const childPtr = newVarName();
            code += `var ${childPtr}=${placeholderExprs[operand]};`;
            placeholderVars[operand] = childPtr;
        }
    };
    const constructReplacement = (replace, placeholderVars, reusableNodes, outStackSlot = "") => {
        if (typeof replace === "string")
            return placeholderVars[replace] || placeholderExprs[replace];
        if (replace[0] === -1 /* i64_to_i32 */) {
            const operand = constructReplacement(replace[1], placeholderVars, reusableNodes);
            return `Number(${constantsVar}[${operand}]&0xFFFFFFFFn)`;
        }
        if (replace[0] === -2 /* i32_add */) {
            const operand1 = constructReplacement(replace[1], placeholderVars, reusableNodes);
            const operand2 = constructReplacement(replace[2], placeholderVars, reusableNodes);
            return `${operand1}+${operand2}`;
        }
        if (replace[0] === -3 /* i64_and */) {
            const replace1 = replace[1];
            if (typeof replace1 === "string") {
                storePlaceholderExprToVar(replace1, placeholderVars);
            }
            const operand1 = constructReplacement(replace1, placeholderVars, reusableNodes);
            const operand2 = constructReplacement(replace[2], placeholderVars, reusableNodes);
            code += `${constantsVar}[${operand1}]&=${constantsVar}[${operand2}];`;
            return operand1;
        }
        const [op, ...operands] = replace;
        const last = operands[operands.length - 1];
        const hasPayload = typeof last === "string" ? last === "P" || last === "Q" : typeof last[0] !== "string" && last[0] < 0;
        const shiftedChildCount = (hasPayload ? operands.length - 1 : operands.length) << 8 /* ChildCountShift */;
        let bestScore = -1;
        let bestIndex;
        let newPtr;
        let existingOperands;
        for (let i = 0; i < reusableNodes.length; i++) {
            const reusableNode = reusableNodes[i];
            if (reusableNode.l.length === operands.length) {
                let score = 0;
                for (let i2 = 0; i2 < operands.length; i2++) {
                    if (operands[i2] === reusableNode.l[i2]) {
                        score++;
                    }
                }
                if (score > bestScore) {
                    bestScore = score;
                    bestIndex = i;
                    newPtr = reusableNode.k;
                    existingOperands = reusableNode.l;
                }
            }
        }
        if (typeof op === "string" && oneOfOps[op].k === newPtr) {
        } else {
            const node = (typeof op === "string" ? `${oneOfOps[op].w}|${shiftedChildCount}` : `${op | shiftedChildCount}`) + outStackSlot;
            if (newPtr) {
                reusableNodes.splice(bestIndex, 1);
                code += `${astVar}[${newPtr}]=${node};`;
            } else {
                newPtr = newVarName();
                code += `var ${newPtr}=${allocateNode}(${node},${replace.length});`;
            }
        }
        for (let i = 0; i < operands.length; i++) {
            if (existingOperands && operands[i] !== existingOperands[i]) {
                const value = constructReplacement(operands[i], placeholderVars, reusableNodes);
                code += `${astVar}[${newPtr}+${i + 1}]=${value};`;
            }
        }
        return newPtr;
    };
    const placeholderExprs = {};
    const oneOfOps = {};
    const recordStatsVar = newVarName();
    const astVar = newVarName();
    const constantsVar = newVarName();
    const allocateNode = newVarName();
    const rootPtrVar = newVarName();
    const rootOpVar = newVarName();
    const opCanBeOptimized = /* @__PURE__ */ new Set();
    for (const { a: [pattern] } of rules) {
        if (typeof pattern === "number") {
            opCanBeOptimized.add(pattern);
        } else {
            const [, ...oneOf] = pattern;
            for (const op of oneOf)
                opCanBeOptimized.add(op);
        }
    }
    let code = `for(;;){var ${rootOpVar}=${astVar}[${rootPtrVar}]&${255 /* OpMask */};`;
    compileRules(rootPtrVar, rootOpVar, rules, 0 /* Stats */ ? matchToStatName : null, [], {});
    code += `return ${rootPtrVar}}`;
    return 0 /* Stats */ ? new Function(recordStatsVar, `return(${astVar},${constantsVar},${allocateNode},${rootPtrVar})=>{${code}}`)(recordStats) : new Function(astVar, constantsVar, allocateNode, rootPtrVar, code);
};

// src/parse.ts
var parse = (bytes) => {
    const dataView = new DataView(bytes.buffer);
    const readU32LEB = () => {
        let value = 0;
        let shift = 0;
        let byte;
        do {
            byte = bytes[ptr++];
            value |= (byte & 127) << shift;
            shift += 7;
        } while (byte & 128);
        return value >>> 0;
    };
    const readI32LEB = () => {
        let value = 0;
        let shift = 0;
        let byte;
        do {
            byte = bytes[ptr++];
            value |= (byte & 127) << shift;
            shift += 7;
        } while (byte & 128);
        return shift < 32 && byte & 64 ? value | ~0 << shift : value;
    };
    const readI64LEB = () => {
        let value = 0n;
        let shift = 0n;
        let byte;
        do {
            byte = bytes[ptr++];
            value |= BigInt(byte & 127) << shift;
            shift += 7n;
        } while (byte & 128);
        return shift < 64 && byte & 64 ? value | ~0n << shift : value;
    };
    const readF32 = () => {
        const value = dataView.getFloat32(ptr, true);
        ptr += 4;
        return value;
    };
    const readF64 = () => {
        const value = dataView.getFloat64(ptr, true);
        ptr += 8;
        return value;
    };
    const readValueTypes = (count = readU32LEB()) => {
        return [...bytes.slice(ptr, ptr += count)];
    };
    const readName = (length = readU32LEB()) => {
        return new TextDecoder().decode(bytes.slice(ptr, ptr += length));
    };
    const readLimits = (kind = bytes[ptr++]) => {
        return [readU32LEB(), kind === 0 /* OnlyMin */ ? Infinity : readU32LEB()];
    };
    const readConstantU32 = () => {
        const op = bytes[ptr++];
        let value;
        if (op === 65 /* i32_const */)
            value = readU32LEB();
        else
            throw new Error("Unsupported constant instruction: 0x" + op.toString(16));
        if (bytes[ptr++] !== 11 /* end */)
            throw new Error("Expected end after constant");
        return value;
    };
    const readInitializer = () => {
        const op = bytes[ptr++];
        let initializer;
        if (op === 65 /* i32_const */) {
            const value = readI32LEB();
            initializer = () => value;
        } else if (op === 66 /* i64_const */) {
            const value = readI64LEB();
            initializer = () => value;
        } else if (op === 67 /* f32_const */) {
            const value = readF32();
            initializer = () => value;
        } else if (op === 68 /* f64_const */) {
            const value = readF64();
            initializer = () => value;
        } else if (op === 35 /* global_get */) {
            const index = readU32LEB();
            initializer = (globals) => globals[index];
        } else
            throw new Error("Unsupported constant instruction: 0x" + op.toString(16));
        if (bytes[ptr++] !== 11 /* end */)
            throw new Error("Expected end after constant");
        return initializer;
    };
    const codeSection = [];
    const customSections = [];
    const dataSection = [];
    const elementSection = [];
    const exportSection = [];
    const functionSection = [];
    const globalSection = [];
    const importSection = [];
    const memorySection = [];
    const nameSection = /* @__PURE__ */ new Map();
    const tableSection = [];
    const typeSection = [];
    let startSection = -1;
    let ptr = 8;
    if (bytes.slice(0, 8).join(",") !== "0,97,115,109,1,0,0,0")
        throw new Error("Invalid file header");
    while (ptr + 5 < bytes.length) {
        const sectionType = bytes[ptr++];
        const contentsSize = readU32LEB();
        const sectionEnd = ptr + contentsSize;
        if (sectionType === 0 /* Custom */) {
            const sectionName = readName();
            customSections.push([sectionName, bytes.slice(ptr, sectionEnd)]);
            if (sectionName === "name") {
                const subsection = bytes[ptr++];
                const subsectionEnd = ptr + readU32LEB();
                if (subsection === 1 /* Function */) {
                    for (let i = 0, count = readI32LEB(); i < count && ptr < subsectionEnd; i++) {
                        nameSection.set(readU32LEB(), readName());
                    }
                }
            }
        } else if (sectionType === 1 /* Type */) {
            for (let i = 0, typeCount = readU32LEB(); i < typeCount; i++) {
                if (bytes[ptr++] !== 96)
                    throw new Error("Invalid function type");
                typeSection.push([readValueTypes(), readValueTypes()]);
            }
        } else if (sectionType === 2 /* Import */) {
            for (let i = 0, importCount = readU32LEB(); i < importCount; i++) {
                const module = readName();
                const name = readName();
                const desc = bytes[ptr++];
                if (desc === 0 /* Func */)
                    importSection.push([module, name, desc, readU32LEB()]);
                else if (desc === 1 /* Table */)
                    importSection.push([module, name, desc, bytes[ptr++], ...readLimits()]);
                else if (desc === 2 /* Mem */)
                    importSection.push([module, name, desc, ...readLimits()]);
                else if (desc === 3 /* Global */)
                    importSection.push([module, name, desc, bytes[ptr++], bytes[ptr++]]);
                else
                    throw new Error("Unsupported import type: " + desc);
            }
        } else if (sectionType === 3 /* Function */) {
            const functionCount = readU32LEB();
            for (let i = 0; i < functionCount; i++) {
                functionSection.push(readU32LEB());
            }
        } else if (sectionType === 4 /* Table */) {
            for (let i = 0, tableCount = readU32LEB(); i < tableCount; i++) {
                tableSection.push([bytes[ptr++], ...readLimits()]);
            }
        } else if (sectionType === 5 /* Memory */) {
            for (let i = 0, memoryCount = readU32LEB(); i < memoryCount; i++) {
                memorySection.push(readLimits());
            }
        } else if (sectionType === 6 /* Global */) {
            for (let i = 0, globalCount = readU32LEB(); i < globalCount; i++) {
                const type = bytes[ptr++];
                const mutable = bytes[ptr++];
                const initializer = readInitializer();
                globalSection.push([type, mutable, initializer]);
            }
        } else if (sectionType === 7 /* Export */) {
            for (let i = 0, exportCount = readU32LEB(); i < exportCount; i++) {
                const name = readName();
                const desc = bytes[ptr++];
                const index = readU32LEB();
                exportSection.push([name, desc, index]);
            }
        } else if (sectionType === 8 /* Start */) {
            startSection = readU32LEB();
        } else if (sectionType === 9 /* Element */) {
            for (let i = 0, elementCount = readU32LEB(); i < elementCount; i++) {
                const byte = bytes[ptr++];
                if (byte === 0) {
                    const offset = readConstantU32();
                    const indices = [];
                    for (let j = 0, count = readU32LEB(); j < count; j++)
                        indices.push(readU32LEB());
                    elementSection.push([offset, indices]);
                } else {
                    throw new Error("Unsupported element kind: " + byte);
                }
            }
        } else if (sectionType === 10 /* Code */) {
            for (let i = 0, codeCount = readU32LEB(); i < codeCount; i++) {
                const codeEnd = readU32LEB() + ptr;
                const localsCount = readU32LEB();
                const locals = [];
                for (let j = 0; j < localsCount; j++)
                    locals.push([readU32LEB(), bytes[ptr++]]);
                codeSection.push([locals, ptr, codeEnd]);
                ptr = codeEnd;
            }
        } else if (sectionType === 11 /* Data */) {
            for (let i = 0, dataCount = readU32LEB(); i < dataCount; i++) {
                const flags = bytes[ptr++];
                const memory = flags & 2 /* MemoryIndex */ ? readU32LEB() : 0;
                const offset = flags & 1 /* Passive */ ? 0 : readConstantU32();
                const length = readU32LEB();
                dataSection.push([memory, offset, bytes.slice(ptr, ptr += length)]);
            }
        } else if (sectionType === 12 /* DataCount */) {
        } else {
            throw new Error("Unsupported section type " + sectionType);
        }
        ptr = sectionEnd;
    }
    return {
        y: bytes,
        z: dataView,
        o: codeSection,
        $: customSections,
        A: dataSection,
        B: elementSection,
        C: exportSection,
        p: functionSection,
        D: globalSection,
        E: importSection,
        F: memorySection,
        G: nameSection,
        H: startSection,
        I: tableSection,
        q: typeSection
    };
};
var moduleMap = /* @__PURE__ */ new Map();
var Module = class {
    constructor(source) {
        moduleMap.set(this, parse(source instanceof Uint8Array ? source : new Uint8Array(source instanceof ArrayBuffer ? source : source.buffer)));
    }
};

// src/compile.ts
var liveCastToWASM = (value, type) => {
    if (type === 125 /* F32 */ || type === 124 /* F64 */)
        return +value;
    if (type === 127 /* I32 */)
        return value | 0;
    if (type === 126 /* I64 */)
        return BigInt(value) & 0xFFFFFFFFFFFFFFFFn;
    throw new Error("Unsupported cast to type " + type);
};
var castToWASM = (code, type) => {
    if (type === 125 /* F32 */ || type === 124 /* F64 */)
        return "+" + code;
    if (type === 127 /* I32 */)
        return code + "|0";
    if (type === 126 /* I64 */)
        return `BigInt(${code})&0xFFFFFFFFFFFFFFFFn`;
    throw new Error("Unsupported cast to type " + type);
};
var castToJS = (code, type) => {
    if (type === 124 /* F64 */ || type === 127 /* I32 */)
        return code;
    if (type === 125 /* F32 */)
        return `Math.fround(${code})`;
    if (type === 126 /* I64 */)
        return `l.${/* @__KEY__ */ "m"}(${code})`;
    throw new Error("Unsupported cast to type " + type);
};
var metaTable = new Uint16Array(256);
metaTable[1 /* nop */] = 512 /* Omit */ | 8 /* Simple */;
metaTable[26 /* drop */] = 1 | 512 /* Omit */ | 8 /* Simple */;
metaTable[32 /* local_get */] = 4 /* Push */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[33 /* local_set */] = 1 | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[34 /* local_tee */] = 1 | 4 /* Push */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[35 /* global_get */] = 4 /* Push */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[36 /* global_set */] = 1 | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[40 /* i32_load */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[41 /* i64_load */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[42 /* f32_load */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[43 /* f64_load */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[44 /* i32_load8_s */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[45 /* i32_load8_u */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[46 /* i32_load16_s */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[47 /* i32_load16_u */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[48 /* i64_load8_s */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[49 /* i64_load8_u */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[50 /* i64_load16_s */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[51 /* i64_load16_u */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[52 /* i64_load32_s */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[53 /* i64_load32_u */] = 1 | 4 /* Push */ | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[54 /* i32_store */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[55 /* i64_store */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[56 /* f32_store */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[57 /* f64_store */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[58 /* i32_store8 */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[59 /* i32_store16 */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[60 /* i64_store8 */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[61 /* i64_store16 */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[62 /* i64_store32 */] = 2 | 32 /* HasAlign */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[63 /* memory_size */] = 4 /* Push */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[64 /* memory_grow */] = 1 | 4 /* Push */ | 16 /* HasIndex */ | 8 /* Simple */;
metaTable[69 /* i32_eqz */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[70 /* i32_eq */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[71 /* i32_ne */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[72 /* i32_lt_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[73 /* i32_lt_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 128 /* ToU32 */;
metaTable[74 /* i32_gt_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[75 /* i32_gt_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 128 /* ToU32 */;
metaTable[76 /* i32_le_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[77 /* i32_le_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 128 /* ToU32 */;
metaTable[78 /* i32_ge_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[79 /* i32_ge_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 128 /* ToU32 */;
metaTable[80 /* i64_eqz */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[81 /* i64_eq */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[82 /* i64_ne */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[83 /* i64_lt_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 256 /* ToS64 */;
metaTable[84 /* i64_lt_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[85 /* i64_gt_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 256 /* ToS64 */;
metaTable[86 /* i64_gt_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[87 /* i64_le_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 256 /* ToS64 */;
metaTable[88 /* i64_le_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[89 /* i64_ge_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */ | 256 /* ToS64 */;
metaTable[90 /* i64_ge_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[91 /* f32_eq */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[92 /* f32_ne */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[93 /* f32_lt */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[94 /* f32_gt */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[95 /* f32_le */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[96 /* f32_ge */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[97 /* f64_eq */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[98 /* f64_ne */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[99 /* f64_lt */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[100 /* f64_gt */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[101 /* f64_le */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[102 /* f64_ge */] = 2 | 4 /* Push */ | 8 /* Simple */ | 64 /* BoolToInt */;
metaTable[103 /* i32_clz */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[104 /* i32_ctz */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[105 /* i32_popcnt */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[106 /* i32_add */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[107 /* i32_sub */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[108 /* i32_mul */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[109 /* i32_div_s */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[110 /* i32_div_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 128 /* ToU32 */;
metaTable[111 /* i32_rem_s */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[112 /* i32_rem_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 128 /* ToU32 */;
metaTable[113 /* i32_and */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[114 /* i32_or */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[115 /* i32_xor */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[116 /* i32_shl */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[117 /* i32_shr_s */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[118 /* i32_shr_u */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[119 /* i32_rotl */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[120 /* i32_rotr */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[121 /* i64_clz */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[122 /* i64_ctz */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[123 /* i64_popcnt */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[124 /* i64_add */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[125 /* i64_sub */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[126 /* i64_mul */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[127 /* i64_div_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 256 /* ToS64 */;
metaTable[128 /* i64_div_u */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[129 /* i64_rem_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 256 /* ToS64 */;
metaTable[130 /* i64_rem_u */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[131 /* i64_and */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[132 /* i64_or */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[133 /* i64_xor */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[134 /* i64_shl */] = 2 | 4 /* Push */ | 8 /* Simple */ | 1024 /* And63 */;
metaTable[135 /* i64_shr_s */] = 2 | 4 /* Push */ | 8 /* Simple */ | 1024 /* And63 */;
metaTable[136 /* i64_shr_u */] = 2 | 4 /* Push */ | 8 /* Simple */ | 1024 /* And63 */;
metaTable[137 /* i64_rotl */] = 2 | 4 /* Push */ | 8 /* Simple */ | 1024 /* And63 */;
metaTable[138 /* i64_rotr */] = 2 | 4 /* Push */ | 8 /* Simple */ | 1024 /* And63 */;
metaTable[139 /* f32_abs */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[140 /* f32_neg */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[141 /* f32_ceil */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[142 /* f32_floor */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[143 /* f32_trunc */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[144 /* f32_nearest */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[145 /* f32_sqrt */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[146 /* f32_add */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[147 /* f32_sub */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[148 /* f32_mul */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[149 /* f32_div */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[150 /* f32_min */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[151 /* f32_max */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[152 /* f32_copysign */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[153 /* f64_abs */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[154 /* f64_neg */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[155 /* f64_ceil */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[156 /* f64_floor */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[157 /* f64_trunc */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[158 /* f64_nearest */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[159 /* f64_sqrt */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[160 /* f64_add */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[161 /* f64_sub */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[162 /* f64_mul */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[163 /* f64_div */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[164 /* f64_min */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[165 /* f64_max */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[166 /* f64_copysign */] = 2 | 4 /* Push */ | 8 /* Simple */;
metaTable[167 /* i32_wrap_i64 */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[168 /* i32_trunc_f32_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[169 /* i32_trunc_f32_u */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[170 /* i32_trunc_f64_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[171 /* i32_trunc_f64_u */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[172 /* i64_extend_i32_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[173 /* i64_extend_i32_u */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[174 /* i64_trunc_f32_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[175 /* i64_trunc_f32_u */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[176 /* i64_trunc_f64_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[177 /* i64_trunc_f64_u */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[178 /* f32_convert_i32_s */] = 1 | 4 /* Push */ | 512 /* Omit */ | 8 /* Simple */;
metaTable[179 /* f32_convert_i32_u */] = 1 | 4 /* Push */ | 512 /* Omit */ | 8 /* Simple */ | 128 /* ToU32 */;
metaTable[180 /* f32_convert_i64_s */] = 1 | 4 /* Push */ | 8 /* Simple */ | 256 /* ToS64 */;
metaTable[181 /* f32_convert_i64_u */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[182 /* f32_demote_f64 */] = 1 | 4 /* Push */ | 512 /* Omit */ | 8 /* Simple */;
metaTable[183 /* f64_convert_i32_s */] = 1 | 4 /* Push */ | 512 /* Omit */ | 8 /* Simple */;
metaTable[184 /* f64_convert_i32_u */] = 1 | 4 /* Push */ | 512 /* Omit */ | 8 /* Simple */ | 128 /* ToU32 */;
metaTable[185 /* f64_convert_i64_s */] = 1 | 4 /* Push */ | 8 /* Simple */ | 256 /* ToS64 */;
metaTable[186 /* f64_convert_i64_u */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[187 /* f64_promote_f32 */] = 1 | 4 /* Push */ | 512 /* Omit */ | 8 /* Simple */;
metaTable[188 /* i32_reinterpret_f32 */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[189 /* i64_reinterpret_f64 */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[190 /* f32_reinterpret_i32 */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[191 /* f64_reinterpret_i64 */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[192 /* i32_extend8_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[193 /* i32_extend16_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[194 /* i64_extend8_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[195 /* i64_extend16_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
metaTable[196 /* i64_extend32_s */] = 1 | 4 /* Push */ | 8 /* Simple */;
var astBufferSingleton = new Int32Array(1 << 16);
var optimizeNode = compileOptimizations();
var compileCode = (funcs, funcTypes, table, globals, library, context, wasm, codeIndex, funcIndex) => {
    const readU32LEB = () => {
        let value = 0;
        let shift = 0;
        let byte;
        do {
            byte = bytes[bytesPtr++];
            value |= (byte & 127) << shift;
            shift += 7;
        } while (byte & 128);
        return value >>> 0;
    };
    const readI32LEB = () => {
        let value = 0;
        let shift = 0;
        let byte;
        do {
            byte = bytes[bytesPtr++];
            value |= (byte & 127) << shift;
            shift += 7;
        } while (byte & 128);
        return shift < 32 && byte & 64 ? value | ~0 << shift : value;
    };
    const readI64LEB = () => {
        let value = 0n;
        let shift = 0n;
        let byte;
        do {
            byte = bytes[bytesPtr++];
            value |= BigInt(byte & 127) << shift;
            shift += 7n;
        } while (byte & 128);
        return shift < 64 && byte & 64 ? value | ~0n << shift : value;
    };
    const readBlockType = () => {
        const byte = bytes[bytesPtr];
        if (byte === 64) {
            bytesPtr++;
            return [0, 0];
        }
        if (byte & 64) {
            bytesPtr++;
            return [0, 1];
        }
        const typeIndex = readU32LEB();
        const [argTypes2, returnTypes2] = typeSection[typeIndex];
        return [argTypes2.length, returnTypes2.length];
    };
    const ast = astBufferSingleton;
    const astPtrs = [];
    let astNextPtr = 0;
    const constants = [];
    let stackLimit = 0;
    const stackSlotName = (stackSlot) => {
        while (stackLimit < stackSlot)
            decls.push("s" + ++stackLimit);
        return "s" + stackSlot;
    };
    const load8 = (field, addr, offset) => {
        return `c.${field}[${emit(addr)}${offset ? "+" + offset : ""}]`;
    };
    const store8 = (field, addr, offset, value) => {
        return `c.${field}[${emit(addr)}${offset ? "+" + offset : ""}]=${value}`;
    };
    const load = (get, addr, offset) => {
        return `c.${"dv" /* DataView */}.get${get}(${emit(addr)}${offset ? "+" + offset : ""},1)`;
    };
    const store = (set, addr, offset, value) => {
        return `c.${"dv" /* DataView */}.set${set}(${emit(addr)}${offset ? "+" + offset : ""},${value},1)`;
    };
    const emit = (ptr) => {
        return ptr < 0 ? stackSlotName(-ptr) : `(${emitUnwrapped(ptr)})`;
    };
    const emitUnwrapped = (ptr) => {
        const node = ast[ptr];
        switch (node & 255 /* OpMask */) {
            case 0 /* i32_trunc_sat_f32_s */:
                return `l.${/* @__KEY__ */ "r"}(${emit(ast[ptr + 1])})`;
            case 1 /* i32_trunc_sat_f32_u */:
                return `l.${/* @__KEY__ */ "s"}(${emit(ast[ptr + 1])})`;
            case 2 /* i32_trunc_sat_f64_s */:
                return `l.${/* @__KEY__ */ "r"}(${emit(ast[ptr + 1])})`;
            case 3 /* i32_trunc_sat_f64_u */:
                return `l.${/* @__KEY__ */ "s"}(${emit(ast[ptr + 1])})`;
            case 4 /* i64_trunc_sat_f32_s */:
                return `l.${/* @__KEY__ */ "t"}(${emit(ast[ptr + 1])})`;
            case 5 /* i64_trunc_sat_f32_u */:
                return `l.${/* @__KEY__ */ "u"}(${emit(ast[ptr + 1])})`;
            case 6 /* i64_trunc_sat_f64_s */:
                return `l.${/* @__KEY__ */ "t"}(${emit(ast[ptr + 1])})`;
            case 7 /* i64_trunc_sat_f64_u */:
                return `l.${/* @__KEY__ */ "u"}(${emit(ast[ptr + 1])})`;
            case 10 /* memory_copy */:
                return `c.${"u8" /* Uint8Array */}.copyWithin(${emit(ast[ptr + 1])},T=${emit(ast[ptr + 2])},T+${emit(ast[ptr + 3])})`;
            case 11 /* memory_fill */:
                return `c.${"u8" /* Uint8Array */}.fill(${emit(ast[ptr + 1])},T=${emit(ast[ptr + 2])},T+${emit(ast[ptr + 3])})`;
            case 16 /* call */: {
                const childCount = node >> 8 /* ChildCountShift */ & 65535 /* ChildCountMask */;
                const funcIndex2 = ast[ptr + childCount + 1];
                const [argTypes2, returnTypes2] = funcTypes[funcIndex2];
                const args = [];
                for (let i = 1; i <= childCount; i++)
                    args.push(emit(ast[ptr + i]));
                const code = `f[${funcIndex2}](${args})`;
                if (returnTypes2.length < 2)
                    return code;
                const slot = ast[ptr + childCount + 2];
                const returns = [];
                for (let i = 0; i < returnTypes2.length; i++)
                    returns.push(stackSlotName(slot + i));
                return `[${returns}]=${code}`;
            }
            case 17 /* call_indirect */: {
                const childCount = node >> 8 /* ChildCountShift */ & 65535 /* ChildCountMask */;
                const typeIndex = ast[ptr + childCount + 2];
                const [argTypes2, returnTypes2] = typeSection[typeIndex];
                const args = [];
                const func = emit(ast[ptr + 1]);
                for (let i = 1; i <= childCount; i++)
                    args.push(emit(ast[ptr + i + 1]));
                const code = `t[${func}](${args})`;
                if (returnTypes2.length < 2)
                    return code;
                const slot = ast[ptr + childCount + 3];
                const returns = [];
                for (let i = 0; i < returnTypes2.length; i++)
                    returns.push(stackSlotName(slot + i));
                return `[${returns}]=${code}`;
            }
            case 27 /* select */:
                return `${emit(ast[ptr + 1])}?${emit(ast[ptr + 2])}:${emit(ast[ptr + 3])}`;
            case 32 /* local_get */:
                return names[ast[ptr + 1]];
            case 33 /* local_set */:
            case 34 /* local_tee */:
                return `${names[ast[ptr + 2]]}=${emit(ast[ptr + 1])}`;
            case 35 /* global_get */:
                return `g[${ast[ptr + 1]}]`;
            case 36 /* global_set */:
                return `g[${ast[ptr + 2]}]=${emit(ast[ptr + 1])}`;
            case 40 /* i32_load */:
                return load("Int32", ast[ptr + 1], ast[ptr + 2]);
            case 245 /* U32_LOAD */:
                return load("Uint32", ast[ptr + 1], ast[ptr + 2]);
            case 41 /* i64_load */:
                return load("BigUint64", ast[ptr + 1], ast[ptr + 2]);
            case 246 /* S64_LOAD */:
                return load("BigInt64", ast[ptr + 1], ast[ptr + 2]);
            case 42 /* f32_load */:
                return load("Float32", ast[ptr + 1], ast[ptr + 2]);
            case 43 /* f64_load */:
                return load("Float64", ast[ptr + 1], ast[ptr + 2]);
            case 44 /* i32_load8_s */:
                return load8("i8" /* Int8Array */, ast[ptr + 1], ast[ptr + 2]);
            case 45 /* i32_load8_u */:
                return load8("u8" /* Uint8Array */, ast[ptr + 1], ast[ptr + 2]);
            case 46 /* i32_load16_s */:
                return load("Int16", ast[ptr + 1], ast[ptr + 2]);
            case 47 /* i32_load16_u */:
                return load("Uint16", ast[ptr + 1], ast[ptr + 2]);
            case 48 /* i64_load8_s */:
                return `BigInt(${load8("i8" /* Int8Array */, ast[ptr + 1], ast[ptr + 2])})&0xFFFFFFFFFFFFFFFFn`;
            case 49 /* i64_load8_u */:
                return `BigInt(${load8("u8" /* Uint8Array */, ast[ptr + 1], ast[ptr + 2])})`;
            case 50 /* i64_load16_s */:
                return `BigInt(${load("Int16", ast[ptr + 1], ast[ptr + 2])})&0xFFFFFFFFFFFFFFFFn`;
            case 51 /* i64_load16_u */:
                return `BigInt(${load("Uint16", ast[ptr + 1], ast[ptr + 2])})`;
            case 52 /* i64_load32_s */:
                return `BigInt(${load("Int32", ast[ptr + 1], ast[ptr + 2])})&0xFFFFFFFFFFFFFFFFn`;
            case 53 /* i64_load32_u */:
                return `BigInt(${load("Uint32", ast[ptr + 1], ast[ptr + 2])})`;
            case 54 /* i32_store */:
                return store("Int32", ast[ptr + 1], ast[ptr + 3], emit(ast[ptr + 2]));
            case 55 /* i64_store */:
                return store("BigUint64", ast[ptr + 1], ast[ptr + 3], emit(ast[ptr + 2]));
            case 56 /* f32_store */:
                return store("Float32", ast[ptr + 1], ast[ptr + 3], emit(ast[ptr + 2]));
            case 57 /* f64_store */:
                return store("Float64", ast[ptr + 1], ast[ptr + 3], emit(ast[ptr + 2]));
            case 58 /* i32_store8 */:
                return store8("u8" /* Uint8Array */, ast[ptr + 1], ast[ptr + 3], emit(ast[ptr + 2]));
            case 59 /* i32_store16 */:
                return store("Int16", ast[ptr + 1], ast[ptr + 3], emit(ast[ptr + 2]));
            case 60 /* i64_store8 */:
                return store8("u8" /* Uint8Array */, ast[ptr + 1], ast[ptr + 3], `Number(${emit(ast[ptr + 2])}&255n)`);
            case 61 /* i64_store16 */:
                return store("Int16", ast[ptr + 1], ast[ptr + 3], `Number(${emit(ast[ptr + 2])}&65535n)`);
            case 62 /* i64_store32 */:
                return store("Int32", ast[ptr + 1], ast[ptr + 3], `Number(${emit(ast[ptr + 2])}&0xFFFFFFFFn)`);
            case 63 /* memory_size */: {
                if (ast[ptr + 1])
                    throw new Error("Unsupported non-zero memory index");
                return `c.${"pc" /* PageCount */}`;
            }
            case 64 /* memory_grow */: {
                if (ast[ptr + 2])
                    throw new Error("Unsupported non-zero memory index");
                return `c.${"pg" /* PageGrow */}(${emit(ast[ptr + 1])})`;
            }
            case 65 /* i32_const */:
                return ast[ptr + 1] + "";
            case 66 /* i64_const */:
                return (constants[ast[ptr + 1]] & 0xFFFFFFFFFFFFFFFFn) + "n";
            case 67 /* f32_const */:
                return dataView.getFloat32(ast[ptr + 1], true) + "";
            case 68 /* f64_const */:
                return dataView.getFloat64(ast[ptr + 1], true) + "";
            case 240 /* BOOL */:
                return emit(ast[ptr + 1]);
            case 241 /* BOOL_NOT */:
                return `!${emit(ast[ptr + 1])}`;
            case 242 /* BOOL_TO_INT */:
                return `${emit(ast[ptr + 1])}?1:0`;
            case 243 /* TO_U32 */:
                return `${emit(ast[ptr + 1])}>>>0`;
            case 244 /* TO_S64 */:
                return `l.${/* @__KEY__ */ "m"}(${emit(ast[ptr + 1])})`;
            case 69 /* i32_eqz */:
            case 80 /* i64_eqz */:
                return `${emit(ast[ptr + 1])}?0:1`;
            case 70 /* i32_eq */:
            case 81 /* i64_eq */:
            case 91 /* f32_eq */:
            case 97 /* f64_eq */:
                return `${emit(ast[ptr + 1])}===${emit(ast[ptr + 2])}`;
            case 71 /* i32_ne */:
            case 82 /* i64_ne */:
            case 92 /* f32_ne */:
            case 98 /* f64_ne */:
                return `${emit(ast[ptr + 1])}!==${emit(ast[ptr + 2])}`;
            case 72 /* i32_lt_s */:
            case 73 /* i32_lt_u */:
            case 83 /* i64_lt_s */:
            case 84 /* i64_lt_u */:
            case 93 /* f32_lt */:
            case 99 /* f64_lt */:
                return `${emit(ast[ptr + 1])}<${emit(ast[ptr + 2])}`;
            case 74 /* i32_gt_s */:
            case 75 /* i32_gt_u */:
            case 85 /* i64_gt_s */:
            case 86 /* i64_gt_u */:
            case 94 /* f32_gt */:
            case 100 /* f64_gt */:
                return `${emit(ast[ptr + 1])}>${emit(ast[ptr + 2])}`;
            case 76 /* i32_le_s */:
            case 77 /* i32_le_u */:
            case 87 /* i64_le_s */:
            case 88 /* i64_le_u */:
            case 95 /* f32_le */:
            case 101 /* f64_le */:
                return `${emit(ast[ptr + 1])}<=${emit(ast[ptr + 2])}`;
            case 78 /* i32_ge_s */:
            case 79 /* i32_ge_u */:
            case 89 /* i64_ge_s */:
            case 90 /* i64_ge_u */:
            case 96 /* f32_ge */:
            case 102 /* f64_ge */:
                return `${emit(ast[ptr + 1])}>=${emit(ast[ptr + 2])}`;
            case 103 /* i32_clz */:
                return `Math.clz32(${emit(ast[ptr + 1])})`;
            case 104 /* i32_ctz */:
                return `l.${/* @__KEY__ */ "J"}(${emit(ast[ptr + 1])})`;
            case 105 /* i32_popcnt */:
                return `l.${/* @__KEY__ */ "K"}(${emit(ast[ptr + 1])})`;
            case 106 /* i32_add */:
                return `${emit(ast[ptr + 1])}+${emit(ast[ptr + 2])}|0`;
            case 107 /* i32_sub */:
                return `${emit(ast[ptr + 1])}-${emit(ast[ptr + 2])}|0`;
            case 108 /* i32_mul */:
                return `Math.imul(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 110 /* i32_div_u */:
            case 109 /* i32_div_s */:
                return `${emit(ast[ptr + 1])}/${emit(ast[ptr + 2])}|0`;
            case 112 /* i32_rem_u */:
            case 111 /* i32_rem_s */:
                return `${emit(ast[ptr + 1])}%${emit(ast[ptr + 2])}|0`;
            case 113 /* i32_and */:
                return `${emit(ast[ptr + 1])}&${emit(ast[ptr + 2])}`;
            case 114 /* i32_or */:
                return `${emit(ast[ptr + 1])}|${emit(ast[ptr + 2])}`;
            case 115 /* i32_xor */:
                return `${emit(ast[ptr + 1])}^${emit(ast[ptr + 2])}`;
            case 116 /* i32_shl */:
                return `${emit(ast[ptr + 1])}<<${emit(ast[ptr + 2])}`;
            case 117 /* i32_shr_s */:
                return `${emit(ast[ptr + 1])}>>${emit(ast[ptr + 2])}`;
            case 118 /* i32_shr_u */:
                return `${emit(ast[ptr + 1])}>>>${emit(ast[ptr + 2])}|0`;
            case 119 /* i32_rotl */:
                return `l.${/* @__KEY__ */ "L"}(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 120 /* i32_rotr */:
                return `l.${/* @__KEY__ */ "M"}(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 121 /* i64_clz */:
                return `l.${/* @__KEY__ */ "N"}(${emit(ast[ptr + 1])})`;
            case 122 /* i64_ctz */:
                return `l.${/* @__KEY__ */ "O"}(${emit(ast[ptr + 1])})`;
            case 123 /* i64_popcnt */:
                return `l.${/* @__KEY__ */ "P"}(${emit(ast[ptr + 1])})`;
            case 124 /* i64_add */:
                return `(${emit(ast[ptr + 1])}+${emit(ast[ptr + 2])})&0xFFFFFFFFFFFFFFFFn`;
            case 125 /* i64_sub */:
                return `(${emit(ast[ptr + 1])}-${emit(ast[ptr + 2])})&0xFFFFFFFFFFFFFFFFn`;
            case 126 /* i64_mul */:
                return `(${emit(ast[ptr + 1])}*${emit(ast[ptr + 2])})&0xFFFFFFFFFFFFFFFFn`;
            case 127 /* i64_div_s */:
                return `${emit(ast[ptr + 1])}/${emit(ast[ptr + 2])}&0xFFFFFFFFFFFFFFFFn`;
            case 128 /* i64_div_u */:
                return `${emit(ast[ptr + 1])}/${emit(ast[ptr + 2])}`;
            case 129 /* i64_rem_s */:
                return `${emit(ast[ptr + 1])}%${emit(ast[ptr + 2])}&0xFFFFFFFFFFFFFFFFn`;
            case 130 /* i64_rem_u */:
                return `${emit(ast[ptr + 1])}%${emit(ast[ptr + 2])}`;
            case 131 /* i64_and */:
                return `${emit(ast[ptr + 1])}&${emit(ast[ptr + 2])}`;
            case 132 /* i64_or */:
                return `${emit(ast[ptr + 1])}|${emit(ast[ptr + 2])}`;
            case 133 /* i64_xor */:
                return `${emit(ast[ptr + 1])}^${emit(ast[ptr + 2])}`;
            case 134 /* i64_shl */:
                return `${emit(ast[ptr + 1])}<<${emit(ast[ptr + 2])}&0xFFFFFFFFFFFFFFFFn`;
            case 135 /* i64_shr_s */:
                return `l.${/* @__KEY__ */ "m"}(${emit(ast[ptr + 1])})>>${emit(ast[ptr + 2])}&0xFFFFFFFFFFFFFFFFn`;
            case 136 /* i64_shr_u */:
                return `${emit(ast[ptr + 1])}>>${emit(ast[ptr + 2])}`;
            case 137 /* i64_rotl */:
                return `l.${/* @__KEY__ */ "Q"}(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 138 /* i64_rotr */:
                return `l.${/* @__KEY__ */ "R"}(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 139 /* f32_abs */:
            case 153 /* f64_abs */:
                return `Math.abs(${emit(ast[ptr + 1])})`;
            case 140 /* f32_neg */:
            case 154 /* f64_neg */:
                return `-${emit(ast[ptr + 1])}`;
            case 141 /* f32_ceil */:
            case 155 /* f64_ceil */:
                return `Math.ceil(${emit(ast[ptr + 1])})`;
            case 142 /* f32_floor */:
            case 156 /* f64_floor */:
                return `Math.floor(${emit(ast[ptr + 1])})`;
            case 143 /* f32_trunc */:
            case 157 /* f64_trunc */:
                return `Math.trunc(${emit(ast[ptr + 1])})`;
            case 144 /* f32_nearest */:
            case 158 /* f64_nearest */:
                return `Math.round(${emit(ast[ptr + 1])})`;
            case 145 /* f32_sqrt */:
            case 159 /* f64_sqrt */:
                return `Math.sqrt(${emit(ast[ptr + 1])})`;
            case 146 /* f32_add */:
            case 160 /* f64_add */:
                return `${emit(ast[ptr + 1])}+${emit(ast[ptr + 2])}`;
            case 147 /* f32_sub */:
            case 161 /* f64_sub */:
                return `${emit(ast[ptr + 1])}-${emit(ast[ptr + 2])}`;
            case 148 /* f32_mul */:
            case 162 /* f64_mul */:
                return `${emit(ast[ptr + 1])}*${emit(ast[ptr + 2])}`;
            case 149 /* f32_div */:
            case 163 /* f64_div */:
                return `${emit(ast[ptr + 1])}/${emit(ast[ptr + 2])}`;
            case 150 /* f32_min */:
            case 164 /* f64_min */:
                return `Math.min(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 151 /* f32_max */:
            case 165 /* f64_max */:
                return `Math.max(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 152 /* f32_copysign */:
            case 166 /* f64_copysign */:
                return `l.${/* @__KEY__ */ "S"}(${emit(ast[ptr + 1])},${emit(ast[ptr + 2])})`;
            case 167 /* i32_wrap_i64 */:
                return `Number(${emit(ast[ptr + 1])}&0xFFFFFFFFn)|0`;
            case 168 /* i32_trunc_f32_s */:
            case 169 /* i32_trunc_f32_u */:
            case 170 /* i32_trunc_f64_s */:
            case 171 /* i32_trunc_f64_u */:
                return `Math.trunc(${emit(ast[ptr + 1])})|0`;
            case 172 /* i64_extend_i32_s */:
                return `BigInt(${emit(ast[ptr + 1])})`;
            case 173 /* i64_extend_i32_u */:
                return `BigInt(${emit(ast[ptr + 1])}>>>0)`;
            case 174 /* i64_trunc_f32_s */:
            case 175 /* i64_trunc_f32_u */:
            case 176 /* i64_trunc_f64_s */:
            case 177 /* i64_trunc_f64_u */:
                return `BigInt(Math.trunc(${emit(ast[ptr + 1])}))&0xFFFFFFFFFFFFFFFFn`;
            case 180 /* f32_convert_i64_s */:
            case 181 /* f32_convert_i64_u */:
            case 186 /* f64_convert_i64_u */:
            case 185 /* f64_convert_i64_s */:
                return `Number(${emit(ast[ptr + 1])})`;
            case 188 /* i32_reinterpret_f32 */:
                return `l.${/* @__KEY__ */ "T"}(${emit(ast[ptr + 1])})`;
            case 189 /* i64_reinterpret_f64 */:
                return `l.${/* @__KEY__ */ "U"}(${emit(ast[ptr + 1])})`;
            case 190 /* f32_reinterpret_i32 */:
                return `l.${/* @__KEY__ */ "V"}(${emit(ast[ptr + 1])})`;
            case 191 /* f64_reinterpret_i64 */:
                return `l.${/* @__KEY__ */ "W"}(${emit(ast[ptr + 1])})`;
            case 192 /* i32_extend8_s */:
                return `${emit(ast[ptr + 1])}<<24>>24`;
            case 193 /* i32_extend16_s */:
                return `${emit(ast[ptr + 1])}<<16>>16`;
            case 194 /* i64_extend8_s */:
                return `l.${/* @__KEY__ */ "X"}(${emit(ast[ptr + 1])})`;
            case 195 /* i64_extend16_s */:
                return `l.${/* @__KEY__ */ "Y"}(${emit(ast[ptr + 1])})`;
            case 196 /* i64_extend32_s */:
                return `l.${/* @__KEY__ */ "Z"}(${emit(ast[ptr + 1])})`;
            default:
                throw "Internal error";
        }
    };
    const allocateNode = (node, length) => {
        const ptr = astNextPtr;
        ast[ptr] = node;
        astNextPtr += length;
        return ptr;
    };
    const pushUnary = (op, stackSlot = stackTop) => {
        astPtrs.push(astNextPtr);
        ast[astNextPtr++] = op | 1 << 8 /* ChildCountShift */ | stackSlot << 24 /* OutSlotShift */;
        ast[astNextPtr++] = -stackSlot;
    };
    const finalizeBasicBlock = (popStackTop = false) => {
        const parts = [];
        let i = astPtrs.length - 1;
        const optimizeChildrenAndSelf = (ptr2) => {
            const node = ast[ptr2];
            const op = node & 255 /* OpMask */;
            const childCount = node >> 8 /* ChildCountShift */ & 65535 /* ChildCountMask */;
            const usesTypedArrays = op >= 40 /* i32_load */ && op <= 62 /* i64_store32 */ || op === 10 /* memory_copy */ || op === 11 /* memory_fill */;
            for (let j = childCount - 1; i >= 0 && j >= 0; j--) {
                const stackSlot = -ast[ptr2 + j + 1];
                let didSkip = false;
                for (let k = i; k >= 0; k--) {
                    const prevPtr = astPtrs[k];
                    if (prevPtr === null)
                        continue;
                    const prevNode = ast[prevPtr];
                    const prevOp = prevNode & 255 /* OpMask */;
                    if (usesTypedArrays && // The only exception we make is for nodes that are trivially safe,
                        // which include terminal nodes without any children that don't
                        // have side effects. The common ones are special-cased below.
                        (prevOp < 65 /* i32_const */ || prevOp > 66 /* i64_const */) && prevOp != 32 /* local_get */) {
                        break;
                    }
                    if (prevNode >>> 24 /* OutSlotShift */ === stackSlot) {
                        astPtrs[k] = null;
                        if (!didSkip)
                            i = k - 1;
                        ast[ptr2 + j + 1] = optimizeChildrenAndSelf(prevPtr);
                        break;
                    }
                    if (prevOp !== 243 /* TO_U32 */ && prevOp !== 244 /* TO_S64 */)
                        break;
                    didSkip = true;
                }
            }
            return optimizeNode(ast, constants, allocateNode, ptr2);
        };
        let ptr;
        while (i >= 0) {
            const index = i--;
            if ((ptr = astPtrs[index]) !== null) {
                astPtrs[index] = optimizeChildrenAndSelf(ptr);
            }
        }
        let result;
        i = astPtrs.length - 1;
        if (popStackTop) {
            if (i >= 0 && (ptr = astPtrs[i]) !== null && ast[ptr] >>> 24 /* OutSlotShift */ === stackTop) {
                result = emitUnwrapped(ptr);
                i--;
            } else {
                result = "s" + stackTop;
            }
            stackTop--;
        }
        while (i >= 0) {
            if ((ptr = astPtrs[i--]) !== null) {
                const stackSlot = ast[ptr] >>> 24 /* OutSlotShift */;
                parts.push(`${stackSlot ? stackSlotName(stackSlot) + "=" : ""}${emitUnwrapped(ptr)};`);
            }
        }
        body += parts.reverse().join("");
        constants.length = 0;
        astPtrs.length = 0;
        astNextPtr = 0;
        return result;
    };
    const {
        y: bytes,
        z: dataView,
        o: codeSection,
        p: functionSection,
        G: nameSection,
        q: typeSection
    } = wasm;
    const [argTypes, returnTypes] = typeSection[functionSection[codeIndex]];
    const [locals, codeStart, codeEnd] = codeSection[codeIndex];
    const names = [];
    const argCount = argTypes.length;
    for (let i = 0; i < argCount; i++) {
        names.push("a" + i);
    }
    const decls = ["L", "T"];
    for (const [count, type] of locals) {
        for (let i = 0; i < count; i++) {
            const name2 = "t" + decls.length;
            names.push(name2);
            decls.push(name2 + (type === 126 /* I64 */ ? "=0n" : "=0"));
        }
    }
    const blockDepthLimit = 256;
    const pushBlock = (kind) => {
        const isBelowLimit = blocks.length < blockDepthLimit;
        if (isBelowLimit) {
            body += `b${blocks.length}:`;
        } else if (blocks.length === blockDepthLimit) {
            body += `L=1;b${blocks.length}:for(;;){switch(L){case 1:`;
            nextLabel = 2;
        }
        const labelBreak = isBelowLimit ? -1 : nextLabel++;
        const labelContinueOrElse = isBelowLimit ? -1 : kind !== 0 /* Normal */ ? nextLabel++ : 0;
        const [argCount2, returnCount] = readBlockType();
        blocks.push({
            i: argCount2,
            c: false,
            j: kind,
            n: labelBreak,
            h: labelContinueOrElse,
            g: stackTop - argCount2,
            f: returnCount
        });
        return labelContinueOrElse;
    };
    const jump = (index = blocks.length - readU32LEB() - 1) => {
        if (blocks[blocks.length - 1].c)
            return;
        const block = blocks[index];
        if (!index) {
            if (block.f === 1) {
                body += `return s${stackTop};`;
            } else if (block.f > 1) {
                const values = [];
                for (let i = block.f - 1; i >= 0; i--)
                    values.push("s" + (stackTop - i));
                body += `return[${values}];`;
            } else {
                body += `return;`;
            }
        } else if (block.j === 1 /* Loop */) {
            if (stackTop > block.g + block.i) {
                for (let i = 1; i <= block.i; i++) {
                    body += `s${block.g + i}=s${stackTop - block.i + i};`;
                }
            }
            body += index < blockDepthLimit ? `continue b${index};` : `L=${block.h};continue;`;
        } else {
            if (stackTop > block.g + block.f) {
                for (let i = 1; i <= block.f; i++) {
                    body += `s${block.g + i}=s${stackTop - block.f + i};`;
                }
            }
            body += index <= blockDepthLimit ? `break b${index};` : `L=${block.n};continue;`;
        }
    };
    const blocks = [{
        i: 0,
        c: false,
        j: 0 /* Normal */,
        n: -1,
        h: -1,
        g: 0,
        f: returnTypes.length
    }];
    let stackTop = 0;
    let bytesPtr = codeStart;
    let nextLabel = 0;
    let body = "b0:{";
    while (bytesPtr < codeEnd) {
        let op = bytes[bytesPtr++];
        const flags = metaTable[op];
        if (flags & 8 /* Simple */) {
            if (!blocks[blocks.length - 1].c) {
                const childCount = flags & 3 /* PopMask */;
                if (flags & 1024 /* And63 */) {
                    astPtrs.push(astNextPtr);
                    ast[astNextPtr++] = 66 /* i64_const */ | stackTop + 1 << 24 /* OutSlotShift */;
                    ast[astNextPtr++] = constants.length;
                    constants.push(63n);
                    astPtrs.push(astNextPtr);
                    ast[astNextPtr++] = 131 /* i64_and */ | 2 << 8 /* ChildCountShift */ | stackTop << 24 /* OutSlotShift */;
                    ast[astNextPtr++] = -stackTop;
                    ast[astNextPtr++] = -(stackTop + 1);
                }
                stackTop -= childCount;
                if (flags & (128 /* ToU32 */ | 256 /* ToS64 */)) {
                    for (let i = 0; i < childCount; i++) {
                        pushUnary(flags & 128 /* ToU32 */ ? 243 /* TO_U32 */ : 244 /* TO_S64 */, stackTop + i + 1);
                    }
                }
                if (!(flags & 512 /* Omit */)) {
                    if (flags & 32 /* HasAlign */)
                        bytesPtr++;
                    astPtrs.push(astNextPtr);
                    if (flags & 4 /* Push */)
                        op |= stackTop + 1 << 24 /* OutSlotShift */;
                    ast[astNextPtr++] = op | childCount << 8 /* ChildCountShift */;
                    for (let i = 1; i <= childCount; i++)
                        ast[astNextPtr++] = -(stackTop + i);
                    if (flags & 16 /* HasIndex */)
                        ast[astNextPtr++] = readU32LEB();
                }
                if (flags & 4 /* Push */)
                    stackTop++;
                if (flags & 64 /* BoolToInt */)
                    pushUnary(242 /* BOOL_TO_INT */);
            } else {
                if (flags & 32 /* HasAlign */)
                    bytesPtr++;
                if (flags & 16 /* HasIndex */)
                    readU32LEB();
            }
        } else {
            switch (op) {
                case 0 /* unreachable */: {
                    const block = blocks[blocks.length - 1];
                    finalizeBasicBlock();
                    if (!block.c) {
                        body += '"unreachable"();';
                        block.c = true;
                    }
                    break;
                }
                case 2 /* block */:
                    finalizeBasicBlock();
                    if (pushBlock(0 /* Normal */) < 0)
                        body += "{";
                    break;
                case 3 /* loop */: {
                    finalizeBasicBlock();
                    const label = pushBlock(1 /* Loop */);
                    body += label < 0 ? "for(;;){" : `case ${label}:`;
                    break;
                }
                case 4 /* if */: {
                    if (!blocks[blocks.length - 1].c) {
                        pushUnary(blocks.length < blockDepthLimit ? 240 /* BOOL */ : 241 /* BOOL_NOT */);
                    }
                    const test = finalizeBasicBlock(true);
                    const label = pushBlock(2 /* IfElse */);
                    body += label < 0 ? `if(${test}){` : `if(${test}){L=${label};continue}`;
                    break;
                }
                case 5 /* else */: {
                    finalizeBasicBlock();
                    const index = blocks.length - 1, block = blocks[index];
                    jump(index);
                    body += index < blockDepthLimit ? "}else{" : `case ${block.h}:`;
                    block.j = 0 /* Normal */;
                    stackTop = block.g + block.i;
                    block.c = false;
                    break;
                }
                case 11 /* end */: {
                    finalizeBasicBlock();
                    const index = blocks.length - 1, block = blocks[index];
                    if (block.j !== 2 /* IfElse */)
                        block.h = 0;
                    block.j = 0 /* Normal */;
                    jump(index);
                    if (index < blockDepthLimit) {
                        body += `}`;
                    } else {
                        if (block.h)
                            body += `case ${block.h}:`;
                        body += `case ${block.n}:`;
                        if (index == blockDepthLimit)
                            body += `}break}`;
                    }
                    stackTop = block.g + block.f;
                    blocks.pop();
                    break;
                }
                case 12 /* br */:
                    finalizeBasicBlock();
                    jump();
                    blocks[blocks.length - 1].c = true;
                    break;
                case 13 /* br_if */: {
                    if (!blocks[blocks.length - 1].c)
                        pushUnary(240 /* BOOL */);
                    const test = finalizeBasicBlock(true);
                    body += `if(${test}){`;
                    jump();
                    body += "}";
                    break;
                }
                case 14 /* br_table */: {
                    const test = finalizeBasicBlock(true);
                    body += `switch(${test}){`;
                    for (let i = 0, tableCount = readU32LEB(); i < tableCount; i++) {
                        body += `case ${i}:`;
                        jump();
                    }
                    body += "default:";
                    jump();
                    body += "}";
                    blocks[blocks.length - 1].c = true;
                    break;
                }
                case 15 /* return */:
                    finalizeBasicBlock();
                    jump(0);
                    blocks[blocks.length - 1].c = true;
                    break;
                case 16 /* call */: {
                    const funcIndex2 = readU32LEB();
                    if (!blocks[blocks.length - 1].c) {
                        const [argTypes2, returnTypes2] = funcTypes[funcIndex2];
                        stackTop -= argTypes2.length;
                        astPtrs.push(astNextPtr);
                        if (returnTypes2.length === 1)
                            op |= stackTop + 1 << 24 /* OutSlotShift */;
                        ast[astNextPtr++] = op | argTypes2.length << 8 /* ChildCountShift */;
                        for (let i = 1; i <= argTypes2.length; i++)
                            ast[astNextPtr++] = -(stackTop + i);
                        ast[astNextPtr++] = funcIndex2;
                        if (returnTypes2.length > 1)
                            ast[astNextPtr++] = stackTop + 1;
                        stackTop += returnTypes2.length;
                    }
                    break;
                }
                case 17 /* call_indirect */: {
                    const typeIndex = readU32LEB();
                    const tableIndex = readU32LEB();
                    if (tableIndex !== 0)
                        throw new Error("Unsupported table index: " + tableIndex);
                    if (!blocks[blocks.length - 1].c) {
                        const [argTypes2, returnTypes2] = typeSection[typeIndex];
                        stackTop -= argTypes2.length + 1;
                        astPtrs.push(astNextPtr);
                        if (returnTypes2.length === 1)
                            op |= stackTop + 1 << 24 /* OutSlotShift */;
                        ast[astNextPtr++] = op | argTypes2.length << 8 /* ChildCountShift */;
                        ast[astNextPtr++] = -(stackTop + argTypes2.length + 1);
                        for (let i = 1; i <= argTypes2.length; i++)
                            ast[astNextPtr++] = -(stackTop + i);
                        ast[astNextPtr++] = typeIndex;
                        if (returnTypes2.length > 1)
                            ast[astNextPtr++] = stackTop + 1;
                        stackTop += returnTypes2.length;
                    }
                    break;
                }
                case 27 /* select */: {
                    if (!blocks[blocks.length - 1].c) {
                        pushUnary(240 /* BOOL */);
                        stackTop -= 2;
                        astPtrs.push(astNextPtr);
                        ast[astNextPtr++] = op | 3 << 8 /* ChildCountShift */ | stackTop << 24 /* OutSlotShift */;
                        ast[astNextPtr++] = -(stackTop + 2);
                        ast[astNextPtr++] = -stackTop;
                        ast[astNextPtr++] = -(stackTop + 1);
                    }
                    break;
                }
                case 65 /* i32_const */:
                    if (!blocks[blocks.length - 1].c) {
                        astPtrs.push(astNextPtr);
                        ast[astNextPtr++] = op | ++stackTop << 24 /* OutSlotShift */;
                        ast[astNextPtr++] = readI32LEB();
                    } else {
                        readI32LEB();
                    }
                    break;
                case 66 /* i64_const */:
                    if (!blocks[blocks.length - 1].c) {
                        astPtrs.push(astNextPtr);
                        ast[astNextPtr++] = op | ++stackTop << 24 /* OutSlotShift */;
                        ast[astNextPtr++] = constants.length;
                        constants.push(readI64LEB());
                    } else {
                        readI64LEB();
                    }
                    break;
                case 67 /* f32_const */:
                    if (!blocks[blocks.length - 1].c) {
                        astPtrs.push(astNextPtr);
                        ast[astNextPtr++] = op | ++stackTop << 24 /* OutSlotShift */;
                        ast[astNextPtr++] = bytesPtr;
                    }
                    bytesPtr += 4;
                    break;
                case 68 /* f64_const */:
                    if (!blocks[blocks.length - 1].c) {
                        astPtrs.push(astNextPtr);
                        ast[astNextPtr++] = op | ++stackTop << 24 /* OutSlotShift */;
                        ast[astNextPtr++] = bytesPtr;
                    }
                    bytesPtr += 8;
                    break;
                case 252:
                    op = bytes[bytesPtr++];
                    if (op <= 7 /* i64_trunc_sat_f64_u */) {
                        if (!blocks[blocks.length - 1].c) {
                            pushUnary(op);
                        }
                    } else if (op === 10 /* memory_copy */) {
                        if (bytes[bytesPtr++] || bytes[bytesPtr++])
                            throw new Error("Unsupported non-zero memory index");
                        if (!blocks[blocks.length - 1].c) {
                            stackTop -= 2;
                            astPtrs.push(astNextPtr);
                            ast[astNextPtr++] = op | 3 << 8 /* ChildCountShift */ | stackTop << 24 /* OutSlotShift */;
                            ast[astNextPtr++] = -stackTop;
                            ast[astNextPtr++] = -(stackTop + 1);
                            ast[astNextPtr++] = -(stackTop + 2);
                        }
                    } else if (op === 11 /* memory_fill */) {
                        if (bytes[bytesPtr++])
                            throw new Error("Unsupported non-zero memory index");
                        if (!blocks[blocks.length - 1].c) {
                            stackTop -= 2;
                            astPtrs.push(astNextPtr);
                            ast[astNextPtr++] = op | 3 << 8 /* ChildCountShift */ | stackTop << 24 /* OutSlotShift */;
                            ast[astNextPtr++] = -(stackTop + 1);
                            ast[astNextPtr++] = -stackTop;
                            ast[astNextPtr++] = -(stackTop + 2);
                        }
                    } else {
                        throw new Error("Unsupported instruction: 0xFC" + op.toString(16).padStart(2, "0"));
                    }
                    break;
                default:
                    throw new Error("Unsupported instruction: 0x" + op.toString(16).padStart(2, "0"));
            }
        }
    }
    if (stackLimit > 255)
        throw new Error("Deep stacks are not supported");
    const name = JSON.stringify("wasm:" + (nameSection.get(funcIndex) || `function[${codeIndex}]`));
    const js = `return{${name}(${names.slice(0, argCount)}){var ${decls};${body}}}[${name}]`;
    return new Function("f", "c", "t", "g", "l", js)(funcs, context, table, globals, library);
};

// src/library.ts
var createLibrary = () => {
    const buffer = new ArrayBuffer(8);
    const f32 = new Float32Array(buffer);
    const f64 = new Float64Array(buffer);
    const i32 = new Int32Array(buffer);
    const i64 = new BigInt64Array(buffer);
    const u64 = new BigUint64Array(buffer);
    return {
        S(x, y) {
            return (x < 0 || x === 0 && Object.is(x, -0)) !== (y < 0 || y === 0 && Object.is(y, -0)) ? -x : x;
        },
        m(x) {
            u64[0] = x;
            return i64[0];
        },
        T(x) {
            f32[0] = x;
            return i32[0];
        },
        V(x) {
            i32[0] = x;
            return f32[0];
        },
        U(x) {
            f64[0] = x;
            return u64[0];
        },
        W(x) {
            u64[0] = x;
            return f64[0];
        },
        L(x, y) {
            return x << y | x >>> 32 - y;
        },
        M(x, y) {
            return x >>> y | x << 32 - y;
        },
        Q(x, y) {
            return (x << y | x >> 64n - y) & 0xFFFFFFFFFFFFFFFFn;
        },
        R(x, y) {
            return (x >> y | x << 64n - y) & 0xFFFFFFFFFFFFFFFFn;
        },
        J(x) {
            return x ? Math.clz32(x & -x) ^ 31 : 32;
        },
        K(x) {
            let count = 0;
            while (x) {
                count++;
                x &= x - 1;
            }
            return count;
        },
        N(x) {
            let count = Math.clz32(Number(x >> 32n & 0xFFFFFFFFn));
            if (count === 32)
                count += Math.clz32(Number(x & 0xFFFFFFFFn));
            return BigInt(count);
        },
        O(x) {
            let y = Number(x & 0xFFFFFFFFn);
            if (y)
                return BigInt(Math.clz32(y & -y) ^ 31);
            y = Number(x >> 32n & 0xFFFFFFFFn);
            return y ? BigInt(32 + Math.clz32(y & -y) ^ 31) : 64n;
        },
        P(x) {
            let count = 0n;
            while (x) {
                count++;
                x &= x - 1n;
            }
            return count;
        },
        r(x) {
            x = Math.trunc(x);
            return x >= 2147483647 ? 2147483647 : x <= -2147483648 ? -2147483648 : x | 0;
        },
        s(x) {
            x = Math.trunc(x);
            return x >= 4294967295 ? -1 : x <= 0 ? 0 : x | 0;
        },
        t(x) {
            x = Math.trunc(x);
            return x >= 9223372036854776e3 ? 0x7FFFFFFFFFFFFFFFn : x <= -9223372036854776e3 ? 0x8000000000000000n : x === x ? BigInt(x) & 0xFFFFFFFFFFFFFFFFn : 0n;
        },
        u(x) {
            x = Math.trunc(x);
            return x >= 18446744073709552e3 ? 0xFFFFFFFFFFFFFFFFn : !(x > 0) ? 0n : (
                // NaN must become 0
                BigInt(x)
            );
        },
        X(x) {
            return x & 0x80n ? x | 0xFFFFFFFFFFFFFF00n : x & 0xFFn;
        },
        Y(x) {
            return x & 0x8000n ? x | 0xFFFFFFFFFFFF0000n : x & 0xFFFFn;
        },
        Z(x) {
            return x & 0x80000000n ? x | 0xFFFFFFFF00000000n : x & 0xFFFFFFFFn;
        }
    };
};

// src/instantiate.ts
var Global = class {
};
var Memory = class {
};
var Table = class {
};
var Context2 = class {
};
var resetContext = (context, buffer, bytes = new Uint8Array(buffer)) => {
    context["i8" /* Int8Array */] = new Int8Array(buffer);
    context["u8" /* Uint8Array */] = bytes;
    context["dv" /* DataView */] = new DataView(buffer);
};
var growContext = (context, pagesDelta) => {
    const pageCount = context["pc" /* PageCount */];
    pagesDelta >>>= 0;
    if (pageCount + pagesDelta > context.v)
        return -1;
    if (pagesDelta) {
        const buffer = context._.buffer = new ArrayBuffer((context["pc" /* PageCount */] += pagesDelta) << 16);
        const oldBytes = context["u8" /* Uint8Array */];
        const bytes = new Uint8Array(buffer);
        bytes.set(oldBytes);
        resetContext(context, buffer, bytes);
        try {
            structuredClone(oldBytes.buffer, { transfer: [oldBytes.buffer] });
        } catch {
        }
    }
    return pageCount;
};
var Instance = class {
    constructor(module, importObject) {
        const wasm = moduleMap.get(module);
        const {
            o: codeSection,
            A: dataSection,
            B: elementSection,
            C: exportSection,
            p: functionSection,
            D: globalSection,
            E: importSection,
            F: memorySection,
            H: startSection,
            I: tableSection,
            q: typeSection
        } = wasm;
        const exports = this.exports = {};
        const funcs = [];
        const funcTypes = [];
        const globals = [];
        const globalTypes = [];
        const tables = [];
        const library = createLibrary();
        const context = new Context2();
        const memory = context._ = new Memory();
        if (memorySection.length > 1)
            throw new Error(`Unsupported memory count: ${memorySection.length}`);
        if (memorySection.length > 0) {
            const [memoryMin, memoryMax] = memorySection[0];
            context.v = Math.min(memoryMax, 65535);
            context["pc" /* PageCount */] = memoryMin;
        } else {
            context.v = 0;
            context["pc" /* PageCount */] = 0;
        }
        const grow = context["pg" /* PageGrow */] = (pagesDelta) => growContext(context, pagesDelta);
        memory.grow = (pagesDelta) => {
            const pageCount = grow(pagesDelta);
            if (pageCount < 0)
                throw new RangeError("Cannot grow past limit");
            return pageCount;
        };
        resetContext(context, memory.buffer = new ArrayBuffer(context["pc" /* PageCount */] << 16));
        for (const [index, offset, data] of dataSection) {
            if (index !== 0)
                throw new Error(`Invalid memory index: ${index}`);
            context["u8" /* Uint8Array */].set(data, offset);
        }
        for (const tuple of importSection) {
            const [module2, name, desc, payload] = tuple;
            const value = importObject[module2][name];
            if (desc === 0 /* Func */) {
                const funcType = typeSection[payload];
                const [argTypes, returnTypes] = funcType;
                const argNames = [];
                const argExprs = [];
                for (let i = 0; i < argTypes.length; i++) {
                    argNames.push("a" + i);
                    argExprs.push(castToJS("a" + i, argTypes[i]));
                }
                let result = `f(${argExprs})`;
                if (returnTypes.length === 1) {
                    result = "return " + castToWASM(result, returnTypes[0]);
                } else if (returnTypes.length > 1) {
                    result = `let r=${result};`;
                    for (let i = 0; i < returnTypes.length; i++)
                        result += `r[${i}]=${castToWASM(`r[${i}]`, returnTypes[i])};`;
                    result += "return r";
                }
                funcs.push(new Function("f", "l", `return(${argNames})=>{${result}}`)(value, library));
                funcTypes.push(funcType);
            } else if (desc === 3 /* Global */) {
                globals.push(liveCastToWASM(value, payload));
                globalTypes.push(payload);
            } else {
                throw new Error(`Unsupported import type ${desc} for "${module2}"."${name}"`);
            }
        }
        for (const [type, mutable, initializer] of globalSection) {
            globals.push(initializer(globals));
            globalTypes.push(type);
        }
        for (let i = 0; i < codeSection.length; i++) {
            const index = funcs.length;
            funcTypes.push(typeSection[functionSection[i]]);
            funcs.push((...args) => {
                return (funcs[index] = compileCode(funcs, funcTypes, tables[0], globals, library, context, wasm, i, index))(...args);
            });
        }
        for (const [type, min, max] of tableSection) {
            const table = [];
            for (let i = 0; i < min; i++)
                table.push(null);
            tables.push(table);
        }
        for (let [offset, indices] of elementSection) {
            if (tables.length !== 1)
                throw new Error("Multiple tables are unsupported");
            const table = tables[0];
            for (const index of indices) {
                const i = offset++;
                table[i] = (...args) => {
                    const result = funcs[index](...args);
                    table[i] = funcs[index];
                    return result;
                };
            }
        }
        const exportFunc = (index) => {
            const [argTypes, returnTypes] = funcTypes[index];
            const argNames = [];
            const argExprs = [];
            for (let i = 0; i < argTypes.length; i++) {
                argNames.push("a" + i);
                argExprs.push(castToWASM("a" + i, argTypes[i]));
            }
            let result = `f[i](${argExprs})`;
            if (returnTypes.length === 1) {
                result = "return " + castToJS(result, returnTypes[0]);
            } else if (returnTypes.length > 1) {
                result = `let r=${result};`;
                for (let i = 0; i < returnTypes.length; i++)
                    result += `r[${i}]=${castToJS(`r[${i}]`, returnTypes[i])};`;
                result += "return r";
            }
            return new Function("f", "i", "l", `return(${argNames})=>{${result}}`)(funcs, index, library);
        };
        for (const [name, desc, index] of exportSection) {
            if (desc === 0 /* Func */) {
                exports[name] = exportFunc(index);
            } else if (desc === 1 /* Table */) {
                const funcs2 = [];
                for (let [offset, indices] of elementSection) {
                    for (const index2 of indices) {
                        funcs2[offset++] = exportFunc(index2);
                    }
                }
                const value = new Table();
                Object.defineProperty(value, "length", {
                    get: () => funcs2.length
                });
                value.get = (i) => funcs2[i];
                value.grow = () => {
                    throw new Error(`Unsupported operation "grow" on table ${index}`);
                };
                value.set = () => {
                    throw new Error(`Unsupported operation "set" on table ${index}`);
                };
                exports[name] = value;
            } else if (desc === 2 /* Mem */) {
                exports[name] = memory;
            } else if (desc === 3 /* Global */) {
                const value = new Global();
                const type = globalTypes[index];
                Object.defineProperty(value, "value", {
                    get: () => globals[index],
                    set: (x) => {
                        globals[index] = liveCastToWASM(x, type);
                    }
                });
                exports[name] = value;
            } else {
                throw new Error(`Unsupported export type ${desc} for "${name}"`);
            }
        }
        if (startSection >= 0)
            funcs[startSection]();
    }
};

// src/index.ts
var instantiate = async (input, importObject) => {
    if (input instanceof Module)
        return new Instance(input, importObject);
    const module = new Module(input);
    return { module, instance: new Instance(module, importObject) };
};
var wasmAPI = {
    Global,
    Instance,
    instantiate,
    Memory,
    Module,
    Table
};
//export {
//    wasmAPI as WebAssembly
//};
WebAssembly = wasmAPI;