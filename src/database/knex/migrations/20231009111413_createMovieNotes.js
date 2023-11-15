exports.up = (knex) =>
  knex.schema.createTable("movie_notes", (table) => {
    table.increments("id").primary();
    table.text("title").notNullable();
    table.text("description").notNullable();
    table.integer("rating").notNullable();
    table.integer("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("movie_notes");
