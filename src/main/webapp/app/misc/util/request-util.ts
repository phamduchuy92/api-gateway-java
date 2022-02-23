import * as _ from 'lodash';

export function plainToFlattenObject(object: any): any {
  const result: any = {};

  function flatten(obj: any, prefix = ''): void {
    _.forEach(obj, (value, key) => {
      if (_.isPlainObject(value)) {
        flatten(value, `${prefix}${key}.`);
      } else {
        result[`${prefix}${key}`] = value;
      }
    });
  }
  flatten(object);

  return result;
}
