import { validate as isValidUUID  } from 'uuid';

export default function (type: string, value: string | number | boolean) {
  switch(type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'uuid':
      if (typeof value !== 'string') {
        return false;
      }

      return isValidUUID(value);
    default:
      throw new Error('Type does not exists');
  }
}