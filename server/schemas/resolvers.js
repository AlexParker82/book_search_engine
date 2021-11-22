const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        user: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findById({ _id: context.user._id });

                return userData;
            } else {

                throw new AuthenticationError("User not logged in");
            }
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const newUser = await User.create(args);
            const token = signToken(newUser);

            return { token, newUser };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError("User not found");
            }

            const passwordCheck = await user.isCorrectPassword(password);

            if (!passwordCheck) {
                throw new AuthenticationError("User not found");
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const addUserBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true },
                );

                return addUserBook;

            } else {
                throw new AuthenticationError("Please log in");
            }
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const removeUserBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return removeUserBook;
            } else {
                throw new AuthenticationError("Please log in");
            }
        },
    },

};

module.exports = resolvers;