import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const catalogEdits=sqliteTable('catalog_edits',{
 id:text('id').primaryKey(), payload:text('payload').notNull(), revision:integer('revision').notNull().default(1), updatedAt:text('updated_at').notNull()
});
