const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const checkUserExists = await knex("users").where({ email }).first();

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso.");
    }

    if (!name) {
      throw new AppError("O nome é obrigatório.");
    }

    if (!email) {
      throw new AppError("O email é obrigatório.");
    }

    if (!password) {
      throw new AppError("A senha é obrigatória.");
    }

    const hashedPassword = await hash(password, 8);

    await knex("users").insert({
      name,
      email,
      password: hashedPassword,
    });

    return response
      .status(201)
      .json({ message: "Usuário criado com sucesso!" });
  }

  async index(request, response) {
    const users = await knex("users");

    if (!users.length) {
      throw new AppError("Nenhum usuário cadastrado.");
    }

    return response.json(users);
  }

  async show(request, response) {
    const { id } = request.params;

    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    return response.json(user);
  }

  async delete(request, response) {
    const { id } = request.params;

    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    await knex("users").where({ id }).delete();

    return response.json({ message: "Usuário excluído com sucesso!" });
  }

  async update(request, response) {
    const { name, email, old_password, new_password } = request.body;
    const { id } = request.params;

    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Usuário não encontrado.");
    }

    if (!email) {
      throw new AppError("Você precisa informar seu email de cadastro.");
    }

    const checkEmailExists = await knex("users")
      .where({ email })
      .whereNot("id", Number(id))
      .first();

    if (checkEmailExists) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const checkOldPassword = await compare(old_password, user.password);
    const checkNewPassword = await compare(new_password, user.password);

    if (!old_password) {
      throw new AppError("Você precisa informar a senha atual.");
    }

    if (!new_password) {
      throw new AppError("Você precisa informar a nova senha.");
    }

    if (!checkOldPassword) {
      throw new AppError("A senha atual não confere.");
    }

    if (checkOldPassword === checkNewPassword) {
      throw new AppError("A nova senha não pode ser igual a senha atual.");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.password = await hash(new_password, 8);

    await knex("users")
      .where({ id })
      .update({
        name: user.name,
        email: user.email,
        password: user.password,
        updated_at: knex.fn.now(),
      });

    return response.json({ message: "Alteração realizada com sucesso!" });
  }
}

module.exports = UsersController;
