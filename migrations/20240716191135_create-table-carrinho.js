exports.up = function(knex) {
    return knex.schema.createTable('carrinho', function(table){
     table.integer("user_id").notNullable();   
     table.float("total").notNullable();
     table.timestamps(true,true);
   })
 };
 
 exports.down = function(knex) {
     return knex.schema.dropTableIfExists('carrinho');
 };
 