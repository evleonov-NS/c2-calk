import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Calculator, DECIMAL, OP_SYMBOLS } from '../src/Calculator.js';

describe('Calculator.compute', () => {
  it('складывает два числа', () => {
    expect(Calculator.compute(10, 5, '+')).toBe(15);
  });

  it('вычитает два числа', () => {
    expect(Calculator.compute(10, 3, '-')).toBe(7);
  });

  it('умножает два числа', () => {
    expect(Calculator.compute(6, 7, '*')).toBe(42);
  });

  it('делит два числа', () => {
    expect(Calculator.compute(20, 4, '/')).toBe(5);
  });

  it('возвращает NaN при делении на ноль', () => {
    expect(Calculator.compute(10, 0, '/')).toBeNaN();
  });

  it('возвращает второй операнд при неизвестном операторе', () => {
    expect(Calculator.compute(10, 5, '%')).toBe(5);
  });
});

describe('Calculator.formatNumber', () => {
  it('форматирует целое число', () => {
    expect(Calculator.formatNumber(42)).toBe('42');
  });

  it('форматирует дробное число с запятой', () => {
    expect(Calculator.formatNumber(3.14)).toBe('3,14');
  });

  it('возвращает «Ошибка» для NaN', () => {
    expect(Calculator.formatNumber(NaN)).toBe('Ошибка');
  });

  it('возвращает «Ошибка» для Infinity', () => {
    expect(Calculator.formatNumber(Infinity)).toBe('Ошибка');
  });
});

describe('Calculator.toDisplay', () => {
  it('заменяет точку на запятую', () => {
    expect(Calculator.toDisplay('3.14')).toBe('3,14');
  });

  it('не меняет строку без точки', () => {
    expect(Calculator.toDisplay('123')).toBe('123');
  });
});

describe('Calculator', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  describe('clear', () => {
    it('сбрасывает состояние в начальное', () => {
      calc.inputDigit('5');
      calc.applyOperator('+');
      calc.clear();

      expect(calc.current).toBe('0');
      expect(calc.previous).toBeNull();
      expect(calc.operator).toBeNull();
      expect(calc.waitingForOperand).toBe(false);
      expect(calc.expression).toBe('');
    });
  });

  describe('inputDigit', () => {
    it('заменяет ноль первой цифрой', () => {
      calc.inputDigit('7');
      expect(calc.current).toBe('7');
    });

    it('добавляет цифру к существующему числу', () => {
      calc.inputDigit('1');
      calc.inputDigit('2');
      calc.inputDigit('3');
      expect(calc.current).toBe('123');
    });

    it('начинает новый операнд после оператора', () => {
      calc.inputDigit('5');
      calc.applyOperator('+');
      calc.inputDigit('9');
      expect(calc.current).toBe('9');
      expect(calc.waitingForOperand).toBe(false);
    });
  });

  describe('inputDecimal', () => {
    it('добавляет запятую к числу', () => {
      calc.inputDigit('3');
      calc.inputDecimal();
      calc.inputDigit('1');
      calc.inputDigit('4');
      expect(calc.current).toBe('3,14');
    });

    it('не добавляет вторую запятую', () => {
      calc.inputDigit('1');
      calc.inputDecimal();
      calc.inputDecimal();
      expect(calc.current).toBe('1,');
    });

    it('начинает с «0,» после оператора', () => {
      calc.inputDigit('5');
      calc.applyOperator('*');
      calc.inputDecimal();
      expect(calc.current).toBe('0,');
      expect(calc.waitingForOperand).toBe(false);
    });
  });

  describe('applyOperator', () => {
    it('устанавливает оператор и выражение', () => {
      calc.inputDigit('5');
      calc.applyOperator('+');

      expect(calc.operator).toBe('+');
      expect(calc.expression).toBe('5 +');
      expect(calc.waitingForOperand).toBe(true);
    });

    it('выполняет цепочку операций', () => {
      calc.inputDigit('5');
      calc.applyOperator('+');
      calc.inputDigit('3');
      calc.applyOperator('*');

      expect(calc.current).toBe('8');
      expect(calc.expression).toBe('8 ×');
      expect(calc.previous).toBe(8);
    });

    it('не меняет состояние при текущем значении «Ошибка»', () => {
      calc.inputDigit('5');
      calc.applyOperator('/');
      calc.inputDigit('0');
      calc.applyOperator('+');

      expect(calc.current).toBe('Ошибка');

      calc.applyOperator('-');

      expect(calc.current).toBe('Ошибка');
      expect(calc.operator).toBeNull();
    });

    it('показывает «Ошибка» при делении на ноль в цепочке', () => {
      calc.inputDigit('8');
      calc.applyOperator('/');
      calc.inputDigit('0');
      calc.applyOperator('+');

      expect(calc.current).toBe('Ошибка');
      expect(calc.expression).toBe('');
      expect(calc.operator).toBeNull();
      expect(calc.waitingForOperand).toBe(true);
    });
  });

  describe('equals', () => {
    it('вычисляет сумму', () => {
      calc.inputDigit('5');
      calc.applyOperator('+');
      calc.inputDigit('3');
      calc.equals();

      expect(calc.current).toBe('8');
      expect(calc.expression).toBe('5 + 3 =');
      expect(calc.operator).toBeNull();
      expect(calc.waitingForOperand).toBe(true);
    });

    it('вычисляет произведение', () => {
      calc.inputDigit('6');
      calc.applyOperator('*');
      calc.inputDigit('7');
      calc.equals();

      expect(calc.current).toBe('42');
      expect(calc.expression).toBe('6 × 7 =');
    });

    it('вызывает onCalculate при успешном вычислении', () => {
      const onCalculate = vi.fn();
      const calcWithJournal = new Calculator({ onCalculate });

      calcWithJournal.inputDigit('2');
      calcWithJournal.applyOperator('+');
      calcWithJournal.inputDigit('2');
      calcWithJournal.equals();

      expect(onCalculate).toHaveBeenCalledOnce();
      expect(onCalculate).toHaveBeenCalledWith('2 + 2 =', '4');
    });

    it('не вызывает onCalculate при делении на ноль', () => {
      const onCalculate = vi.fn();
      const calcWithJournal = new Calculator({ onCalculate });

      calcWithJournal.inputDigit('1');
      calcWithJournal.applyOperator('/');
      calcWithJournal.inputDigit('0');
      calcWithJournal.equals();

      expect(onCalculate).not.toHaveBeenCalled();
      expect(calcWithJournal.current).toBe('Ошибка');
      expect(calcWithJournal.expression).toBe('');
    });

    it('не вычисляет без оператора', () => {
      calc.inputDigit('9');
      calc.equals();

      expect(calc.current).toBe('9');
      expect(calc.expression).toBe('');
    });

    it('не вычисляет повторно без нового операнда', () => {
      calc.inputDigit('5');
      calc.applyOperator('+');
      calc.equals();

      expect(calc.current).toBe('5');
      expect(calc.expression).toBe('5 +');
    });
  });

  describe('backspace', () => {
    it('удаляет последнюю цифру', () => {
      calc.inputDigit('1');
      calc.inputDigit('2');
      calc.inputDigit('3');
      calc.backspace();

      expect(calc.current).toBe('12');
    });

    it('сбрасывает одну цифру в ноль', () => {
      calc.inputDigit('7');
      calc.backspace();

      expect(calc.current).toBe('0');
    });

    it('вызывает clear при состоянии «Ошибка»', () => {
      calc.inputDigit('1');
      calc.applyOperator('/');
      calc.inputDigit('0');
      calc.equals();
      calc.backspace();

      expect(calc.current).toBe('0');
      expect(calc.operator).toBeNull();
    });

    it('вызывает clear при ожидании операнда', () => {
      calc.inputDigit('5');
      calc.applyOperator('+');
      calc.backspace();

      expect(calc.current).toBe('0');
      expect(calc.expression).toBe('');
    });
  });

  describe('percent', () => {
    it('делит число на 100', () => {
      calc.inputDigit('5');
      calc.inputDigit('0');
      calc.percent();

      expect(calc.current).toBe('0,5');
    });

    it('не меняет состояние «Ошибка»', () => {
      calc.inputDigit('1');
      calc.applyOperator('/');
      calc.inputDigit('0');
      calc.equals();
      calc.percent();

      expect(calc.current).toBe('Ошибка');
    });
  });

  describe('loadResult', () => {
    it('подставляет результат из журнала', () => {
      calc.loadResult('42');

      expect(calc.current).toBe('42');
      expect(calc.previous).toBeNull();
      expect(calc.operator).toBeNull();
      expect(calc.waitingForOperand).toBe(true);
      expect(calc.expression).toBe('');
    });

    it('игнорирует значение «Ошибка»', () => {
      calc.inputDigit('5');
      calc.loadResult('Ошибка');

      expect(calc.current).toBe('5');
    });
  });

  describe('parseCurrent', () => {
    it('парсит число с запятой', () => {
      calc.current = '3,14';
      expect(calc.parseCurrent()).toBeCloseTo(3.14);
    });

    it('возвращает 0 для «Ошибка»', () => {
      calc.current = 'Ошибка';
      expect(calc.parseCurrent()).toBe(0);
    });
  });

  describe('деление на ноль (сквозные сценарии)', () => {
    it('5 / 0 = «Ошибка»', () => {
      calc.inputDigit('5');
      calc.applyOperator('/');
      calc.inputDigit('0');
      calc.equals();

      expect(calc.current).toBe('Ошибка');
      expect(calc.expression).toBe('');
      expect(calc.operator).toBe('/');
      expect(calc.waitingForOperand).toBe(true);
    });

    it('после ошибки clear восстанавливает работу', () => {
      calc.inputDigit('5');
      calc.applyOperator('/');
      calc.inputDigit('0');
      calc.equals();
      calc.clear();
      calc.inputDigit('2');
      calc.applyOperator('+');
      calc.inputDigit('2');
      calc.equals();

      expect(calc.current).toBe('4');
    });
  });
});
