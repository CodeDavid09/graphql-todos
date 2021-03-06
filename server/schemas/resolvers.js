const {AuthorizationError} = require('apollo-server-express');
const {Todo, User} = require('../models');
const utils = require('../utils');

const resolvers = {
	Query: {
		user: async (_root, {id}) => {
			return await User.findById(id);
		},
		users: async (_root, _args, context) => {
			if (!context.req.user) {
				throw new AuthorizationError('You must be logged in to do that');
			}
			console.log(context.coolestGuyInTheWorld);
			console.log(context.someNerd);
			return await User.find({});
		},
		todo: async (_root, {id}) => {
			return await Todo.findById(id);
		},
		todos: async () => {
			return await Todo.find({});
		}
	},
	Mutation: {
		// Sign up
		createUser: async (_root, {firstName, lastName, email, password}) => {
			console.log('im hit!!!');
			const user = await User.create({
				firstName,
				lastName,
				email,
				password,
			});

			const token = utils.signToken(user.firstName, user._id);
			console.log(token);
			return {token, user};
		},
		login: async (_root, {email, password}) => {
			const userFound = await User.findOne({email});

			if (!userFound) {
				throw new AuthorizationError('No user found with this email');
			}

			// successfully logged in
			if (userFound.password === password) {
				const token = utils.signToken(userFound.firstName, userFound._id);
				console.log(userFound);
				return {token, userFound};
			}

			throw new AuthorizationError('You must provide correct credentials');

		},
		createTodo: async (_root, {task, userId, completed}) => {
			return await Todo.create({
				task,
				userId,
				completed
			});
		}
	},
	// Field Resolvers
	// Basically things we defined in typeDefs
	// that isn't in the database
	// but we want extra shit, we can use field resolvers
	User: {
		fullName: (root) => {
			console.log('I AM ROOT',root);
			return `${root.firstName} ${root.lastName}`;
		},
		nameLength: (root) => {
			return root.firstName.length;
		},
		todos: async  (root) => {
			return await Todo.find({
				userId: root._id,
			});
		}
	},
	Todo: {
		user: async (root) => {
			console.log('root', root, 54);
			return await User.findById(root.userId);
		}
	}
};

module.exports = resolvers;