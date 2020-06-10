import fs from 'fs';
import converter from 'json-2-csv';

export function jsonToCsv(inputSeries: object[]): void {
  converter.json2csv(inputSeries, (err, csv) => {
    if (err) throw err;
    if (!csv) return;
    fs.writeFileSync('./tradesTS.csv', csv);
  });
}
