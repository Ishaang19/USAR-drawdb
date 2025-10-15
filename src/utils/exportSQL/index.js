import { DB } from "../../data/constants"; 

import { toMariaDB } from "./mariadb"; 

import { toMSSQL } from "./mssql"; 

import { toMySQL } from "./mysql"; 

import { toOracleSQL } from "./oraclesql"; 

import { toPostgres } from "./postgres"; 

import { toSqlite } from "./sqlite"; 

 

export function exportSQL(diagram, generateForeignKeys = true) { 

switch (diagram.database) { 

case DB.SQLITE: 

return toSqlite(diagram, generateForeignKeys); 

case DB.MYSQL: 

return toMySQL(diagram, generateForeignKeys); 

case DB.POSTGRES: 

return toPostgres(diagram, generateForeignKeys); 

case DB.MARIADB: 

return toMariaDB(diagram, generateForeignKeys); 

case DB.MSSQL: 

return toMSSQL(diagram, generateForeignKeys); 

case DB.ORACLESQL: 

return toOracleSQL(diagram, generateForeignKeys); 

default: 

return ""; 

} 

} 