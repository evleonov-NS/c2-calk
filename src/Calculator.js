export const OP_SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
export const DECIMAL = ',';

export class Calculator {
  constructor({ onCalculate } = {}) {
    this.onCalculate = onCalculate;
    this.clear();
  }

  clear() {
    this.current = '0';
    this.previous = null;
    this.operator = null;
    this.waitingForOperand = false;
    this.expression = '';
  }

  inputDigit(digit) {
    if (this.waitingForOperand) {
      this.current = digit;
      this.waitingForOperand = false;
    } else {
      this.current = this.current === '0' ? digit : this.current + digit;
    }
  }

  inputDecimal() {
    if (this.waitingForOperand) {
      this.current = '0' + DECIMAL;
      this.waitingForOperand = false;
      return;
    }
    if (!this.current.includes(DECIMAL)) {
      this.current += DECIMAL;
    }
  }

  applyOperator(nextOp) {
    if (this.current === 'Ошибка') return;

    const currentVal = this.parseCurrent();

    if (this.operator !== null && !this.waitingForOperand) {
      const result = Calculator.compute(this.previous, currentVal, this.operator);
      if (Number.isNaN(result)) {
        this.current = 'Ошибка';
        this.previous = null;
        this.operator = null;
        this.expression = '';
        this.waitingForOperand = true;
        return;
      }
      this.previous = result;
      this.current = Calculator.formatNumber(result);
      this.expression = Calculator.formatNumber(result) + ' ' + OP_SYMBOLS[nextOp];
    } else {
      this.previous = currentVal;
      this.expression = Calculator.formatNumber(currentVal) + ' ' + OP_SYMBOLS[nextOp];
    }

    this.operator = nextOp;
    this.waitingForOperand = true;
  }

  equals() {
    if (this.operator === null || this.waitingForOperand) return;

    const currentVal = this.parseCurrent();
    const result = Calculator.compute(this.previous, currentVal, this.operator);

    if (Number.isNaN(result)) {
      this.current = 'Ошибка';
      this.expression = '';
    } else {
      const prevSym = OP_SYMBOLS[this.operator];
      const fullExpr =
        Calculator.formatNumber(this.previous) +
        ' ' +
        prevSym +
        ' ' +
        Calculator.formatNumber(currentVal) +
        ' =';
      this.expression = fullExpr;
      this.current = Calculator.formatNumber(result);
      if (this.onCalculate) {
        this.onCalculate(fullExpr, this.current);
      }
      this.previous = null;
      this.operator = null;
    }

    this.waitingForOperand = true;
  }

  backspace() {
    if (this.current === 'Ошибка' || this.waitingForOperand) {
      this.clear();
      return;
    }
    if (this.current.length <= 1) {
      this.current = '0';
    } else {
      this.current = this.current.slice(0, -1);
    }
  }

  percent() {
    if (this.current === 'Ошибка') return;
    const val = this.parseCurrent() / 100;
    this.current = Calculator.formatNumber(val);
  }

  loadResult(resultStr) {
    if (resultStr === 'Ошибка') return;
    this.current = resultStr;
    this.previous = null;
    this.operator = null;
    this.waitingForOperand = true;
    this.expression = '';
  }

  parseCurrent() {
    return parseFloat(this.current.replace(DECIMAL, '.')) || 0;
  }

  static compute(a, b, op) {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  static formatNumber(num) {
    if (!Number.isFinite(num)) return 'Ошибка';
    return Number(num).toLocaleString('ru-RU', {
      useGrouping: false,
      maximumFractionDigits: 10
    });
  }

  static toDisplay(str) {
    return String(str).replace(/\./g, DECIMAL);
  }
}
