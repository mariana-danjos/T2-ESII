"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyDigits = void 0;
exports.isValidCPF = isValidCPF;
exports.isValidCNPJ = isValidCNPJ;
exports.classifyDocument = classifyDocument;
const onlyDigits = (value) => (value || '').replace(/\D/g, '');
exports.onlyDigits = onlyDigits;
function isValidCPF(input) {
    const cpf = (0, exports.onlyDigits)(input);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;
    const calc = (len) => {
        let sum = 0;
        for (let i = 0; i < len; i++)
            sum += Number(cpf[i]) * (len + 1 - i);
        const rest = (sum * 10) % 11;
        return rest === 10 ? 0 : rest;
    };
    return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}
function isValidCNPJ(input) {
    const cnpj = (0, exports.onlyDigits)(input);
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj))
        return false;
    const calc = (len) => {
        const weights = len === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        for (let i = 0; i < len; i++)
            sum += Number(cnpj[i]) * weights[i];
        const rest = sum % 11;
        return rest < 2 ? 0 : 11 - rest;
    };
    return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}
function classifyDocument(input) {
    const digits = (0, exports.onlyDigits)(input);
    if (digits.length === 11 && isValidCPF(digits))
        return 'cpf';
    if (digits.length === 14 && isValidCNPJ(digits))
        return 'cnpj';
    return null;
}
//# sourceMappingURL=document.js.map