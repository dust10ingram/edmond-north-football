import {players, staff} from './generated-site-data';

export const varsity = players
  .filter((player) => player.active === 'yes' && player.team === 'Varsity')
  .map((player) => [player.number, player.name, player.position, player.class_year]);

export const freshman = players
  .filter((player) => player.active === 'yes' && player.team === 'Freshman')
  .map((player) => [player.number, player.name, player.position, player.class_year]);

export const managers = staff
  .filter((person) => person.active === 'yes')
  .map((person) => ['', person.name, person.role, person.class_year]);
