import { Candle, ConditionQuery, SafetyQuery, QueryInput } from '../types';

export function safetyParser(
  query: SafetyQuery,
  type: 'target' | 'stop',
  tick: number,
) {
  const coeff = type === 'target' ? 1 : -1;
  return function (
    entryPx: number,
    side: 1 | -1,
    candle: Candle,
  ): number | undefined {
    if (query.fixed) {
      const { columnName, value } = query.fixed;
      // if (columnName && !candle[columnName]) {
      //   throw new Error(
      //     `Unabled to parse the query. Column name ${columnName} doesn't exist.`,
      //   )
      // }
      const ref = columnName ? candle[columnName] : 1;
      const offset = coeff * side * (typeof ref === 'number' ? ref : 1) * value;
      return entryPx + Math.floor(offset / tick) * tick;
    } else if (query.percent) {
      const { value } = query.percent;
      const price = entryPx * (1 + (coeff * side * value) / 100);
      return Math.floor(price / tick) * tick;
    }
  };
}

export function conditionParser(query: ConditionQuery[]) {
  return function (data: Candle, or = false): boolean {
    return query.reduce((acc: boolean, curr: ConditionQuery) => {
      //console.log(query)
      const [key] = Object.keys(curr);
      const [value] = Object.values(curr);
      if (!value) {
        throw new Error('Unabled to parse the query. No query string given.');
      }
      //console.log(value)
      if (key === 'or') {
        // if ('length' in value) {
        return acc && conditionParser(value as ConditionQuery[])(data, true);
      } else if (key === 'and') {
        return acc && conditionParser(value as ConditionQuery[])(data, false);
      } else {
        return or
          ? acc || queryParser(key, value as QueryInput, data)
          : acc && queryParser(key, value as QueryInput, data);
      }
    }, true);
  };
}

function queryParser(key: string, query: QueryInput, data: Candle) {
  const { columnName, index, target } = query;
  if (!data[columnName]) return false;
  if (index && !data.history({ count: index, columnName })[index]) return false;
  //console.log(columnName, index, target)
  switch (key) {
    case 'crossover':
      return (
        data[columnName] >
          (typeof target === 'number' ? target : data[target]) &&
        data.history({ columnName, count: 1 })[1] <
          (typeof target === 'number'
            ? target
            : data.history({ columnName: target, count: 1 })[1])
      );
    case 'crossunder':
      return (
        data[columnName] <
          (typeof target === 'number' ? target : data[target]) &&
        data.history({ columnName, count: 1 })[1] >
          (typeof target === 'number'
            ? target
            : data.history({ columnName: target, count: 1 })[1])
      );
    case 'lt':
      return index > 0
        ? data.history({ columnName, count: index })[index] <
            (typeof target === 'number'
              ? target
              : data.history({ columnName: target, count: index })[index])
        : data[columnName] <
            (typeof target === 'number' ? target : data[target]);
    case 'lte':
      return index > 0
        ? data.history({ columnName, count: index })[index] <=
            (typeof target === 'number'
              ? target
              : data.history({ columnName: target, count: index })[index])
        : data[columnName] <=
            (typeof target === 'number' ? target : data[target]);
    case 'gt':
      return index > 0
        ? data.history({ columnName, count: index })[index] >
            (typeof target === 'number'
              ? target
              : data.history({ columnName: target, count: index })[index])
        : data[columnName] >
            (typeof target === 'number' ? target : data[target]);
    case 'gte':
      return index > 0
        ? data.history({ columnName, count: index })[index] >=
            (typeof target === 'number'
              ? target
              : data.history({ columnName: target, count: index })[index])
        : data[columnName] >=
            (typeof target === 'number' ? target : data[target]);
    default:
      throw new Error('invalid query.');
  }
}
